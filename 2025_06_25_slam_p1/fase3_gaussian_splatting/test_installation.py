#!/usr/bin/env python3
"""
Demo rápido para verificar que la instalación de Gaussian Splatting funciona
Autor: Daniel - Fase 3 Computación Visual
"""

import sys
import subprocess
import importlib

def check_package(package_name, import_name=None):
    """Verifica si un paquete está instalado"""
    if import_name is None:
        import_name = package_name
    
    try:
        importlib.import_module(import_name)
        print(f"✅ {package_name}")
        return True
    except ImportError:
        print(f"❌ {package_name} - NO INSTALADO")
        return False

def install_package(package):
    """Instala un paquete usando pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        return True
    except subprocess.CalledProcessError:
        return False

def main():
    print("🔍 VERIFICACIÓN DE INSTALACIÓN - GAUSSIAN SPLATTING")
    print("="*55)
    print("👤 Autor: Daniel")
    print("📚 Fase 3 - Computación Visual")
    print("="*55)
    
    # Lista de paquetes requeridos
    required_packages = [
        ("torch", "torch"),
        ("torchvision", "torchvision"), 
        ("numpy", "numpy"),
        ("matplotlib", "matplotlib"),
        ("opencv-python", "cv2"),
        ("pillow", "PIL"),
        ("tqdm", "tqdm"),
        ("plyfile", "plyfile")
    ]
    
    print("\n📦 Verificando dependencias...")
    
    missing_packages = []
    for package_name, import_name in required_packages:
        if not check_package(package_name, import_name):
            missing_packages.append(package_name)
    
    if missing_packages:
        print(f"\n⚠️ Faltan {len(missing_packages)} paquetes")
        print("🔧 Instalando paquetes faltantes...")
        
        for package in missing_packages:
            print(f"📥 Instalando {package}...")
            if install_package(package):
                print(f"✅ {package} instalado correctamente")
            else:
                print(f"❌ Error instalando {package}")
    
    else:
        print("\n🎉 ¡Todas las dependencias están instaladas!")
    
    # Verificar PyTorch y CUDA
    print("\n🔧 Verificando configuración de PyTorch...")
    try:
        import torch
        print(f"✅ PyTorch versión: {torch.__version__}")
        print(f"🖥️ CUDA disponible: {'Sí' if torch.cuda.is_available() else 'No'}")
        if torch.cuda.is_available():
            print(f"🎯 GPU detectada: {torch.cuda.get_device_name(0)}")
            print(f"💾 Memoria GPU: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
        else:
            print("⚠️ CUDA no disponible - se usará CPU (más lento)")
    except ImportError:
        print("❌ PyTorch no instalado")
    
    # Test básico de funcionalidad
    print("\n🧪 Test básico de funcionalidad...")
    try:
        import numpy as np
        import matplotlib.pyplot as plt
        
        # Crear datos de prueba
        x = np.linspace(0, 10, 100)
        y = np.sin(x)
        
        # Test de matplotlib
        plt.figure(figsize=(8, 4))
        plt.plot(x, y, 'b-', label='sin(x)')
        plt.title('Test de Matplotlib - Gaussian Splatting Ready!')
        plt.xlabel('x')
        plt.ylabel('sin(x)')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Guardar imagen de prueba
        plt.savefig('test_plot.png', dpi=150, bbox_inches='tight')
        plt.close()
        
        print("✅ Test de matplotlib exitoso")
        print("✅ Imagen guardada: test_plot.png")
        
    except Exception as e:
        print(f"❌ Error en test: {e}")
    
    # Información del sistema
    print("\n💻 Información del sistema...")
    print(f"🐍 Python: {sys.version}")
    print(f"📁 Directorio actual: {sys.path[0]}")
    
    # Instrucciones finales
    print("\n" + "="*55)
    print("🚀 PRÓXIMOS PASOS:")
    print("="*55)
    print("1. 📓 Abrir: gaussian_splatting_implementacion.ipynb")
    print("2. ▶️ Ejecutar todas las celdas secuencialmente")
    print("3. 📊 Revisar resultados y análisis")
    print("4. 📋 Leer README.md para instrucciones detalladas")
    print("")
    print("🎯 Para usar tus propias imágenes:")
    print("   - Captura 50-200 fotos desde diferentes ángulos")
    print("   - Usa COLMAP para generar poses de cámara")
    print("   - Modifica el path del dataset en el notebook")
    print("")
    print("📧 Preguntas: Revisar documentación en README.md")
    print("="*55)
    print("🎊 ¡LISTO PARA GAUSSIAN SPLATTING! 🎊")
    print("="*55)

if __name__ == "__main__":
    main()
