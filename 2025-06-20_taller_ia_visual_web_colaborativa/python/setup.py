#!/usr/bin/env python3
"""
🚀 Script de inicialización para el Taller IA Visual Colaborativa
================================================================

Este script automatiza la configuración inicial del proyecto.
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def print_header():
    print("=" * 60)
    print("🧪 TALLER IA VISUAL COLABORATIVA - SETUP")
    print("=" * 60)
    print("Configurando entorno para detección de objetos y visualización web...")
    print()

def check_python_version():
    """Verificar versión de Python"""
    print("🐍 Verificando Python...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print("❌ Error: Se requiere Python 3.7 o superior")
        sys.exit(1)
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} - OK")

def install_requirements():
    """Instalar dependencias de Python"""
    print("\n📦 Instalando dependencias...")
    
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, capture_output=True)
        print("✅ Dependencias instaladas correctamente")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error instalando dependencias: {e}")
        print("💡 Intenta ejecutar manualmente: pip install -r requirements.txt")
        return False
    return True

def create_directories():
    """Crear directorios necesarios"""
    print("\n📁 Creando estructura de directorios...")
    
    dirs = [
        "../results/images",
        "../results/json", 
        "../results/csv",
        "../web/data",
        "data"
    ]
    
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"   📂 {dir_path}")
    
    print("✅ Directorios creados")

def download_yolo_model():
    """Descargar modelo YOLO si no existe"""
    print("\n🤖 Verificando modelo YOLO...")
    
    try:
        from ultralytics import YOLO
        model = YOLO("yolov8n.pt")  # Esto descarga el modelo automáticamente
        print("✅ Modelo YOLO listo")
        return True
    except Exception as e:
        print(f"❌ Error descargando modelo: {e}")
        return False

def create_test_image():
    """Crear imagen de prueba"""
    print("\n🖼️ Generando imagen de prueba...")
    
    try:
        subprocess.run([sys.executable, "create_test_image.py"], check=True)
        print("✅ Imagen de prueba creada")
        return True
    except subprocess.CalledProcessError:
        print("❌ Error creando imagen de prueba")
        return False

def test_detection():
    """Probar detección básica"""
    print("\n🔍 Probando detección...")
    
    if not os.path.exists("test_image.jpg"):
        print("❌ No se encontró imagen de prueba")
        return False
    
    try:
        result = subprocess.run([
            sys.executable, "detector.py", 
            "--source", "test_image.jpg",
            "--output", "test_setup"
        ], check=True, capture_output=True, text=True)
        
        print("✅ Detección completada")
        print("📊 Resultado:")
        # Mostrar las últimas líneas del output
        lines = result.stdout.strip().split('\n')
        for line in lines[-5:]:
            print(f"   {line}")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en detección: {e}")
        return False

def create_config_file():
    """Crear archivo de configuración"""
    print("\n⚙️ Creando configuración...")
    
    config = {
        "project_name": "IA Visual Colaborativa",
        "version": "1.0.0",
        "setup_date": "2025-06-20",
        "default_model": "yolov8n.pt",
        "default_confidence": 0.5,
        "web_server_port": 8000,
        "results_dir": "../results",
        "web_dir": "../web",
        "supported_formats": ["jpg", "jpeg", "png", "bmp"],
        "class_colors": {
            "person": "#ff6b6b",
            "car": "#4ecdc4", 
            "truck": "#45b7d1",
            "bicycle": "#96ceb4",
            "motorcycle": "#ffeaa7",
            "bus": "#dda0dd",
            "train": "#74b9ff",
            "boat": "#00b894"
        }
    }
    
    with open("config.json", "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    print("✅ Configuración guardada en config.json")

def show_next_steps():
    """Mostrar siguientes pasos"""
    print("\n" + "=" * 60)
    print("🎉 ¡CONFIGURACIÓN COMPLETADA!")
    print("=" * 60)
    print("\n📝 Próximos pasos:")
    print("\n1. 🔍 Ejecutar detección:")
    print("   python detector.py --source test_image.jpg")
    print("\n2. 🌐 Abrir visualizador web:")
    print("   cd ../web")
    print("   python -m http.server 8000")
    print("   # Visitar: http://localhost:8000")
    print("\n3. 📚 Consultar tutorial:")
    print("   Ver docs/tutorial.md para guía completa")
    print("\n4. 🎯 Probar con tus imágenes:")
    print("   python detector.py --source tu_imagen.jpg")
    print("\n" + "=" * 60)

def main():
    """Función principal"""
    print_header()
    
    # Cambiar al directorio python
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Ejecutar verificaciones y configuración
    steps = [
        ("Verificar Python", check_python_version),
        ("Instalar dependencias", install_requirements),
        ("Crear directorios", create_directories),
        ("Descargar modelo YOLO", download_yolo_model),
        ("Crear imagen de prueba", create_test_image),
        ("Probar detección", test_detection),
        ("Crear configuración", create_config_file)
    ]
    
    failed_steps = []
    
    for step_name, step_func in steps:
        try:
            success = step_func()
            if success is False:
                failed_steps.append(step_name)
        except Exception as e:
            print(f"❌ Error en {step_name}: {e}")
            failed_steps.append(step_name)
    
    # Mostrar resumen
    print(f"\n📊 Resumen: {len(steps) - len(failed_steps)}/{len(steps)} pasos completados")
    
    if failed_steps:
        print(f"⚠️ Pasos con problemas: {', '.join(failed_steps)}")
        print("💡 Revisa los errores anteriores y ejecuta los comandos manualmente")
    else:
        print("🎯 ¡Todo configurado correctamente!")
    
    show_next_steps()

if __name__ == "__main__":
    main()
