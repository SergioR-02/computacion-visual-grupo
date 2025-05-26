#!/usr/bin/env python3
"""
🧪 Taller - Interfaces Multimodales: Uniendo Voz y Gestos
Sistema que combina detección de gestos (MediaPipe) con reconocimiento de voz
para crear una experiencia de interacción multimodal rica e intuitiva.
"""

import cv2
import mediapipe as mp
import speech_recognition as sr
import pygame
import numpy as np
import threading
import time
import math
import queue
from typing import Optional, Tuple, Dict, Any
import pyttsx3

# Configuración de colores
COLORS = {
    'azul': (100, 150, 255),
    'rojo': (255, 100, 100),
    'verde': (100, 255, 100),
    'amarillo': (255, 255, 100),
    'blanco': (255, 255, 255),
    'negro': (0, 0, 0),
    'gris': (128, 128, 128),
    'violeta': (255, 100, 255)
}

# Comandos de voz reconocidos
VOICE_COMMANDS = [
    'cambiar', 'mover', 'rotar', 'mostrar', 'salir',
    'azul', 'rojo', 'verde', 'amarillo', 'parar', 'reset'
]

class GestureDetector:
    """Detector de gestos usando MediaPipe Hands"""
    
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
    def classify_gesture(self, hand_landmarks) -> str:
        """Clasifica el gesto basado en las posiciones de los landmarks"""
        if not hand_landmarks:
            return "none"
        
        landmarks = hand_landmarks.landmark
        
        # Obtener posiciones de los dedos
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]
        
        # Posiciones de las articulaciones medias
        index_pip = landmarks[6]
        middle_pip = landmarks[10]
        ring_pip = landmarks[14]
        pinky_pip = landmarks[18]
        
        # Contar dedos extendidos
        fingers_up = []
        
        # Pulgar (comparar x para mano derecha/izquierda)
        if thumb_tip.x > landmarks[3].x:  # Mano derecha
            fingers_up.append(thumb_tip.x > landmarks[3].x)
        else:  # Mano izquierda
            fingers_up.append(thumb_tip.x < landmarks[3].x)
            
        # Otros dedos (comparar y)
        fingers_up.append(index_tip.y < index_pip.y)
        fingers_up.append(middle_tip.y < middle_pip.y)
        fingers_up.append(ring_tip.y < ring_pip.y)
        fingers_up.append(pinky_tip.y < pinky_pip.y)
        
        total_fingers = sum(fingers_up)
        
        # Clasificar gestos
        if total_fingers == 0:
            return "fist"  # Puño cerrado
        elif total_fingers == 5:
            return "open"  # Mano abierta
        elif total_fingers == 2 and fingers_up[1] and fingers_up[2]:
            return "peace"  # Dos dedos (V de victoria)
        elif total_fingers == 1 and fingers_up[1]:
            return "point"  # Señalar
        elif self._is_ok_gesture(landmarks):
            return "ok"  # Gesto OK
        else:
            return f"fingers_{total_fingers}"
    
    def _is_ok_gesture(self, landmarks) -> bool:
        """Detecta el gesto OK (círculo con pulgar e índice)"""
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        
        # Calcular distancia entre pulgar e índice
        distance = math.sqrt(
            (thumb_tip.x - index_tip.x) ** 2 + 
            (thumb_tip.y - index_tip.y) ** 2
        )
        
        return distance < 0.05  # Umbral para considerar que están tocándose
    
    def detect_gestures(self, frame):
        """Detecta gestos en el frame y retorna información"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_frame)
        
        gestures = []
        annotated_frame = frame.copy()
        
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Dibujar landmarks
                self.mp_drawing.draw_landmarks(
                    annotated_frame, hand_landmarks, self.mp_hands.HAND_CONNECTIONS
                )
                
                # Clasificar gesto
                gesture = self.classify_gesture(hand_landmarks)
                gestures.append(gesture)
                
                # Obtener posición de la muñeca para tracking
                wrist = hand_landmarks.landmark[0]
                hand_center = (int(wrist.x * frame.shape[1]), int(wrist.y * frame.shape[0]))
                
                # Dibujar etiqueta del gesto
                cv2.putText(annotated_frame, gesture, 
                           (hand_center[0] - 50, hand_center[1] - 50),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        return gestures, annotated_frame

class VoiceRecognizer:
    """Reconocedor de voz usando SpeechRecognition"""
    
    def __init__(self, microphone_index=None):
        self.recognizer = sr.Recognizer()
        self.microphone_index = microphone_index
        self.is_listening = False
        self.command_queue = queue.Queue()
        
        # Configurar micrófono
        self.setup_microphone()
        
        # Ajustar configuración para EMEET SmartCam
        self.optimize_for_emeet()
        
        # Sistema de síntesis de voz
        self.tts_engine = pyttsx3.init()
        self.tts_engine.setProperty('rate', 150)  # Velocidad de habla
    
    def setup_microphone(self):
        """Configura el micrófono con mejor detección"""
        try:
            # Intentar con micrófono específico si se proporcionó
            if self.microphone_index is not None:
                print(f"🎤 Usando micrófono específico #{self.microphone_index}")
                self.microphone = sr.Microphone(device_index=self.microphone_index)
            else:
                # Buscar el mejor micrófono disponible
                self.microphone = self.find_best_microphone()
            
            # Configurar el reconocedor
            print("🔧 Configurando micrófono...")
            with self.microphone as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=2)
                print(f"✅ Micrófono configurado - Umbral: {self.recognizer.energy_threshold}")
                
        except Exception as e:
            print(f"⚠️  Error configurando micrófono: {e}")
            print("🔄 Intentando con micrófono por defecto...")
            try:
                self.microphone = sr.Microphone()
                with self.microphone as source:
                    self.recognizer.adjust_for_ambient_noise(source, duration=1)
            except Exception as e2:
                print(f"❌ Error crítico con micrófono: {e2}")
                raise e2
    
    def find_best_microphone(self):
        """Encuentra el mejor micrófono disponible, priorizando EMEET SmartCam Nova 4K"""
        import pyaudio
        
        try:
            p = pyaudio.PyAudio()
            
            # Buscar específicamente EMEET SmartCam Nova 4K
            print("🔍 Buscando micrófono EMEET SmartCam Nova 4K...")
            for i in range(p.get_device_count()):
                try:
                    info = p.get_device_info_by_index(i)
                    if info['maxInputChannels'] > 0:
                        # Buscar EMEET SmartCam en el nombre
                        if "EMEET" in info['name'] or "SmartCam" in info['name']:
                            print(f"🎯 ¡Encontrado! Usando: {info['name']}")
                            test_mic = sr.Microphone(device_index=i)
                            p.terminate()
                            return test_mic
                except:
                    continue
            
            print("⚠️  No se encontró EMEET SmartCam, buscando otros micrófonos...")
            
            # Obtener micrófono por defecto como respaldo
            try:
                default_info = p.get_default_input_device_info()
                default_mic = sr.Microphone(device_index=default_info['index'])
                print(f"🎤 Usando micrófono por defecto: {default_info['name']}")
                p.terminate()
                return default_mic
            except:
                pass
            
            # Buscar cualquier micrófono funcional
            for i in range(p.get_device_count()):
                try:
                    info = p.get_device_info_by_index(i)
                    if info['maxInputChannels'] > 0:
                        # Intentar crear micrófono
                        test_mic = sr.Microphone(device_index=i)
                        print(f"🎤 Usando micrófono: {info['name']}")
                        p.terminate()
                        return test_mic
                except:
                    continue
            
                        # p.terminate()
            # Si nada funciona, usar micrófono por defecto sin índice
            return sr.Microphone()
            
        except Exception as e:
            print(f"⚠️  Error buscando micrófonos: {e}")
            return sr.Microphone()
    
    def optimize_for_emeet(self):
        """Optimiza la configuración específicamente para EMEET SmartCam Nova 4K"""
        try:
            # Ajustar configuración específica para EMEET SmartCam
            # Estos valores funcionan mejor con cámaras web
            self.recognizer.energy_threshold = 300  # Umbral más bajo para cámaras web
            self.recognizer.dynamic_energy_threshold = True
            self.recognizer.dynamic_energy_adjustment_damping = 0.15
            self.recognizer.dynamic_energy_ratio = 1.5
            self.recognizer.pause_threshold = 0.8  # Pausa más corta
            self.recognizer.operation_timeout = None
            self.recognizer.phrase_threshold = 0.3
            self.recognizer.non_speaking_duration = 0.5
            
            print("🔧 Configuración optimizada para EMEET SmartCam Nova 4K")
            
        except Exception as e:
            print(f"⚠️  Error optimizando para EMEET: {e}")
         
    def listen_continuously(self):
        """Escucha continuamente comandos de voz en un hilo separado"""
        self.is_listening = True
        
        def listen_worker():
            while self.is_listening:
                try:
                    with self.microphone as source:
                        # Escuchar con timeout corto para no bloquear
                        audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=3)
                    
                    try:
                        # Reconocer el audio
                        command = self.recognizer.recognize_google(audio, language='es-ES').lower()
                        
                        # Filtrar solo comandos válidos
                        for valid_command in VOICE_COMMANDS:
                            if valid_command in command:
                                self.command_queue.put(valid_command)
                                print(f"🎤 Comando reconocido: {valid_command}")
                                break
                                
                    except sr.UnknownValueError:
                        pass  # No se entendió el audio
                    except sr.RequestError as e:
                        print(f"Error en el servicio de reconocimiento: {e}")
                        
                except sr.WaitTimeoutError:
                    pass  # Timeout normal, continuar
                except Exception as e:
                    print(f"Error en reconocimiento de voz: {e}")
                    time.sleep(0.1)
        
        # Iniciar hilo de escucha
        self.listen_thread = threading.Thread(target=listen_worker, daemon=True)
        self.listen_thread.start()
    
    def get_command(self) -> Optional[str]:
        """Obtiene el siguiente comando de la cola"""
        try:
            return self.command_queue.get_nowait()
        except queue.Empty:
            return None
    
    def speak(self, text: str):
        """Síntesis de voz para retroalimentación"""
        def speak_worker():
            self.tts_engine.say(text)
            self.tts_engine.runAndWait()
        
        thread = threading.Thread(target=speak_worker, daemon=True)
        thread.start()
    
    def stop_listening(self):
        """Detiene la escucha continua"""
        self.is_listening = False

class InteractiveObject:
    """Objeto interactivo que responde a comandos multimodales"""
    
    def __init__(self, x: int, y: int, size: int = 50):
        self.x = x
        self.y = y
        self.size = size
        self.color = COLORS['azul']
        self.rotation = 0
        self.scale = 1.0
        self.velocity = [0, 0]
        self.is_moving = False
        self.is_rotating = False
        
    def update(self):
        """Actualiza el estado del objeto"""
        if self.is_moving:
            self.x += self.velocity[0]
            self.y += self.velocity[1]
            
        if self.is_rotating:
            self.rotation += 2
            
        # Mantener dentro de los límites
        self.x = max(self.size, min(800 - self.size, self.x))
        self.y = max(self.size, min(600 - self.size, self.y))
        
    def draw(self, screen):
        """Dibuja el objeto en la pantalla"""
        # Crear superficie para rotación
        surf_size = int(self.size * 2 * self.scale)
        surf = pygame.Surface((surf_size, surf_size), pygame.SRCALPHA)
        
        # Dibujar forma básica
        pygame.draw.circle(surf, self.color, 
                          (surf_size // 2, surf_size // 2), 
                          int(self.size * self.scale))
        
        # Rotar superficie
        if self.rotation != 0:
            surf = pygame.transform.rotate(surf, self.rotation)
        
        # Dibujar en pantalla
        rect = surf.get_rect(center=(self.x, self.y))
        screen.blit(surf, rect)

class MultimodalInterface:
    """Interfaz principal que coordina gestos, voz y visualización"""
    
    def __init__(self):
        # Inicializar Pygame
        pygame.init()
        self.screen = pygame.display.set_mode((800, 600))
        pygame.display.set_caption("🧪 Interfaces Multimodales: Voz + Gestos")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 24)
        self.big_font = pygame.font.Font(None, 36)
        
        # Inicializar componentes
        self.gesture_detector = GestureDetector()
        self.voice_recognizer = VoiceRecognizer()
        
        # Estado del sistema
        self.running = True
        self.current_gesture = "none"
        self.last_command = ""
        self.interactive_object = InteractiveObject(400, 300, 40)
        
        # Estadísticas y feedback
        self.gesture_count = 0
        self.command_count = 0
        self.multimodal_actions = 0
        self.status_message = "🎯 Combina gestos y voz para interactuar"
        self.message_timer = 0
        
        # Inicializar cámara
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            raise Exception("No se pudo abrir la cámara")
            
        # Configurar ventana de cámara
        cv2.namedWindow('Detección de Gestos', cv2.WINDOW_NORMAL)
        cv2.resizeWindow('Detección de Gestos', 640, 480)
        
    def start(self):
        """Inicia el sistema multimodal"""
        print("🚀 Iniciando sistema multimodal...")
        print("📝 Comandos disponibles:")
        print("   Gestos: mano abierta, puño, dos dedos, gesto OK")
        print("   Voz: cambiar, mover, rotar, mostrar, colores, salir")
        
        # Iniciar reconocimiento de voz
        self.voice_recognizer.listen_continuously()
        self.voice_recognizer.speak("Sistema multimodal iniciado")
        
        # Bucle principal
        while self.running:
            self.handle_events()
            self.process_camera()
            self.process_voice()
            self.update_objects()
            self.render()
            self.clock.tick(60)
        
        self.cleanup()
    
    def handle_events(self):
        """Maneja eventos de Pygame"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
                elif event.key == pygame.K_r:
                    self.reset_object()
    
    def process_camera(self):
        """Procesa el feed de la cámara y detecta gestos"""
        ret, frame = self.cap.read()
        if not ret:
            return
        
        # Voltear frame horizontalmente para efecto espejo
        frame = cv2.flip(frame, 1)
        
        # Detectar gestos
        gestures, annotated_frame = self.gesture_detector.detect_gestures(frame)
        
        if gestures:
            new_gesture = gestures[0]  # Usar el primer gesto detectado
            if new_gesture != self.current_gesture:
                self.current_gesture = new_gesture
                self.gesture_count += 1
                print(f"👋 Gesto detectado: {new_gesture}")
        else:
            self.current_gesture = "none"
        
        # Mostrar frame con anotaciones
        cv2.putText(annotated_frame, f"Gesto: {self.current_gesture}", 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(annotated_frame, "ESC: Salir | R: Reset", 
                   (10, annotated_frame.shape[0] - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        cv2.imshow('Detección de Gestos', annotated_frame)
        cv2.waitKey(1)
    
    def process_voice(self):
        """Procesa comandos de voz"""
        command = self.voice_recognizer.get_command()
        if command:
            self.last_command = command
            self.command_count += 1
            self.process_multimodal_action(self.current_gesture, command)
    
    def process_multimodal_action(self, gesture: str, command: str):
        """Procesa acciones que requieren combinación de gesto y voz"""
        action_performed = False
        message = ""
        
        # Acciones que requieren combinaciones específicas
        if command == "cambiar" and gesture == "open":
            self.change_object_color()
            message = "🎨 Color cambiado con mano abierta"
            action_performed = True
            
        elif command == "mover" and gesture == "peace":
            self.toggle_object_movement()
            message = "🏃 Movimiento activado con dos dedos"
            action_performed = True
            
        elif command == "rotar" and gesture == "fist":
            self.toggle_object_rotation()
            message = "🌀 Rotación activada con puño"
            action_performed = True
            
        elif command == "mostrar" and gesture == "ok":
            self.show_statistics()
            message = "📊 Estadísticas mostradas con gesto OK"
            action_performed = True
            
        # Comandos de color (solo con mano abierta)
        elif command in COLORS and gesture == "open":
            self.interactive_object.color = COLORS[command]
            message = f"🎨 Color cambiado a {command}"
            action_performed = True
            
        # Comandos especiales
        elif command == "salir":
            self.running = False
            message = "👋 Cerrando aplicación"
            action_performed = True
            
        elif command == "reset":
            self.reset_object()
            message = "🔄 Objeto reiniciado"
            action_performed = True
            
        elif command == "parar":
            self.stop_all_actions()
            message = "⏹️ Todas las acciones detenidas"
            action_performed = True
        
        # Acciones que no requieren gesto específico
        elif command == "mostrar":
            self.show_statistics()
            message = "📊 Estadísticas mostradas"
            action_performed = True
            
        elif command == "mover":
            self.toggle_object_movement()
            message = "🏃 Movimiento activado/desactivado por voz"
            action_performed = True
            
        elif command == "rotar":
            self.toggle_object_rotation()
            message = "🌀 Rotación activada/desactivada por voz"
            action_performed = True
        
        # Si no se realizó ninguna acción válida
        if not action_performed:
            message = f"❌ Combinación no válida: {gesture} + {command}"
            self.voice_recognizer.speak("Combinación no válida")
        else:
            self.multimodal_actions += 1
            self.voice_recognizer.speak("Acción realizada")
        
        self.set_status_message(message)
        print(f"🎯 {message}")
    
    def change_object_color(self):
        """Cambia el color del objeto aleatoriamente"""
        colors = list(COLORS.values())
        current_color = self.interactive_object.color
        new_color = current_color
        while new_color == current_color:
            new_color = colors[np.random.randint(len(colors))]
        self.interactive_object.color = new_color
    
    def toggle_object_movement(self):
        """Activa/desactiva el movimiento del objeto"""
        self.interactive_object.is_moving = not self.interactive_object.is_moving
        if self.interactive_object.is_moving:
            # Generar velocidad aleatoria
            angle = np.random.random() * 2 * np.pi
            speed = 2
            self.interactive_object.velocity = [
                speed * np.cos(angle),
                speed * np.sin(angle)
            ]
        else:
            self.interactive_object.velocity = [0, 0]
    
    def toggle_object_rotation(self):
        """Activa/desactiva la rotación del objeto"""
        self.interactive_object.is_rotating = not self.interactive_object.is_rotating
    
    def stop_all_actions(self):
        """Detiene todas las acciones del objeto"""
        self.interactive_object.is_moving = False
        self.interactive_object.is_rotating = False
        self.interactive_object.velocity = [0, 0]
    
    def reset_object(self):
        """Reinicia el objeto a su estado inicial"""
        self.interactive_object = InteractiveObject(400, 300, 40)
        self.multimodal_actions += 1
    
    def show_statistics(self):
        """Muestra estadísticas del sistema"""
        stats = f"Gestos: {self.gesture_count}, Comandos: {self.command_count}, Acciones: {self.multimodal_actions}"
        print(f"📊 Estadísticas: {stats}")
        self.set_status_message(f"📊 {stats}")
    
    def set_status_message(self, message: str):
        """Establece un mensaje de estado temporal"""
        self.status_message = message
        self.message_timer = pygame.time.get_ticks() + 3000  # 3 segundos
    
    def update_objects(self):
        """Actualiza todos los objetos interactivos"""
        self.interactive_object.update()
        
        # Limpiar mensaje de estado después del tiempo
        if pygame.time.get_ticks() > self.message_timer:
            self.status_message = "🎯 Combina gestos y voz para interactuar"
    
    def render(self):
        """Renderiza toda la interfaz"""
        # Limpiar pantalla
        self.screen.fill(COLORS['negro'])
        
        # Dibujar objeto interactivo
        self.interactive_object.draw(self.screen)
        
        # Panel de información
        self.draw_info_panel()
        
        # Actualizar pantalla
        pygame.display.flip()
    
    def draw_info_panel(self):
        """Dibuja el panel de información"""
        y_offset = 10
        
        # Título
        title = self.big_font.render("🧪 Interfaces Multimodales", True, COLORS['blanco'])
        self.screen.blit(title, (10, y_offset))
        y_offset += 40
        
        # Estado actual
        info_texts = [
            f"👋 Gesto actual: {self.current_gesture}",
            f"🎤 Último comando: {self.last_command}",
            f"📊 Gestos: {self.gesture_count} | Comandos: {self.command_count} | Acciones: {self.multimodal_actions}",
            "",
            "🎮 Controles Multimodales:",
            "• Mano abierta + 'cambiar' = Cambiar color",
            "• Dos dedos + 'mover' = Activar movimiento", 
            "• Puño + 'rotar' = Activar rotación",
            "• Gesto OK + 'mostrar' = Ver estadísticas",
            "• Mano abierta + colores = Cambiar a color específico",
            "",
            "🗣️ Comandos de voz (funcionan solos o con gestos):",
            "• 'mover' = Activar/desactivar movimiento",
            "• 'rotar' = Activar/desactivar rotación", 
            "• 'cambiar', 'mostrar', 'parar', 'reset', 'salir'",
            "• Colores: azul, rojo, verde, amarillo",
        ]
        
        for text in info_texts:
            if text:  # Solo renderizar líneas no vacías
                surface = self.font.render(text, True, COLORS['blanco'])
                self.screen.blit(surface, (10, y_offset))
            y_offset += 25
        
        # Mensaje de estado
        if self.status_message:
            status_surface = self.font.render(self.status_message, True, COLORS['amarillo'])
            self.screen.blit(status_surface, (10, 550))
        
        # Estado del objeto
        obj_info = [
            f"Objeto - Pos: ({self.interactive_object.x}, {self.interactive_object.y})",
            f"Movimiento: {'Sí' if self.interactive_object.is_moving else 'No'}",
            f"Rotación: {'Sí' if self.interactive_object.is_rotating else 'No'}",
            f"Rotación actual: {self.interactive_object.rotation:.0f}°"
        ]
        
        for i, text in enumerate(obj_info):
            surface = self.font.render(text, True, COLORS['gris'])
            self.screen.blit(surface, (550, 10 + i * 25))
    
    def cleanup(self):
        """Limpia recursos al cerrar"""
        print("🧹 Cerrando sistema multimodal...")
        self.voice_recognizer.stop_listening()
        self.cap.release()
        cv2.destroyAllWindows()
        pygame.quit()

def main():
    """Función principal"""
    try:
        print("🧪 Taller - Interfaces Multimodales: Uniendo Voz y Gestos")
        print("=" * 60)
        
        # Crear y ejecutar interfaz
        interface = MultimodalInterface()
        interface.start()
        
    except KeyboardInterrupt:
        print("\n🛑 Interrumpido por el usuario")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("👋 ¡Gracias por usar el sistema multimodal!")

if __name__ == "__main__":
    main()
