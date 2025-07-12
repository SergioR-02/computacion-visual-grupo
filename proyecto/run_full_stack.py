"""
Script para ejecutar tanto el backend como el frontend simultáneamente
Facilita el desarrollo y pruebas de la aplicación completa
"""

import subprocess
import sys
import os
import time
import signal
import threading

# Colores para la consola
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_colored(message, color):
    """Imprimir mensaje con color"""
    print(f"{color}{message}{Colors.ENDC}")

def run_backend():
    """Ejecutar el servidor backend"""
    print_colored("🚀 Iniciando servidor backend...", Colors.OKBLUE)
    
    # Cambiar al directorio Backend
    backend_dir = "Backend"
    if not os.path.exists(backend_dir):
        print_colored(f"❌ Error: Directorio '{backend_dir}' no encontrado", Colors.FAIL)
        return None
    
    try:
        # Cambiar al directorio Backend y ejecutar el servidor
        process = subprocess.Popen(
            [sys.executable, "api_server.py"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Mostrar output del backend
        def print_backend_output():
            for line in iter(process.stdout.readline, ''):
                print_colored(f"[Backend] {line.strip()}", Colors.OKBLUE)
        
        # Ejecutar en hilo separado
        thread = threading.Thread(target=print_backend_output)
        thread.daemon = True
        thread.start()
        
        return process
        
    except Exception as e:
        print_colored(f"❌ Error iniciando backend: {e}", Colors.FAIL)
        return None

def run_frontend():
    """Ejecutar el servidor frontend"""
    print_colored("🌐 Iniciando servidor frontend...", Colors.OKGREEN)
    
    # Cambiar al directorio ThreejsFrontend
    frontend_dir = "ThreejsFrontend"
    if not os.path.exists(frontend_dir):
        print_colored(f"❌ Error: Directorio '{frontend_dir}' no encontrado", Colors.FAIL)
        return None
    
    try:
        # Verificar si package.json existe
        if not os.path.exists(os.path.join(frontend_dir, "package.json")):
            print_colored(f"❌ Error: package.json no encontrado en {frontend_dir}", Colors.FAIL)
            return None
        
        # Ejecutar npm run dev
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Mostrar output del frontend
        def print_frontend_output():
            for line in iter(process.stdout.readline, ''):
                print_colored(f"[Frontend] {line.strip()}", Colors.OKGREEN)
        
        # Ejecutar en hilo separado
        thread = threading.Thread(target=print_frontend_output)
        thread.daemon = True
        thread.start()
        
        return process
        
    except Exception as e:
        print_colored(f"❌ Error iniciando frontend: {e}", Colors.FAIL)
        return None

def check_dependencies():
    """Verificar que las dependencias están instaladas"""
    print_colored("🔍 Verificando dependencias...", Colors.WARNING)
    
    # Verificar Backend
    backend_reqs = "Backend/requirements.txt"
    if os.path.exists(backend_reqs):
        print_colored("✅ Backend requirements.txt encontrado", Colors.OKGREEN)
    else:
        print_colored("❌ Backend requirements.txt no encontrado", Colors.FAIL)
        return False
    
    # Verificar Frontend
    frontend_package = "ThreejsFrontend/package.json"
    if os.path.exists(frontend_package):
        print_colored("✅ Frontend package.json encontrado", Colors.OKGREEN)
    else:
        print_colored("❌ Frontend package.json no encontrado", Colors.FAIL)
        return False
    
    return True

def main():
    """Función principal"""
    print_colored("🚀 INICIANDO APLICACIÓN COMPLETA", Colors.HEADER)
    print_colored("=" * 50, Colors.HEADER)
    
    # Verificar dependencias
    if not check_dependencies():
        print_colored("❌ Faltan dependencias. Ejecuta setup primero.", Colors.FAIL)
        return
    
    print()
    
    # Iniciar backend
    backend_process = run_backend()
    if not backend_process:
        print_colored("❌ Error iniciando backend", Colors.FAIL)
        return
    
    # Esperar un poco para que el backend inicie
    time.sleep(3)
    
    # Iniciar frontend
    frontend_process = run_frontend()
    if not frontend_process:
        print_colored("❌ Error iniciando frontend", Colors.FAIL)
        backend_process.terminate()
        return
    
    print()
    print_colored("🎉 ¡APLICACIÓN INICIADA EXITOSAMENTE!", Colors.HEADER)
    print_colored("=" * 50, Colors.HEADER)
    print_colored("🔗 URLs disponibles:", Colors.OKGREEN)
    print_colored("   Backend API: http://localhost:5000", Colors.OKBLUE)
    print_colored("   Frontend:    http://localhost:5173", Colors.OKGREEN)
    print()
    print_colored("💡 Para probar la conexión:", Colors.WARNING)
    print_colored("   1. Abre http://localhost:5173 en tu navegador", Colors.WARNING)
    print_colored("   2. Ve al módulo de análisis de imágenes", Colors.WARNING)
    print_colored("   3. Sube una imagen y haz clic en 'Analizar'", Colors.WARNING)
    print()
    print_colored("⚠️  Presiona Ctrl+C para detener ambos servidores", Colors.WARNING)
    print_colored("=" * 50, Colors.HEADER)
    
    # Manejar señal de interrupción
    def signal_handler(sig, frame):
        print_colored("\n🛑 Deteniendo servidores...", Colors.WARNING)
        backend_process.terminate()
        frontend_process.terminate()
        print_colored("👋 ¡Hasta luego!", Colors.OKGREEN)
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Esperar a que terminen los procesos
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main() 