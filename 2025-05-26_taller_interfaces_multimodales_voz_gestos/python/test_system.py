#!/usr/bin/env python3
"""
🧪 Test System - Verificador del Sistema Multimodal
Script para probar todos los componentes antes de ejecutar el taller completo.
"""

import sys
import traceback

def test_imports():
    """Prueba las importaciones de todas las librerías necesarias"""
    print("🔍 Probando importaciones...")
    
    try:
        import cv2
        print("✅ OpenCV")
    except ImportError as e:
        print(f"❌ OpenCV: {e}")
        return False
    
    try:
        import mediapipe as mp
        print("✅ MediaPipe")
    except ImportError as e:
        print(f"❌ MediaPipe: {e}")
        return False
    
    try:
        import speech_recognition as sr
        print("✅ SpeechRecognition")
    except ImportError as e:
        print(f"❌ SpeechRecognition: {e}")
        return False
    
    try:
        import pygame
        print("✅ Pygame")
    except ImportError as e:
        print(f"❌ Pygame: {e}")
        return False
    
    try:
        import numpy as np
        print("✅ NumPy")
    except ImportError as e:
        print(f"❌ NumPy: {e}")
        return False
    
    try:
        import pyttsx3
        print("✅ pyttsx3")
    except ImportError as e:
        print(f"❌ pyttsx3: {e}")
        return False
    
    try:
        import pyaudio
        print("✅ PyAudio")
    except ImportError as e:
        print(f"❌ PyAudio: {e}")
        return False
    
    return True

def test_camera():
    """Prueba que la cámara funcione"""
    print("\n📹 Probando cámara...")
    
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("❌ No se pudo abrir la cámara")
            return False
        
        ret, frame = cap.read()
        if not ret:
            print("❌ No se pudo leer de la cámara")
            cap.release()
            return False
        
        print(f"✅ Cámara funcional - Resolución: {frame.shape[1]}x{frame.shape[0]}")
        cap.release()
        return True
        
    except Exception as e:
        print(f"❌ Error con cámara: {e}")
        return False

def test_microphone():
    """Prueba que el micrófono funcione"""
    print("\n🎤 Probando micrófono...")
    
    try:
        import speech_recognition as sr
        
        recognizer = sr.Recognizer()
        microphone = sr.Microphone()
        
        print("🔧 Ajustando para ruido ambiente...")
        with microphone as source:
            recognizer.adjust_for_ambient_noise(source, duration=1)
        
        print("✅ Micrófono configurado correctamente")
        return True
        
    except Exception as e:
        print(f"❌ Error con micrófono: {e}")
        return False

def test_mediapipe():
    """Prueba que MediaPipe funcione con la cámara"""
    print("\n🤚 Probando detección de manos con MediaPipe...")
    
    try:
        import cv2
        import mediapipe as mp
        
        mp_hands = mp.solutions.hands
        hands = mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7
        )
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ No se pudo abrir la cámara para MediaPipe")
            return False
        
        print("📸 Capturando frame para probar detección...")
        for _ in range(10):  # Intentar 10 frames
            ret, frame = cap.read()
            if ret:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = hands.process(rgb_frame)
                break
        
        cap.release()
        print("✅ MediaPipe funcional")
        return True
        
    except Exception as e:
        print(f"❌ Error con MediaPipe: {e}")
        return False

def test_pygame():
    """Prueba que Pygame funcione"""
    print("\n🎮 Probando Pygame...")
    
    try:
        import pygame
        
        pygame.init()
        screen = pygame.display.set_mode((100, 100))
        pygame.display.set_caption("Test")
        pygame.quit()
        
        print("✅ Pygame funcional")
        return True
        
    except Exception as e:
        print(f"❌ Error con Pygame: {e}")
        return False

def test_text_to_speech():
    """Prueba que la síntesis de voz funcione"""
    print("\n🔊 Probando síntesis de voz...")
    
    try:
        import pyttsx3
        
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)
        
        print("✅ Síntesis de voz funcional")
        
        test_speech = input("¿Quieres probar la voz? (y/n): ").lower().strip()
        if test_speech == 'y':
            print("🔊 Diciendo 'Hola mundo'...")
            engine.say("Hola mundo, sistema de prueba funcionando")
            engine.runAndWait()
        
        return True
        
    except Exception as e:
        print(f"❌ Error con síntesis de voz: {e}")
        return False

