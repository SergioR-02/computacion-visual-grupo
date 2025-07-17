"""
Versión alternativa que toma fotos con la cámara y las clasifica,
guardando los resultados como imágenes en lugar de mostrar video en tiempo real.
"""

import cv2
import numpy as np
import tensorflow as tf
import json
import time
import os
from datetime import datetime
import requests  # para descargar imágenes desde URLs

# Importar módulos de Keras de forma compatible
try:
    from tensorflow.keras.models import load_model, Model
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
except ImportError:
    from keras.models import load_model, Model
    from keras.applications import MobileNetV2
    from keras.layers import Dense, GlobalAveragePooling2D, Dropout

class PhotoClassifier:
    def __init__(self, model_path='garbage_classifier_final.h5', labels_path='class_labels.json'):
        """Inicializar clasificador de fotos"""
        print("🚀 Cargando modelo especializado de basura...")
        
        # Cargar etiquetas PRIMERO (necesarias para crear modelo)
        try:
            with open(labels_path, 'r') as f:
                self.class_labels = json.load(f)
            print(f"✅ Etiquetas cargadas: {list(self.class_labels.values())}")
        except Exception as e:
            print(f"❌ Error cargando etiquetas: {e}")
            exit(1)
        
        # Cargar modelo especializado de basura
        try:
            # Intenta cargar con opciones de compatibilidad
            self.model = load_model(model_path, compile=False)
            
            # Recompilar el modelo con la versión actual de TensorFlow
            self.model.compile(
                optimizer='adam',
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
            print(f"✅ Modelo cargado con compatibilidad: {model_path}")
        except Exception as e:
            print(f"❌ Error cargando modelo: {e}")
            print("🔧 Creando modelo base nuevo...")
            
            # Crear un modelo nuevo compatible
            try:
                print("🔄 Creando modelo desde cero...")
                self.model = self._create_base_model()
                print("✅ Modelo base nuevo creado (necesita entrenamiento)")
                print("⚠️ NOTA: Este modelo no tiene pesos entrenados, dará predicciones aleatorias")
            except Exception as e2:
                print(f"❌ Error creando modelo base: {e2}")
                print("🏋️ Necesitas reentrenar el modelo con la versión actual de TensorFlow")
                print("💡 Ejecuta: python train_model.py")
                exit(1)
        
        # Configuración
        self.img_size = 224
        self.confidence_threshold = 0.5
        
        # Crear directorio para guardar fotos
        self.output_dir = "classified_photos"
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
        
        print("✅ Modelo cargado - ¡Listo para clasificar fotos!")
    
    def _create_base_model(self):
        """Crear modelo base con la misma arquitectura que se usó en el entrenamiento"""
        
        # Cargar MobileNetV2 pre-entrenado (misma configuración que train_model.py)
        base_model = MobileNetV2(
            weights='imagenet',
            include_top=False,
            input_shape=(224, 224, 3)
        )
        
        # Recrear la misma arquitectura personalizada  
        inputs = tf.keras.layers.Input(shape=(224, 224, 3))
        x = base_model(inputs, training=False)
        x = GlobalAveragePooling2D()(x)
        x = Dropout(0.5)(x)
        x = Dense(128, activation='relu')(x)
        x = Dropout(0.3)(x)
        
        # Número de clases basado en las etiquetas cargadas
        num_classes = len(self.class_labels)
        outputs = Dense(num_classes, activation='softmax')(x)
        
        model = Model(inputs, outputs)
        
        # Compilar el modelo
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def preprocess_image(self, image):
        """Preprocesar imagen para el modelo especializado"""
        # Redimensionar
        resized = cv2.resize(image, (self.img_size, self.img_size))
        
        # Normalizar
        normalized = resized.astype('float32') / 255.0
        
        # Añadir dimensión batch
        batch = np.expand_dims(normalized, axis=0)
        
        return batch
    
    def predict(self, image):
        """Realizar predicción con el modelo especializado"""
        # Preprocesar
        processed_image = self.preprocess_image(image)
        
        # Predicción
        start_time = time.time()
        predictions = self.model.predict(processed_image, verbose=0)
        inference_time = (time.time() - start_time) * 1000  # en ms
        
        # Obtener clase predicha y confianza
        predicted_class_idx = np.argmax(predictions[0])
        confidence = predictions[0][predicted_class_idx]
        
        # Obtener nombre de la clase
        class_name = self.class_labels[str(predicted_class_idx)]
        
        return class_name, confidence, inference_time, predictions[0]
    
    def classify_image(self, image):
        """Clasificar una imagen"""
        # Realizar predicción
        class_name, confidence, inference_time, all_predictions = self.predict(image)
        
        return {
            'garbage_class': class_name,
            'confidence': confidence,
            'inference_time': inference_time,
            'original_class': class_name,  # Ya no hay mapeo, es directo
            'all_predictions': all_predictions
        }
    
    def classify_image_realtime(self, image):
        """
        Clasificar imagen optimizada para tiempo real
        Mantiene la precisión pero optimiza velocidad de procesamiento
        """
        # Preprocesar con optimizaciones para tiempo real
        processed_image = self.preprocess_image_realtime(image)
        
        # Predicción optimizada
        start_time = time.time()
        predictions = self.model.predict(processed_image, verbose=0)
        inference_time = (time.time() - start_time) * 1000  # en ms
        
        # Obtener clase predicha y confianza
        predicted_class_idx = np.argmax(predictions[0])
        confidence = predictions[0][predicted_class_idx]
        confidence_percentage = round(confidence * 100, 1)
        
        # Obtener nombre de la clase
        class_name = self.class_labels[str(predicted_class_idx)]
        
        # Mapear a categorías para el frontend
        category_mapping = {
            'battery': 'battery',
            'biological': 'biological', 
            'brown-glass': 'glass',
            'cardboard': 'cardboard',
            'clothes': 'clothes',
            'green-glass': 'glass',
            'metal': 'metal',
            'paper': 'paper',
            'plastic': 'plastic',
            'shoes': 'shoes',
            'trash': 'trash',
            'white-glass': 'glass'
        }
        
        category = category_mapping.get(class_name, 'trash')
        
        return {
            'category': category,
            'garbage_class': class_name,
            'confidence': confidence,
            'confidence_percentage': confidence_percentage,
            'inference_time_ms': round(inference_time, 1),
            'original_class': class_name
        }
    
    def preprocess_image_realtime(self, image):
        """
        Preprocesamiento optimizado para tiempo real
        Mantiene calidad pero mejora velocidad
        """
        # Redimensionar eficientemente
        resized = cv2.resize(image, (self.img_size, self.img_size), interpolation=cv2.INTER_LINEAR)
        
        # Normalizar de forma optimizada
        normalized = resized.astype(np.float32) / 255.0
        
        # Añadir dimensión batch
        batch = np.expand_dims(normalized, axis=0)
        
        return batch
    
    def add_text_to_image(self, image, result):
        """Añadir información de clasificación a la imagen"""
        height, width = image.shape[:2]
        
        # Crear copia para modificar
        annotated = image.copy()
        
        # Fondo para el texto
        overlay = annotated.copy()
        cv2.rectangle(overlay, (10, 10), (width-10, 200), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.7, annotated, 0.3, 0, annotated)
        
        # Texto principal
        if result['confidence'] > self.confidence_threshold:
            text = f"BASURA: {result['garbage_class'].upper()}"
            cv2.putText(annotated, text, (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 2)
        else:
            text = "OBJETO NO IDENTIFICADO"
            cv2.putText(annotated, text, (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
        
        # Confianza
        conf_text = f"Confianza: {result['confidence']:.2%}"
        cv2.putText(annotated, conf_text, (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        # Clase detectada
        orig_text = f"Clase: {result['garbage_class']}"
        cv2.putText(annotated, orig_text, (20, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
        
        # Tiempo de inferencia
        time_text = f"Tiempo: {result['inference_time']:.1f}ms"
        cv2.putText(annotated, time_text, (20, 140), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 1)
        
        # Top 3 predicciones
        cv2.putText(annotated, "Top 3 predicciones:", (20, 170), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        top_3_indices = np.argsort(result['all_predictions'])[-3:][::-1]
        
        for i, idx in enumerate(top_3_indices):
            class_name_top = self.class_labels[str(idx)]
            conf_top = result['all_predictions'][idx]
            pred_text = f"{i+1}. {class_name_top}: {conf_top:.1%}"
            cv2.putText(annotated, pred_text, (30, 185 + i*12), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)
        
        return annotated
    
    def capture_and_classify(self, camera_id=0, num_photos=5):
        """Capturar fotos y clasificarlas"""
        print(f"📸 Capturando {num_photos} fotos para clasificar...")
        
        # Inicializar cámara
        cap = cv2.VideoCapture(camera_id)
        
        if not cap.isOpened():
            print("❌ Error: No se pudo abrir la cámara")
            return
        
        # Configurar cámara
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        print("📹 Cámara inicializada")
        print("💡 Coloca diferentes objetos de basura frente a la cámara")
        print()
        
        for i in range(num_photos):
            print(f"📸 Capturando foto {i+1}/{num_photos} en 3 segundos...")
            
            # Countdown
            for countdown in range(3, 0, -1):
                print(f"   {countdown}...")
                time.sleep(1)
            
            # Capturar frame
            ret, frame = cap.read()
            if not ret:
                print("❌ Error capturando frame")
                continue
            
            # Voltear horizontalmente
            frame = cv2.flip(frame, 1)
            
            print("   ¡Foto tomada! Clasificando...")
            
            # Clasificar
            result = self.classify_image(frame)
            
            # Añadir información a la imagen
            annotated_image = self.add_text_to_image(frame, result)
            
            # Guardar imagen original y anotada
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            original_filename = f"{self.output_dir}/original_{timestamp}_{i+1}.jpg"
            annotated_filename = f"{self.output_dir}/classified_{timestamp}_{i+1}.jpg"
            
            cv2.imwrite(original_filename, frame)
            cv2.imwrite(annotated_filename, annotated_image)
            
            # Mostrar resultado
            print(f"   ✅ Resultado: {result['garbage_class'].upper()}")
            print(f"      Confianza: {result['confidence']:.2%}")
            print(f"      Tiempo: {result['inference_time']:.1f}ms")
            print(f"      📁 Guardado: {annotated_filename}")
            print()
            
            # Pausa entre fotos
            if i < num_photos - 1:
                time.sleep(2)
        
        # Limpiar
        cap.release()
        print("🎉 ¡Clasificación completada!")
        print(f"📁 Revisa las imágenes en: {self.output_dir}/")
    
    def classify_existing_image(self, image_path):
        """Clasificar una imagen existente o desde URL"""
        # Detectar si es una URL
        if image_path.startswith(('http://', 'https://')):
            try:
                resp = requests.get(image_path)
                image_data = np.frombuffer(resp.content, np.uint8)
                image = cv2.imdecode(image_data, cv2.IMREAD_COLOR)
                if image is None:
                    print(f"❌ Error decodificando imagen desde URL: {image_path}")
                    return
            except Exception as e:
                print(f"❌ Error descargando imagen: {e}")
                return
        else:
            if not os.path.exists(image_path):
                print(f"❌ Imagen no encontrada: {image_path}")
                return
            image = cv2.imread(image_path)
            if image is None:
                print(f"❌ Error cargando imagen: {image_path}")
                return

        print(f"🖼️ Clasificando imagen: {image_path}")
        
        # Clasificar
        result = self.classify_image(image)
        
        # Añadir información a la imagen
        annotated_image = self.add_text_to_image(image, result)

        # Guardar resultado
        basename = os.path.splitext(os.path.basename(image_path))[0]
        output_path = f"{self.output_dir}/classified_{basename}.jpg"
        cv2.imwrite(output_path, annotated_image)
        
        # Mostrar resultado
        print(f"✅ Resultado: {result['garbage_class'].upper()}")
        print(f"   Confianza: {result['confidence']:.2%}")
        print(f"   📁 Guardado: {output_path}")

def main():
    """Función principal"""
    print("🗑️ CLASIFICADOR DE BASURA POR FOTOS (MODELO ESPECIALIZADO)")
    print("=" * 60)
    print("Este clasificador usa un modelo entrenado específicamente para basura.")
    print()
    
    try:
        classifier = PhotoClassifier()
        
        while True:
            print("\n📋 OPCIONES:")
            print("1. Capturar y clasificar fotos con cámara")
            print("2. Clasificar imagen existente")
            print("3. Salir")
            
            choice = input("\nSelecciona opción (1-3): ").strip()
            
            if choice == '1':
                num_photos = input("¿Cuántas fotos quieres tomar? (default: 5): ").strip()
                try:
                    num_photos = int(num_photos) if num_photos else 5
                    classifier.capture_and_classify(num_photos=num_photos)
                except ValueError:
                    print("❌ Número inválido, usando 5 fotos")
                    classifier.capture_and_classify(num_photos=5)
            
            elif choice == '2':
                image_path = input("Ruta de la imagen: ").strip()
                classifier.classify_existing_image(image_path)
            
            elif choice == '3':
                print("👋 ¡Hasta luego!")
                break
            
            else:
                print("❌ Opción inválida")
    
    except KeyboardInterrupt:
        print("\n🛑 Interrumpido por el usuario")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
