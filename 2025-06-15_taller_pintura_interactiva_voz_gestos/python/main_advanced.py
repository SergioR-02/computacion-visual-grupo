import cv2
import mediapipe as mp
import numpy as np
import speech_recognition as sr
import threading
import time
from datetime import datetime
import os
import random

class InteractivePainting:
    def __init__(self):
        # Inicializar MediaPipe
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Configuración de la cámara
        self.cap = cv2.VideoCapture(0)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        # Configuración del lienzo
        self.canvas = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Estado del pincel
        self.drawing = False
        self.prev_x, self.prev_y = None, None
        self.brush_color = (0, 255, 0)  # Verde por defecto
        self.brush_size = 5
        self.brush_type = "circle"  # circle, square, line, star, spray, calligraphy
        self.current_gesture = "none"  # Gesto actual detectado
        self.brush_trail = []  # Para efectos especiales
        self.last_gesture_time = time.time()
        
        # Colores disponibles
        self.colors = {
            "rojo": (0, 0, 255),
            "verde": (0, 255, 0),
            "azul": (255, 0, 0),
            "amarillo": (0, 255, 255),
            "morado": (255, 0, 255),
            "cian": (255, 255, 0),
            "blanco": (255, 255, 255),
            "negro": (0, 0, 0)
        }
        
        # Configuración de reconocimiento de voz
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.last_command = "Esperando comando..."
        self.command_time = time.time()
        
        # Variables de control
        self.running = True
        self.voice_thread = None
        
        # Ajustar micrófono
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source)
        
        print("🎨 Obra Interactiva Iniciada")
        print("📋 Comandos de voz disponibles:")
        print("   - Colores: rojo, verde, azul, amarillo, morado, cian, blanco, negro")
        print("   - Pinceles: pincel, línea, cuadrado, estrella, spray, caligrafía")
        print("   - Acciones: limpiar, guardar")
        print("   - Control: más grande, más pequeño")
        print("")
        print("✋ Gestos disponibles:")
        print("   👆 Índice solo → Pincel circular")
        print("   ✌️ Índice + Medio → Pincel línea")
        print("   🤟 Tres dedos → Pincel cuadrado")
        print("   🖐️ Cuatro dedos → Pincel estrella")
        print("   🖐️ Mano abierta → Pincel spray")
        print("   🤏 Pellizco → Pincel caligrafía")
        print("   👊 Puño cerrado → No dibujar")
        
    def start_voice_recognition(self):
        """Hilo para reconocimiento de voz continuo"""
        def listen_for_commands():
            while self.running:
                try:
                    with self.microphone as source:
                        # Escuchar con timeout corto
                        audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=2)
                    
                    try:
                        # Reconocer el comando
                        command = self.recognizer.recognize_google(audio, language='es-ES').lower()
                        self.process_voice_command(command)
                    except sr.UnknownValueError:
                        pass  # No se entendió el comando
                    except sr.RequestError:
                        self.last_command = "Error de conexión"
                        
                except sr.WaitTimeoutError:
                    pass  # Timeout normal, continuar
                except Exception as e:
                    print(f"Error en reconocimiento de voz: {e}")
                    time.sleep(1)
        
        self.voice_thread = threading.Thread(target=listen_for_commands, daemon=True)
        self.voice_thread.start()
    
    def process_voice_command(self, command):
        """Procesar comandos de voz"""
        self.last_command = f"Comando: {command}"
        self.command_time = time.time()
        
        print(f"🎤 Comando detectado: {command}")
        
        # Cambiar colores
        for color_name, color_value in self.colors.items():
            if color_name in command:
                self.brush_color = color_value
                print(f"🎨 Color cambiado a {color_name}")
                return
        
        # Acciones especiales
        if "limpiar" in command or "borrar" in command:
            self.canvas = np.zeros((480, 640, 3), dtype=np.uint8)
            print("🧹 Lienzo limpiado")
            
        elif "guardar" in command:
            self.save_artwork()
            
        elif "pincel" in command or "círculo" in command:
            self.brush_type = "circle"
            print("🖌️ Pincel circular activado")
            
        elif "línea" in command:
            self.brush_type = "line"
            print("📏 Pincel lineal activado")
            
        elif "cuadrado" in command:
            self.brush_type = "square"
            print("⬜ Pincel cuadrado activado")
            
        elif "estrella" in command:
            self.brush_type = "star"
            print("⭐ Pincel estrella activado")
            
        elif "spray" in command or "aerosol" in command:
            self.brush_type = "spray"
            print("💨 Pincel spray activado")
            
        elif "caligrafía" in command or "caligrafia" in command:
            self.brush_type = "calligraphy"
            print("✒️ Pincel caligrafía activado")
            
        elif "más grande" in command or "aumentar" in command:
            self.brush_size = min(20, self.brush_size + 2)
            print(f"📏 Tamaño aumentado a {self.brush_size}")
            
        elif "más pequeño" in command or "reducir" in command:
            self.brush_size = max(1, self.brush_size - 2)
            print(f"📏 Tamaño reducido a {self.brush_size}")
    
    def save_artwork(self):
        """Guardar la obra como imagen"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        obras_dir = "../obras"
        if not os.path.exists(obras_dir):
            os.makedirs(obras_dir)
        
        filename = f"{obras_dir}/obra_{timestamp}.png"
        cv2.imwrite(filename, self.canvas)
        print(f"💾 Obra guardada como: {filename}")
    
    def detect_finger_gesture(self, landmarks):
        """Detectar diferentes gestos de mano para cambiar tipo de pincel"""
        # Puntos de referencia de los dedos
        thumb_tip = landmarks[4]    # Pulgar
        index_tip = landmarks[8]    # Índice
        middle_tip = landmarks[12]  # Medio
        ring_tip = landmarks[16]    # Anular
        pinky_tip = landmarks[20]   # Meñique
        
        # Articulaciones para comparar
        thumb_ip = landmarks[3]
        index_pip = landmarks[6]
        middle_pip = landmarks[10]
        ring_pip = landmarks[14]
        pinky_pip = landmarks[18]
        
        # Detectar dedos extendidos
        fingers_up = []
        
        # Pulgar (comparación horizontal)
        if thumb_tip.x > thumb_ip.x:  # Pulgar derecho
            fingers_up.append(1)
        else:
            fingers_up.append(0)
            
        # Otros dedos (comparación vertical)
        for tip, pip in [(index_tip, index_pip), (middle_tip, middle_pip), 
                        (ring_tip, ring_pip), (pinky_tip, pinky_pip)]:
            if tip.y < pip.y:
                fingers_up.append(1)
            else:
                fingers_up.append(0)
        
        total_fingers = sum(fingers_up)
        
        # Determinar gesto y tipo de pincel
        old_gesture = self.current_gesture
        
        # Solo índice extendido - Pincel normal
        if fingers_up == [0, 1, 0, 0, 0]:
            self.current_gesture = "index"
            if old_gesture != "index":
                self.brush_type = "circle"
                print("👆 Gesto: Índice → Pincel circular")
            return True
            
        # Índice y medio (V de victoria) - Pincel línea
        elif fingers_up == [0, 1, 1, 0, 0]:
            self.current_gesture = "peace"
            if old_gesture != "peace":
                self.brush_type = "line"
                print("✌️ Gesto: Paz → Pincel línea")
            return True
            
        # Tres dedos - Pincel cuadrado
        elif fingers_up == [0, 1, 1, 1, 0]:
            self.current_gesture = "three"
            if old_gesture != "three":
                self.brush_type = "square"
                print("🤟 Gesto: Tres dedos → Pincel cuadrado")
            return True
            
        # Cuatro dedos - Pincel estrella
        elif fingers_up == [0, 1, 1, 1, 1]:
            self.current_gesture = "four"
            if old_gesture != "four":
                self.brush_type = "star"
                print("🖐️ Gesto: Cuatro dedos → Pincel estrella")
            return True
            
        # Cinco dedos (mano abierta) - Pincel spray
        elif total_fingers == 5:
            self.current_gesture = "open_hand"
            if old_gesture != "open_hand":
                self.brush_type = "spray"
                print("🖐️ Gesto: Mano abierta → Pincel spray")
            return True
            
        # Pulgar e índice - Pincel caligrafía
        elif fingers_up == [1, 1, 0, 0, 0]:
            self.current_gesture = "pinch"
            if old_gesture != "pinch":
                self.brush_type = "calligraphy"
                print("🤏 Gesto: Pellizco → Pincel caligrafía")
            return True
            
        # Puño cerrado - No dibujar
        elif total_fingers == 0:
            self.current_gesture = "fist"
            return False
            
        # Otros gestos - No dibujar pero mantener pincel actual
        else:
            self.current_gesture = "other"
            return False
    
    def draw_star(self, x, y, size):
        """Dibujar una estrella"""
        points = []
        for i in range(10):
            angle = i * np.pi / 5
            if i % 2 == 0:
                radius = size
            else:
                radius = size // 2
            px = int(x + radius * np.cos(angle - np.pi/2))
            py = int(y + radius * np.sin(angle - np.pi/2))
            points.append([px, py])
        
        points = np.array(points, np.int32)
        cv2.fillPoly(self.canvas, [points], self.brush_color)
    
    def draw_spray(self, x, y, size):
        """Dibujar efecto spray"""
        for _ in range(15):
            offset_x = random.randint(-size*2, size*2)
            offset_y = random.randint(-size*2, size*2)
            spray_x = max(0, min(self.canvas.shape[1]-1, x + offset_x))
            spray_y = max(0, min(self.canvas.shape[0]-1, y + offset_y))
            spray_size = random.randint(1, max(1, size//3))
            cv2.circle(self.canvas, (spray_x, spray_y), spray_size, self.brush_color, -1)
    
    def draw_calligraphy(self, x, y, prev_x, prev_y):
        """Dibujar trazo de caligrafía (grosor variable)"""
        if prev_x is not None and prev_y is not None:
            # Calcular velocidad para variar grosor
            distance = np.sqrt((x - prev_x)**2 + (y - prev_y)**2)
            thickness = max(1, min(self.brush_size*2, int(self.brush_size * (10 / max(distance, 1)))))
            cv2.line(self.canvas, (prev_x, prev_y), (x, y), self.brush_color, thickness)
        else:
            cv2.circle(self.canvas, (x, y), self.brush_size, self.brush_color, -1)
    
    def draw_on_canvas(self, x, y):
        """Dibujar en el lienzo según el tipo de pincel"""
        if self.brush_type == "circle":
            cv2.circle(self.canvas, (x, y), self.brush_size, self.brush_color, -1)
            
        elif self.brush_type == "square":
            half_size = self.brush_size // 2
            cv2.rectangle(self.canvas, 
                         (x - half_size, y - half_size),
                         (x + half_size, y + half_size),
                         self.brush_color, -1)
                         
        elif self.brush_type == "line" and self.prev_x is not None:
            cv2.line(self.canvas, (self.prev_x, self.prev_y), (x, y), 
                    self.brush_color, self.brush_size)
                    
        elif self.brush_type == "star":
            self.draw_star(x, y, self.brush_size*2)
            
        elif self.brush_type == "spray":
            self.draw_spray(x, y, self.brush_size)
            
        elif self.brush_type == "calligraphy":
            self.draw_calligraphy(x, y, self.prev_x, self.prev_y)
    
    def draw_ui(self, frame):
        """Dibujar la interfaz de usuario"""
        height, width = frame.shape[:2]
        
        # Fondo semi-transparente para el texto
        overlay = frame.copy()
        
        # Panel de información
        cv2.rectangle(overlay, (10, 10), (width - 10, 140), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        
        # Información del pincel
        color_name = "desconocido"
        for name, color in self.colors.items():
            if color == self.brush_color:
                color_name = name
                break
        
        # Texto de información
        cv2.putText(frame, f"Color: {color_name}", (20, 35), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame, f"Pincel: {self.brush_type} (tamaño: {self.brush_size})", 
                   (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame, f"Gesto: {self.current_gesture}", 
                   (20, 85), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        cv2.putText(frame, f"Estado: {'🎨 Dibujando' if self.drawing else '✋ En pausa'}", 
                   (20, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.7, 
                   (0, 255, 0) if self.drawing else (0, 0, 255), 2)
        
        # Mostrar último comando de voz
        if time.time() - self.command_time < 3:  # Mostrar por 3 segundos
            cv2.putText(frame, self.last_command, (20, 135), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        
        # Muestra de color actual
        cv2.circle(frame, (width - 50, 50), 20, self.brush_color, -1)
        cv2.circle(frame, (width - 50, 50), 20, (255, 255, 255), 2)
        
        # Instrucciones
        instructions = [
            "ESC: Salir | S: Guardar | C: Limpiar",
            "Comandos de voz: colores, pinceles, limpiar, guardar",
            "Gestos: cambia el pincel automaticamente"
        ]
        
        for i, instruction in enumerate(instructions):
            cv2.putText(frame, instruction, (20, height - 60 + i * 20), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
    
    def run(self):
        """Bucle principal de la aplicación"""
        # Iniciar reconocimiento de voz
        self.start_voice_recognition()
        
        print("🚀 Aplicación iniciada. Presiona ESC para salir.")
        
        while self.running:
            ret, frame = self.cap.read()
            if not ret:
                break
            
            # Voltear frame horizontalmente para efecto espejo
            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Detectar manos
            results = self.hands.process(rgb_frame)
            
            # Procesar detección de manos
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    # Dibujar landmarks de la mano
                    self.mp_drawing.draw_landmarks(
                        frame, hand_landmarks, self.mp_hands.HAND_CONNECTIONS)
                    
                    # Obtener posición del dedo índice
                    index_tip = hand_landmarks.landmark[8]
                    h, w, _ = frame.shape
                    x, y = int(index_tip.x * w), int(index_tip.y * h)
                    
                    # Detectar gesto y determinar si dibujar
                    should_draw = self.detect_finger_gesture(hand_landmarks.landmark)
                    
                    if should_draw:
                        if not self.drawing:
                            self.drawing = True
                            self.prev_x, self.prev_y = x, y
                        
                        # Dibujar en el lienzo
                        self.draw_on_canvas(x, y)
                        self.prev_x, self.prev_y = x, y
                        
                        # Mostrar punto de dibujo
                        cv2.circle(frame, (x, y), self.brush_size + 2, (0, 255, 0), 2)
                    else:
                        self.drawing = False
                        self.prev_x, self.prev_y = None, None
                        # Mostrar punto sin dibujar
                        cv2.circle(frame, (x, y), 10, (0, 0, 255), 2)
            else:
                self.drawing = False
                self.prev_x, self.prev_y = None, None
            
            # Combinar cámara y lienzo
            canvas_resized = cv2.resize(self.canvas, (frame.shape[1], frame.shape[0]))
            combined = cv2.addWeighted(frame, 0.7, canvas_resized, 0.3, 0)
            
            # Dibujar interfaz de usuario
            self.draw_ui(combined)
            
            # Mostrar resultado
            cv2.imshow('🎨 Pintura Interactiva - Voz y Gestos', combined)
            cv2.imshow('🖼️ Lienzo', self.canvas)
            
            # Controles de teclado
            key = cv2.waitKey(1) & 0xFF
            if key == 27:  # ESC
                break
            elif key == ord('s') or key == ord('S'):
                self.save_artwork()
            elif key == ord('c') or key == ord('C'):
                self.canvas = np.zeros((480, 640, 3), dtype=np.uint8)
                print("🧹 Lienzo limpiado")
        
        self.cleanup()
    
    def cleanup(self):
        """Limpiar recursos"""
        self.running = False
        if self.voice_thread:
            self.voice_thread.join(timeout=1)
        self.cap.release()
        cv2.destroyAllWindows()
        print("👋 Aplicación cerrada")

if __name__ == "__main__":
    try:
        app = InteractivePainting()
        app.run()
    except KeyboardInterrupt:
        print("\n🛑 Aplicación interrumpida por el usuario")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Asegúrate de tener una cámara y micrófono conectados")
