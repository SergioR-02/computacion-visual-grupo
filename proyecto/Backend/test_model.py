import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import json
import os
import matplotlib.pyplot as plt
from PIL import Image

class ModelTester:
    def __init__(self, model_path='best_garbage_model.h5', labels_path='class_labels.json'):
        """Inicializar el tester del modelo"""
        self.model = load_model(model_path)
        with open(labels_path, 'r') as f:
            self.class_labels = json.load(f)
        self.img_size = 224
    
    def test_single_image(self, image_path):
        """Testear una sola imagen"""
        # Cargar imagen
        img = cv2.imread(image_path)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Preprocesar
        img_resized = cv2.resize(img_rgb, (self.img_size, self.img_size))
        img_normalized = img_resized.astype('float32') / 255.0
        img_batch = np.expand_dims(img_normalized, axis=0)
        
        # Predicción
        predictions = self.model.predict(img_batch, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = predictions[0][predicted_class_idx]
        class_name = self.class_labels[str(predicted_class_idx)]
        
        # Mostrar resultado
        plt.figure(figsize=(10, 6))
        
        # Imagen original
        plt.subplot(1, 2, 1)
        plt.imshow(img_rgb)
        plt.title(f'Imagen Original\n{os.path.basename(image_path)}')
        plt.axis('off')
        
        # Gráfico de predicciones
        plt.subplot(1, 2, 2)
        classes = list(self.class_labels.values())
        confidences = predictions[0]
        
        # Ordenar por confianza
        sorted_indices = np.argsort(confidences)[::-1]
        sorted_classes = [classes[i] for i in sorted_indices]
        sorted_confidences = [confidences[i] for i in sorted_indices]
        
        colors = ['red' if i == 0 else 'blue' for i in range(len(classes))]
        
        plt.barh(sorted_classes, sorted_confidences, color=colors)
        plt.xlabel('Confianza')
        plt.title(f'Predicción: {class_name}\nConfianza: {confidence:.2%}')
        plt.xlim(0, 1)
        
        plt.tight_layout()
        plt.show()
        
        return class_name, confidence
    
    def test_camera_snapshot(self):
        """Tomar una foto con la cámara y testearla"""
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("❌ Error: No se pudo abrir la cámara")
            return
        
        print("📸 Presiona ESPACIO para tomar foto, ESC para salir")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame = cv2.flip(frame, 1)
            cv2.putText(frame, "Presiona ESPACIO para capturar", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.imshow('Capturar Imagen', frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord(' '):  # Espacio
                # Guardar imagen
                cv2.imwrite('test_snapshot.jpg', frame)
                
                # Testear imagen
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                img_resized = cv2.resize(frame_rgb, (self.img_size, self.img_size))
                img_normalized = img_resized.astype('float32') / 255.0
                img_batch = np.expand_dims(img_normalized, axis=0)
                
                predictions = self.model.predict(img_batch, verbose=0)
                predicted_class_idx = np.argmax(predictions[0])
                confidence = predictions[0][predicted_class_idx]
                class_name = self.class_labels[str(predicted_class_idx)]
                
                print(f"📊 Resultado: {class_name} ({confidence:.2%} confianza)")
                
                # Mostrar en pantalla
                cv2.putText(frame, f"Resultado: {class_name}", (10, 60), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(frame, f"Confianza: {confidence:.2%}", (10, 90), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.imshow('Capturar Imagen', frame)
                cv2.waitKey(2000)  # Mostrar resultado por 2 segundos
                
            elif key == 27:  # ESC
                break
        
        cap.release()
        cv2.destroyAllWindows()

def main():
    """Función principal para testing"""
    print("🧪 TESTER DEL MODELO DE CLASIFICACIÓN DE BASURA")
    print("=" * 50)
    
    try:
        tester = ModelTester()
        
        while True:
            print("\nOpciones:")
            print("1. Testear imagen desde archivo")
            print("2. Testear con snapshot de cámara")
            print("3. Salir")
            
            choice = input("\nSelecciona una opción (1-3): ").strip()
            
            if choice == '1':
                image_path = input("Ingresa la ruta de la imagen: ").strip()
                if os.path.exists(image_path):
                    class_name, confidence = tester.test_single_image(image_path)
                    print(f"✅ Resultado: {class_name} ({confidence:.2%} confianza)")
                else:
                    print("❌ Archivo no encontrado")
            
            elif choice == '2':
                tester.test_camera_snapshot()
            
            elif choice == '3':
                print("👋 ¡Hasta luego!")
                break
            
            else:
                print("❌ Opción inválida")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        print("🏋️ Asegúrate de haber entrenado el modelo primero con train_model.py")

if __name__ == "__main__":
    main()
