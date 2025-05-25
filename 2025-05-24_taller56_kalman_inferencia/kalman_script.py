#!/usr/bin/env python3
"""
Taller 56 - Filtro de Kalman e Inferencia de Variables Ocultas
Script principal para ejecutar los experimentos y generar resultados
"""

import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from matplotlib.patches import Ellipse
import seaborn as sns

# Configuración
plt.style.use('default')
sns.set_palette("husl")
np.random.seed(42)  # Para reproducibilidad

class KalmanFilter1D:
    """
    Filtro de Kalman 1D para estimar posición y velocidad
    """
    def __init__(self, dt=1.0, process_noise=0.1, measurement_noise=1.0):
        """
        Inicialización del filtro
        
        Args:
            dt: Intervalo de tiempo entre mediciones
            process_noise: Ruido del proceso (Q)
            measurement_noise: Ruido de medición (R)
        """
        self.dt = dt
        
        # Matriz de transición de estado (modelo de movimiento uniforme)
        self.F = np.array([[1, dt],
                          [0, 1]])
        
        # Matriz de observación (solo observamos posición)
        self.H = np.array([[1, 0]])
        
        # Ruido del proceso
        self.Q = np.array([[dt**4/4, dt**3/2],
                          [dt**3/2, dt**2]]) * process_noise
        
        # Ruido de medición
        self.R = np.array([[measurement_noise]])
        
        # Estado inicial [posición, velocidad]
        self.x = np.array([[0.0], [0.0]])
        
        # Covarianza inicial
        self.P = np.eye(2) * 1000
        
    def predict(self):
        """Fase de predicción"""
        self.x = self.F @ self.x
        self.P = self.F @ self.P @ self.F.T + self.Q
        
    def update(self, measurement):
        """Fase de corrección"""
        # Residuo de la medición
        y = measurement - self.H @ self.x
        
        # Covarianza del residuo
        S = self.H @ self.P @ self.H.T + self.R
        
        # Ganancia de Kalman
        K = self.P @ self.H.T @ np.linalg.inv(S)
        
        # Actualización del estado
        self.x = self.x + K @ y
        
        # Actualización de la covarianza
        I = np.eye(self.P.shape[0])
        self.P = (I - K @ self.H) @ self.P
        
    def get_state(self):
        """Obtener estado actual [posición, velocidad]"""
        return self.x.flatten()

class KalmanFilter2D:
    """
    Filtro de Kalman 2D para seguimiento de objetos
    Estado: [x, y, vx, vy] (posición y velocidad en 2D)
    """
    def __init__(self, dt=1.0, process_noise=0.1, measurement_noise=1.0):
        self.dt = dt
        
        # Matriz de transición (modelo de velocidad constante)
        self.F = np.array([[1, 0, dt, 0],
                          [0, 1, 0, dt],
                          [0, 0, 1, 0],
                          [0, 0, 0, 1]])
        
        # Matriz de observación (observamos solo posición)
        self.H = np.array([[1, 0, 0, 0],
                          [0, 1, 0, 0]])
        
        # Ruido del proceso
        self.Q = np.array([[dt**4/4, 0, dt**3/2, 0],
                          [0, dt**4/4, 0, dt**3/2],
                          [dt**3/2, 0, dt**2, 0],
                          [0, dt**3/2, 0, dt**2]]) * process_noise
        
        # Ruido de medición
        self.R = np.eye(2) * measurement_noise
        
        # Estado inicial [x, y, vx, vy]
        self.x = np.zeros((4, 1))
        
        # Covarianza inicial
        self.P = np.eye(4) * 1000
        
    def predict(self):
        """Fase de predicción"""
        self.x = self.F @ self.x
        self.P = self.F @ self.P @ self.F.T + self.Q
        
    def update(self, measurement):
        """Fase de corrección"""
        # Residuo
        y = measurement.reshape(-1, 1) - self.H @ self.x
        
        # Covarianza del residuo
        S = self.H @ self.P @ self.H.T + self.R
        
        # Ganancia de Kalman
        K = self.P @ self.H.T @ np.linalg.inv(S)
        
        # Actualización
        self.x = self.x + K @ y
        I = np.eye(self.P.shape[0])
        self.P = (I - K @ self.H) @ self.P
        
    def get_state(self):
        """Obtener estado actual [x, y, vx, vy]"""
        return self.x.flatten()
    
    def get_position_covariance(self):
        """Obtener matriz de covarianza de posición 2x2"""
        return self.P[:2, :2]

