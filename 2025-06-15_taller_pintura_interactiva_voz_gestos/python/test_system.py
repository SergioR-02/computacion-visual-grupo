import cv2
import numpy as np

def test_camera():
    """Función simple para probar la cámara"""
    print("🔍 Probando cámara...")
    
    # Intentar abrir la cámara
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ No se pudo abrir la cámara")
        # Probar otras cámaras
        for i in range(1, 4):
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                print(f"✅ Cámara encontrada en índice {i}")
                break
        else:
            print("❌ No se encontró ninguna cámara")
            return False
    
    print("✅ Cámara funcionando")
    print("Presiona 'q' para cerrar la prueba")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Error leyendo frame")
            break
        
        # Voltear para efecto espejo
        frame = cv2.flip(frame, 1)
        
        # Agregar texto de prueba
        cv2.putText(frame, "Prueba de Camara - Presiona 'q' para salir", 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, "Si ves esto, la camara funciona OK!", 
                   (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        cv2.imshow('Prueba de Camara', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print("✅ Prueba de cámara completada")
    return True

def test_dependencies():
    """Probar que todas las dependencias estén instaladas"""
    print("🔍 Verificando dependencias...")
    
    try:
        import cv2
        print("✅ OpenCV: OK")
    except ImportError:
        print("❌ OpenCV: NO INSTALADO")
        return False
    
    try:
        import mediapipe
        print("✅ MediaPipe: OK")
    except ImportError:
        print("❌ MediaPipe: NO INSTALADO")
        return False
    
    try:
        import numpy
        print("✅ NumPy: OK")
    except ImportError:
        print("❌ NumPy: NO INSTALADO")
        return False
    
    # Dependencias opcionales
    try:
        import speech_recognition
        print("✅ SpeechRecognition: OK (versión completa disponible)")
    except ImportError:
        print("⚠️ SpeechRecognition: NO INSTALADO (solo versión simple)")
    
    try:
        import pyaudio
        print("✅ PyAudio: OK (versión completa disponible)")
    except ImportError:
        print("⚠️ PyAudio: NO INSTALADO (solo versión simple)")
    
    return True

if __name__ == "__main__":
    print("🧪 Prueba del Sistema de Pintura Interactiva")
    print("=" * 50)
    
    # Probar dependencias
    if not test_dependencies():
        print("\n❌ Faltan dependencias críticas")
        print("💡 Ejecuta: pip install opencv-python mediapipe numpy")
        exit(1)
    
    print("\n" + "=" * 50)
    
    # Probar cámara
    if test_camera():
        print("\n✅ ¡Todo listo! Puedes ejecutar:")
        print("   - python simple_painting.py (versión estable)")
        print("   - python main.py (versión completa con voz)")
    else:
        print("\n❌ Problemas con la cámara")
        print("💡 Verifica que tengas una cámara conectada y funcionando")
