#!/usr/bin/env python3
"""
Setup script para el Taller de Reconocimiento de Voz Local
Instala y configura todas las dependencias necesarias.
"""

import subprocess
import sys
import os
import platform

def install_package(package):
    """Instala un paquete usando pip."""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ {package} instalado correctamente")
        return True
    except subprocess.CalledProcessError:
        print(f"❌ Error instalando {package}")
        return False

def check_microphone():
    """Verifica si hay micrófonos disponibles."""
    try:
        import pyaudio
        audio = pyaudio.PyAudio()
        
        print("\n🎤 Micrófonos disponibles:")
        for i in range(audio.get_device_count()):
            device_info = audio.get_device_info_by_index(i)
            if device_info['maxInputChannels'] > 0:
                print(f"  - {i}: {device_info['name']}")
        
        audio.terminate()
        return True
    except ImportError:
        print("❌ PyAudio no está instalado")
        return False
    except Exception as e:
        print(f"❌ Error verificando micrófonos: {e}")
        return False

def setup_sphinx():
    """Configura PocketSphinx para reconocimiento offline."""
    try:
        import pocketsphinx
        print("✅ PocketSphinx está disponible para reconocimiento offline")
        return True
    except ImportError:
        print("⚠️ PocketSphinx no está disponible. Se usará Google Speech Recognition online")
        return False

def main():
    """Función principal de setup."""
    print("=== Setup - Taller de Reconocimiento de Voz Local ===")
    print(f"Sistema operativo: {platform.system()}")
    print(f"Versión de Python: {sys.version}")
    
    # Lista de paquetes a instalar
    packages = [
        "speech_recognition==3.10.0",
        "pyaudio==0.2.11",
        "pyttsx3==2.90",
        "pygame==2.5.2",
        "numpy==1.24.3",
        "matplotlib==3.7.1"
    ]
    
    # Intentar instalar PocketSphinx (puede fallar en algunos sistemas)
    optional_packages = [
        "pocketsphinx==5.0.0"
    ]
    
    print("\n📦 Instalando dependencias principales...")
    failed_packages = []
    
    for package in packages:
        if not install_package(package):
            failed_packages.append(package)
    
    print("\n📦 Instalando dependencias opcionales...")
    for package in optional_packages:
        install_package(package)  # No importa si falla
    
    # Verificaciones post-instalación
    print("\n🔍 Verificando instalación...")
    
    # Verificar micrófonos
    check_microphone()
    
    # Verificar Sphinx
    setup_sphinx()
    
    # Verificar pygame
    try:
        import pygame
        pygame.init()
        print("✅ Pygame inicializado correctamente")
        pygame.quit()
    except Exception as e:
        print(f"❌ Error con Pygame: {e}")
    
    # Verificar síntesis de voz
    try:
        import pyttsx3
        engine = pyttsx3.init()
        print("✅ Síntesis de voz (pyttsx3) disponible")
    except Exception as e:
        print(f"❌ Error con síntesis de voz: {e}")
    
    # Resumen final
    print("\n" + "="*50)
    if failed_packages:
        print("⚠️ Setup completado con errores:")
        for package in failed_packages:
            print(f"  - {package}")
        print("\nIntenta instalar manualmente los paquetes fallidos.")
    else:
        print("✅ Setup completado exitosamente!")
    
    print("\n🚀 Para ejecutar el visualizador:")
    print("   python voice_visualizer.py")
    
    print("\n💡 Consejos:")
    print("  - Asegúrate de tener un micrófono conectado")
    print("  - Habla claramente y en español")
    print("  - Presiona ESPACIO para activar/desactivar la escucha")
    print("  - Di 'ayuda' para conocer todos los comandos")

if __name__ == "__main__":
    main() 