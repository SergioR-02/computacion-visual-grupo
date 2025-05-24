"""
Test Installation - Verificador de instalación del sistema BCI
Prueba que todas las dependencias estén instaladas correctamente
"""

import sys
import importlib

def test_imports():
    """Prueba la importación de todas las dependencias"""
    required_modules = [
        'numpy',
        'pandas', 
        'matplotlib',
        'scipy',
        'pygame',
        'cv2',
        'time',
        'threading',
        'queue',
        'collections',
        'math',
        'random'
    ]
    
    print("🔍 Verificando dependencias...")
    print("="*50)
    
    failed_imports = []
    
    for module in required_modules:
        try:
            importlib.import_module(module)
            print(f"✅ {module:<15} - OK")
        except ImportError as e:
            print(f"❌ {module:<15} - FALTA: {e}")
            failed_imports.append(module)
    
    return failed_imports

def test_project_modules():
    """Prueba la importación de módulos del proyecto"""
    print("\n🧠 Verificando módulos del proyecto...")
    print("="*50)
    
    project_modules = [
        'eeg_data_generator',
        'eeg_signal_processor',
        'bci_visual_interface'
    ]
    
    failed_modules = []
    
    for module in project_modules:
        try:
            importlib.import_module(module)
            print(f"✅ {module:<25} - OK")
        except ImportError as e:
            print(f"❌ {module:<25} - ERROR: {e}")
            failed_modules.append(module)
    
    return failed_modules

def test_basic_functionality():
    """Prueba funcionalidad básica de los componentes"""
    print("\n⚙️ Probando funcionalidad básica...")
    print("="*50)
    
    try:
        # Test generador EEG
        from eeg_data_generator import EEGDataGenerator
        generator = EEGDataGenerator(sampling_rate=256, duration=2)
        test_signal = generator.generate_attention_state('neutral')
        print(f"✅ Generador EEG      - {len(test_signal)} muestras generadas")
        
        # Test procesador
        from eeg_signal_processor import EEGSignalProcessor
        processor = EEGSignalProcessor(sampling_rate=256)
        features = processor.calculate_spectral_features(test_signal)
        print(f"✅ Procesador EEG     - {len(features)} características extraídas")
        
        # Test pygame (sin inicializar ventana)
        import pygame
        pygame.init()
        pygame.quit()
        print("✅ Pygame            - Inicialización exitosa")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en funcionalidad: {e}")
        return False

def test_performance():
    """Prueba básica de rendimiento"""
    print("\n📊 Evaluando rendimiento...")
    print("="*50)
    
    try:
        import time
        import numpy as np
        from eeg_data_generator import EEGDataGenerator
        from eeg_signal_processor import EEGSignalProcessor
        
        # Test de velocidad de generación
        start_time = time.time()
        generator = EEGDataGenerator(sampling_rate=256, duration=5)
        signal = generator.generate_attention_state('focused')
        generation_time = time.time() - start_time
        
        print(f"⏱️ Generación EEG     - {generation_time:.3f}s para 5s de datos")
        
        # Test de velocidad de procesamiento
        start_time = time.time()
        processor = EEGSignalProcessor(sampling_rate=256)
        features = processor.calculate_spectral_features(signal)
        processing_time = time.time() - start_time
        
        print(f"⏱️ Procesamiento      - {processing_time:.3f}s para análisis completo")
        
        # Evaluación
        if generation_time < 1.0 and processing_time < 2.0:
            print("✅ Rendimiento        - EXCELENTE")
        elif generation_time < 2.0 and processing_time < 5.0:
            print("⚠️ Rendimiento        - ACEPTABLE")
        else:
            print("❌ Rendimiento        - LENTO (puede afectar tiempo real)")
            
        return True
        
    except Exception as e:
        print(f"❌ Error en test de rendimiento: {e}")
        return False

def main():
    """Función principal de verificación"""
    print("🧠 VERIFICADOR DE INSTALACIÓN - SISTEMA BCI")
    print("="*70)
    print(f"🐍 Python {sys.version}")
    print(f"💻 Plataforma: {sys.platform}")
    print("="*70)
    
    # Test 1: Dependencias
    failed_imports = test_imports()
    
    # Test 2: Módulos del proyecto
    failed_modules = test_project_modules()
    
    # Test 3: Funcionalidad básica
    functionality_ok = test_basic_functionality()
    
    # Test 4: Rendimiento
    performance_ok = test_performance()
    
    # Resumen final
    print("\n🎯 RESUMEN DE VERIFICACIÓN")
    print("="*70)
    
    if not failed_imports and not failed_modules and functionality_ok and performance_ok:
        print("🎉 ¡INSTALACIÓN COMPLETAMENTE EXITOSA!")
        print("✅ Todas las dependencias instaladas")
        print("✅ Todos los módulos funcionando")
        print("✅ Funcionalidad básica operativa")
        print("✅ Rendimiento adecuado")
        print("\n🚀 El sistema BCI está listo para usar!")
        print("\n📋 COMANDOS DISPONIBLES:")
        print("python main_bci_system.py       - Sistema completo automático")
        print("python demo_interactive.py      - Demo interactivo manual")
        print("python bci_visual_interface.py  - Solo interfaz visual")
        
    else:
        print("⚠️ INSTALACIÓN INCOMPLETA")
        
        if failed_imports:
            print(f"❌ Dependencias faltantes: {', '.join(failed_imports)}")
            print("💡 Ejecuta: pip install -r requirements.txt")
        
        if failed_modules:
            print(f"❌ Módulos con problemas: {', '.join(failed_modules)}")
            print("💡 Verifica que estés en el directorio correcto")
        
        if not functionality_ok:
            print("❌ Problemas en funcionalidad básica")
        
        if not performance_ok:
            print("❌ Problemas de rendimiento detectados")
        
        print("\n🔧 SOLUCIONES:")
        print("1. pip install -r requirements.txt")
        print("2. Verifica estar en: .../python/")
        print("3. Reinicia el terminal")
        print("4. Ejecuta este test nuevamente")

if __name__ == "__main__":
    main() 