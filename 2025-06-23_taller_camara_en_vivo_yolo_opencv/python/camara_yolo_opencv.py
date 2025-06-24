import cv2
import numpy as np
import time
from ultralytics import YOLO
import os

class CamaraYOLO:
    def __init__(self, modelo_path='../../../yolov8n.pt'):
        # Inicializar captura de video
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            raise Exception("No se pudo abrir la cámara")
        
        # Cargar modelo YOLO
        self.modelo = YOLO(modelo_path)
        
        # Estado de filtros
        self.filtro_actual = 0
        self.filtros = ["Original", "Escala de grises", "Binarización", "Detección de bordes"]
        
        # Estado de pausa
        self.pausado = False
        
        # Crear directorio para guardar capturas si no existe
        self.dir_capturas = "../resultados"
        if not os.path.exists(self.dir_capturas):
            os.makedirs(self.dir_capturas)
    
    def aplicar_filtro(self, frame, tipo_filtro):
        """Aplica diferentes filtros al frame según el tipo seleccionado"""
        if tipo_filtro == 0:  # Original
            return frame
        elif tipo_filtro == 1:  # Escala de grises
            return cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        elif tipo_filtro == 2:  # Binarización
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
            return binary
        elif tipo_filtro == 3:  # Detección de bordes
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 100, 200)
            return edges
    
    def detectar_objetos(self, frame):
        """Detecta objetos en el frame usando YOLO y dibuja los resultados"""
        resultados = self.modelo.predict(frame, conf=0.5)
        frame_anotado = frame.copy()
        
        # Dibujar cajas y etiquetas
        for r in resultados:
            boxes = r.boxes
            for box in boxes:
                # Coordenadas de la caja
                x1, y1, x2, y2 = box.xyxy[0]
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                
                # Confianza y clase
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                nombre_clase = self.modelo.names[cls]
                
                # Dibujar caja
                cv2.rectangle(frame_anotado, (x1, y1), (x2, y2), (0, 255, 0), 2)
                
                # Mostrar etiqueta con clase y confianza
                etiqueta = f'{nombre_clase}: {conf:.2f}'
                cv2.putText(frame_anotado, etiqueta, (x1, y1-10), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        return frame_anotado
    
    def guardar_captura(self, frame):
        """Guarda una captura del frame actual"""
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        filename = f"{self.dir_capturas}/captura_{timestamp}.jpg"
        cv2.imwrite(filename, frame)
        print(f"Imagen guardada como {filename}")
    
    def iniciar_grabacion(self):
        """Inicia la grabación de un video corto"""
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        filename = f"{self.dir_capturas}/video_{timestamp}.mp4"
        fps = int(self.cap.get(cv2.CAP_PROP_FPS))
        width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        self.video_writer = cv2.VideoWriter(filename, fourcc, fps, (width, height))
        self.grabando = True
        self.tiempo_inicio_grabacion = time.time()
        print("Iniciando grabación de 5 segundos...")
    
    def ejecutar(self):
        """Ejecuta el bucle principal de captura y procesamiento"""
        self.grabando = False
        
        # Configurar ventanas
        cv2.namedWindow("Original con YOLO", cv2.WINDOW_NORMAL)
        cv2.namedWindow("Filtro Aplicado", cv2.WINDOW_NORMAL)
        
        print("\n--- Controles ---")
        print("ESC: Salir")
        print("ESPACIO: Pausar/Reanudar")
        print("F: Cambiar filtro")
        print("S: Guardar captura")
        print("R: Grabar video de 5 segundos")
        
        while True:
            if not self.pausado:
                ret, frame = self.cap.read()
                if not ret:
                    print("Error al leer el frame")
                    break
                
                # Detectar objetos con YOLO
                frame_yolo = self.detectar_objetos(frame)
                
                # Aplicar filtro seleccionado
                frame_filtrado = self.aplicar_filtro(frame, self.filtro_actual)
                
                # Convertir a color si es necesario para mostrar
                if len(frame_filtrado.shape) == 2:
                    frame_filtrado_display = cv2.cvtColor(frame_filtrado, cv2.COLOR_GRAY2BGR)
                else:
                    frame_filtrado_display = frame_filtrado
                
                # Mostrar información sobre el filtro
                filtro_info = f"Filtro: {self.filtros[self.filtro_actual]}"
                cv2.putText(frame_filtrado_display, filtro_info, (10, 30), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
                # Grabar si está en modo grabación
                if self.grabando:
                    self.video_writer.write(frame_yolo)
                    tiempo_transcurrido = time.time() - self.tiempo_inicio_grabacion
                    # Detener grabación después de 5 segundos
                    if tiempo_transcurrido > 5:
                        self.grabando = False
                        self.video_writer.release()
                        print("Grabación completada")
                
                # Mostrar frames
                cv2.imshow("Original con YOLO", frame_yolo)
                cv2.imshow("Filtro Aplicado", frame_filtrado_display)
            
            # Capturar tecla
            key = cv2.waitKey(1) & 0xFF
            
            # Procesar teclas
            if key == 27:  # ESC
                break
            elif key == 32:  # ESPACIO
                self.pausado = not self.pausado
                if self.pausado:
                    print("Video pausado")
                else:
                    print("Video reanudado")
            elif key == ord('f'):  # Cambiar filtro
                self.filtro_actual = (self.filtro_actual + 1) % len(self.filtros)
                print(f"Filtro cambiado a: {self.filtros[self.filtro_actual]}")
            elif key == ord('s'):  # Guardar captura
                self.guardar_captura(frame_yolo)
            elif key == ord('r') and not self.grabando:  # Iniciar grabación
                self.iniciar_grabacion()
        
        # Liberar recursos
        self.cap.release()
        cv2.destroyAllWindows()
        if self.grabando:
            self.video_writer.release()

if __name__ == "__main__":
    try:
        camara = CamaraYOLO()
        camara.ejecutar()
    except Exception as e:
        print(f"Error: {e}")