def test_quick_gesture_detection():
    """Prueba rápida de detección de gestos"""
    print("\n👋 Prueba rápida de detección de gestos (5 segundos)...")
    print("   Muestra tu mano frente a la cámara")
    
    try:
        import cv2
        import mediapipe as mp
        import time
        
        mp_hands = mp.solutions.hands
        hands = mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7
        )
        mp_drawing = mp.solutions.drawing_utils
        
        cap = cv2.VideoCapture(0)
        start_time = time.time()
        hands_detected = 0
        
        while time.time() - start_time < 5:
            ret, frame = cap.read()
            if not ret:
                continue
            
            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(rgb_frame)
            
            if results.multi_hand_landmarks:
                hands_detected += 1
                for hand_landmarks in results.multi_hand_landmarks:
                    mp_drawing.draw_landmarks(
                        frame, hand_landmarks, mp_hands.HAND_CONNECTIONS
                    )
            
            cv2.putText(frame, "Prueba - Muestra tu mano", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Manos detectadas: {hands_detected}", 
                       (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            cv2.imshow('Prueba de Gestos', frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()
        
        if hands_detected > 0:
            print(f"✅ Detección de gestos funcional - {hands_detected} detecciones")
            return True
        else:
            print("⚠️  No se detectaron manos - verifica iluminación y posición")
            return False
        
    except Exception as e:
        print(f"❌ Error en detección de gestos: {e}")
        return False

def run_full_test():
    """Ejecuta todas las pruebas"""
    print("🧪 Sistema de Pruebas - Interfaces Multimodales")
    print("=" * 50)
    
    tests = [
        ("Importaciones", test_imports),
        ("Cámara", test_camera),
        ("Micrófono", test_microphone),
        ("MediaPipe", test_mediapipe),
        ("Pygame", test_pygame),
        ("Síntesis de voz", test_text_to_speech),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ Error en {test_name}: {e}")
            results[test_name] = False
    
    # Prueba de gestos solo si los componentes básicos funcionan
    if all([results.get("Importaciones", False), 
            results.get("Cámara", False), 
            results.get("MediaPipe", False)]):
        print(f"\n{'='*20} Detección de Gestos {'='*20}")
        results["Detección de Gestos"] = test_quick_gesture_detection()
    
    # Resumen final
    print(f"\n{'='*20} RESUMEN {'='*20}")
    all_passed = True
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name}: {status}")
        if not passed:
            all_passed = False
    
    print(f"\n{'='*50}")
    if all_passed:
        print("🎉 ¡Todos los tests pasaron! El sistema está listo.")
        print("🚀 Puedes ejecutar: python main.py")
    else:
        print("⚠️  Algunos tests fallaron. Revisa la instalación.")
        print("💡 Ejecuta: python install_dependencies.py")
    
    return all_passed

def quick_demo():
    """Demo rápido del sistema"""
    print("\n🎬 ¿Quieres ver una demo rápida? (y/n): ", end="")
    response = input().lower().strip()
    
    if response == 'y':
        print("\n🎬 Iniciando demo rápido...")
        print("📝 Demo simulado de comandos multimodales:")
        print("   1. Mano abierta + 'cambiar' = Cambiar color")
        print("   2. Dos dedos + 'mover' = Activar movimiento")
        print("   3. Puño + 'rotar' = Activar rotación")
        print("   4. Gesto OK + 'mostrar' = Mostrar estadísticas")
        
        import time
        for i in range(3, 0, -1):
            print(f"   Iniciando en {i}...")
            time.sleep(1)
        
        try:
            # Importar y ejecutar una versión simplificada
            print("🚀 Para la demo completa, ejecuta: python main.py")
        except Exception as e:
            print(f"❌ Error en demo: {e}")

def main():
    """Función principal"""
    try:
        if len(sys.argv) > 1 and sys.argv[1] == "--quick":
            # Solo pruebas básicas
            test_imports()
            test_camera()
        else:
            # Pruebas completas
            success = run_full_test()
            
            if success:
                quick_demo()
        
    except KeyboardInterrupt:
        print("\n🛑 Pruebas interrumpidas por el usuario")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    main() 