"""
EEG Signal Processor - Procesamiento avanzado de señales EEG
Implementa filtros digitales y extracción de características para control BCI
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import signal
from scipy.signal import butter, filtfilt, welch
import warnings
warnings.filterwarnings('ignore')

class EEGSignalProcessor:
    def __init__(self, sampling_rate=256):
        """
        Inicializa el procesador de señales EEG
        
        Args:
            sampling_rate: Frecuencia de muestreo en Hz
        """
        self.fs = sampling_rate
        self.nyquist = self.fs / 2
        
        # Definir bandas de frecuencia
        self.frequency_bands = {
            'delta': (0.5, 4),
            'theta': (4, 8),
            'alpha': (8, 12),
            'beta': (12, 30),
            'gamma': (30, 50)
        }
        
        # Parámetros de control BCI
        self.attention_threshold = 0.3
        self.relaxation_threshold = 0.4
        self.window_size = 2.0  # segundos
        self.overlap = 0.5  # 50% overlap
    
    def design_bandpass_filter(self, low_freq, high_freq, order=4):
        """
        Diseña un filtro pasa banda Butterworth
        
        Args:
            low_freq: Frecuencia de corte inferior
            high_freq: Frecuencia de corte superior
            order: Orden del filtro
        """
        # Normalizar frecuencias
        low_norm = low_freq / self.nyquist
        high_norm = high_freq / self.nyquist
        
        # Diseñar filtro
        b, a = butter(order, [low_norm, high_norm], btype='band')
        return b, a
    
    def apply_bandpass_filter(self, data, low_freq, high_freq, order=4):
        """Aplica filtro pasa banda a los datos"""
        b, a = self.design_bandpass_filter(low_freq, high_freq, order)
        filtered_data = filtfilt(b, a, data)
        return filtered_data
    
    def remove_powerline_noise(self, data, powerline_freq=50, quality_factor=30):
        """
        Elimina ruido de línea eléctrica usando filtro notch
        
        Args:
            data: Señal EEG
            powerline_freq: Frecuencia de línea eléctrica (50 o 60 Hz)
            quality_factor: Factor Q del filtro notch
        """
        # Diseñar filtro notch
        b, a = signal.iirnotch(powerline_freq, quality_factor, self.fs)
        
        # Aplicar filtro
        clean_data = filtfilt(b, a, data)
        return clean_data
    
    def extract_band_power(self, data, band_name, window_length=2):
        """
        Extrae la potencia en una banda de frecuencia específica
        
        Args:
            data: Señal EEG
            band_name: Nombre de la banda ('alpha', 'beta', etc.)
            window_length: Longitud de ventana en segundos
        """
        # Obtener límites de frecuencia
        low_freq, high_freq = self.frequency_bands[band_name]
        
        # Aplicar filtro pasa banda
        filtered_data = self.apply_bandpass_filter(data, low_freq, high_freq)
        
        # Calcular potencia usando ventanas deslizantes
        window_samples = int(window_length * self.fs)
        overlap_samples = int(window_samples * self.overlap)
        
        powers = []
        for i in range(0, len(filtered_data) - window_samples, window_samples - overlap_samples):
            window_data = filtered_data[i:i + window_samples]
            power = np.mean(window_data ** 2)
            powers.append(power)
        
        return np.array(powers)
    
    def calculate_spectral_features(self, data, window_length=2):
        """
        Calcula características espectrales de la señal EEG
        
        Returns:
            dict: Diccionario con potencias por banda y ratios
        """
        features = {}
        
        # Extraer potencia por banda
        for band_name in self.frequency_bands.keys():
            band_power = self.extract_band_power(data, band_name, window_length)
            features[f'{band_name}_power'] = band_power
        
        # Calcular ratios importantes para BCI
        alpha_power = features['alpha_power']
        beta_power = features['beta_power']
        theta_power = features['theta_power']
        
        # Ratio alpha/beta (relajación vs concentración)
        features['alpha_beta_ratio'] = alpha_power / (beta_power + 1e-10)
        
        # Ratio theta/beta (drowsiness vs alertness)
        features['theta_beta_ratio'] = theta_power / (beta_power + 1e-10)
        
        # Índice de atención (basado en beta)
        total_power = alpha_power + beta_power + theta_power
        features['attention_index'] = beta_power / (total_power + 1e-10)
        
        # Índice de relajación (basado en alpha)
        features['relaxation_index'] = alpha_power / (total_power + 1e-10)
        
        return features
    
    def detect_mental_state(self, data, window_length=2):
        """
        Detecta el estado mental basado en características espectrales
        
        Returns:
            list: Lista de estados mentales detectados
        """
        features = self.calculate_spectral_features(data, window_length)
        
        attention_index = features['attention_index']
        relaxation_index = features['relaxation_index']
        
        states = []
        for i in range(len(attention_index)):
            if attention_index[i] > self.attention_threshold:
                if relaxation_index[i] < 0.2:  # Baja relajación
                    states.append('focused')
                else:
                    states.append('alert')
            elif relaxation_index[i] > self.relaxation_threshold:
                states.append('relaxed')
            else:
                states.append('neutral')
        
        return states
    
    def generate_control_signals(self, data, window_length=2):
        """
        Genera señales de control para la interfaz visual
        
        Returns:
            dict: Señales de control normalizadas [0, 1]
        """
        features = self.calculate_spectral_features(data, window_length)
        
        # Normalizar características para control
        control_signals = {}
        
        # Señal de atención (0 = relajado, 1 = muy concentrado)
        attention = features['attention_index']
        control_signals['attention'] = np.clip(attention / 0.5, 0, 1)
        
        # Señal de relajación (0 = estresado, 1 = muy relajado)
        relaxation = features['relaxation_index']
        control_signals['relaxation'] = np.clip(relaxation / 0.6, 0, 1)
        
        # Señal de activación mental (combinación alpha-beta)
        activation = features['alpha_beta_ratio']
        # Invertir ratio (más beta = más activación)
        control_signals['activation'] = np.clip(1 / (activation + 1), 0, 1)
        
        # Señal de calma (basada en theta)
        theta_power = features['theta_power']
        theta_normalized = theta_power / (np.max(theta_power) + 1e-10)
        control_signals['calmness'] = theta_normalized
        
        return control_signals
    
    def real_time_analysis(self, data_buffer, buffer_length=5):
        """
        Análisis en tiempo real con buffer circular
        
        Args:
            data_buffer: Buffer circular con los últimos datos
            buffer_length: Longitud del buffer en segundos
        """
        if len(data_buffer) < buffer_length * self.fs:
            return None
        
        # Tomar últimos datos del buffer
        recent_data = data_buffer[-int(buffer_length * self.fs):]
        
        # Limpiar señal
        clean_data = self.remove_powerline_noise(recent_data)
        
        # Generar características
        features = self.calculate_spectral_features(clean_data, window_length=1)
        control_signals = self.generate_control_signals(clean_data, window_length=1)
        mental_state = self.detect_mental_state(clean_data, window_length=1)
        
        return {
            'features': features,
            'control_signals': control_signals,
            'mental_state': mental_state[-1] if mental_state else 'neutral',
            'timestamp': len(data_buffer) / self.fs
        }
    
    def visualize_processing_pipeline(self, data, title="Pipeline de Procesamiento EEG"):
        """Visualiza todo el pipeline de procesamiento"""
        plt.figure(figsize=(16, 12))
        
        # 1. Señal original
        plt.subplot(3, 3, 1)
        time = np.arange(len(data)) / self.fs
        plt.plot(time, data)
        plt.title('Señal EEG Original')
        plt.xlabel('Tiempo (s)')
        plt.ylabel('Amplitud (μV)')
        plt.grid(True, alpha=0.3)
        
        # 2. Señal filtrada (sin ruido de línea)
        plt.subplot(3, 3, 2)
        clean_data = self.remove_powerline_noise(data)
        plt.plot(time, clean_data)
        plt.title('Señal Limpia (sin 50Hz)')
        plt.xlabel('Tiempo (s)')
        plt.ylabel('Amplitud (μV)')
        plt.grid(True, alpha=0.3)
        
        # 3. Filtro Alpha
        plt.subplot(3, 3, 3)
        alpha_filtered = self.apply_bandpass_filter(data, 8, 12)
        plt.plot(time, alpha_filtered)
        plt.title('Banda Alpha (8-12 Hz)')
        plt.xlabel('Tiempo (s)')
        plt.ylabel('Amplitud (μV)')
        plt.grid(True, alpha=0.3)
        
        # 4. Filtro Beta
        plt.subplot(3, 3, 4)
        beta_filtered = self.apply_bandpass_filter(data, 12, 30)
        plt.plot(time, beta_filtered)
        plt.title('Banda Beta (12-30 Hz)')
        plt.xlabel('Tiempo (s)')
        plt.ylabel('Amplitud (μV)')
        plt.grid(True, alpha=0.3)
        
        # 5. Potencias por banda
        plt.subplot(3, 3, 5)
        features = self.calculate_spectral_features(data)
        bands = ['delta', 'theta', 'alpha', 'beta', 'gamma']
        powers = [np.mean(features[f'{band}_power']) for band in bands]
        colors = ['purple', 'blue', 'green', 'orange', 'red']
        plt.bar(bands, powers, color=colors, alpha=0.7)
        plt.title('Potencia Media por Banda')
        plt.ylabel('Potencia')
        plt.xticks(rotation=45)
        
        # 6. Señales de control
        plt.subplot(3, 3, 6)
        control_signals = self.generate_control_signals(data)
        control_time = np.linspace(0, len(data)/self.fs, len(control_signals['attention']))
        
        plt.plot(control_time, control_signals['attention'], label='Atención', linewidth=2)
        plt.plot(control_time, control_signals['relaxation'], label='Relajación', linewidth=2)
        plt.plot(control_time, control_signals['activation'], label='Activación', linewidth=2)
        plt.title('Señales de Control BCI')
        plt.xlabel('Tiempo (s)')
        plt.ylabel('Nivel de Control [0-1]')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # 7. Estados mentales
        plt.subplot(3, 3, 7)
        mental_states = self.detect_mental_state(data)
        state_mapping = {'focused': 3, 'alert': 2, 'neutral': 1, 'relaxed': 0}
        state_values = [state_mapping[state] for state in mental_states]
        state_time = np.linspace(0, len(data)/self.fs, len(mental_states))
        
        plt.step(state_time, state_values, where='mid', linewidth=2)
        plt.title('Estados Mentales Detectados')
        plt.xlabel('Tiempo (s)')
        plt.ylabel('Estado')
        plt.yticks([0, 1, 2, 3], ['Relajado', 'Neutral', 'Alerta', 'Concentrado'])
        plt.grid(True, alpha=0.3)
        
        # 8. Espectrograma
        plt.subplot(3, 3, 8)
        frequencies, times, Sxx = signal.spectrogram(data, self.fs, nperseg=self.fs)
        plt.pcolormesh(times, frequencies, 10 * np.log10(Sxx), shading='gouraud')
        plt.colorbar(label='Potencia (dB)')
        plt.title('Espectrograma')
        plt.xlabel('Tiempo (s)')
        plt.ylabel('Frecuencia (Hz)')
        plt.ylim(0, 50)
        
        # 9. Ratio Alpha/Beta
        plt.subplot(3, 3, 9)
        alpha_beta_ratio = features['alpha_beta_ratio']
        ratio_time = np.linspace(0, len(data)/self.fs, len(alpha_beta_ratio))
        plt.plot(ratio_time, alpha_beta_ratio, linewidth=2, color='purple')
        plt.axhline(y=1, color='r', linestyle='--', alpha=0.7, label='Equilibrio')
        plt.title('Ratio Alpha/Beta')
        plt.xlabel('Tiempo (s)')
        plt.ylabel('Ratio')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.show()

def main():
    """Función de prueba del procesador"""
    print("🔧 Procesador de Señales EEG")
    print("="*50)
    
    # Importar generador de datos
    from eeg_data_generator import EEGDataGenerator
    
    # Generar datos de prueba
    generator = EEGDataGenerator(sampling_rate=256, duration=20)
    test_signal = generator.generate_attention_state('high')
    
    # Crear procesador
    processor = EEGSignalProcessor(sampling_rate=256)
    
    # Procesar señal
    print("\n🔍 Analizando señal...")
    features = processor.calculate_spectral_features(test_signal)
    control_signals = processor.generate_control_signals(test_signal)
    mental_states = processor.detect_mental_state(test_signal)
    
    print(f"📊 Estados mentales detectados: {set(mental_states)}")
    print(f"📈 Nivel de atención promedio: {np.mean(control_signals['attention']):.3f}")
    print(f"😌 Nivel de relajación promedio: {np.mean(control_signals['relaxation']):.3f}")
    
    # Visualizar procesamiento
    print("\n📊 Visualizando pipeline...")
    processor.visualize_processing_pipeline(test_signal)
    
    print("\n✅ Procesamiento completado!")

if __name__ == "__main__":
    main() 