def run_1d_experiment():
    """Ejecutar experimento 1D"""
    print("🔄 Ejecutando experimento 1D...")
    
    # Generar datos sintéticos
    n_steps = 100
    dt = 0.1
    time = np.arange(n_steps) * dt

    # Posición real: movimiento sinusoidal con aceleración variable
    real_position = 10 * np.sin(0.5 * time) + 0.1 * time**2
    real_velocity = np.gradient(real_position, dt)

    # Mediciones ruidosas (solo posición)
    measurement_noise_std = 2.0
    observed_position = real_position + np.random.normal(0, measurement_noise_std, n_steps)

    # Aplicar filtro de Kalman
    kf = KalmanFilter1D(dt=dt, process_noise=0.1, measurement_noise=measurement_noise_std**2)

    # Almacenar resultados
    estimated_positions = []
    estimated_velocities = []
    covariances = []

    for i, z in enumerate(observed_position):
        # Predicción
        kf.predict()
        
        # Corrección con medición
        kf.update(np.array([[z]]))
        
        # Guardar estimaciones
        state = kf.get_state()
        estimated_positions.append(state[0])
        estimated_velocities.append(state[1])
        covariances.append(np.sqrt(kf.P[0, 0]))  # Desviación estándar de posición

    estimated_positions = np.array(estimated_positions)
    estimated_velocities = np.array(estimated_velocities)
    covariances = np.array(covariances)

    # Visualización
    fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(12, 10))

    # Gráfico 1: Posición
    ax1.plot(time, real_position, 'g-', linewidth=2, label='Posición Real', alpha=0.8)
    ax1.scatter(time, observed_position, c='red', s=20, alpha=0.6, label='Mediciones Ruidosas')
    ax1.plot(time, estimated_positions, 'b-', linewidth=2, label='Estimación Kalman')

    # Banda de confianza
    ax1.fill_between(time, 
                    estimated_positions - 2*covariances,
                    estimated_positions + 2*covariances,
                    alpha=0.3, color='blue', label='Incertidumbre (±2σ)')

    ax1.set_ylabel('Posición')
    ax1.set_title('🎯 Estimación de Posición con Filtro de Kalman 1D')
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # Gráfico 2: Velocidad
    ax2.plot(time, real_velocity, 'g-', linewidth=2, label='Velocidad Real', alpha=0.8)
    ax2.plot(time, estimated_velocities, 'b-', linewidth=2, label='Velocidad Estimada')
    ax2.set_ylabel('Velocidad')
    ax2.set_title('📈 Estimación de Velocidad (Variable No Observada)')
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    # Gráfico 3: Error de estimación
    position_error = np.abs(real_position - estimated_positions)
    ax3.plot(time, position_error, 'r-', linewidth=2, label='Error Absoluto')
    ax3.axhline(y=np.mean(position_error), color='orange', linestyle='--', 
               label=f'Error Promedio: {np.mean(position_error):.2f}')
    ax3.set_xlabel('Tiempo (s)')
    ax3.set_ylabel('Error Absoluto')
    ax3.set_title('📊 Error de Estimación')
    ax3.legend()
    ax3.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig('grafico_resultado_1d.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    # Guardar datos
    data_1d = pd.DataFrame({
        'tiempo': time,
        'posicion_real': real_position,
        'posicion_observada': observed_position,
        'posicion_estimada': estimated_positions,
        'velocidad_real': real_velocity,
        'velocidad_estimada': estimated_velocities,
        'incertidumbre': covariances
    })
    data_1d.to_csv('datos_1d.csv', index=False)
    
    print("✅ Experimento 1D completado")
    return real_position, estimated_positions, observed_position

def run_2d_experiment():
    """Ejecutar experimento 2D"""
    print("🔄 Ejecutando experimento 2D...")
    
    # Generar trayectoria 2D
    n_steps = 80
    dt = 0.1
    time = np.arange(n_steps) * dt

    # Trayectoria real: espiral
    radius = 5 + 0.5 * time
    angle = 0.3 * time
    real_x = radius * np.cos(angle)
    real_y = radius * np.sin(angle)

    # Velocidades reales
    real_vx = np.gradient(real_x, dt)
    real_vy = np.gradient(real_y, dt)

    # Mediciones ruidosas
    measurement_noise_2d = 1.5
    observed_x = real_x + np.random.normal(0, measurement_noise_2d, n_steps)
    observed_y = real_y + np.random.normal(0, measurement_noise_2d, n_steps)

    # Aplicar filtro de Kalman 2D
    kf2d = KalmanFilter2D(dt=dt, process_noise=0.1, measurement_noise=measurement_noise_2d**2)

    # Resultados
    estimated_states = []
    position_covariances = []

    for i in range(n_steps):
        # Predicción
        kf2d.predict()
        
        # Corrección
        measurement = np.array([observed_x[i], observed_y[i]])
        kf2d.update(measurement)
        
        # Guardar resultados
        estimated_states.append(kf2d.get_state())
        position_covariances.append(kf2d.get_position_covariance())

    estimated_states = np.array(estimated_states)
    estimated_x = estimated_states[:, 0]
    estimated_y = estimated_states[:, 1]
    estimated_vx = estimated_states[:, 2]
    estimated_vy = estimated_states[:, 3]

    # Visualización 2D
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))

    # Gráfico 1: Trayectoria 2D
    ax1.plot(real_x, real_y, 'g-', linewidth=3, label='Trayectoria Real', alpha=0.8)
    ax1.scatter(observed_x, observed_y, c='red', s=30, alpha=0.6, label='Mediciones Ruidosas')
    ax1.plot(estimated_x, estimated_y, 'b-', linewidth=2, label='Estimación Kalman')

    # Elipses de confianza cada 10 puntos
    for i in range(0, n_steps, 10):
        cov = position_covariances[i]
        eigenvals, eigenvecs = np.linalg.eigh(cov)
        angle = np.degrees(np.arctan2(eigenvecs[1, 0], eigenvecs[0, 0]))
        width, height = 2 * np.sqrt(eigenvals) * 2  # 2-sigma
        
        ellipse = Ellipse((estimated_x[i], estimated_y[i]), width, height, 
                         angle=angle, alpha=0.3, color='blue')
        ax1.add_patch(ellipse)

    ax1.set_xlabel('X')
    ax1.set_ylabel('Y')
    ax1.set_title('🎯 Seguimiento 2D con Filtro de Kalman')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    ax1.axis('equal')

    # Gráfico 2: Componente X vs tiempo
    ax2.plot(time, real_x, 'g-', linewidth=2, label='X Real')
    ax2.scatter(time, observed_x, c='red', s=20, alpha=0.6, label='X Observado')
    ax2.plot(time, estimated_x, 'b-', linewidth=2, label='X Estimado')
    ax2.set_xlabel('Tiempo (s)')
    ax2.set_ylabel('Posición X')
    ax2.set_title('📈 Componente X')
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    # Gráfico 3: Componente Y vs tiempo
    ax3.plot(time, real_y, 'g-', linewidth=2, label='Y Real')
    ax3.scatter(time, observed_y, c='red', s=20, alpha=0.6, label='Y Observado')
    ax3.plot(time, estimated_y, 'b-', linewidth=2, label='Y Estimado')
    ax3.set_xlabel('Tiempo (s)')
    ax3.set_ylabel('Posición Y')
    ax3.set_title('📈 Componente Y')
    ax3.legend()
    ax3.grid(True, alpha=0.3)

    # Gráfico 4: Velocidades estimadas vs reales
    velocity_magnitude_real = np.sqrt(real_vx**2 + real_vy**2)
    velocity_magnitude_est = np.sqrt(estimated_vx**2 + estimated_vy**2)

    ax4.plot(time, velocity_magnitude_real, 'g-', linewidth=2, label='Velocidad Real')
    ax4.plot(time, velocity_magnitude_est, 'b-', linewidth=2, label='Velocidad Estimada')
    ax4.set_xlabel('Tiempo (s)')
    ax4.set_ylabel('|Velocidad|')
    ax4.set_title('🚀 Magnitud de Velocidad (Variable No Observada)')
    ax4.legend()
    ax4.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig('grafico_resultado_2d.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    # Guardar datos
    data_2d = pd.DataFrame({
        'tiempo': time,
        'x_real': real_x,
        'y_real': real_y,
        'x_observado': observed_x,
        'y_observado': observed_y,
        'x_estimado': estimated_x,
        'y_estimado': estimated_y,
        'vx_real': real_vx,
        'vy_real': real_vy,
        'vx_estimado': estimated_vx,
        'vy_estimado': estimated_vy
    })
    data_2d.to_csv('datos_2d.csv', index=False)
    
    print("✅ Experimento 2D completado")
    return real_x, real_y, estimated_x, estimated_y, observed_x, observed_y

def calculate_metrics(real, estimated, observed):
    """Calcular métricas de rendimiento"""
    # Error cuadrático medio (MSE)
    mse_kalman = np.mean((real - estimated)**2)
    mse_observed = np.mean((real - observed)**2)
    
    # Error absoluto medio (MAE)
    mae_kalman = np.mean(np.abs(real - estimated))
    mae_observed = np.mean(np.abs(real - observed))
    
    # Mejora relativa
    improvement_mse = (mse_observed - mse_kalman) / mse_observed * 100
    improvement_mae = (mae_observed - mae_kalman) / mae_observed * 100
    
    return {
        'mse_kalman': mse_kalman,
        'mse_observed': mse_observed,
        'mae_kalman': mae_kalman,
        'mae_observed': mae_observed,
        'improvement_mse': improvement_mse,
        'improvement_mae': improvement_mae
    }

def main():
    """Función principal"""
    print("🧮 Taller 56 - Filtro de Kalman e Inferencia de Variables Ocultas")
    print("=" * 60)
    
    # Ejecutar experimentos
    real_pos_1d, est_pos_1d, obs_pos_1d = run_1d_experiment()
    real_x_2d, real_y_2d, est_x_2d, est_y_2d, obs_x_2d, obs_y_2d = run_2d_experiment()
    
    # Calcular métricas
    metrics_1d = calculate_metrics(real_pos_1d, est_pos_1d, obs_pos_1d)
    
    # Para 2D, usar distancia euclidiana
    real_2d_distance = np.sqrt(real_x_2d**2 + real_y_2d**2)
    estimated_2d_distance = np.sqrt(est_x_2d**2 + est_y_2d**2)
    observed_2d_distance = np.sqrt(obs_x_2d**2 + obs_y_2d**2)
    metrics_2d = calculate_metrics(real_2d_distance, estimated_2d_distance, observed_2d_distance)
    
    print("\n📊 ANÁLISIS DE RENDIMIENTO")
    print("=" * 50)
    print("\n🔢 Caso 1D:")
    print(f"   MSE Kalman:    {metrics_1d['mse_kalman']:.4f}")
    print(f"   MSE Observado: {metrics_1d['mse_observed']:.4f}")
    print(f"   Mejora MSE:    {metrics_1d['improvement_mse']:.1f}%")
    print(f"   MAE Kalman:    {metrics_1d['mae_kalman']:.4f}")
    print(f"   MAE Observado: {metrics_1d['mae_observed']:.4f}")
    print(f"   Mejora MAE:    {metrics_1d['improvement_mae']:.1f}%")

    print("\n🌐 Caso 2D:")
    print(f"   MSE Kalman:    {metrics_2d['mse_kalman']:.4f}")
    print(f"   MSE Observado: {metrics_2d['mse_observed']:.4f}")
    print(f"   Mejora MSE:    {metrics_2d['improvement_mse']:.1f}%")
    print(f"   MAE Kalman:    {metrics_2d['mae_kalman']:.4f}")
    print(f"   MAE Observado: {metrics_2d['mae_observed']:.4f}")
    print(f"   Mejora MAE:    {metrics_2d['improvement_mae']:.1f}%")
    
    print("\n✅ Todos los experimentos completados exitosamente")
    print("📁 Archivos generados:")
    print("   - grafico_resultado_1d.png")
    print("   - grafico_resultado_2d.png")
    print("   - datos_1d.csv")
    print("   - datos_2d.csv")

if __name__ == "__main__":
    main() 