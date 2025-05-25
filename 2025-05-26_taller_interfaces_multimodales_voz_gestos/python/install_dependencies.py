#!/usr/bin/env python3
"""
Script de instalación automática de dependencias para el taller de interfaces multimodales.
"""

import subprocess
import sys
import platform
import os

def run_command(command):
    """Ejecuta un comando y maneja errores"""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {command}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error ejecutando: {command}")
        print(f"   Error: {e.stderr}")
        return False

def install_basic_dependencies():
    """Instala las dependencias básicas desde requirements.txt"""
    print("📦 Instalando dependencias básicas...")
    
    # Actualizar pip
    run_command(f"{sys.executable} -m pip install --upgrade pip")
    
    # Instalar desde requirements.txt
    if os.path.exists("requirements.txt"):
        return run_command(f"{sys.executable} -m pip install -r requirements.txt")
    else:
        print("❌ No se encontró requirements.txt")
        return False

def install_pyaudio_windows():
    """Instalación especial de PyAudio para Windows"""
    print("🪟 Instalando PyAudio para Windows...")
    
    # Intentar con pipwin primero
    if run_command(f"{sys.executable} -m pip install pipwin"):
        if run_command("pipwin install pyaudio"):
            return True
    
    # Si falla, intentar instalación directa
    print("🔄 Intentando instalación directa de PyAudio...")
    return run_command(f"{sys.executable} -m pip install pyaudio")

def install_system_dependencies():
    """Instala dependencias del sistema según la plataforma"""
    system = platform.system().lower()
    
    if system == "linux":
        print("🐧 Instalando dependencias para Linux...")
        commands = [
            "sudo apt-get update",
            "sudo apt-get install -y python3-pyaudio portaudio19-dev",
            "sudo apt-get install -y python3-opencv",
        ]
        for cmd in commands:
            run_command(cmd)
            
    elif system == "darwin":  # macOS
        print("🍎 Instalando dependencias para macOS...")
        commands = [
            "brew install portaudio",
            "brew install opencv",
        ]
        for cmd in commands:
            run_command(cmd)

def verify_installation():
    """Verifica que todas las dependencias estén instaladas correctamente"""
    print("\n🔍 Verificando instalación...")
    
    required_modules = [
        "cv2", "mediapipe", "speech_recognition", 
        "pygame", "numpy", "pyttsx3"
    ]
    
    failed_modules = []
    
    for module in required_modules:
        try:
            __import__(module)
            print(f"✅ {module}")
        except ImportError:
            print(f"❌ {module}")
            failed_modules.append(module)
    
    # Verificación especial para PyAudio
    try:
        import pyaudio
        print("✅ pyaudio")
    except ImportError:
        print("❌ pyaudio")
        failed_modules.append("pyaudio")
    
    if failed_modules:
        print(f"\n⚠️  Módulos faltantes: {', '.join(failed_modules)}")
        return False
    else:
        print("\n🎉 ¡Todas las dependencias están instaladas correctamente!")
        return True

def main():
    """Función principal de instalación"""
    print("🧪 Instalador de dependencias - Interfaces Multimodales")
    print("=" * 60)
    
    # Verificar versión de Python
    if sys.version_info < (3, 8):
        print("❌ Este proyecto requiere Python 3.8 o superior")
        print(f"   Versión actual: {sys.version}")
        return
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    
    # Instalar dependencias del sistema
    install_system_dependencies()
    
    # Instalar dependencias de Python
    if not install_basic_dependencies():
        print("❌ Error instalando dependencias básicas")
        return
    
    # Instalación especial de PyAudio en Windows
    if platform.system().lower() == "windows":
        install_pyaudio_windows()
    
    # Verificar instalación
    if verify_installation():
        print("\n🚀 Instalación completada. Puedes ejecutar:")
        print("   python main.py")
    else:
        print("\n⚠️  Instalación incompleta. Revisa los errores arriba.")
        print("\n🔧 Soluciones comunes:")
        print("   - Para PyAudio en Windows: pip install pipwin && pipwin install pyaudio")
        print("   - Para problemas de permisos: usar --user en pip install")
        print("   - Para errores de compilación: instalar Visual Studio Build Tools")

if __name__ == "__main__":
    main() 