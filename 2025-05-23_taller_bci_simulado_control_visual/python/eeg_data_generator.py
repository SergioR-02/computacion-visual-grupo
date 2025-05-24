"""
EEG Data Generator - Simulador de señales EEG realistas
Genera datos sintéticos que simulan actividad cerebral con diferentes frecuencias
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import signal
import random

class EEGDataGenerator:
    def __init__(self, sampling_rate=256, duration=60):
        """
        Inicializa el generador de datos EEG
        
        Args:
            sampling_rate: Frecuencia de muestreo en Hz (típicamente 256 Hz)
            duration: Duración de la señal en segundos
        """
        self.fs = sampling_rate
        self.duration = duration
        self.n_samples = int(self.fs * self.duration)
        self.time = np.linspace(0, self.duration, self.n_samples)
        
        # Bandas de frecuencia EEG
        self.bands = {
            'delta': (0.5, 4),    # Sueño profundo
            'theta': (4, 8),      # Relajación profunda, meditación
            'alpha': (8, 12),     # Relajación consciente, ojos cerrados
            'beta': (12, 30),     # Concentración, actividad mental
            'gamma': (30, 100)    # Procesamiento cognitivo complejo
        }
    
    def generate_brain_wave(self, frequency, amplitude=1.0, phase=0):
        """Genera una onda cerebral específica"""
        return amplitude * np.sin(2 * np.pi * frequency * self.time + phase)
    
    def generate_noise(self, amplitude=0.1):
        """Genera ruido realista para simular interferencias"""
        # Ruido blanco
        white_noise = amplitude * np.random.randn(self.n_samples)
        
        # Ruido de línea eléctrica (50/60 Hz)
        power_line = 0.05 * np.sin(2 * np.pi * 50 * self.time)
        
        # Artefactos de movimiento (frecuencias bajas)
        movement = 0.1 * np.sin(2 * np.pi * 0.5 * self.time + np.random.random() * 2 * np.pi)
        
        return white_noise + power_line + movement
    
    def generate_attention_state(self, attention_level='medium'):
        """
        Genera una señal EEG que simula diferentes estados de atención
        
        Args:
            attention_level: 'low', 'medium', 'high', 'neutral', 'focused', 'relaxed', 'alert'
        """
        signal_data = np.zeros(self.n_samples)
        
        # Mapear estados adicionales a los básicos
        if attention_level in ['neutral', 'medium']:
            attention_level = 'medium'
        elif attention_level in ['focused', 'high']:
            attention_level = 'high'
        elif attention_level in ['relaxed', 'low']:
            attention_level = 'low'
        elif attention_level == 'alert':
            attention_level = 'medium'
        
        if attention_level == 'low':
            # Estado relajado: más alpha, menos beta
            alpha = self.generate_brain_wave(10, amplitude=2.0)
            theta = self.generate_brain_wave(6, amplitude=1.5)
            beta = self.generate_brain_wave(15, amplitude=0.5)
            
        elif attention_level == 'high':
            # Estado concentrado: más beta, menos alpha
            alpha = self.generate_brain_wave(10, amplitude=0.8)
            theta = self.generate_brain_wave(6, amplitude=0.5)
            beta = self.generate_brain_wave(20, amplitude=2.5)
            
        else:  # 'medium' o cualquier otro valor por defecto
            # Estado normal: balance alpha-beta
            alpha = self.generate_brain_wave(10, amplitude=1.5)
            theta = self.generate_brain_wave(6, amplitude=1.0)
            beta = self.generate_brain_wave(18, amplitude=1.2)
        
        # Combinar ondas
        signal_data = alpha + theta + beta
        
        # Añadir ruido realista
        noise = self.generate_noise(amplitude=0.2)
        signal_data += noise
        
        return signal_data
    
    def generate_dynamic_session(self, state_changes=5):
        """
        Genera una sesión EEG con cambios dinámicos de estado mental
        """
        signal_data = np.zeros(self.n_samples)
        states = []
        
        # Dividir la sesión en segmentos
        segment_length = self.n_samples // state_changes
        
        for i in range(state_changes):
            start_idx = i * segment_length
            end_idx = min((i + 1) * segment_length, self.n_samples)
            
            # Seleccionar estado aleatorio
            state = random.choice(['low', 'medium', 'high'])
            states.append(state)
            
            # Generar segmento temporal
            temp_duration = (end_idx - start_idx) / self.fs
            temp_generator = EEGDataGenerator(self.fs, temp_duration)
            segment_signal = temp_generator.generate_attention_state(state)
            
            signal_data[start_idx:end_idx] = segment_signal[:end_idx-start_idx]
        
        return signal_data, states
    
    def save_to_csv(self, signal_data, filename, labels=None):
        """Guarda los datos EEG en formato CSV"""
        # Crear DataFrame
        df = pd.DataFrame({
            'time': self.time[:len(signal_data)],
            'eeg_signal': signal_data,
            'sampling_rate': self.fs
        })
        
        if labels:
            df['state'] = labels
        
        # Guardar archivo
        df.to_csv(filename, index=False)
        print(f"Datos EEG guardados en: {filename}")
        
        return df
    
    def visualize_signal(self, signal_data, title="Señal EEG Simulada"):
        """Visualiza la señal EEG generada"""
        plt.figure(figsize=(15, 8))
        
        # Subplot 1: Señal completa en tiempo
        plt.subplot(2, 2, 1)
        plt.plot(self.time[:len(signal_data)], signal_data)
        plt.title(f'{title} - Señal Temporal')
        plt.xlabel('Tiempo (s)')
        plt.ylabel('Amplitud (μV)')
        plt.grid(True, alpha=0.3)
        
        # Subplot 2: Primer segundo de detalle
        plt.subplot(2, 2, 2)
        detail_samples = min(self.fs, len(signal_data))
        plt.plot(self.time[:detail_samples], signal_data[:detail_samples])
        plt.title('Detalle - Primer Segundo')
        plt.xlabel('Tiempo (s)')
        plt.ylabel('Amplitud (μV)')
        plt.grid(True, alpha=0.3)
        
        # Subplot 3: Espectro de frecuencias
        plt.subplot(2, 2, 3)
        frequencies, power_spectrum = signal.welch(signal_data, self.fs, nperseg=self.fs*2)
        plt.semilogy(frequencies, power_spectrum)
        plt.title('Espectro de Potencia')
        plt.xlabel('Frecuencia (Hz)')
        plt.ylabel('Potencia (μV²/Hz)')
        plt.xlim(0, 50)
        plt.grid(True, alpha=0.3)
        
        # Subplot 4: Bandas de frecuencia
        plt.subplot(2, 2, 4)
        band_powers = self.calculate_band_powers(signal_data)
        bands = list(band_powers.keys())
        powers = list(band_powers.values())
        
        colors = ['purple', 'blue', 'green', 'orange', 'red']
        plt.bar(bands, powers, color=colors, alpha=0.7)
        plt.title('Potencia por Banda de Frecuencia')
        plt.xlabel('Banda')
        plt.ylabel('Potencia Relativa')
        plt.xticks(rotation=45)
        
        plt.tight_layout()
        plt.show()
    
    def calculate_band_powers(self, signal_data):
        """Calcula la potencia en cada banda de frecuencia"""
        frequencies, power_spectrum = signal.welch(signal_data, self.fs, nperseg=self.fs*2)
        
        band_powers = {}
        for band_name, (low_freq, high_freq) in self.bands.items():
            # Encontrar índices de frecuencia
            freq_mask = (frequencies >= low_freq) & (frequencies <= high_freq)
            band_power = np.trapz(power_spectrum[freq_mask], frequencies[freq_mask])
            band_powers[band_name] = band_power
        
        # Normalizar
        total_power = sum(band_powers.values())
        if total_power > 0:
            band_powers = {k: v/total_power for k, v in band_powers.items()}
        
        return band_powers

# Función principal para generar datos de ejemplo
def main():
    print("🧠 Generador de Datos EEG Simulados")
    print("="*50)
    
    # Crear generador
    generator = EEGDataGenerator(sampling_rate=256, duration=30)
    
    # Generar diferentes tipos de señales
    print("\n1. Generando señal de baja atención...")
    low_attention = generator.generate_attention_state('low')
    
    print("2. Generando señal de alta concentración...")
    high_attention = generator.generate_attention_state('high')
    
    print("3. Generando sesión dinámica...")
    dynamic_signal, states = generator.generate_dynamic_session(state_changes=6)
    
    # Guardar datos
    print("\n📁 Guardando datos...")
    generator.save_to_csv(low_attention, 'eeg_low_attention.csv')
    generator.save_to_csv(high_attention, 'eeg_high_attention.csv')
    generator.save_to_csv(dynamic_signal, 'eeg_dynamic_session.csv', 
                         labels=np.repeat(states, len(dynamic_signal)//len(states)))
    
    # Visualizar
    print("\n📊 Visualizando señales...")
    generator.visualize_signal(low_attention, "EEG - Baja Atención")
    generator.visualize_signal(high_attention, "EEG - Alta Concentración")
    generator.visualize_signal(dynamic_signal, "EEG - Sesión Dinámica")
    
    print("\n✅ Generación de datos completada!")

if __name__ == "__main__":
    main() 