#!/usr/bin/env python3
"""
🚀 Launcher - Taller de Interfaces Multimodales
Script de inicio que facilita la ejecución del taller con diferentes opciones.
"""

import sys
import os
import subprocess

def show_banner():
    """Muestra el banner del taller"""
    print("🧪" + "="*58 + "🧪")
    print("🧪  TALLER - INTERFACES MULTIMODALES: UNIENDO VOZ Y GESTOS  🧪")
    print("🧪" + "="*58 + "🧪")
    print()
    print("🎯 Objetivo: Fusionar gestos y comandos de voz para crear")
    print("   una experiencia de interacción multimodal rica e intuitiva")
    print()

def show_menu():
    """Muestra el menú principal"""
    print("📋 OPCIONES DISPONIBLES:")
    print("=" * 30)
    print("1. 🧪 Ejecutar Taller Principal")
    print("2. 🔧 Instalar Dependencias")
    print("3. 🧪 Probar Sistema")
    print("4. 🎯 Entrenador de Gestos")
    print("5. ℹ️  Información del Sistema")
    print("6. 🆘 Ayuda y Documentación")
    print("7. 🚪 Salir")
    print()

def run_main_workshop():
    """Ejecuta el taller principal"""
    print("🚀 Iniciando Taller Principal...")
    try:
        subprocess.run([sys.executable, "main.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error ejecutando el taller: {e}")
    except FileNotFoundError:
        print("❌ No se encontró main.py")
        print("💡 Asegúrate de estar en el directorio correcto")

def install_dependencies():
    """Ejecuta el instalador de dependencias"""
    print("📦 Iniciando Instalador de Dependencias...")
    try:
        subprocess.run([sys.executable, "install_dependencies.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en instalación: {e}")
    except FileNotFoundError:
        print("❌ No se encontró install_dependencies.py")

def test_system():
    """Ejecuta las pruebas del sistema"""
    print("🧪 Iniciando Pruebas del Sistema...")
    try:
        subprocess.run([sys.executable, "test_system.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en pruebas: {e}")
    except FileNotFoundError:
        print("❌ No se encontró test_system.py")

def gesture_trainer():
    """Ejecuta el entrenador de gestos"""
    print("🎯 Iniciando Entrenador de Gestos...")
    try:
        subprocess.run([sys.executable, "gesture_trainer.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error en entrenador: {e}")
    except FileNotFoundError:
        print("❌ No se encontró gesture_trainer.py")

def show_system_info():
    """Muestra información del sistema"""
    print("ℹ️  INFORMACIÓN DEL SISTEMA")
    print("=" * 30)
    print(f"🐍 Python: {sys.version}")
    print(f"📁 Directorio: {os.getcwd()}")
    print(f"💻 Plataforma: {sys.platform}")
    
    # Verificar archivos principales
    files_to_check = [
        "main.py", "requirements.txt", "install_dependencies.py",
        "test_system.py", "gesture_trainer.py"
    ]
    
    print("\n📄 Archivos del Proyecto:")
    for file in files_to_check:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"✅ {file} ({size} bytes)")
        else:
            print(f"❌ {file} (no encontrado)")
    
    # Verificar dependencias básicas
    print("\n📦 Dependencias Principales:")
    dependencies = ["cv2", "mediapipe", "speech_recognition", "pygame", "numpy", "pyttsx3"]
    
    for dep in dependencies:
        try:
            __import__(dep)
            print(f"✅ {dep}")
        except ImportError:
            print(f"❌ {dep}")
    
    print()

def show_help():
    """Muestra ayuda y documentación"""
    print("🆘 AYUDA Y DOCUMENTACIÓN")
    print("=" * 30)
    print()
    print("🎮 CONTROLES MULTIMODALES:")
    print("• Mano abierta + 'cambiar' → Cambiar color")
    print("• Dos dedos + 'mover' → Activar movimiento")
    print("• Puño + 'rotar' → Activar rotación")
    print("• Gesto OK + 'mostrar' → Ver estadísticas")
    print()
    print("🗣️  COMANDOS DE VOZ:")
    print("• cambiar, mover, rotar, mostrar")
    print("• azul, rojo, verde, amarillo")
    print("• parar, reset, salir")
    print()
    print("🔧 SOLUCIÓN DE PROBLEMAS:")
    print("• Cámara no funciona → Cerrar otras apps que usen cámara")
    print("• Micrófono no funciona → Verificar permisos")
    print("• PyAudio error → pip install pipwin && pipwin install pyaudio")
    print("• Rendimiento lento → Cerrar otras aplicaciones")
    print()
    print("📚 ESTRUCTURA DEL PROYECTO:")
    print("• main.py → Aplicación principal")
    print("• test_system.py → Pruebas del sistema")
    print("• gesture_trainer.py → Entrenar gestos personalizados")
    print("• install_dependencies.py → Instalar dependencias")
    print("• requirements.txt → Lista de dependencias")
    print()

def quick_start():
    """Inicio rápido para usuarios experimentados"""
    print("⚡ INICIO RÁPIDO")
    print("=" * 20)
    print("1. Ejecutando pruebas automáticas...")
    
    # Prueba rápida
    try:
        result = subprocess.run([sys.executable, "test_system.py", "--quick"], 
                              capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print("✅ Pruebas básicas exitosas")
            print("2. Iniciando taller...")
            run_main_workshop()
        else:
            print("❌ Pruebas fallaron")
            print("💡 Usa el menú para instalar dependencias")
    except subprocess.TimeoutExpired:
        print("⏰ Timeout en pruebas")
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Función principal del launcher"""
    show_banner()
    
    # Verificar si estamos en el directorio correcto
    if not os.path.exists("main.py"):
        print("❌ Error: No se encontró main.py")
        print("💡 Asegúrate de ejecutar este script desde el directorio python/")
        return
    
    # Modo inicio rápido
    if len(sys.argv) > 1 and sys.argv[1] == "--quick":
        quick_start()
        return
    
    while True:
        show_menu()
        try:
            choice = input("Selecciona una opción (1-7): ").strip()
            
            if choice == '1':
                run_main_workshop()
            elif choice == '2':
                install_dependencies()
            elif choice == '3':
                test_system()
            elif choice == '4':
                gesture_trainer()
            elif choice == '5':
                show_system_info()
            elif choice == '6':
                show_help()
            elif choice == '7':
                print("👋 ¡Gracias por usar el taller!")
                break
            else:
                print("❌ Opción no válida. Selecciona 1-7.")
            
            print("\n" + "="*50)
            input("Presiona Enter para continuar...")
            print()
            
        except KeyboardInterrupt:
            print("\n👋 ¡Hasta luego!")
            break
        except Exception as e:
            print(f"❌ Error inesperado: {e}")

if __name__ == "__main__":
    main() 