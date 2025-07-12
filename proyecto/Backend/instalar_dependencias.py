#!/usr/bin/env python3
"""
🚀 INSTALADOR SIMPLE PARA PYTHON 3.12.10
Clasificador de Basura en Tiempo Real
"""

import sys
import subprocess

def instalar_dependencias():
    """Instalar dependencias básicas"""
    print("🚀 INSTALANDO DEPENDENCIAS PARA PYTHON 3.12.10")
    print("=" * 50)
    
    version = sys.version_info
    print(f"Python version: {version.major}.{version.minor}.{version.micro}")
    
    # Lista de dependencias en orden
    dependencias = [
        "numpy>=1.24.3",
        "matplotlib>=3.7.2", 
        "pillow>=10.0.0",
        "tensorflow>=2.13.0",
        "opencv-python>=4.8.0",
        "scikit-learn>=1.3.0"
    ]
    
    print("\n📦 Instalando dependencias...")
    
    for dep in dependencias:
        print(f"\n🔄 Instalando {dep}...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", dep], 
                         check=True, capture_output=True)
            print(f"✅ {dep} instalado")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error instalando {dep}")
            print(f"   Intenta manualmente: pip install {dep}")
    
    print("\n🧪 Probando importaciones...")
    
    # Probar importaciones
    tests = [
        ("numpy", "NumPy"),
        ("matplotlib", "Matplotlib"),
        ("PIL", "Pillow"),
        ("tensorflow", "TensorFlow"),
        ("cv2", "OpenCV"),
        ("sklearn", "scikit-learn")
    ]
    
    exitos = 0
    for module, name in tests:
        try:
            __import__(module)
            print(f"✅ {name} funciona")
            exitos += 1
        except ImportError:
            print(f"❌ {name} no se importa")
    
    print(f"\n📊 Resultado: {exitos}/{len(tests)} dependencias funcionando")
    
    if exitos >= 5:
        print("\n🎉 ¡INSTALACIÓN EXITOSA!")
        print("✅ Puedes ejecutar: python realtime_classifier.py")
    else:
        print("\n⚠️  Algunas dependencias faltan")
        print("💡 Instala manualmente las que fallaron")

if __name__ == "__main__":
    instalar_dependencias() 