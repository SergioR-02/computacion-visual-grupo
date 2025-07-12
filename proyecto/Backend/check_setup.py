"""
Script para verificar que todas las dependencias estén instaladas correctamente
y que el dataset esté en el lugar correcto.
"""

import sys
import os
import importlib.util

def check_import(module_name, package_name=None):
    """Verificar si un módulo puede ser importado"""
    try:
        if package_name:
            __import__(package_name)
        else:
            __import__(module_name)
        print(f"✅ {module_name} - OK")
        return True
    except ImportError as e:
        print(f"❌ {module_name} - ERROR: {e}")
        return False

def check_dataset():
    """Verificar estructura del dataset"""
    dataset_path = "garbage-dataset"
    expected_classes = ['battery', 'biological', 'cardboard', 'clothes', 'glass', 
                       'metal', 'paper', 'plastic', 'shoes', 'trash']
    
    print("\n📁 VERIFICANDO DATASET...")
    print("-" * 40)
    
    if not os.path.exists(dataset_path):
        print(f"❌ Dataset no encontrado en: {dataset_path}")
        return False
    
    print(f"✅ Dataset encontrado en: {dataset_path}")
    
    # Verificar clases
    missing_classes = []
    for class_name in expected_classes:
        class_path = os.path.join(dataset_path, class_name)
        if os.path.exists(class_path):
            image_count = len([f for f in os.listdir(class_path) 
                             if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
            print(f"✅ {class_name}: {image_count} imágenes")
        else:
            missing_classes.append(class_name)
            print(f"❌ {class_name}: carpeta no encontrada")
    
    if missing_classes:
        print(f"\n❌ Clases faltantes: {missing_classes}")
        return False
    
    print("\n✅ Dataset verificado correctamente!")
    return True

def check_camera():
    """Verificar acceso a la cámara"""
    print("\n📹 VERIFICANDO CÁMARA...")
    print("-" * 40)
    
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                print("✅ Cámara funcionando correctamente")
                print(f"   Resolución: {frame.shape[1]}x{frame.shape[0]}")
                cap.release()
                return True
            else:
                print("❌ No se pudo capturar frame de la cámara")
                cap.release()
                return False
        else:
            print("❌ No se pudo abrir la cámara")
            return False
    except Exception as e:
        print(f"❌ Error verificando cámara: {e}")
        return False

def check_gpu():
    """Verificar disponibilidad de GPU"""
    print("\n🚀 VERIFICANDO GPU...")
    print("-" * 40)
    
    try:
        import tensorflow as tf
        
        # Verificar TensorFlow
        print(f"📦 TensorFlow version: {tf.__version__}")
        
        # Verificar GPU
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            print(f"✅ GPU disponible: {len(gpus)} dispositivo(s)")
            for i, gpu in enumerate(gpus):
                print(f"   GPU {i}: {gpu.name}")
            
            # Verificar memoria GPU
            try:
                gpu_details = tf.config.experimental.get_device_details(gpus[0])
                if 'device_name' in gpu_details:
                    print(f"   Nombre: {gpu_details['device_name']}")
            except:
                pass
                
            return True
        else:
            print("⚠️  No hay GPU disponible - usando CPU")
            print("   El entrenamiento será más lento pero funcionará")
            return False
    except Exception as e:
        print(f"❌ Error verificando GPU: {e}")
        return False

def main():
    """Función principal de verificación"""
    print("🔍 VERIFICACIÓN DEL SISTEMA")
    print("=" * 50)
    print(f"Python version: {sys.version}")
    print(f"Directorio actual: {os.getcwd()}")
    print()
    
    # Lista de dependencias a verificar
    dependencies = [
        ("tensorflow", "tensorflow"),
        ("cv2", "cv2"),
        ("numpy", "numpy"),
        ("matplotlib", "matplotlib.pyplot"),
        ("PIL", "PIL"),
        ("sklearn", "sklearn"),
        ("json", None),
        ("time", None),
        ("os", None)
    ]
    
    print("📦 VERIFICANDO DEPENDENCIAS...")
    print("-" * 40)
    
    all_deps_ok = True
    for module, package in dependencies:
        if not check_import(module, package):
            all_deps_ok = False
    
    # Verificar dataset
    dataset_ok = check_dataset()
    
    # Verificar cámara
    camera_ok = check_camera()
    
    # Verificar GPU
    gpu_ok = check_gpu()
    
    # Resumen final
    print("\n" + "=" * 50)
    print("📊 RESUMEN DE VERIFICACIÓN")
    print("=" * 50)
    
    if all_deps_ok:
        print("✅ Todas las dependencias están instaladas")
    else:
        print("❌ Algunas dependencias faltan")
        print("   Ejecuta: pip install -r requirements.txt")
    
    if dataset_ok:
        print("✅ Dataset verificado correctamente")
    else:
        print("❌ Problemas con el dataset")
        print("   Verifica que la carpeta 'garbage-dataset' esté presente")
    
    if camera_ok:
        print("✅ Cámara funcionando")
    else:
        print("❌ Problemas con la cámara")
        print("   Verifica permisos y que no esté en uso")
    
    if gpu_ok:
        print("✅ GPU disponible para aceleración")
    else:
        print("⚠️  Sin GPU - entrenamiento en CPU (más lento)")
    
    print("\n🚀 PRÓXIMOS PASOS:")
    if all_deps_ok and dataset_ok:
        print("1. Ejecutar: python train_model.py")
        print("2. Esperar que termine el entrenamiento (30-60 min)")
        print("3. Ejecutar: python realtime_classifier.py")
    else:
        print("1. Solucionar los problemas indicados arriba")
        print("2. Volver a ejecutar este script")
    
    print("\n💡 AYUDA:")
    print("- Si hay problemas, revisa el README.md")
    print("- Para soporte técnico, verifica la documentación")

if __name__ == "__main__":
    main()
