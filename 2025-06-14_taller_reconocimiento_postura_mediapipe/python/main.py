
import cv2
import mediapipe as mp
import numpy as np
import pygame
import time
from typing import Tuple

class PoseActionDetector:
    """Detector de acciones basado en postura corporal usando MediaPipe"""
    
    def __init__(self, enable_sound: bool = True):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
        self.enable_sound = enable_sound
        if enable_sound:
            try:
                pygame.mixer.init()
                self.sound_enabled = True
            except:
                print("⚠️ No se pudo inicializar pygame para sonidos")
                self.sound_enabled = False
        else:
            self.sound_enabled = False
        
        self.current_action = "Desconocido"
        self.last_action = ""
        self.action_confidence = 0.0
        self.action_start_time = time.time()
        self.action_duration = 0.0
        
        self.foot_positions_history = []
        self.max_history = 10
        
        self.colors = {
            'green': (0, 255, 0),
            'red': (0, 0, 255),
            'blue': (255, 0, 0),
            'yellow': (0, 255, 255),
            'purple': (255, 0, 255),
            'orange': (0, 165, 255),
            'white': (255, 255, 255),
            'black': (0, 0, 0)        }
    
    def play_sound_effect(self, action: str):
        if not self.sound_enabled:
            return
            
        try:
            frequency_map = {
                'brazos_arriba': 800,
                'sentado': 400,
                'agachado': 300,
                'brazos_extendidos': 600,
                'caminando': 500
            }
            
            frequency = frequency_map.get(action, 440)
            duration = 0.1
            sample_rate = 22050
            
            frames = int(duration * sample_rate)
            arr = np.zeros(frames)
            
            for i in range(frames):
                arr[i] = np.sin(2 * np.pi * frequency * i / sample_rate)
            
            arr = (arr * 32767).astype(np.int16)
            stereo_arr = np.array([arr, arr]).T
            
            sound = pygame.sndarray.make_sound(stereo_arr)
            sound.play()
            
        except Exception as e:
            print(f"Error reproduciendo sonido: {e}")
    
    def get_landmark_position(self, landmarks, landmark_id: int, width: int, height: int) -> Tuple[int, int]:
        if landmarks and len(landmarks.landmark) > landmark_id:
            landmark = landmarks.landmark[landmark_id]
            return int(landmark.x * width), int(landmark.y * height)
        return 0, 0
    
    def calculate_distance(self, point1: Tuple[int, int], point2: Tuple[int, int]) -> float:
        return np.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)
    
    def detect_arms_up(self, landmarks, width: int, height: int) -> bool:
        """Detectar si ambos brazos están levantados"""
        if not landmarks:
            return False
        
        # Obtener posiciones relevantes
        nose_x, nose_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.NOSE, width, height)
        left_wrist_x, left_wrist_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.LEFT_WRIST, width, height)
        right_wrist_x, right_wrist_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.RIGHT_WRIST, width, height)
        left_shoulder_x, left_shoulder_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.LEFT_SHOULDER, width, height)
        right_shoulder_x, right_shoulder_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.RIGHT_SHOULDER, width, height)
        
        # Condición: muñecas por encima de la nariz y hombros
        left_arm_up = left_wrist_y < nose_y and left_wrist_y < left_shoulder_y
        right_arm_up = right_wrist_y < nose_y and right_wrist_y < right_shoulder_y
        
        return left_arm_up and right_arm_up
    
    def detect_sitting(self, landmarks, width: int, height: int) -> bool:
        """Detectar si la persona está sentada"""
        if not landmarks:
            return False
        
        # Obtener posiciones relevantes
        left_hip_x, left_hip_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.LEFT_HIP, width, height)
        right_hip_x, right_hip_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.RIGHT_HIP, width, height)
        left_knee_x, left_knee_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.LEFT_KNEE, width, height)
        right_knee_x, right_knee_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.RIGHT_KNEE, width, height)
        
        # Condición: caderas cerca del nivel de las rodillas
        hip_knee_diff_left = abs(left_hip_y - left_knee_y)
        hip_knee_diff_right = abs(right_hip_y - right_knee_y)
        
        # Sentado si la diferencia es pequeña (caderas y rodillas al mismo nivel)
        sitting_threshold = height * 0.15  # 15% de la altura de la imagen
        
        return hip_knee_diff_left < sitting_threshold and hip_knee_diff_right < sitting_threshold
    
    def detect_crouching(self, landmarks, width: int, height: int) -> bool:
        """Detectar si la persona está agachada"""
        if not landmarks:
            return False
        
        # Obtener posiciones relevantes
        nose_x, nose_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.NOSE, width, height)
        left_hip_x, left_hip_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.LEFT_HIP, width, height)
        right_hip_x, right_hip_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.RIGHT_HIP, width, height)
        left_knee_x, left_knee_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.LEFT_KNEE, width, height)
        right_knee_x, right_knee_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.RIGHT_KNEE, width, height)
        
        # Calcular altura aproximada del torso
        avg_hip_y = (left_hip_y + right_hip_y) / 2
        avg_knee_y = (left_knee_y + right_knee_y) / 2
        
        # Condición: torso comprimido (nariz cerca de las caderas)
        torso_height = avg_hip_y - nose_y
        normal_torso_threshold = height * 0.25  # 25% de la altura normal
        
        # Rodillas dobladas
        knees_bent = avg_knee_y < avg_hip_y + height * 0.1
        
        return torso_height < normal_torso_threshold and knees_bent
    
    def detect_arms_extended(self, landmarks, width: int, height: int) -> bool:
        """Detectar si los brazos están extendidos horizontalmente"""
        if not landmarks:
            return False
        
        # Obtener posiciones relevantes
        left_shoulder_x, left_shoulder_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.LEFT_SHOULDER, width, height)
        right_shoulder_x, right_shoulder_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.RIGHT_SHOULDER, width, height)
        left_wrist_x, left_wrist_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.LEFT_WRIST, width, height)
        right_wrist_x, right_wrist_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.RIGHT_WRIST, width, height)
        
        # Calcular diferencias verticales (deberían ser pequeñas para brazos horizontales)
        left_vertical_diff = abs(left_wrist_y - left_shoulder_y)
        right_vertical_diff = abs(right_wrist_y - right_shoulder_y)
        
        # Calcular distancias horizontales (deberían ser grandes)
        left_horizontal_diff = abs(left_wrist_x - left_shoulder_x)
        right_horizontal_diff = abs(right_wrist_x - right_shoulder_x)
        
        # Thresholds
        vertical_threshold = height * 0.1  # 10% de altura
        horizontal_threshold = width * 0.15  # 15% de ancho
        
        left_extended = (left_vertical_diff < vertical_threshold and 
                        left_horizontal_diff > horizontal_threshold)
        right_extended = (right_vertical_diff < vertical_threshold and 
                         right_horizontal_diff > horizontal_threshold)
        
        return left_extended and right_extended
    
    def detect_walking(self, landmarks, width: int, height: int) -> bool:
        """Detectar si la persona está caminando (movimiento alternado de pies)"""
        if not landmarks:
            return False
        
        # Obtener posiciones de los pies
        left_foot_x, left_foot_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.LEFT_FOOT_INDEX, width, height)
        right_foot_x, right_foot_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.RIGHT_FOOT_INDEX, width, height)
        
        # Agregar posiciones al historial
        current_positions = {
            'left_foot': (left_foot_x, left_foot_y),
            'right_foot': (right_foot_x, right_foot_y),
            'timestamp': time.time()
        }
        
        self.foot_positions_history.append(current_positions)
        
        # Mantener solo las últimas posiciones
        if len(self.foot_positions_history) > self.max_history:
            self.foot_positions_history.pop(0)
        
        # Necesitamos al menos algunas posiciones para detectar movimiento
        if len(self.foot_positions_history) < 5:
            return False
        
        # Calcular variación en posiciones de pies
        left_foot_variations = []
        right_foot_variations = []
        
        for i in range(1, len(self.foot_positions_history)):
            prev = self.foot_positions_history[i-1]
            curr = self.foot_positions_history[i]
            
            left_var = self.calculate_distance(prev['left_foot'], curr['left_foot'])
            right_var = self.calculate_distance(prev['right_foot'], curr['right_foot'])
            
            left_foot_variations.append(left_var)
            right_foot_variations.append(right_var)
        
        # Calcular movimiento promedio
        avg_left_movement = np.mean(left_foot_variations) if left_foot_variations else 0
        avg_right_movement = np.mean(right_foot_variations) if right_foot_variations else 0
        
        # Threshold para considerar movimiento como caminata
        movement_threshold = width * 0.02  # 2% del ancho de la imagen
        
        return (avg_left_movement > movement_threshold or 
                avg_right_movement > movement_threshold)
    
    def detect_action(self, landmarks, width: int, height: int) -> Tuple[str, float]:
        """
        Detectar la acción principal basada en los landmarks
        
        Returns:
            Tuple con (nombre_accion, confianza)
        """
        if not landmarks:
            return "Sin detección", 0.0
        
        # Detectar cada acción
        actions_detected = {
            'brazos_arriba': self.detect_arms_up(landmarks, width, height),
            'sentado': self.detect_sitting(landmarks, width, height),
            'agachado': self.detect_crouching(landmarks, width, height),
            'brazos_extendidos': self.detect_arms_extended(landmarks, width, height),
            'caminando': self.detect_walking(landmarks, width, height)
        }
        
        # Mapeo de nombres para mostrar
        action_names = {
            'brazos_arriba': '🙌 Brazos Arriba',
            'sentado': '🪑 Sentado',
            'agachado': '🤸 Agachado',
            'brazos_extendidos': '🤲 Brazos Extendidos',
            'caminando': '🚶 Caminando'
        }
        
        # Priorizar acciones (algunas son más específicas que otras)
        priority_order = ['agachado', 'brazos_arriba', 'brazos_extendidos', 'sentado', 'caminando']
        
        for action in priority_order:
            if actions_detected[action]:
                confidence = 0.8  # Confianza base
                return action_names[action], confidence
        
        # Si no se detectó ninguna acción específica, determinar posición básica
        return "🧍 De Pie", 0.6
    
    def draw_landmarks_with_info(self, image, landmarks, width: int, height: int):
        """Dibujar landmarks y información adicional en la imagen"""
        if landmarks:
            # Dibujar conexiones del cuerpo
            self.mp_drawing.draw_landmarks(
                image, landmarks, self.mp_pose.POSE_CONNECTIONS,
                self.mp_drawing.DrawingSpec(color=self.colors['blue'], thickness=2, circle_radius=2),
                self.mp_drawing.DrawingSpec(color=self.colors['green'], thickness=2)
            )
            
            # Destacar puntos clave importantes
            key_landmarks = [
                (self.mp_pose.PoseLandmark.NOSE, self.colors['red']),
                (self.mp_pose.PoseLandmark.LEFT_WRIST, self.colors['yellow']),
                (self.mp_pose.PoseLandmark.RIGHT_WRIST, self.colors['yellow']),
                (self.mp_pose.PoseLandmark.LEFT_HIP, self.colors['purple']),
                (self.mp_pose.PoseLandmark.RIGHT_HIP, self.colors['purple']),
                (self.mp_pose.PoseLandmark.LEFT_KNEE, self.colors['orange']),
                (self.mp_pose.PoseLandmark.RIGHT_KNEE, self.colors['orange'])
            ]
            
            for landmark_id, color in key_landmarks:
                x, y = self.get_landmark_position(landmarks, landmark_id, width, height)
                if x > 0 and y > 0:
                    cv2.circle(image, (x, y), 8, color, -1)
                    cv2.circle(image, (x, y), 10, self.colors['white'], 2)
    
    def draw_action_info(self, image, width: int, height: int):
        """Dibujar información de la acción detectada"""
        # Fondo para el texto
        overlay = image.copy()
        cv2.rectangle(overlay, (10, 10), (width-10, 120), self.colors['black'], -1)
        cv2.addWeighted(overlay, 0.7, image, 0.3, 0, image)
        
        # Información principal
        cv2.putText(image, f"Accion: {self.current_action}", 
                   (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, self.colors['white'], 2)
        
        cv2.putText(image, f"Confianza: {self.action_confidence:.1%}", 
                   (20, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.8, self.colors['green'], 2)
        
        cv2.putText(image, f"Duracion: {self.action_duration:.1f}s", 
                   (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.8, self.colors['yellow'], 2)
        
        # Estado del sonido
        sound_status = "🔊 ON" if self.sound_enabled else "🔇 OFF"
        cv2.putText(image, f"Sonido: {sound_status}", 
                   (width-200, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, self.colors['white'], 2)
        
        # Instrucciones
        instructions = [
            "Presiona 'q' para salir",
            "Presiona 's' para toggle sonido",
            "Presiona 'r' para reset historial"
        ]
        
        for i, instruction in enumerate(instructions):
            cv2.putText(image, instruction, 
                       (20, height - 80 + i*25), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.5, self.colors['white'], 1)
    
    def process_frame(self, frame):
        """Procesar un frame de video y detectar acciones"""
        height, width, _ = frame.shape
        
        # Convertir BGR a RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Procesar con MediaPipe
        results = self.pose.process(rgb_frame)
        
        # Detectar acción
        action, confidence = self.detect_action(results.pose_landmarks, width, height)
        
        # Actualizar estado
        if action != self.current_action:
            self.last_action = self.current_action
            self.current_action = action
            self.action_confidence = confidence
            self.action_start_time = time.time()
            self.action_duration = 0.0
            
            # Reproducir sonido si cambió la acción
            if self.sound_enabled and action != "🧍 De Pie" and action != "Sin detección":
                action_key = action.split(' ', 1)[1].lower().replace(' ', '_')
                self.play_sound_effect(action_key)
        else:
            self.action_duration = time.time() - self.action_start_time
        
        # Dibujar visualización
        self.draw_landmarks_with_info(frame, results.pose_landmarks, width, height)
        self.draw_action_info(frame, width, height)
        
        return frame
    
    def run(self):
        """Ejecutar el sistema de detección de acciones"""
        print("🎥 Iniciando detección de acciones con postura corporal...")
        print("📋 Acciones detectables:")
        print("   🙌 Brazos Arriba - Levanta ambos brazos por encima de la cabeza")
        print("   🪑 Sentado - Siéntate en una silla")
        print("   🤸 Agachado - Ponte en cuclillas")
        print("   🤲 Brazos Extendidos - Extiende los brazos horizontalmente")
        print("   🚶 Caminando - Camina frente a la cámara")
        print("\n⌨️ Controles:")
        print("   'q' - Salir")
        print("   's' - Activar/desactivar sonido")
        print("   'r' - Reiniciar historial de movimiento")
        print("\n🎬 ¡Comienza a moverte frente a la cámara!")
        
        # Inicializar captura de video
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("❌ Error: No se pudo abrir la cámara")
            return
        
        # Configurar resolución
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    print("❌ Error leyendo el frame")
                    break
                
                # Voltear horizontalmente para efecto espejo
                frame = cv2.flip(frame, 1)
                
                # Procesar frame
                processed_frame = self.process_frame(frame)
                
                # Mostrar resultado
                cv2.imshow('🧪 Reconocimiento de Acciones - Computación Visual', processed_frame)
                
                # Manejar teclas
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    print("👋 Saliendo...")
                    break
                elif key == ord('s'):
                    self.sound_enabled = not self.sound_enabled
                    status = "activado" if self.sound_enabled else "desactivado"
                    print(f"🔊 Sonido {status}")
                elif key == ord('r'):
                    self.foot_positions_history.clear()
                    print("🔄 Historial de movimiento reiniciado")
        
        except KeyboardInterrupt:
            print("\n👋 Interrupción por teclado. Saliendo...")
        
        finally:
            cap.release()
            cv2.destroyAllWindows()
            if self.sound_enabled:
                pygame.mixer.quit()
            print("✅ Recursos liberados correctamente")

def main():
    """Función principal"""
    print("🧪 Taller - Reconocimiento de Acciones Simples con Detección de Postura")
    print("=" * 70)
    
    try:
        # Crear y ejecutar detector
        detector = PoseActionDetector(enable_sound=True)
        detector.run()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Asegúrate de tener una cámara conectada y las dependencias instaladas")
        print("   Ejecuta: pip install -r requirements.txt")

if __name__ == "__main__":
    main()