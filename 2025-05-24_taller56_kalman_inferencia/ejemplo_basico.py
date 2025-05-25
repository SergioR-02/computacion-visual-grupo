#!/usr/bin/env python3
"""
Ejemplo básico del filtro de Kalman siguiendo la estructura del taller
"""

import numpy as np
import matplotlib.pyplot as plt

# Generar datos simulados
np.random.seed(42)
real = np.cumsum(np.random.randn(50))           # Posición real
noise = np.random.normal(0, 2, size=50)
observed = real + noise                         # Medición ruidosa

# Inicialización del filtro
estimate = []
P = 1
x_hat = 0
Q = 0.001   # Ruido del proceso
R = 4       # Ruido de medición

for z in observed:
    # Predicción
    x_hat_prior = x_hat
    P_prior = P + Q

    # Corrección
    K = P_prior / (P_prior + R)
    x_hat = x_hat_prior + K * (z - x_hat_prior)
    P = (1 - K) * P_prior
    estimate.append(x_hat)

# Visualización
plt.figure(figsize=(12, 6))
plt.plot(real, 'g-', linewidth=2, label='Real', alpha=0.8)
plt.plot(observed, 'r.', alpha=0.6, label='Medido')
plt.plot(estimate, 'b-', linewidth=2, label='Kalman')
plt.legend()
plt.title('Filtro de Kalman - Ejemplo Básico')
plt.xlabel('Tiempo')
plt.ylabel('Posición')
plt.grid(True, alpha=0.3)
plt.savefig('ejemplo_basico.png', dpi=300, bbox_inches='tight')
plt.show()

# Calcular métricas
mse_kalman = np.mean((real - estimate)**2)
mse_observed = np.mean((real - observed)**2)
improvement = (mse_observed - mse_kalman) / mse_observed * 100

print(f"MSE Observado: {mse_observed:.4f}")
print(f"MSE Kalman: {mse_kalman:.4f}")
print(f"Mejora: {improvement:.1f}%") 