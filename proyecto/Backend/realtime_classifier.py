import cv2
import numpy as np
import tensorflow as tf
import json
import time
from datetime import datetime

# Importar load_model de forma compatible
try:
    from tensorflow.keras.models import load_model
except ImportError:
    from keras.models import load_model

class GarbageClassifierRealTime:
    def __init__(self, model_path='best_garbage_model.h5', labels_path='class_labels.json'):
        """Inicializar el clasificador en tiempo real"""
        print("🤖 Inicializando clasificador de basura en tiempo real...")
        
        # Cargar modelo
        try:
            self.model = load_model(model_path)
            print(f"✅ Modelo cargado: {model_path}")
        except Exception as e:
            print(f"❌ Error cargando modelo: {e}")
            print("🏋️ Ejecuta primero train_model.py para entrenar el modelo")
            exit(1)
        
        # Cargar etiquetas
        try:
            with open(labels_path, 'r') as f:
                self.class_labels = json.load(f)
            print(f"✅ Etiquetas cargadas: {list(self.class_labels.values())}")
        except Exception as e:
            print(f"❌ Error cargando etiquetas: {e}")
            exit(1)
        
        # Configuración
        self.img_size = 224
        self.confidence_threshold = 0.5
        
        # Colores para cada clase (7 clases nuevas)
        self.colors = {
            'biological': (0, 255, 0),    # Verde
            'cardboard': (139, 69, 19),   # Marrón
            'glass': (0, 150, 255),       # Cyan
            'metal': (128, 128, 128),     # Gris
            'paper': (0, 0, 255),     # Blanco
            'plastic': (0, 0, 255),       # Azul
            'trash': (255, 0, 0)          # Rojo
        }
        
        # Estadísticas
        self.fps_counter = 0
        self.fps_start_time = time.time()
        self.current_fps = 0
        
    def preprocess_frame(self, frame):
        """Preprocesar frame para el modelo"""
        # Redimensionar
        resized = cv2.resize(frame, (self.img_size, self.img_size))
        
        # Normalizar
        normalized = resized.astype('float32') / 255.0
        
        # Añadir dimensión batch
        batch = np.expand_dims(normalized, axis=0)
        
        return batch
    
    def predict(self, frame):
        """Realizar predicción en el frame"""
        # Preprocesar
        processed_frame = self.preprocess_frame(frame)
        
        # Predicción
        start_time = time.time()
        predictions = self.model.predict(processed_frame, verbose=0)
        inference_time = (time.time() - start_time) * 1000  # en ms
        
        # Obtener clase predicha y confianza
        predicted_class_idx = np.argmax(predictions[0])
        confidence = predictions[0][predicted_class_idx]
        
        # Obtener nombre de la clase
        class_name = self.class_labels[str(predicted_class_idx)]
        
        return class_name, confidence, inference_time, predictions[0]
    
    def draw_prediction(self, frame, class_name, confidence, inference_time, all_predictions):
        """Dibujar información de predicción en el frame"""
        height, width = frame.shape[:2]
        
        # Color según la clase
        color = self.colors.get(class_name, (255, 255, 255))
        
        # Dibujar rectángulo principal
        if confidence > self.confidence_threshold:
            cv2.rectangle(frame, (10, 10), (width-10, 120), color, 2)
            cv2.rectangle(frame, (10, 10), (width-10, 120), color, -1)
            cv2.rectangle(frame, (10, 10), (width-10, 120), (0, 0, 0), 2)
            
            # Texto principal
            text = f"CLASE: {class_name.upper()}"
            cv2.putText(frame, text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 2)
            
            # Confianza
            conf_text = f"Confianza: {confidence:.2%}"
            cv2.putText(frame, conf_text, (20, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        else:
            # Predicción de baja confianza
            cv2.rectangle(frame, (10, 10), (width-10, 80), (0, 0, 255), 2)
            text = "OBJETO NO RECONOCIDO"
            cv2.putText(frame, text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            conf_text = f"Confianza: {confidence:.2%}"
            cv2.putText(frame, conf_text, (20, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        
        # Información técnica
        fps_text = f"FPS: {self.current_fps:.1f}"
        cv2.putText(frame, fps_text, (width-150, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        time_text = f"Inferencia: {inference_time:.1f}ms"
        cv2.putText(frame, time_text, (width-200, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Top 3 predicciones
        top_3_indices = np.argsort(all_predictions)[-3:][::-1]
        y_start = height - 100
        
        cv2.putText(frame, "Top 3 Predicciones:", (10, y_start), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        for i, idx in enumerate(top_3_indices):
            class_name_top = self.class_labels[str(idx)]
            conf_top = all_predictions[idx]
            text = f"{i+1}. {class_name_top}: {conf_top:.2%}"
            cv2.putText(frame, text, (10, y_start + 25 + i*20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    
    def update_fps(self):
        """Actualizar contador de FPS"""
        self.fps_counter += 1
        if self.fps_counter >= 30:  # Actualizar cada 30 frames
            elapsed_time = time.time() - self.fps_start_time
            self.current_fps = self.fps_counter / elapsed_time
            self.fps_counter = 0
            self.fps_start_time = time.time()
    
    def run(self, camera_id=0):
        """Ejecutar clasificación en tiempo real"""
        print("📹 Iniciando cámara...")
        
        # Inicializar cámara
        cap = cv2.VideoCapture(camera_id)
        
        if not cap.isOpened():
            print("❌ Error: No se pudo abrir la cámara")
            return
        
        # Configurar cámara para mejor rendimiento
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 30)
        
        print("🚀 ¡Sistema iniciado! Presiona 'q' para salir")
        print("💡 Consejos:")
        print("   - Mantén el objeto centrado en la cámara")
        print("   - Asegúrate de tener buena iluminación")
        print("   - Mantén el objeto quieto por unos segundos")
        
        while True:
            # Capturar frame
            ret, frame = cap.read()
            if not ret:
                break
            
            # Voltear horizontalmente para efecto espejo
            frame = cv2.flip(frame, 1)
            
            # Realizar predicción
            class_name, confidence, inference_time, all_predictions = self.predict(frame)
            
            # Dibujar información
            self.draw_prediction(frame, class_name, confidence, inference_time, all_predictions)
            
            # Actualizar FPS
            self.update_fps()
            
            # Mostrar frame
            cv2.imshow('🗑️ Clasificador de Basura en Tiempo Real', frame)
            
            # Salir con 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        # Limpiar
        cap.release()
        cv2.destroyAllWindows()
        print("👋 ¡Sistema cerrado correctamente!")

def main():
    """Función principal"""
    print("🗑️ CLASIFICADOR DE BASURA EN TIEMPO REAL")
    print("=" * 50)
    
    # Crear clasificador
    classifier = GarbageClassifierRealTime()
    
    # Ejecutar
    try:
        classifier.run()
    except KeyboardInterrupt:
        print("\n🛑 Interrumpido por el usuario")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
