import numpy as np
import matplotlib.pyplot as plt
import cv2
import time
from matplotlib.backends.backend_agg import FigureCanvasAgg

class GeneradorDatos:
    """Clase para generar diferentes tipos de datos simulados en tiempo real"""
    
    def __init__(self):
        self.tiempo_inicio = time.time()
        
    def obtener_tiempo(self):
        """Retorna el tiempo transcurrido desde la inicialización"""
        return time.time() - self.tiempo_inicio
    
    def temperatura(self):
        """Simula una señal de temperatura con patrón sinusoidal y ruido aleatorio"""
        t = self.obtener_tiempo()
        # Temperatura base que oscila entre 20 y 25 grados
        base = 22.5 + 2.5 * np.sin(0.1 * t)
        # Agregar ruido aleatorio para simular variaciones
        ruido = np.random.normal(0, 0.2)
        return base + ruido
    
    def conteo_objetos(self, max_objetos=10):
        """Simula conteo de objetos con variación aleatoria"""
        # Simular detección de 0 a max_objetos
        return np.random.randint(0, max_objetos + 1)
    
    def senal_sensor(self):
        """Simula una señal de sensor con múltiples componentes de frecuencia"""
        t = self.obtener_tiempo()
        # Señal compuesta de diferentes frecuencias
        senal = 0.5 * np.sin(t) + 0.25 * np.sin(2.5 * t) + 0.15 * np.sin(5 * t)
        # Agregar ruido aleatorio
        ruido = np.random.normal(0, 0.05)
        return senal + ruido

# Función para crear un gráfico y convertirlo a imagen para OpenCV
def crear_grafico_opencv(datos_x, datos_y, titulo="Señal del Sensor"):
    # Crear figura de matplotlib
    fig, ax = plt.subplots(figsize=(6, 3))
    ax.plot(datos_x, datos_y, 'b-')
    ax.set_title(titulo)
    ax.set_xlabel('Tiempo (s)')
    ax.set_ylabel('Valor')
    ax.grid(True)
    
    # Convertir figura a imagen
    fig.canvas.draw()
    img = np.frombuffer(fig.canvas.renderer.buffer_rgba(), dtype=np.uint8)
    img = img.reshape(fig.canvas.get_width_height()[::-1] + (4,))
    img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
    
    plt.close(fig)  # Cerrar la figura para liberar memoria
    return img

# Función para simular un video con detección
def simular_deteccion_video():
    # Crear un fondo negro como "video simulado"
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Simular objeto detectado (rectángulo aleatorio)
    x, y = np.random.randint(100, 500), np.random.randint(100, 400)
    w, h = np.random.randint(50, 150), np.random.randint(50, 150)
    
    # Dibujar rectángulo
    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
    
    # Añadir texto
    cv2.putText(frame, "Objeto", (x, y-10), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    return frame, 1  # Frame y número de objetos detectados

def main():
    print("Iniciando visualización en tiempo real con OpenCV...")
    
    # Inicializar generador de datos
    generador = GeneradorDatos()
    
    # Datos para el gráfico
    datos_x = []
    datos_y = []
    conteos = []
    tiempos_conteo = []
    
    # Tiempo inicial
    tiempo_inicio = time.time()
    
    try:
        while True:
            # Obtener tiempo actual
            tiempo_actual = time.time() - tiempo_inicio
            
            # Simular señal y detección
            valor_sensor = generador.senal_sensor()
            frame, num_objetos = simular_deteccion_video()
            
            # Agregar datos para gráficos
            datos_x.append(tiempo_actual)
            datos_y.append(valor_sensor)
            conteos.append(num_objetos)
            tiempos_conteo.append(tiempo_actual)
            
            # Mantener solo los últimos 50 puntos
            if len(datos_x) > 50:
                datos_x.pop(0)
                datos_y.pop(0)
            if len(conteos) > 20:
                conteos.pop(0)
                tiempos_conteo.pop(0)
            
            # Crear gráficos
            grafico_sensor = crear_grafico_opencv(datos_x, datos_y, "Señal del Sensor")
            grafico_conteo = crear_grafico_opencv(tiempos_conteo, conteos, "Conteo de Objetos")
            
            # Redimensionar gráficos para que coincidan con el ancho del frame
            h, w = frame.shape[:2]
            grafico_sensor = cv2.resize(grafico_sensor, (w, int(w * grafico_sensor.shape[0] / grafico_sensor.shape[1])))
            grafico_conteo = cv2.resize(grafico_conteo, (w, int(w * grafico_conteo.shape[0] / grafico_conteo.shape[1])))
            
            # Combinar frame y gráficos verticalmente
            resultado = np.vstack([frame, grafico_sensor, grafico_conteo])
            
            # Mostrar imagen combinada
            cv2.imshow("Visualización en Tiempo Real", resultado)
            
            # Salir con 'q'
            if cv2.waitKey(100) & 0xFF == ord('q'):
                break
            
            # Pequeña pausa para simular procesamiento en tiempo real
            time.sleep(0.1)
    
    finally:
        cv2.destroyAllWindows()
        print("Visualización finalizada.")

if __name__ == "__main__":
    main()
