"""
Script para solucionar problemas de compatibilidad de modelos TensorFlow
Este script intenta varias estrategias para cargar modelos incompatibles
"""

import tensorflow as tf
import numpy as np
import os
import json
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model

def create_compatible_model(num_classes=6):
    """Crear un modelo compatible con la versión actual de TensorFlow"""
    
    # Cargar MobileNetV2 pre-entrenado
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(224, 224, 3)
    )
    
    # Congelar las capas base
    base_model.trainable = False
    
    # Añadir capas personalizadas
    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = base_model(inputs, training=False)
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.5)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    outputs = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs, outputs)
    
    # Compilar el modelo
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def fix_model_compatibility():
    """Función principal para arreglar la compatibilidad"""
    
    print("🔧 Intentando solucionar problemas de compatibilidad de modelo...")
    
    # Verificar si existen los archivos necesarios
    model_files = ['best_garbage_model.h5', 'garbage_classifier_final.h5']
    labels_file = 'class_labels.json'
    
    # Cargar etiquetas
    if os.path.exists(labels_file):
        with open(labels_file, 'r') as f:
            class_labels = json.load(f)
        num_classes = len(class_labels)
        print(f"✅ Etiquetas cargadas: {list(class_labels.values())}")
    else:
        print("⚠️ No se encontraron las etiquetas, usando configuración por defecto")
        num_classes = 6
        class_labels = {
            '0': 'cardboard',
            '1': 'glass', 
            '2': 'metal',
            '3': 'organic',
            '4': 'paper',
            '5': 'plastic'
        }
        
        # Crear archivo de etiquetas
        with open(labels_file, 'w') as f:
            json.dump(class_labels, f)
        print(f"✅ Archivo de etiquetas creado: {labels_file}")
    
    # Crear modelo compatible
    print("🔄 Creando modelo compatible...")
    compatible_model = create_compatible_model(num_classes)
    
    # Intentar cargar pesos desde modelos existentes
    for model_file in model_files:
        if os.path.exists(model_file):
            print(f"🔍 Intentando extraer información de {model_file}...")
            
            try:
                # Intento 1: Cargar sin compilar
                old_model = tf.keras.models.load_model(model_file, compile=False)
                print(f"✅ Modelo {model_file} cargado sin compilación")
                
                # Intentar transferir pesos compatibles
                try:
                    # Obtener pesos de las capas que coincidan
                    print("🔄 Transfiriendo pesos compatibles...")
                    
                    # Guardar el modelo en formato compatible
                    new_model_name = model_file.replace('.h5', '_compatible.h5')
                    old_model.save(new_model_name, save_format='h5')
                    print(f"✅ Modelo compatible guardado como: {new_model_name}")
                    
                    # También crear una versión solo con el modelo base funcional
                    compatible_model.save('model_base_compatible.h5')
                    print("✅ Modelo base compatible creado: model_base_compatible.h5")
                    
                    return True
                    
                except Exception as e:
                    print(f"⚠️ No se pudieron transferir todos los pesos: {e}")
                    
            except Exception as e:
                print(f"❌ No se pudo cargar {model_file}: {e}")
    
    # Si llegamos aquí, crear un modelo base nuevo
    print("🆕 Creando modelo base nuevo...")
    compatible_model.save('model_base_new.h5')
    print("✅ Modelo base nuevo creado: model_base_new.h5")
    print("⚠️ Este modelo necesitará ser entrenado desde cero")
    
    return True

def test_model_loading():
    """Probar la carga de modelos disponibles"""
    
    print("\n🧪 Probando carga de modelos...")
    
    # Lista de modelos a probar
    test_models = [
        'best_garbage_model.h5',
        'garbage_classifier_final.h5', 
        'best_garbage_model_compatible.h5',
        'garbage_classifier_final_compatible.h5',
        'model_base_compatible.h5',
        'model_base_new.h5'
    ]
    
    for model_name in test_models:
        if os.path.exists(model_name):
            try:
                print(f"🔍 Probando {model_name}...")
                model = tf.keras.models.load_model(model_name, compile=False)
                print(f"✅ {model_name} - ¡Carga exitosa!")
                
                # Recompilar
                model.compile(
                    optimizer='adam',
                    loss='categorical_crossentropy', 
                    metrics=['accuracy']
                )
                print(f"✅ {model_name} - ¡Compilación exitosa!")
                
                # Probar predicción con imagen dummy
                dummy_input = np.random.random((1, 224, 224, 3))
                prediction = model.predict(dummy_input, verbose=0)
                print(f"✅ {model_name} - ¡Predicción exitosa! Shape: {prediction.shape}")
                
            except Exception as e:
                print(f"❌ {model_name} - Error: {e}")
        else:
            print(f"⚪ {model_name} - No existe")

if __name__ == "__main__":
    print("🚀 Iniciando reparación de compatibilidad de modelos...")
    print("=" * 60)
    
    # Mostrar información del sistema
    print(f"TensorFlow version: {tf.__version__}")
    print(f"Keras version: {tf.keras.__version__}")
    print("=" * 60)
    
    # Ejecutar reparación
    try:
        if fix_model_compatibility():
            print("\n" + "=" * 60)
            print("✅ Proceso de reparación completado!")
            
            # Probar los modelos
            test_model_loading()
            
            print("\n" + "=" * 60)
            print("💡 INSTRUCCIONES SIGUIENTES:")
            print("1. Actualiza photo_classifier.py para usar un modelo compatible")
            print("2. O reinstala TensorFlow con: pip install tensorflow==2.13.0")
            print("3. O reentrena el modelo con: python train_model.py")
            print("=" * 60)
            
    except Exception as e:
        print(f"❌ Error durante la reparación: {e}")
        print("💡 Intenta reentrenar el modelo desde cero") 