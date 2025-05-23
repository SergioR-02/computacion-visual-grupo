"""
Demo Interactivo BCI - Demostración controlada por el usuario
Permite control manual de la interfaz BCI para entender el funcionamiento
"""

import pygame
import numpy as np
import matplotlib.pyplot as plt
import time
from bci_visual_interface import BCIVisualInterface
from eeg_data_generator import EEGDataGenerator
from eeg_signal_processor import EEGSignalProcessor

class InteractiveBCIDemo:
    def __init__(self):
        """
        Demo interactivo del sistema BCI
        """
        print("🎮 Demo Interactivo BCI")
        print("="*50)
        
        # Crear componentes
        self.interface = BCIVisualInterface(width=1200, height=800)
        self.generator = EEGDataGenerator(sampling_rate=256, duration=10)
        self.processor = EEGSignalProcessor(sampling_rate=256)
        
        # Estado del demo
        self.current_attention = 0.5
        self.current_relaxation = 0.5
        self.current_activation = 0.5
        self.current_calmness = 0.5
        self.mental_state = 'neutral'
        
        # Configuración de control
        self.control_speed = 0.02
        self.auto_mode = False
        self.auto_time = 0
        
        # Datos para análisis
        self.demo_data = []
        self.start_time = time.time()
    
    def handle_keyboard_controls(self):
        """Maneja controles de teclado para la demostración"""
        keys = pygame.key.get_pressed()
        
        # Controles manuales
        if not self.auto_mode:
            # Atención (A/Z)
            if keys[pygame.K_a]:
                self.current_attention = min(1.0, self.current_attention + self.control_speed)
            elif keys[pygame.K_z]:
                self.current_attention = max(0.0, self.current_attention - self.control_speed)
            
            # Relajación (S/X)
            if keys[pygame.K_s]:
                self.current_relaxation = min(1.0, self.current_relaxation + self.control_speed)
            elif keys[pygame.K_x]:
                self.current_relaxation = max(0.0, self.current_relaxation - self.control_speed)
            
            # Activación (D/C)
            if keys[pygame.K_d]:
                self.current_activation = min(1.0, self.current_activation + self.control_speed)
            elif keys[pygame.K_c]:
                self.current_activation = max(0.0, self.current_activation - self.control_speed)
            
            # Calma (F/V)
            if keys[pygame.K_f]:
                self.current_calmness = min(1.0, self.current_calmness + self.control_speed)
            elif keys[pygame.K_v]:
                self.current_calmness = max(0.0, self.current_calmness - self.control_speed)
        
        # Determinar estado mental basado en niveles
        self.update_mental_state()
    
    def handle_special_keys(self):
        """Maneja teclas especiales para funciones adicionales"""
        keys = pygame.key.get_pressed()
        
        # Modo automático (SPACE)
        if keys[pygame.K_SPACE]:
            self.auto_mode = not self.auto_mode
            if self.auto_mode:
                print("🤖 Modo automático activado")
            else:
                print("✋ Modo manual activado")
            time.sleep(0.2)  # Evitar rebote
        
        # Resetear valores (R)
        if keys[pygame.K_r]:
            self.reset_values()
            print("🔄 Valores reseteados")
            time.sleep(0.2)
        
        # Presets rápidos
        if keys[pygame.K_1]:  # Estado concentrado
            self.set_preset('focused')
        elif keys[pygame.K_2]:  # Estado relajado
            self.set_preset('relaxed')
        elif keys[pygame.K_3]:  # Estado alerta
            self.set_preset('alert')
        elif keys[pygame.K_4]:  # Estado neutral
            self.set_preset('neutral')
    
    def update_mental_state(self):
        """Actualiza el estado mental basado en los niveles actuales"""
        if self.current_attention > 0.7 and self.current_relaxation < 0.3:
            self.mental_state = 'focused'
        elif self.current_attention > 0.5 and self.current_relaxation < 0.5:
            self.mental_state = 'alert'
        elif self.current_relaxation > 0.7:
            self.mental_state = 'relaxed'
        else:
            self.mental_state = 'neutral'
    
    def simulate_automatic_session(self):
        """Simula una sesión automática con cambios predefinidos"""
        if not self.auto_mode:
            return
        
        # Ciclo automático de 20 segundos
        cycle_duration = 20.0
        self.auto_time += 1/60  # Asumiendo 60 FPS
        
        if self.auto_time > cycle_duration:
            self.auto_time = 0
        
        # Diferentes fases del ciclo
        phase = (self.auto_time / cycle_duration) * 4  # 4 fases
        
        if phase < 1:  # Fase 1: Relajación creciente
            self.current_relaxation = min(1.0, phase)
            self.current_attention = max(0.2, 1.0 - phase)
            self.current_activation = 0.3 + 0.2 * np.sin(self.auto_time * 2)
            
        elif phase < 2:  # Fase 2: Transición a concentración
            progress = phase - 1
            self.current_attention = 0.2 + 0.8 * progress
            self.current_relaxation = 1.0 - 0.7 * progress
            self.current_activation = 0.5 + 0.4 * progress
            
        elif phase < 3:  # Fase 3: Alta concentración
            self.current_attention = 0.9 + 0.1 * np.sin(self.auto_time * 3)
            self.current_relaxation = 0.2
            self.current_activation = 0.8 + 0.2 * np.sin(self.auto_time * 2)
            
        else:  # Fase 4: Retorno a neutral
            progress = phase - 3
            self.current_attention = 0.9 - 0.4 * progress
            self.current_relaxation = 0.2 + 0.3 * progress
            self.current_activation = 0.8 - 0.3 * progress
        
        # Calma como función suave
        self.current_calmness = 0.3 + 0.4 * np.sin(self.auto_time * 0.5)
        
        # Actualizar estado mental
        self.update_mental_state()
    
    def set_preset(self, preset_name):
        """Establece valores predefinidos para diferentes estados"""
        presets = {
            'focused': (0.9, 0.2, 0.8, 0.3),
            'relaxed': (0.2, 0.9, 0.3, 0.8),
            'alert': (0.7, 0.4, 0.7, 0.5),
            'neutral': (0.5, 0.5, 0.5, 0.5)
        }
        
        if preset_name in presets:
            self.current_attention, self.current_relaxation, \
            self.current_activation, self.current_calmness = presets[preset_name]
            self.update_mental_state()
            print(f"📊 Preset aplicado: {preset_name}")
    
    def reset_values(self):
        """Resetea todos los valores a neutral"""
        self.current_attention = 0.5
        self.current_relaxation = 0.5
        self.current_activation = 0.5
        self.current_calmness = 0.5
        self.mental_state = 'neutral'
    
    def record_data_point(self):
        """Registra un punto de datos para análisis"""
        current_time = time.time() - self.start_time
        
        data_point = {
            'time': current_time,
            'attention': self.current_attention,
            'relaxation': self.current_relaxation,
            'activation': self.current_activation,
            'calmness': self.current_calmness,
            'mental_state': self.mental_state,
            'auto_mode': self.auto_mode
        }
        
        self.demo_data.append(data_point)
    
    def draw_control_instructions(self):
        """Dibuja instrucciones de control en la interfaz"""
        instructions = [
            "🎮 CONTROLES DEL DEMO:",
            "",
            "MANUAL:",
            "A/Z - Atención ↑/↓",
            "S/X - Relajación ↑/↓", 
            "D/C - Activación ↑/↓",
            "F/V - Calma ↑/↓",
            "",
            "PRESETS:",
            "1 - Concentrado",
            "2 - Relajado",
            "3 - Alerta", 
            "4 - Neutral",
            "",
            "ESPECIALES:",
            "SPACE - Modo auto",
            "R - Reset",
            "Q - Salir"
        ]
        
        # Crear superficie para instrucciones
        font = pygame.font.Font(None, 20)
        panel_width = 200
        panel_height = len(instructions) * 22 + 20
        
        # Posición en la esquina superior derecha
        panel_x = self.interface.width - panel_width - 10
        panel_y = 10
        
        # Fondo semi-transparente
        surf = pygame.Surface((panel_width, panel_height), pygame.SRCALPHA)
        pygame.draw.rect(surf, (0, 0, 0, 180), surf.get_rect(), border_radius=8)
        self.interface.screen.blit(surf, (panel_x, panel_y))
        
        # Borde
        pygame.draw.rect(self.interface.screen, (100, 150, 255), 
                        (panel_x, panel_y, panel_width, panel_height), 2, border_radius=8)
        
        # Texto de instrucciones
        for i, instruction in enumerate(instructions):
            if instruction.startswith("🎮"):
                color = (255, 255, 100)
            elif instruction.startswith(("MANUAL:", "PRESETS:", "ESPECIALES:")):
                color = (150, 200, 255)
            elif instruction == "":
                continue
            else:
                color = (200, 200, 200)
            
            text_surf = font.render(instruction, True, color)
            self.interface.screen.blit(text_surf, (panel_x + 10, panel_y + 10 + i * 22))
    
    def draw_status_info(self):
        """Dibuja información de estado del demo"""
        font = pygame.font.Font(None, 24)
        
        # Información de modo
        mode_text = "🤖 AUTOMÁTICO" if self.auto_mode else "✋ MANUAL"
        mode_color = (100, 255, 100) if self.auto_mode else (255, 200, 100)
        mode_surf = font.render(mode_text, True, mode_color)
        self.interface.screen.blit(mode_surf, (20, self.interface.height - 40))
        
        # Tiempo transcurrido
        elapsed_time = time.time() - self.start_time
        time_text = f"⏱️ {elapsed_time:.1f}s"
        time_surf = font.render(time_text, True, (255, 255, 255))
        self.interface.screen.blit(time_surf, (200, self.interface.height - 40))
        
        # Número de muestras
        samples_text = f"📊 {len(self.demo_data)} muestras"
        samples_surf = font.render(samples_text, True, (255, 255, 255))
        self.interface.screen.blit(samples_surf, (350, self.interface.height - 40))
    
    def run_demo(self):
        """Ejecuta el demo interactivo"""
        print("\n🚀 Iniciando Demo Interactivo BCI...")
        print("\n📋 INSTRUCCIONES:")
        print("• Usa A/Z, S/X, D/C, F/V para controlar manualmente")
        print("• Presiona 1-4 para presets rápidos")
        print("• SPACE para modo automático")
        print("• R para resetear, Q para salir")
        print("• Observa cómo cambian los efectos visuales")
        
        clock = pygame.time.Clock()
        
        while self.interface.running:
            # Manejar eventos
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.interface.running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_q:
                        self.interface.running = False
            
            # Procesar controles
            self.handle_keyboard_controls()
            self.handle_special_keys()
            
            # Simular modo automático
            self.simulate_automatic_session()
            
            # Actualizar interfaz BCI
            self.interface.update_bci_state(
                self.current_attention,
                self.current_relaxation,
                self.current_activation,
                self.current_calmness,
                self.mental_state
            )
            
            # Renderizar frame
            self.interface.render_frame()
            
            # Dibujar elementos adicionales del demo
            self.draw_control_instructions()
            self.draw_status_info()
            
            # Registrar datos
            self.record_data_point()
            
            # Actualizar pantalla
            pygame.display.flip()
            clock.tick(60)
        
        # Cerrar interfaz
        self.interface.close()
        
        # Generar reporte del demo
        self.generate_demo_report()
    
    def generate_demo_report(self):
        """Genera un reporte de la sesión de demo"""
        if len(self.demo_data) < 10:
            print("⚠️ Sesión muy corta para generar reporte")
            return
        
        print("\n📊 Generando reporte del demo...")
        
        # Extraer datos
        times = [d['time'] for d in self.demo_data]
        attention = [d['attention'] for d in self.demo_data]
        relaxation = [d['relaxation'] for d in self.demo_data]
        activation = [d['activation'] for d in self.demo_data]
        calmness = [d['calmness'] for d in self.demo_data]
        
        # Crear gráfico
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        fig.suptitle('🎮 Reporte de Demo Interactivo BCI', fontsize=16, fontweight='bold')
        
        # Gráfico 1: Señales principales
        axes[0, 0].plot(times, attention, label='Atención', color='red', linewidth=2)
        axes[0, 0].plot(times, relaxation, label='Relajación', color='green', linewidth=2)
        axes[0, 0].set_title('Atención vs Relajación')
        axes[0, 0].set_xlabel('Tiempo (s)')
        axes[0, 0].set_ylabel('Nivel [0-1]')
        axes[0, 0].legend()
        axes[0, 0].grid(True, alpha=0.3)
        
        # Gráfico 2: Activación y calma
        axes[0, 1].plot(times, activation, label='Activación', color='orange', linewidth=2)
        axes[0, 1].plot(times, calmness, label='Calma', color='blue', linewidth=2)
        axes[0, 1].set_title('Activación vs Calma')
        axes[0, 1].set_xlabel('Tiempo (s)')
        axes[0, 1].set_ylabel('Nivel [0-1]')
        axes[0, 1].legend()
        axes[0, 1].grid(True, alpha=0.3)
        
        # Gráfico 3: Estados mentales en el tiempo
        states = [d['mental_state'] for d in self.demo_data]
        state_mapping = {'neutral': 0, 'relaxed': 1, 'alert': 2, 'focused': 3}
        state_values = [state_mapping[state] for state in states]
        
        axes[1, 0].plot(times, state_values, linewidth=2, marker='o', markersize=2)
        axes[1, 0].set_title('Estados Mentales en el Tiempo')
        axes[1, 0].set_xlabel('Tiempo (s)')
        axes[1, 0].set_ylabel('Estado Mental')
        axes[1, 0].set_yticks([0, 1, 2, 3])
        axes[1, 0].set_yticklabels(['Neutral', 'Relajado', 'Alerta', 'Concentrado'])
        axes[1, 0].grid(True, alpha=0.3)
        
        # Gráfico 4: Distribución de tiempo por estado
        state_counts = {}
        for state in states:
            state_counts[state] = state_counts.get(state, 0) + 1
        
        colors = {'neutral': 'blue', 'relaxed': 'green', 'alert': 'orange', 'focused': 'red'}
        bar_colors = [colors.get(state, 'gray') for state in state_counts.keys()]
        
        axes[1, 1].bar(state_counts.keys(), state_counts.values(), 
                      color=bar_colors, alpha=0.7)
        axes[1, 1].set_title('Distribución de Estados')
        axes[1, 1].set_xlabel('Estado Mental')
        axes[1, 1].set_ylabel('Frecuencia')
        axes[1, 1].tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        
        # Guardar reporte
        plt.savefig('demo_bci_report.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        # Estadísticas
        print("\n📈 ESTADÍSTICAS DEL DEMO:")
        print("-" * 40)
        print(f"⏱️  Duración total: {times[-1]:.1f} segundos")
        print(f"📊 Puntos de datos: {len(self.demo_data)}")
        print(f"🎯 Atención promedio: {np.mean(attention):.3f}")
        print(f"😌 Relajación promedio: {np.mean(relaxation):.3f}")
        print(f"⚡ Activación promedio: {np.mean(activation):.3f}")
        print(f"🕯️  Calma promedio: {np.mean(calmness):.3f}")
        
        # Modo más usado
        manual_count = sum(1 for d in self.demo_data if not d['auto_mode'])
        auto_count = len(self.demo_data) - manual_count
        print(f"✋ Tiempo manual: {manual_count/len(self.demo_data)*100:.1f}%")
        print(f"🤖 Tiempo automático: {auto_count/len(self.demo_data)*100:.1f}%")
        
        print(f"\n✅ Reporte guardado como: demo_bci_report.png")

def main():
    """Función principal del demo"""
    print("🎮 DEMO INTERACTIVO BCI")
    print("="*50)
    print("🧠 Explora el funcionamiento de una interfaz BCI")
    print("🎯 Controla efectos visuales con simulación mental")
    print("📊 Genera reportes de tu sesión")
    print("="*50)
    
    try:
        demo = InteractiveBCIDemo()
        demo.run_demo()
        
    except Exception as e:
        print(f"❌ Error en el demo: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        print("\n🎯 Demo completado")
        print("¡Gracias por probar el sistema BCI!")

if __name__ == "__main__":
    main() 