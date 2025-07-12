"""
Script de configuración para el servidor API de clasificación de imágenes
Instala dependencias y configura el entorno para el servidor
"""

import subprocess
import sys
import os

def install_requirements():
    """Instalar dependencias desde requirements.txt"""
    print("📦 Instalando dependencias...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencias instaladas correctamente")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error instalando dependencias: {e}")
        return False

def test_imports():
    """Probar que todas las importaciones funcionen"""
    print("🔍 Verificando importaciones...")
    try:
        import tensorflow as tf
        print(f"  ✅ TensorFlow: {tf.__version__}")
        
        import cv2
        print(f"  ✅ OpenCV: {cv2.__version__}")
        
        import numpy as np
        print(f"  ✅ NumPy: {np.__version__}")
        
        import flask
        print(f"  ✅ Flask: {flask.__version__}")
        
        import flask_cors
        print(f"  ✅ Flask-CORS instalado")
        
        import PIL
        print(f"  ✅ Pillow: {PIL.__version__}")
        
        return True
    except ImportError as e:
        print(f"❌ Error en importaciones: {e}")
        return False

def test_classifier():
    """Probar que el clasificador funcione"""
    print("🤖 Probando clasificador...")
    try:
        from photo_classifier import PhotoClassifier
        
        # Crear clasificador
        classifier = PhotoClassifier()
        print("✅ Clasificador inicializado correctamente")
        
        # Crear imagen de prueba
        import numpy as np
        test_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        
        # Probar clasificación
        result = classifier.classify_image(test_image)
        print(f"✅ Clasificación de prueba: {result['garbage_class']} ({result['confidence']:.2%})")
        
        return True
    except Exception as e:
        print(f"❌ Error probando clasificador: {e}")
        return False

def create_directories():
    """Crear directorios necesarios"""
    print("📁 Creando directorios...")
    dirs = ["classified_photos", "uploads"]
    for dir_name in dirs:
        if not os.path.exists(dir_name):
            os.makedirs(dir_name)
            print(f"  ✅ Directorio creado: {dir_name}")
        else:
            print(f"  ℹ️  Directorio ya existe: {dir_name}")

def main():
    """Función principal"""
    print("🚀 CONFIGURACIÓN DEL SERVIDOR API")
    print("=" * 50)
    
    # Verificar que estamos en el directorio correcto
    if not os.path.exists("photo_classifier.py"):
        print("❌ Error: No se encontró photo_classifier.py")
        print("   Asegúrate de ejecutar este script desde el directorio Backend/")
        return
    
    # Instalar dependencias
    if not install_requirements():
        print("❌ Fallo en la instalación de dependencias")
        return
    
    print()
    
    # Probar importaciones
    if not test_imports():
        print("❌ Fallo en las importaciones")
        return
    
    print()
    
    # Crear directorios
    create_directories()
    
    print()
    
    # Probar clasificador
    if not test_classifier():
        print("❌ Fallo en la prueba del clasificador")
        return
    
    print()
    print("🎉 ¡CONFIGURACIÓN COMPLETADA!")
    print("=" * 50)
    print("📋 Para ejecutar el servidor API:")
    print("   python api_server.py")
    print()
    print("🔗 El servidor estará disponible en:")
    print("   http://localhost:5000")
    print()
    print("📡 Endpoints disponibles:")
    print("   GET  /health - Verificar estado")
    print("   POST /classify - Clasificar imagen")
    print("   GET  /categories - Obtener categorías")
    print()

if __name__ == "__main__":
    main() 