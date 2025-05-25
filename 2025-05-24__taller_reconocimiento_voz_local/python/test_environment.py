#!/usr/bin/env python3
"""
Test Environment - Taller de Reconocimiento de Voz Local
Verifica que todas las dependencias estén funcionando correctamente.
"""

import sys
import importlib

def test_import(module_name, package_name=None):
    """Prueba importar un módulo y reporta el resultado."""
    try:
        if package_name:
            print(f"📦 Probando {package_name}...")
        else:
            print(f"📦 Probando {module_name}...")
            
        module = importlib.import_module(module_name)
        
        if hasattr(module, '__version__'):
            version = module.__version__
            print(f"   ✅ {package_name or module_name} v{version} - OK")
        else:
            print(f"   ✅ {package_name or module_name} - OK")
        return True
    except ImportError as e:
        print(f"   ❌ {package_name or module_name} - FALTA")
        print(f"      Error: {e}")
        return False
    except Exception as e:
        print(f"   ⚠️ {package_name or module_name} - ERROR")
        print(f"      Error: {e}")
        return False

def test_pyaudio():
    """Prueba específica para PyAudio."""
    print("🎤 Probando PyAudio y micrófono...")
    try:
        import pyaudio
        audio = pyaudio.PyAudio()
        
        # Verificar dispositivos de entrada
        input_devices = 0
        for i in range(audio.get_device_count()):
            device_info = audio.get_device_info_by_index(i)
            if device_info['maxInputChannels'] > 0:
                input_devices += 1
        
        audio.terminate()
        
        if input_devices > 0:
            print(f"   ✅ PyAudio - OK ({input_devices} dispositivos de entrada encontrados)")
            return True
        else:
            print("   ⚠️ PyAudio - Sin dispositivos de entrada")
            return False
            
    except Exception as e:
        print(f"   ❌ PyAudio - ERROR: {e}")
        return False

def test_speech_recognition():
    """Prueba específica para Speech Recognition."""
    print("🗣️ Probando Speech Recognition...")
    try:
        import speech_recognition as sr
        
        recognizer = sr.Recognizer()
        microphone = sr.Microphone()
        
        print("   ✅ Speech Recognition - OK")
        
        # Probar calibración rápida
        print("   🔧 Probando calibración...")
        with microphone as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
        print("   ✅ Calibración - OK")
        
        return True
    except Exception as e:
        print(f"   ❌ Speech Recognition - ERROR: {e}")
        return False

def test_pyttsx3():
    """Prueba específica para pyttsx3."""
    print("🔊 Probando síntesis de voz...")
    try:
        import pyttsx3
        
        engine = pyttsx3.init()
        
        # Obtener voces disponibles
        voices = engine.getProperty('voices')
        if voices:
            print(f"   ✅ pyttsx3 - OK ({len(voices)} voces disponibles)")
        else:
            print("   ⚠️ pyttsx3 - Sin voces disponibles")
        
        engine.stop()
        return True
    except Exception as e:
        print(f"   ❌ pyttsx3 - ERROR: {e}")
        return False

def test_pygame():
    """Prueba específica para pygame."""
    print("🎮 Probando Pygame...")
    try:
        import pygame
        
        pygame.init()
        
        # Probar crear una superficie pequeña
        test_surface = pygame.Surface((100, 100))
        
        print("   ✅ Pygame - OK")
        pygame.quit()
        return True
    except Exception as e:
        print(f"   ❌ Pygame - ERROR: {e}")
        return False

def test_sphinx():
    """Prueba específica para PocketSphinx."""
    print("🧠 Probando PocketSphinx (reconocimiento offline)...")
    try:
        import pocketsphinx
        print("   ✅ PocketSphinx - OK (reconocimiento offline disponible)")
        return True
    except ImportError:
        print("   ⚠️ PocketSphinx - NO DISPONIBLE (se usará Google Speech como fallback)")
        return False
    except Exception as e:
        print(f"   ❌ PocketSphinx - ERROR: {e}")
        return False

def main():
    """Función principal de testing."""
    print("=== Test de Entorno - Taller de Reconocimiento de Voz ===")
    print(f"Python: {sys.version}")
    print("=" * 60)
    
    # Lista de tests
    tests = [
        ("Importaciones Básicas", [
            lambda: test_import("speech_recognition", "SpeechRecognition"),
            lambda: test_import("pygame", "Pygame"),
            lambda: test_import("pyttsx3", "pyttsx3"),
            lambda: test_import("numpy", "NumPy"),
            lambda: test_import("threading", "Threading"),
        ]),
        ("Tests de Audio", [
            test_pyaudio,
            test_speech_recognition,
            test_pyttsx3,
        ]),
        ("Tests de Visualización", [
            test_pygame,
        ]),
        ("Tests Opcionales", [
            test_sphinx,
        ])
    ]
    
    total_passed = 0
    total_tests = 0
    
    for category, test_functions in tests:
        print(f"\n🧪 {category}")
        print("-" * 40)
        
        for test_func in test_functions:
            total_tests += 1
            if test_func():
                total_passed += 1
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE TESTS")
    print("=" * 60)
    
    success_rate = (total_passed / total_tests) * 100 if total_tests > 0 else 0
    
    print(f"Tests pasados: {total_passed}/{total_tests} ({success_rate:.1f}%)")
    
    if success_rate >= 80:
        print("✅ ENTORNO LISTO - Puedes ejecutar el taller")
        print("\n🚀 Comandos para ejecutar:")
        print("   python voice_visualizer.py    # Aplicación principal")
        print("   python simple_voice_demo.py   # Demo simple")
    elif success_rate >= 60:
        print("⚠️ ENTORNO PARCIAL - Algunas funciones pueden fallar")
        print("\n💡 Recomendaciones:")
        print("   - Instala las dependencias faltantes")
        print("   - Verifica permisos de micrófono")
        print("   - Ejecuta 'python setup.py' para instalación automática")
    else:
        print("❌ ENTORNO NO LISTO - Muchas dependencias faltan")
        print("\n🔧 Acciones requeridas:")
        print("   1. Ejecuta 'python setup.py'")
        print("   2. Instala manualmente las dependencias faltantes")
        print("   3. Verifica permisos de sistema")
    
    print("\n💡 Consejos adicionales:")
    print("   - Asegúrate de tener un micrófono conectado y funcionando")
    print("   - Cierra otras aplicaciones que puedan usar el micrófono")
    print("   - En Windows, verifica permisos de micrófono en Configuración")
    
    return success_rate >= 80

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 