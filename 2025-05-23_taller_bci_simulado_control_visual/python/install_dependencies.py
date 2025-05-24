"""
Script de Instalación Alternativo - Soluciona problemas comunes en Windows
Instala dependencias paso a paso con manejo de errores
"""

import subprocess
import sys
import importlib
import os

def run_command(command, description):
    """Ejecuta un comando y maneja errores"""
    print(f"\n🔧 {description}...")
    print(f"Ejecutando: {command}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            print(f"✅ {description} - EXITOSO")
            if result.stdout:
                print(f"Output: {result.stdout[:200]}...")
            return True
        else:
            print(f"❌ {description} - ERROR")
            print(f"Error: {result.stderr[:200]}...")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"⏰ {description} - TIMEOUT (más de 5 minutos)")
        return False
    except Exception as e:
        print(f"❌ {description} - EXCEPCIÓN: {e}")
        return False

def check_module(module_name):
    """Verifica si un módulo está instalado"""
    try:
        importlib.import_module(module_name)
        return True
    except ImportError:
        return False

def main():
    print("🔧 INSTALADOR DE DEPENDENCIAS BCI - MODO WINDOWS")
    print("="*70)
    print(f"🐍 Python: {sys.version}")
    print(f"📁 Directorio: {os.getcwd()}")
    print("="*70)
    
    # Paso 1: Actualizar pip y setuptools
    print("\n📦 PASO 1: Actualizando herramientas básicas...")
    
    commands_step1 = [
        ("python -m pip install --upgrade pip", "Actualizar pip"),
        ("python -m pip install --upgrade setuptools", "Actualizar setuptools"),
        ("python -m pip install --upgrade wheel", "Instalar wheel")
    ]
    
    for command, desc in commands_step1:
        run_command(command, desc)
    
    # Paso 2: Instalar dependencias básicas
    print("\n📊 PASO 2: Instalando dependencias científicas...")
    
    # Usar versiones más compatibles para Windows
    scientific_packages = [
        ("pip install numpy", "NumPy"),
        ("pip install scipy", "SciPy"), 
        ("pip install pandas", "Pandas"),
        ("pip install matplotlib", "Matplotlib")
    ]
    
    for command, desc in scientific_packages:
        if not run_command(command, f"Instalar {desc}"):
            # Intentar con --user si falla
            user_command = command + " --user"
            run_command(user_command, f"Instalar {desc} (modo usuario)")
    
    # Paso 3: Instalar pygame
    print("\n🎮 PASO 3: Instalando pygame...")
    
    pygame_commands = [
        ("pip install pygame", "Instalar pygame"),
        ("pip install pygame --user", "Instalar pygame (modo usuario)"),
        ("pip install pygame==2.1.0", "Instalar pygame versión compatible")
    ]
    
    pygame_success = False
    for command, desc in pygame_commands:
        if run_command(command, desc):
            pygame_success = True
            break
    
    if not pygame_success:
        print("⚠️ pygame no se pudo instalar automáticamente")
        print("💡 Intenta manualmente: pip install pygame")
    
    # Paso 4: Instalar opencv
    print("\n📷 PASO 4: Instalando OpenCV...")
    
    opencv_commands = [
        ("pip install opencv-python", "Instalar OpenCV"),
        ("pip install opencv-python --user", "Instalar OpenCV (modo usuario)"),
        ("pip install opencv-python-headless", "Instalar OpenCV headless")
    ]
    
    opencv_success = False
    for command, desc in opencv_commands:
        if run_command(command, desc):
            opencv_success = True
            break
    
    # Paso 5: Instalar Pillow
    print("\n🖼️ PASO 5: Instalando Pillow...")
    run_command("pip install Pillow", "Instalar Pillow")
    
    # Verificación final
    print("\n🔍 VERIFICACIÓN FINAL...")
    print("="*50)
    
    modules_to_check = {
        'numpy': 'NumPy',
        'pandas': 'Pandas', 
        'matplotlib': 'Matplotlib',
        'scipy': 'SciPy',
        'pygame': 'Pygame',
        'cv2': 'OpenCV',
        'PIL': 'Pillow'
    }
    
    installed = []
    missing = []
    
    for module, name in modules_to_check.items():
        if check_module(module):
            print(f"✅ {name:<15} - INSTALADO")
            installed.append(name)
        else:
            print(f"❌ {name:<15} - FALTANTE")
            missing.append(name)
    
    # Resumen
    print("\n📋 RESUMEN DE INSTALACIÓN")
    print("="*50)
    print(f"✅ Módulos instalados: {len(installed)}")
    print(f"❌ Módulos faltantes: {len(missing)}")
    
    if missing:
        print(f"\n⚠️ Módulos que faltan: {', '.join(missing)}")
        print("\n🔧 SOLUCIONES ALTERNATIVAS:")
        print("1. Reinicia la terminal y ejecuta nuevamente")
        print("2. Instala manualmente: pip install <module> --user")
        print("3. Usa conda en lugar de pip: conda install <module>")
        print("4. Verifica que tengas permisos de administrador")
        
        # Comandos manuales para módulos faltantes
        print(f"\n💻 COMANDOS MANUALES:")
        manual_commands = {
            'Pandas': 'pip install pandas --user',
            'SciPy': 'pip install scipy --user', 
            'Pygame': 'pip install pygame --user',
            'OpenCV': 'pip install opencv-python --user',
            'Pillow': 'pip install Pillow --user'
        }
        
        for module in missing:
            if module in manual_commands:
                print(f"  {manual_commands[module]}")
    
    else:
        print("\n🎉 ¡INSTALACIÓN COMPLETAMENTE EXITOSA!")
        print("🚀 Ahora puedes ejecutar:")
        print("  python test_installation.py")
        print("  python demo_interactive.py")
        print("  python main_bci_system.py")
    
    print(f"\n📁 Asegúrate de estar en el directorio: .../python/")
    print(f"📁 Directorio actual: {os.getcwd()}")

if __name__ == "__main__":
    main() 