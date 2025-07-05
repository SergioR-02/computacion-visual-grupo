import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import time

# Configuración inicial
fig, ax = plt.subplots(figsize=(10, 6))
ax.set_xlim(0, 100)
ax.set_ylim(-1.5, 1.5)
ax.set_title('Simulación de Temperatura en Tiempo Real')
ax.set_xlabel('Tiempo (s)')
ax.set_ylabel('Temperatura (normalizada)')
ax.grid(True)

# Datos iniciales
x_data = []
y_data = []
line, = ax.plot([], [], 'r-', lw=2)

# Contador para seguir el tiempo
start_time = time.time()

# Función para inicializar la animación
def init():
    line.set_data([], [])
    return line,

# Función de actualización para la animación
def update(frame):
    # Obtener tiempo transcurrido
    current_time = time.time() - start_time
    x_data.append(current_time)
    
    # Simular temperatura usando una función seno con algo de ruido
    temperature = np.sin(current_time * 0.5) + np.random.normal(0, 0.1)
    y_data.append(temperature)
    
    # Limitar los datos para mostrar solo los últimos 100 puntos
    if len(x_data) > 100:
        x_data.pop(0)
        y_data.pop(0)
    
    # Ajustar el rango X automáticamente
    ax.set_xlim(max(0, current_time - 20), current_time + 1)
    
    # Actualizar los datos
    line.set_data(x_data, y_data)
    
    return line,

# Crear animación
ani = FuncAnimation(fig, update, frames=None, init_func=init, 
                   interval=100, blit=True)

# Mostrar la animación
plt.tight_layout()
plt.show()
