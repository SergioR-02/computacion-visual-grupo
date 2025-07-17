"""
Script especializado para convertir garbage_classifier_final.h5 
a un formato compatible con TensorFlow 2.19.0
"""

import tensorflow as tf
import numpy as np
import os
import json
import h5py
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model

def inspect_h5_model(model_path):
    """Inspeccionar la estructura del modelo H5"""
    print(f"🔍 Inspeccionando {model_path}...")
    
    try:
        with h5py.File(model_path, 'r') as f:
            print("📊 Estructura del archivo H5:")
            
            def print_structure(name, obj):
                print(f"  {name}: {type(obj)}")
                if hasattr(obj, 'shape'):
                    print(f"    Shape: {obj.shape}")
                if hasattr(obj, 'dtype'):
                    print(f"    Dtype: {obj.dtype}")
            
            f.visititems(print_structure)
            
            # Buscar información de configuración
            if 'model_config' in f.attrs:
                print(f"📋 Model config encontrado: {len(f.attrs['model_config'])} bytes")
            
            if 'model_weights' in f:
                print("🔧 Pesos del modelo encontrados")
                
    except Exception as e:
        print(f"❌ Error inspeccionando H5: {e}")

def extract_weights_from_h5(model_path):
    """Extraer pesos del modelo H5 manualmente"""
    print(f"🔧 Extrayendo pesos de {model_path}...")
    
    weights_dict = {}
    
    try:
        with h5py.File(model_path, 'r') as f:
            def extract_weights(name, obj):
                if isinstance(obj, h5py.Dataset):
                    # Convertir a numpy array
                    weights_dict[name] = np.array(obj)
                    print(f"  ✅ Extraído: {name} - Shape: {obj.shape}")
            
            f.visititems(extract_weights)
            
        print(f"📦 Total de pesos extraídos: {len(weights_dict)}")
        return weights_dict
        
    except Exception as e:
        print(f"❌ Error extrayendo pesos: {e}")
        return {}

def create_new_compatible_model(num_classes=7):
    """Crear nuevo modelo compatible con la misma arquitectura"""
    print("🏗️ Creando modelo compatible...")
    
    # Cargar MobileNetV2 base
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(224, 224, 3)
    )
    
    # Configurar como no entrenable inicialmente
    base_model.trainable = False
    
    # Crear capas superiores
    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = base_model(inputs, training=False)
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.5)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    outputs = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs, outputs)
    
    # Compilar
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print("✅ Modelo compatible creado")
    return model

def try_advanced_conversion(original_path, output_path):
    """Intentar conversión avanzada del modelo"""
    print(f"🔄 Intentando conversión avanzada de {original_path}...")
    
    try:
        # Método 1: Cargar con custom objects
        print("📋 Método 1: Custom objects...")
        
        # Definir custom objects para problemas conocidos
        custom_objects = {
            'DepthwiseConv2D': tf.keras.layers.DepthwiseConv2D
        }
        
        # Intentar cargar con custom objects
        model = tf.keras.models.load_model(original_path, custom_objects=custom_objects, compile=False)
        print("✅ Carga exitosa con custom objects")
        
        # Guardar en formato compatible
        model.save(output_path, save_format='h5')
        print(f"✅ Modelo convertido guardado: {output_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Método 1 falló: {e}")
    
    try:
        # Método 2: Usar tf.compat.v1
        print("📋 Método 2: Compatibilidad v1...")
        
        # Habilitar modo de compatibilidad
        tf.compat.v1.disable_eager_execution()
        
        with tf.compat.v1.Session() as sess:
            # Intentar cargar con sesión v1
            model = tf.keras.models.load_model(original_path, compile=False)
            
            # Guardar en formato moderno
            model.save(output_path)
            print(f"✅ Convertido con v1: {output_path}")
            
            return True
            
    except Exception as e:
        print(f"❌ Método 2 falló: {e}")
        tf.compat.v1.enable_eager_execution()
    
    return False

