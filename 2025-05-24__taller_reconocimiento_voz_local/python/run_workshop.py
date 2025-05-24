#!/usr/bin/env python3
"""
Launcher - Taller de Reconocimiento de Voz Local
Script principal para ejecutar diferentes componentes del taller.
"""

import sys
import subprocess
import os

def clear_screen():
    """Limpia la pantalla."""
    os.system('cls' if os.name == 'nt' else 'clear')

def print_banner():
    """Imprime el banner del taller."""
    banner = """
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🧪 TALLER - VOZ AL CÓDIGO: RECONOCIMIENTO DE VOZ LOCAL    ║
║                                                              ║
║         Comandos por Voz → Acciones Visuales                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""
    print(banner)

def show_menu():
    """Muestra el menú principal."""
    print("🎯 OPCIONES DISPONIBLES:")
    print("━" * 50)
    print("1. 🔧 Instalar dependencias (setup.py)")
    print("2. 🧪 Probar entorno (test_environment.py)")
    print("3. 🎮 Ejecutar aplicación principal (voice_visualizer.py)")
    print("4. 🎤 Ejecutar demo simple (simple_voice_demo.py)")
    print("5. 📚 Ver README.md")
    print("6. ❌ Salir")
    print("━" * 50)

def run_script(script_name, description):
    """Ejecuta un script Python."""
    print(f"\n🚀 Ejecutando {description}...")
    print("═" * 60)
    
    try:
        # Verificar si el archivo existe
        if not os.path.exists(script_name):
            print(f"❌ Error: No se encontró el archivo {script_name}")
            return False
        
        # Ejecutar el script
        result = subprocess.run([sys.executable, script_name], 
                              capture_output=False, 
                              text=True)
        
        if result.returncode == 0:
            print(f"\n✅ {description} completado exitosamente")
        else:
            print(f"\n⚠️ {description} terminó con código {result.returncode}")
        
        return result.returncode == 0
        
    except KeyboardInterrupt:
        print(f"\n⏹️ {description} interrumpido por el usuario")
        return False
    except Exception as e:
        print(f"\n❌ Error ejecutando {description}: {e}")
        return False

def show_readme():
    """Muestra el contenido del README."""
    try:
        readme_path = "../README.md"
        if os.path.exists(readme_path):
            print("\n📚 README.md")
            print("═" * 60)
            with open(readme_path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Mostrar solo las primeras líneas para no saturar
                lines = content.split('\n')[:50]
                for line in lines:
                    print(line)
                if len(content.split('\n')) > 50:
                    print("\n... (contenido truncado)")
                    print(f"Ver archivo completo en: {readme_path}")
        else:
            print("❌ No se encontró README.md")
    except Exception as e:
        print(f"❌ Error leyendo README: {e}")

def check_prerequisites():
    """Verifica prerequisitos básicos."""
    print("🔍 Verificando prerequisitos...")
    
    # Verificar Python
    python_version = sys.version_info
    if python_version < (3, 7):
        print(f"❌ Python {python_version.major}.{python_version.minor} detectado")
        print("   Se requiere Python 3.7 o superior")
        return False
    else:
        print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    # Verificar archivos del taller
    required_files = [
        "voice_visualizer.py",
        "simple_voice_demo.py", 
        "setup.py",
        "test_environment.py",
        "requirements.txt"
    ]
    
    missing_files = []
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file}")
            missing_files.append(file)
    
    if missing_files:
        print(f"\n⚠️ Archivos faltantes: {', '.join(missing_files)}")
        return False
    
    return True

def main():
    """Función principal del launcher."""
    clear_screen()
    print_banner()
    
    # Verificar prerequisitos
    if not check_prerequisites():
        print("\n❌ Prerequisitos no cumplidos. Verifica la instalación.")
        input("\nPresiona ENTER para continuar...")
        return
    
    print("✅ Prerequisitos verificados\n")
    
    while True:
        show_menu()
        
        try:
            choice = input("\n🔸 Selecciona una opción (1-6): ").strip()
            
            if choice == '1':
                clear_screen()
                print_banner()
                run_script("setup.py", "Instalación de dependencias")
                input("\nPresiona ENTER para continuar...")
                clear_screen()
                print_banner()
                
            elif choice == '2':
                clear_screen()
                print_banner()
                success = run_script("test_environment.py", "Test de entorno")
                if success:
                    print("\n🎉 ¡Entorno listo para el taller!")
                input("\nPresiona ENTER para continuar...")
                clear_screen()
                print_banner()
                
            elif choice == '3':
                clear_screen()
                print_banner()
                print("🎮 APLICACIÓN PRINCIPAL")
                print("═" * 40)
                print("💡 Controles:")
                print("   ESPACIO - Activar/Desactivar escucha")
                print("   ESC - Salir")
                print("📝 Comandos de ejemplo:")
                print("   'rojo', 'círculo', 'girar', 'grande'")
                print("\n🚀 Iniciando aplicación...")
                input("Presiona ENTER para continuar...")
                
                run_script("voice_visualizer.py", "Aplicación principal")
                input("\nPresiona ENTER para continuar...")
                clear_screen()
                print_banner()
                
            elif choice == '4':
                clear_screen()
                print_banner()
                print("🎤 DEMO SIMPLE")
                print("═" * 40)
                print("💡 Este demo muestra reconocimiento básico sin interfaz visual")
                print("📝 Comandos de ejemplo:")
                print("   'hola', 'nombre', 'hora', 'salir'")
                print("\n🚀 Iniciando demo...")
                input("Presiona ENTER para continuar...")
                
                run_script("simple_voice_demo.py", "Demo simple")
                input("\nPresiona ENTER para continuar...")
                clear_screen()
                print_banner()
                
            elif choice == '5':
                clear_screen()
                print_banner()
                show_readme()
                input("\nPresiona ENTER para continuar...")
                clear_screen()
                print_banner()
                
            elif choice == '6':
                print("\n👋 ¡Gracias por usar el taller de reconocimiento de voz!")
                print("🎯 Recuerda consultar el README.md para más información")
                break
                
            else:
                print("❌ Opción inválida. Por favor selecciona 1-6.")
                input("Presiona ENTER para continuar...")
                clear_screen()
                print_banner()
                
        except KeyboardInterrupt:
            print("\n\n👋 ¡Hasta luego!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            input("Presiona ENTER para continuar...")
            clear_screen()
            print_banner()

if __name__ == "__main__":
    main() 