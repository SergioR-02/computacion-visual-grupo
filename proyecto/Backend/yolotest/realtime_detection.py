"""
📹 Detección de Basura en Tiempo Real con YOLO
==============================================
Este script usa el modelo YOLO entrenado para detectar basura
en tiempo real usando la cámara web.
"""

import cv2
import numpy as np
from ultralytics import YOLO
import torch
import time
import os
import argparse
from collections import defaultdict

class GarbageDetector:
    def __init__(self, model_path, confidence_threshold=0.5, device='auto'):
        """
        Inicializa el detector de basura
        
        Args:
            model_path: Ruta al modelo YOLO entrenado
            confidence_threshold: Umbral de confianza para detecciones
            device: Dispositivo a usar ('auto', 'cpu', 'cuda')
        """
        self.confidence_threshold = confidence_threshold
        
        # Configurar dispositivo
        if device == 'auto':
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        else:
            self.device = device
            
        print(f"🔧 Usando dispositivo: {self.device}")
        
        # Cargar modelo
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"❌ Modelo no encontrado: {model_path}")
            
        print(f"🤖 Cargando modelo: {model_path}")
        self.model = YOLO(model_path)
        self.model.to(self.device)
        
        # Clases de basura
        self.classes = ['BIODEGRADABLE', 'CARDBOARD', 'GLASS', 'METAL', 'PAPER', 'PLASTIC']
        
        # Colores para cada clase (BGR format)
        self.colors = {
            'BIODEGRADABLE': (0, 255, 0),      # Verde
            'CARDBOARD': (0, 165, 255),        # Naranja
            'GLASS': (255, 255, 0),            # Cian
            'METAL': (128, 128, 128),          # Gris
            'PAPER': (255, 255, 255),          # Blanco
            'PLASTIC': (0, 0, 255)             # Rojo
        }
        
        # Estadísticas
        self.detection_count = defaultdict(int)
        self.fps_history = []
        
    def preprocess_frame(self, frame):
        """Preprocesa el frame antes de la detección"""
        # Opcional: redimensionar para mejor rendimiento
        # frame = cv2.resize(frame, (640, 480))
        return frame
    
    def detect_garbage(self, frame):
        """
        Detecta basura en el frame
        
        Args:
            frame: Frame de la cámara
            
        Returns:
            results: Resultados de YOLO
        """
        # Realizar detección
        results = self.model(frame, conf=self.confidence_threshold, verbose=False)
        return results
    
    def draw_detections(self, frame, results):
        """
        Dibuja las detecciones en el frame
        
        Args:
            frame: Frame original
            results: Resultados de YOLO
            
        Returns:
            frame: Frame con detecciones dibujadas
        """
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Obtener coordenadas
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                    
                    # Obtener clase y confianza
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    class_name = self.classes[class_id]
                    
                    # Actualizar contador
                    self.detection_count[class_name] += 1
                    
                    # Obtener color
                    color = self.colors.get(class_name, (255, 255, 255))
                    
                    # Dibujar bounding box
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    
                    # Preparar texto
                    text = f"{class_name}: {confidence:.2f}"
                    text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
                    
                    # Dibujar fondo del texto
                    cv2.rectangle(frame, (x1, y1 - text_size[1] - 10), 
                                (x1 + text_size[0], y1), color, -1)
                    
                    # Dibujar texto
                    cv2.putText(frame, text, (x1, y1 - 5), 
                              cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
        
        return frame
    
    def draw_info_panel(self, frame, fps=0):
        """
        Dibuja panel de información en el frame
        
        Args:
            frame: Frame original
            fps: FPS actual
            
        Returns:
            frame: Frame con panel de información
        """
        height, width = frame.shape[:2]
        
        # Panel de información (esquina superior izquierda)
        panel_width = 300
        panel_height = 150
        
        # Fondo del panel
        overlay = frame.copy()
        cv2.rectangle(overlay, (10, 10), (panel_width, panel_height), (0, 0, 0), -1)
        frame = cv2.addWeighted(frame, 0.7, overlay, 0.3, 0)
        
        # Título
        cv2.putText(frame, "🗂️ DETECTOR DE BASURA", (20, 35), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # FPS
        cv2.putText(frame, f"FPS: {fps:.1f}", (20, 60), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        # Confianza
        cv2.putText(frame, f"Confianza: {self.confidence_threshold:.2f}", (20, 80), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Dispositivo
        cv2.putText(frame, f"Dispositivo: {self.device.upper()}", (20, 100), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Controles
        cv2.putText(frame, "ESC: Salir | SPACE: Pausar", (20, 130), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)
        
        # Panel de estadísticas (esquina inferior derecha)
        if self.detection_count:
            stats_height = len(self.detection_count) * 25 + 50
            stats_y = height - stats_height - 10
            
            # Fondo del panel de estadísticas
            overlay = frame.copy()
            cv2.rectangle(overlay, (width - 250, stats_y), (width - 10, height - 10), (0, 0, 0), -1)
            frame = cv2.addWeighted(frame, 0.7, overlay, 0.3, 0)
            
            # Título de estadísticas
            cv2.putText(frame, "📊 DETECCIONES:", (width - 240, stats_y + 25), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            # Mostrar contadores
            y_offset = 50
            for class_name, count in self.detection_count.items():
                color = self.colors.get(class_name, (255, 255, 255))
                cv2.putText(frame, f"{class_name}: {count}", 
                           (width - 235, stats_y + y_offset), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)
                y_offset += 25
        
        return frame
    
    def run_camera_detection(self, camera_index=0, show_fps=True):
        """
        Ejecuta detección en tiempo real con la cámara
        
        Args:
            camera_index: Índice de la cámara (0 por defecto)
            show_fps: Mostrar FPS en pantalla
        """
        print("📹 Iniciando detección en tiempo real...")
        print("⌨️  Controles:")
        print("   - ESC: Salir")
        print("   - ESPACIO: Pausar/Reanudar")
        print("   - 'r': Reiniciar estadísticas")
        print("   - '+/-': Ajustar confianza")
        
        # Inicializar cámara
        cap = cv2.VideoCapture(camera_index)
        if not cap.isOpened():
            raise ValueError(f"❌ No se pudo abrir la cámara {camera_index}")
        
        # Configurar cámara
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        cap.set(cv2.CAP_PROP_FPS, 30)
        
        print(f"✅ Cámara inicializada: {int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))}x{int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))}")
        
        paused = False
        frame_count = 0
        start_time = time.time()
        
        try:
            while True:
                if not paused:
                    ret, frame = cap.read()
                    if not ret:
                        print("❌ Error al leer frame de la cámara")
                        break
                    
                    # Preprocesar frame
                    frame = self.preprocess_frame(frame)
                    
                    # Detectar basura
                    detection_start = time.time()
                    results = self.detect_garbage(frame)
                    detection_time = time.time() - detection_start
                    
                    # Dibujar detecciones
                    frame = self.draw_detections(frame, results)
                    
                    # Calcular FPS
                    frame_count += 1
                    if frame_count % 10 == 0:  # Actualizar cada 10 frames
                        current_time = time.time()
                        fps = 10 / (current_time - start_time)
                        self.fps_history.append(fps)
                        if len(self.fps_history) > 10:
                            self.fps_history.pop(0)
                        start_time = current_time
                    
                    current_fps = np.mean(self.fps_history) if self.fps_history else 0
                    
                    # Dibujar panel de información
                    frame = self.draw_info_panel(frame, current_fps)
                    
                    # Mostrar tiempo de detección
                    cv2.putText(frame, f"Detección: {detection_time*1000:.1f}ms", 
                               (20, frame.shape[0] - 20), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
                
                # Mostrar frame
                cv2.imshow('🗂️ Detector de Basura - YOLO', frame)
                
                # Manejar teclas
                key = cv2.waitKey(1) & 0xFF
                
                if key == 27:  # ESC
                    break
                elif key == ord(' '):  # ESPACIO
                    paused = not paused
                    status = "PAUSADO" if paused else "REANUDADO"
                    print(f"⏸️  {status}")
                elif key == ord('r'):  # R - Reiniciar estadísticas
                    self.detection_count.clear()
                    print("🔄 Estadísticas reiniciadas")
                elif key == ord('+') or key == ord('='):  # Aumentar confianza
                    self.confidence_threshold = min(0.95, self.confidence_threshold + 0.05)
                    print(f"📈 Confianza: {self.confidence_threshold:.2f}")
                elif key == ord('-'):  # Disminuir confianza
                    self.confidence_threshold = max(0.1, self.confidence_threshold - 0.05)
                    print(f"📉 Confianza: {self.confidence_threshold:.2f}")
                    
        except KeyboardInterrupt:
            print("\n⏹️  Detenido por el usuario")
        finally:
            cap.release()
            cv2.destroyAllWindows()
            
            # Mostrar estadísticas finales
            print("\n📊 ESTADÍSTICAS FINALES:")
            print("=" * 30)
            total_detections = sum(self.detection_count.values())
            print(f"Total detecciones: {total_detections}")
            
            if self.detection_count:
                for class_name, count in sorted(self.detection_count.items(), key=lambda x: x[1], reverse=True):
                    percentage = (count / total_detections) * 100
                    print(f"  {class_name}: {count} ({percentage:.1f}%)")
            else:
                print("  No se detectaron objetos")

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description='Detector de basura en tiempo real con YOLO')
    
    parser.add_argument('--model', type=str, 
                       default='runs/detect/garbage_detection_precise/weights/best.pt',
                       help='Ruta al modelo YOLO entrenado')
    
    parser.add_argument('--confidence', type=float, default=0.45,
                       help='Umbral de confianza (0.1-0.95)')
    
    parser.add_argument('--device', type=str, default='auto',
                       choices=['auto', 'cpu', 'cuda'],
                       help='Dispositivo a usar')
    
    parser.add_argument('--camera', type=int, default=0,
                       help='Índice de la cámara')
    
    args = parser.parse_args()
    
    print("🗂️ DETECTOR DE BASURA EN TIEMPO REAL")
    print("=" * 40)
    
    try:
        # Crear detector
        detector = GarbageDetector(
            model_path=args.model,
            confidence_threshold=args.confidence,
            device=args.device
        )
        
        # Ejecutar detección
        detector.run_camera_detection(camera_index=args.camera)
        
    except FileNotFoundError as e:
        print(f"❌ {e}")
        print("💡 Asegúrate de haber entrenado el modelo primero con train_detection.py")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