def manual_weight_transfer(source_path, target_model):
    """Transferir pesos manualmente entre modelos"""
    print(f"🔧 Transfiriendo pesos manualmente de {source_path}...")
    
    try:
        # Extraer pesos del modelo original
        weights_dict = extract_weights_from_h5(source_path)
        
        if not weights_dict:
            print("❌ No se pudieron extraer pesos")
            return False
        
        # Intentar mapear pesos a las capas del nuevo modelo
        transferred = 0
        total_layers = len(target_model.layers)
        
        print(f"🎯 Intentando transferir a {total_layers} capas...")
        
        for i, layer in enumerate(target_model.layers):
            layer_name = layer.name
            print(f"  Capa {i}: {layer_name} - {type(layer).__name__}")
            
            # Buscar pesos correspondientes
            for weight_name, weight_data in weights_dict.items():
                if layer_name in weight_name.lower() or any(part in weight_name.lower() for part in layer_name.lower().split('_')):
                    try:
                        # Intentar asignar pesos si las dimensiones coinciden
                        if hasattr(layer, 'set_weights') and len(layer.get_weights()) > 0:
                            current_weights = layer.get_weights()
                            
                            # Verificar compatibilidad de dimensiones
                            if len(current_weights) > 0 and weight_data.shape == current_weights[0].shape:
                                layer.set_weights([weight_data])
                                print(f"    ✅ Peso transferido: {weight_name}")
                                transferred += 1
                                break
                                
                    except Exception as e:
                        print(f"    ⚠️ Error transferiendo {weight_name}: {e}")
        
        print(f"📊 Pesos transferidos: {transferred}/{total_layers}")
        return transferred > 0
        
    except Exception as e:
        print(f"❌ Error en transferencia manual: {e}")
        return False

def convert_garbage_model():
    """Función principal de conversión"""
    source_model = 'garbage_classifier_final.h5'
    target_model = 'garbage_classifier_final_compatible.h5'
    
    print("🚀 Iniciando conversión de garbage_classifier_final.h5...")
    print("=" * 60)
    
    # Verificar que existe el modelo original
    if not os.path.exists(source_model):
        print(f"❌ No se encontró {source_model}")
        return False
    
    # Cargar etiquetas
    try:
        with open('class_labels.json', 'r') as f:
            class_labels = json.load(f)
        num_classes = len(class_labels)
        print(f"✅ Etiquetas: {list(class_labels.values())} ({num_classes} clases)")
    except:
        print("⚠️ Usando configuración por defecto: 7 clases")
        num_classes = 7
    
    # Inspeccionar modelo original
    inspect_h5_model(source_model)
    
    print("\n" + "=" * 60)
    
    # Método 1: Conversión avanzada
    if try_advanced_conversion(source_model, target_model):
        print("✅ ¡Conversión avanzada exitosa!")
        return True
    
    print("\n" + "-" * 40)
    
    # Método 2: Crear nuevo modelo y transferir pesos
    print("📋 Método alternativo: Transferencia manual de pesos...")
    
    try:
        # Crear modelo compatible
        new_model = create_new_compatible_model(num_classes)
        
        # Intentar transferir pesos manualmente
        if manual_weight_transfer(source_model, new_model):
            # Guardar modelo con pesos transferidos
            new_model.save(target_model)
            print(f"✅ Modelo con pesos transferidos guardado: {target_model}")
            return True
        else:
            # Guardar modelo base sin pesos entrenados
            new_model.save('garbage_model_base_only.h5')
            print("⚠️ Guardado modelo base sin pesos: garbage_model_base_only.h5")
            print("💡 Necesitarás reentrenar este modelo")
            
    except Exception as e:
        print(f"❌ Error en método alternativo: {e}")
    
    return False

def test_converted_model():
    """Probar el modelo convertido"""
    print("\n" + "=" * 60)
    print("🧪 Probando modelos convertidos...")
    
    test_models = [
        'garbage_classifier_final_compatible.h5',
        'garbage_model_base_only.h5'
    ]
    
    for model_name in test_models:
        if os.path.exists(model_name):
            try:
                print(f"\n🔍 Probando {model_name}...")
                
                # Cargar modelo
                model = tf.keras.models.load_model(model_name, compile=False)
                print(f"  ✅ Carga exitosa")
                
                # Recompilar
                model.compile(
                    optimizer='adam',
                    loss='categorical_crossentropy',
                    metrics=['accuracy']
                )
                print(f"  ✅ Compilación exitosa")
                
                # Probar predicción
                dummy_input = np.random.random((1, 224, 224, 3))
                prediction = model.predict(dummy_input, verbose=0)
                print(f"  ✅ Predicción exitosa - Shape: {prediction.shape}")
                print(f"  📊 Confianzas: {prediction[0][:3]}...")  # Mostrar primeras 3
                
            except Exception as e:
                print(f"  ❌ Error: {e}")

if __name__ == "__main__":
    print(f"TensorFlow version: {tf.__version__}")
    print(f"Keras version: {tf.keras.__version__}")
    print("=" * 60)
    
    # Ejecutar conversión
    success = convert_garbage_model()
    
    # Probar modelos
    test_converted_model()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 ¡Conversión completada exitosamente!")
        print("💡 Ahora puedes usar 'garbage_classifier_final_compatible.h5'")
    else:
        print("⚠️ Conversión parcial - se creó modelo base")
        print("💡 Considera reentrenar el modelo con train_model.py")
    print("=" * 60) 