"""
Main BCI System - Sistema principal de Brain-Computer Interface
Integra generación de datos EEG, procesamiento y control visual en tiempo real
"""

import numpy as np
import matplotlib.pyplot as plt
import threading
import time
import queue
import cv2
import os
from collections import deque

# Importar módulos del proyecto
from eeg_data_generator import EEGDataGenerator
from eeg_signal_processor import EEGSignalProcessor
from bci_visual_interface import BCIVisualInterface

class RealTimeBCISystem:
    def __init__(self, sampling_rate=256, buffer_length=10):
        """
        Sistema BCI en tiempo real que simula adquisición y procesamiento
        
        Args:
            sampling_rate: Frecuencia de muestreo en Hz
            buffer_length: Longitud del buffer en segundos
        """
        self.fs = sampling_rate
        self.buffer_length = buffer_length
        self.buffer_size = int(buffer_length * sampling_rate)
        
        # Componentes del sistema
        self.generator = EEGDataGenerator(sampling_rate, duration=1)  # 1 segundo de datos
        self.processor = EEGSignalProcessor(sampling_rate)
        self.interface = BCIVisualInterface(width=1400, height=900)
        
        # Buffer circular para datos EEG
        self.data_buffer = deque(maxlen=self.buffer_size)
        
        # Colas para comunicación entre hilos
        self.signal_queue = queue.Queue()
        self.control_queue = queue.Queue()
        
        # Estado del sistema
        self.running = False
        self.current_state = 'neutral'
        self.state_history = []
        
        # Hilos de trabajo
        self.acquisition_thread = None
        self.processing_thread = None
        
        # Para grabación de sesión
        self.recording = False
        self.session_data = []
        
        print("🧠 Sistema BCI Inicializado")
        print(f"📊 Frecuencia de muestreo: {self.fs} Hz")
        print(f"💾 Buffer de datos: {self.buffer_length} segundos")
    
    def simulate_eeg_acquisition(self):
        """
        Simula la adquisición de datos EEG en tiempo real
        Hilo separado que genera datos continuamente
        """
        print("🔴 Iniciando simulación de adquisición EEG...")
        
        # Estados predefinidos para simular sesión realista
        session_states = ['neutral', 'alert', 'focused', 'relaxed', 'neutral', 
                         'focused', 'alert', 'relaxed', 'focused', 'neutral']
        state_index = 0
        state_duration = 5  # segundos por estado
        last_state_change = time.time()
        
        sample_count = 0
        start_time = time.time()
        
        while self.running:
            try:
                current_time = time.time()
                
                # Cambiar estado automáticamente cada cierto tiempo
                if current_time - last_state_change > state_duration:
                    state_index = (state_index + 1) % len(session_states)
                    self.current_state = session_states[state_index]
                    last_state_change = current_time
                    print(f"🔄 Cambiando a estado: {self.current_state}")
                
                # Generar muestra EEG
                sample_signal = self.generator.generate_attention_state(self.current_state)
                
                # Tomar solo unas pocas muestras para simulación en tiempo real
                samples_per_iteration = int(self.fs * 0.1)  # 100ms de datos
                for i in range(0, min(samples_per_iteration, len(sample_signal))):
                    if len(self.data_buffer) >= self.buffer_size:
                        # Buffer lleno, eliminar datos antiguos
                        pass  # deque automáticamente elimina elementos antiguos
                    
                    # Agregar nueva muestra
                    sample_index = (sample_count + i) % len(sample_signal)
                    self.data_buffer.append(sample_signal[sample_index])
                
                sample_count += samples_per_iteration
                
                # Enviar señal para procesamiento
                if len(self.data_buffer) >= self.buffer_size // 2:  # Buffer medio lleno
                    buffer_copy = list(self.data_buffer)
                    self.signal_queue.put(buffer_copy)
                
                # Control de velocidad de simulación
                time.sleep(0.1)  # 100ms entre iteraciones
                
            except Exception as e:
                print(f"❌ Error en adquisición: {e}")
                break
        
        print("🔴 Adquisición EEG finalizada")
    
    def process_eeg_signals(self):
        """
        Procesa las señales EEG y genera comandos de control
        Hilo separado para procesamiento en tiempo real
        """
        print("⚙️ Iniciando procesamiento de señales...")
        
        while self.running:
            try:
                # Esperar por datos
                buffer_data = self.signal_queue.get(timeout=1.0)
                
                if len(buffer_data) < self.fs:  # Mínimo 1 segundo de datos
                    continue
                
                # Procesar señal
                analysis_result = self.processor.real_time_analysis(
                    buffer_data, buffer_length=3
                )
                
                if analysis_result is None:
                    continue
                
                # Extraer información de control
                control_signals = analysis_result['control_signals']
                mental_state = analysis_result['mental_state']
                timestamp = analysis_result['timestamp']
                
                # Promediar señales de control para suavizar
                attention = np.mean(control_signals['attention'])
                relaxation = np.mean(control_signals['relaxation'])
                activation = np.mean(control_signals['activation'])
                calmness = np.mean(control_signals['calmness'])
                
                # Guardar para análisis posterior
                if self.recording:
                    self.session_data.append({
                        'timestamp': timestamp,
                        'attention': attention,
                        'relaxation': relaxation,
                        'activation': activation,
                        'calmness': calmness,
                        'mental_state': mental_state
                    })
                
                # Enviar a interfaz visual
                control_data = {
                    'attention': attention,
                    'relaxation': relaxation,
                    'activation': activation,
                    'calmness': calmness,
                    'mental_state': mental_state
                }
                
                self.control_queue.put(control_data)
                
                # Actualizar historial
                self.state_history.append(mental_state)
                if len(self.state_history) > 100:
                    self.state_history.pop(0)
                
            except queue.Empty:
                continue
            except Exception as e:
                print(f"❌ Error en procesamiento: {e}")
                continue
        
        print("⚙️ Procesamiento finalizado")
    
    def update_visual_interface(self):
        """
        Actualiza la interfaz visual con datos de control
        Se ejecuta en el hilo principal
        """
        try:
            # Obtener últimos datos de control
            while not self.control_queue.empty():
                control_data = self.control_queue.get_nowait()
                
                # Actualizar interfaz
                self.interface.update_bci_state(
                    control_data['attention'],
                    control_data['relaxation'],
                    control_data['activation'],
                    control_data['calmness'],
                    control_data['mental_state']
                )
        except queue.Empty:
            pass
        except Exception as e:
            print(f"❌ Error actualizando interfaz: {e}")
    
    def start_system(self):
        """Inicia todos los componentes del sistema BCI"""
        print("\n🚀 Iniciando Sistema BCI Completo...")
        print("="*60)
        
        self.running = True
        self.recording = True
        
        # Iniciar hilos de adquisición y procesamiento
        self.acquisition_thread = threading.Thread(
            target=self.simulate_eeg_acquisition, 
            daemon=True
        )
        self.processing_thread = threading.Thread(
            target=self.process_eeg_signals, 
            daemon=True
        )
        
        self.acquisition_thread.start()
        self.processing_thread.start()
        
        print("✅ Hilos de adquisición y procesamiento iniciados")
        print("🎮 Iniciando interfaz visual...")
        print("\n💡 INSTRUCCIONES:")
        print("• El sistema simula automáticamente diferentes estados mentales")
        print("• Observa cómo cambian los efectos visuales")
        print("• Presiona 'Q' para salir")
        
        # Bucle principal de la interfaz visual
        try:
            while self.interface.running:
                self.interface.handle_events()
                self.update_visual_interface()
                self.interface.render_frame()
        except KeyboardInterrupt:
            print("\n⚠️ Interrumpido por el usuario")
        
        self.stop_system()
    
    def stop_system(self):
        """Detiene todos los componentes del sistema"""
        print("\n🛑 Deteniendo Sistema BCI...")
        
        self.running = False
        self.recording = False
        
        # Esperar a que terminen los hilos
        if self.acquisition_thread and self.acquisition_thread.is_alive():
            self.acquisition_thread.join(timeout=2)
        
        if self.processing_thread and self.processing_thread.is_alive():
            self.processing_thread.join(timeout=2)
        
        # Cerrar interfaz
        self.interface.close()
        
        print("✅ Sistema BCI detenido completamente")
    
    def save_session_report(self, filename="bci_session_report"):
        """Guarda un reporte de la sesión BCI"""
        if not self.session_data:
            print("⚠️ No hay datos de sesión para guardar")
            return
        
        print(f"\n📊 Generando reporte de sesión...")
        
        # Crear reporte con matplotlib
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle('🧠 Reporte de Sesión BCI', fontsize=16, fontweight='bold')
        
        # Extraer datos
        timestamps = [d['timestamp'] for d in self.session_data]
        attention = [d['attention'] for d in self.session_data]
        relaxation = [d['relaxation'] for d in self.session_data]
        activation = [d['activation'] for d in self.session_data]
        calmness = [d['calmness'] for d in self.session_data]
        
        # Gráfico 1: Señales de control en el tiempo
        axes[0, 0].plot(timestamps, attention, label='Atención', color='red', linewidth=2)
        axes[0, 0].plot(timestamps, relaxation, label='Relajación', color='green', linewidth=2)
        axes[0, 0].set_title('Señales de Control BCI')
        axes[0, 0].set_xlabel('Tiempo (s)')
        axes[0, 0].set_ylabel('Nivel [0-1]')
        axes[0, 0].legend()
        axes[0, 0].grid(True, alpha=0.3)
        
        # Gráfico 2: Activación y calma
        axes[0, 1].plot(timestamps, activation, label='Activación', color='orange', linewidth=2)
        axes[0, 1].plot(timestamps, calmness, label='Calma', color='blue', linewidth=2)
        axes[0, 1].set_title('Estados de Activación')
        axes[0, 1].set_xlabel('Tiempo (s)')
        axes[0, 1].set_ylabel('Nivel [0-1]')
        axes[0, 1].legend()
        axes[0, 1].grid(True, alpha=0.3)
        
        # Gráfico 3: Distribución de estados mentales
        states = [d['mental_state'] for d in self.session_data]
        state_counts = {state: states.count(state) for state in set(states)}
        
        axes[1, 0].bar(state_counts.keys(), state_counts.values(), 
                      color=['blue', 'green', 'orange', 'red'], alpha=0.7)
        axes[1, 0].set_title('Distribución de Estados Mentales')
        axes[1, 0].set_xlabel('Estado Mental')
        axes[1, 0].set_ylabel('Frecuencia')
        axes[1, 0].tick_params(axis='x', rotation=45)
        
        # Gráfico 4: Estadísticas promedio
        avg_stats = {
            'Atención': np.mean(attention),
            'Relajación': np.mean(relaxation),
            'Activación': np.mean(activation),
            'Calma': np.mean(calmness)
        }
        
        bars = axes[1, 1].bar(avg_stats.keys(), avg_stats.values(), 
                             color=['red', 'green', 'orange', 'blue'], alpha=0.7)
        axes[1, 1].set_title('Promedios de Sesión')
        axes[1, 1].set_xlabel('Métrica')
        axes[1, 1].set_ylabel('Valor Promedio')
        axes[1, 1].tick_params(axis='x', rotation=45)
        
        # Añadir valores en las barras
        for bar, value in zip(bars, avg_stats.values()):
            axes[1, 1].text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                           f'{value:.3f}', ha='center', va='bottom')
        
        plt.tight_layout()
        
        # Guardar reporte
        report_filename = f"{filename}.png"
        plt.savefig(report_filename, dpi=300, bbox_inches='tight')
        plt.show()
        
        print(f"✅ Reporte guardado como: {report_filename}")
        
        # Estadísticas de texto
        print("\n📈 ESTADÍSTICAS DE SESIÓN:")
        print("-" * 40)
        print(f"⏱️  Duración: {timestamps[-1] - timestamps[0]:.1f} segundos")
        print(f"📊 Muestras procesadas: {len(self.session_data)}")
        print(f"🎯 Atención promedio: {np.mean(attention):.3f}")
        print(f"😌 Relajación promedio: {np.mean(relaxation):.3f}")
        print(f"⚡ Activación promedio: {np.mean(activation):.3f}")
        print(f"🕯️  Calma promedio: {np.mean(calmness):.3f}")
        print(f"🧠 Estado más frecuente: {max(state_counts, key=state_counts.get)}")

def create_demo_gif():
    """Crea un GIF de demostración del sistema BCI"""
    print("\n🎬 Para crear un GIF de demostración, ejecuta:")
    print("python main_bci_system.py")
    print("Luego usa software de captura de pantalla para grabar la sesión")

def main():
    """Función principal del sistema BCI"""
    print("🧠 SISTEMA BCI SIMULADO - CONTROL VISUAL")
    print("="*70)
    print("🔬 Simulador de Brain-Computer Interface")
    print("📊 Procesamiento de señales EEG en tiempo real")
    print("🎮 Control visual basado en actividad cerebral")
    print("="*70)
    
    try:
        # Crear y configurar sistema
        bci_system = RealTimeBCISystem(sampling_rate=256, buffer_length=10)
        
        # Iniciar sistema completo
        bci_system.start_system()
        
        # Generar reporte de sesión
        if bci_system.session_data:
            bci_system.save_session_report("bci_session_report")
        
    except Exception as e:
        print(f"❌ Error en el sistema BCI: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        print("\n🎯 Sesión BCI completada")
        print("📁 Revisa los archivos generados para el análisis")
        print("🚀 ¡Gracias por usar el Sistema BCI Simulado!")

if __name__ == "__main__":
    main() 