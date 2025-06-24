import numpy as np
import matplotlib.pyplot as plt
import cv2
import time
from matplotlib.animation import FuncAnimation
from matplotlib.backends.backend_agg import FigureCanvasAgg
from PIL import Image

class SensorSimulador:
    def __init__(self):
        # Simular datos de sensores de movimiento (x, y, z)
        self.datos_x = []
        self.datos_y = []
        self.datos_z = []
        self.tiempos = []
        self.start_time = time.time()
        
    def obtener_datos(self):
        # Simular sensores de movimiento
        tiempo_actual = time.time() - self.start_time
        self.tiempos.append(tiempo_actual)
        
        # Simular acelerómetro con ruido
        x = np.sin(tiempo_actual * 0.8) * 0.5 + np.random.normal(0, 0.1)
        y = np.cos(tiempo_actual * 1.2) * 0.3 + np.random.normal(0, 0.1)
        z = np.sin(tiempo_actual * 0.5) * 0.7 + np.random.normal(0, 0.1)
        
        self.datos_x.append(x)
        self.datos_y.append(y)
        self.datos_z.append(z)
        
        # Mantener solo los últimos 100 puntos
        if len(self.tiempos) > 100:
            self.tiempos.pop(0)
            self.datos_x.pop(0)
            self.datos_y.pop(0)
            self.datos_z.pop(0)
        
        return {
            'tiempo': self.tiempos,
            'x': self.datos_x,
            'y': self.datos_y,
            'z': self.datos_z
        }

def main():
    # Inicializar el simulador de sensores
    simulador = SensorSimulador()
    
    # Configurar la figura y los ejes para el gráfico
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.set_title('Datos de Sensores de Movimiento en Tiempo Real')
    ax.set_xlabel('Tiempo (s)')
    ax.set_ylabel('Aceleración')
    ax.grid(True)
    
    # Crear líneas vacías para los datos
    line_x, = ax.plot([], [], 'r-', label='X')
    line_y, = ax.plot([], [], 'g-', label='Y')
    line_z, = ax.plot([], [], 'b-', label='Z')
    ax.legend()
    
    # Crear una ventana de OpenCV
    cv2.namedWindow('Visualización Combinada', cv2.WINDOW_NORMAL)
    cv2.resizeWindow('Visualización Combinada', 1000, 600)
    
    # Función para convertir la figura de matplotlib a imagen de OpenCV
    def fig_to_image(fig):
        canvas = FigureCanvasAgg(fig)
        canvas.draw()
        buf = canvas.buffer_rgba()
        w, h = canvas.get_width_height()
        img_array = np.frombuffer(buf, dtype=np.uint8).reshape(h, w, 4)
        img_array_rgb = cv2.cvtColor(img_array, cv2.COLOR_RGBA2BGR)
        return img_array_rgb
    
    # Función para actualizar la visualización
    def update():
        # Obtener nuevos datos
        datos = simulador.obtener_datos()
        
        # Actualizar líneas
        line_x.set_data(datos['tiempo'], datos['x'])
        line_y.set_data(datos['tiempo'], datos['y'])
        line_z.set_data(datos['tiempo'], datos['z'])
        
        # Ajustar límites
        if len(datos['tiempo']) > 0:
            ax.set_xlim(datos['tiempo'][0], datos['tiempo'][-1] + 0.5)
        ax.set_ylim(-1.5, 1.5)
        
        # Convertir figura a imagen
        img = fig_to_image(fig)
        
        # Crear un panel de información
        info_panel = np.ones((200, img.shape[1], 3), dtype=np.uint8) * 255
        
        # Añadir texto al panel
        if len(datos['x']) > 0:
            cv2.putText(info_panel, f"Valor X: {datos['x'][-1]:.2f}", (20, 50), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            cv2.putText(info_panel, f"Valor Y: {datos['y'][-1]:.2f}", (20, 100), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(info_panel, f"Valor Z: {datos['z'][-1]:.2f}", (20, 150), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
        
        # Combinar gráfico y panel de información
        combined_img = np.vstack((img, info_panel))
        
        return combined_img
    
    try:
        while True:
            # Actualizar visualización
            img = update()
            
            # Mostrar imagen combinada
            cv2.imshow('Visualización Combinada', img)
            
            # Salir con la tecla 'q'
            key = cv2.waitKey(100) & 0xFF
            if key == ord('q'):
                break
    finally:
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
