#!/usr/bin/env python3
"""
🎯 Demo Interactivo - Aprende las Acciones Paso a Paso

Este script te guía a través de cada acción que puede detectar el sistema,
con instrucciones claras y retroalimentación visual.
"""

import cv2
import mediapipe as mp
import time

class InteractiveDemo:
    """Demo interactivo para aprender las acciones"""
    
    def __init__(self):
        # Inicializar MediaPipe
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Lista de acciones para demostrar
        self.actions_demo = [
            {
                'name': '🙌 Brazos Arriba',
                'instruction': 'Levanta ambos brazos por encima de la cabeza',
                'detection_func': self.detect_arms_up,
                'completed': False
            },
            {
                'name': '🤲 Brazos Extendidos',
                'instruction': 'Extiende los brazos horizontalmente a los lados',
                'detection_func': self.detect_arms_extended,
                'completed': False
            },
            {
                'name': '🤸 Agachado',
                'instruction': 'Ponte en cuclillas (agáchate)',
                'detection_func': self.detect_crouching,
                'completed': False
            },
            {
                'name': '🪑 Sentado',
                'instruction': 'Siéntate en una silla',
                'detection_func': self.detect_sitting,
                'completed': False
            }
        ]
        
        self.current_demo_idx = 0
        self.detection_start_time = None
        self.detection_duration_needed = 2.0  # 2 segundos para confirmar
    
    def get_landmark_position(self, landmarks, landmark_id, width, height):
        """Obtener posición de landmark"""
        if landmarks and len(landmarks.landmark) > landmark_id:
            landmark = landmarks.landmark[landmark_id]
            return int(landmark.x * width), int(landmark.y * height)
        return 0, 0
    
    def detect_arms_up(self, landmarks, width, height):
        """Detectar brazos arriba"""
        if not landmarks:
            return False
        
        nose_x, nose_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.NOSE, width, height)
        left_wrist_x, left_wrist_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.LEFT_WRIST, width, height)
        right_wrist_x, right_wrist_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.RIGHT_WRIST, width, height)
        
        return left_wrist_y < nose_y and right_wrist_y < nose_y
    
    def detect_arms_extended(self, landmarks, width, height):
        """Detectar brazos extendidos"""
        if not landmarks:
            return False
        
        left_shoulder_x, left_shoulder_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.LEFT_SHOULDER, width, height)
        right_shoulder_x, right_shoulder_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.RIGHT_SHOULDER, width, height)
        left_wrist_x, left_wrist_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.LEFT_WRIST, width, height)
        right_wrist_x, right_wrist_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.RIGHT_WRIST, width, height)
        
        left_vertical_diff = abs(left_wrist_y - left_shoulder_y)
        right_vertical_diff = abs(right_wrist_y - right_shoulder_y)
        left_horizontal_diff = abs(left_wrist_x - left_shoulder_x)
        right_horizontal_diff = abs(right_wrist_x - right_shoulder_x)
        
        vertical_threshold = height * 0.1
        horizontal_threshold = width * 0.15
        
        left_extended = (left_vertical_diff < vertical_threshold and left_horizontal_diff > horizontal_threshold)
        right_extended = (right_vertical_diff < vertical_threshold and right_horizontal_diff > horizontal_threshold)
        
        return left_extended and right_extended
    
    def detect_crouching(self, landmarks, width, height):
        """Detectar agachado"""
        if not landmarks:
            return False
        
        nose_x, nose_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.NOSE, width, height)
        left_hip_x, left_hip_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.LEFT_HIP, width, height)
        right_hip_x, right_hip_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.RIGHT_HIP, width, height)
        
        avg_hip_y = (left_hip_y + right_hip_y) / 2
        torso_height = avg_hip_y - nose_y
        normal_torso_threshold = height * 0.25
        
        return torso_height < normal_torso_threshold
    
    def detect_sitting(self, landmarks, width, height):
        """Detectar sentado"""
        if not landmarks:
            return False
        
        left_hip_x, left_hip_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.LEFT_HIP, width, height)
        right_hip_x, right_hip_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.RIGHT_HIP, width, height)
        left_knee_x, left_knee_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.LEFT_KNEE, width, height)
        right_knee_x, right_knee_y = self.get_landmark_position(landmarks, self.mp_pose.PoseLandmark.RIGHT_KNEE, width, height)
        
        hip_knee_diff_left = abs(left_hip_y - left_knee_y)
        hip_knee_diff_right = abs(right_hip_y - right_knee_y)
        sitting_threshold = height * 0.15
        
        return hip_knee_diff_left < sitting_threshold and hip_knee_diff_right < sitting_threshold
    
    def draw_demo_info(self, image, width, height, detected, detection_progress):
        """Dibujar información del demo"""
        if self.current_demo_idx >= len(self.actions_demo):
            # Demo completado
            overlay = image.copy()
            cv2.rectangle(overlay, (0, 0), (width, height), (0, 255, 0), -1)
            cv2.addWeighted(overlay, 0.3, image, 0.7, 0, image)
            
            cv2.putText(image, "🎉 ¡DEMO COMPLETADO!", 
                       (width//2 - 200, height//2 - 50), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3)
            cv2.putText(image, "Presiona 'q' para salir o 'r' para reiniciar", 
                       (width//2 - 250, height//2 + 50), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
            return
        
        current_action = self.actions_demo[self.current_demo_idx]
        
        # Fondo para información
        overlay = image.copy()
        cv2.rectangle(overlay, (10, 10), (width-10, 180), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.8, image, 0.2, 0, image)
        
        # Título de la acción actual
        cv2.putText(image, f"Accion {self.current_demo_idx + 1}/{len(self.actions_demo)}: {current_action['name']}", 
                   (20, 45), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
        
        # Instrucción
        cv2.putText(image, current_action['instruction'], 
                   (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        # Estado de detección
        if detected:
            status_color = (0, 255, 0)
            status_text = f"✅ DETECTADO! Mantén por {detection_progress:.1f}s más"
        else:
            status_color = (0, 0, 255)
            status_text = "❌ No detectado - Sigue las instrucciones"
        
        cv2.putText(image, status_text, 
                   (20, 115), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)
        
        # Progreso
        completed_count = sum(1 for action in self.actions_demo if action['completed'])
        progress_text = f"Progreso: {completed_count}/{len(self.actions_demo)} acciones completadas"
        cv2.putText(image, progress_text, 
                   (20, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
        
        # Barra de progreso de detección
        if detected and detection_progress > 0:
            bar_width = 300
            bar_height = 20
            bar_x = width - bar_width - 20
            bar_y = height - 60
            
            # Fondo de la barra
            cv2.rectangle(image, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), 
                         (100, 100, 100), -1)
            
            # Progreso
            progress_width = int((detection_progress / self.detection_duration_needed) * bar_width)
            cv2.rectangle(image, (bar_x, bar_y), (bar_x + progress_width, bar_y + bar_height), 
                         (0, 255, 0), -1)
            
            # Texto de la barra
            cv2.putText(image, f"{detection_progress:.1f}s / {self.detection_duration_needed:.1f}s", 
                       (bar_x, bar_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    
    def run(self):
        """Ejecutar demo interactivo"""
        print("🎯 Demo Interactivo - Reconocimiento de Acciones")
        print("=" * 50)
        print("Te guiaré paso a paso por cada acción que puedes hacer.")
        print("Mantén cada posición por 2 segundos para confirmar la detección.")
        print("\nControles:")
        print("'q' - Salir")
        print("'r' - Reiniciar demo")
        print("'n' - Saltar a siguiente acción")
        print("\n🎬 ¡Empecemos!")
        
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("❌ Error: No se pudo abrir la cámara")
            return
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame = cv2.flip(frame, 1)
            height, width, _ = frame.shape
            
            # Procesar con MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.pose.process(rgb_frame)
            
            # Dibujar landmarks
            if results.pose_landmarks:
                self.mp_drawing.draw_landmarks(
                    frame, results.pose_landmarks, self.mp_pose.POSE_CONNECTIONS,
                    self.mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                    self.mp_drawing.DrawingSpec(color=(255, 0, 0), thickness=2)
                )
            
            # Verificar detección de acción actual
            detected = False
            detection_progress = 0.0
            
            if self.current_demo_idx < len(self.actions_demo):
                current_action = self.actions_demo[self.current_demo_idx]
                detected = current_action['detection_func'](results.pose_landmarks, width, height)
                
                if detected:
                    if self.detection_start_time is None:
                        self.detection_start_time = time.time()
                    
                    detection_progress = time.time() - self.detection_start_time
                    
                    if detection_progress >= self.detection_duration_needed:
                        # Acción completada
                        current_action['completed'] = True
                        self.current_demo_idx += 1
                        self.detection_start_time = None
                        print(f"✅ {current_action['name']} completado!")
                else:
                    self.detection_start_time = None
            
            # Dibujar información
            self.draw_demo_info(frame, width, height, detected, detection_progress)
            
            # Mostrar frame
            cv2.imshow('🎯 Demo Interactivo - Reconocimiento de Acciones', frame)
            
            # Manejar teclas
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('r'):
                # Reiniciar demo
                self.current_demo_idx = 0
                self.detection_start_time = None
                for action in self.actions_demo:
                    action['completed'] = False
                print("🔄 Demo reiniciado")
            elif key == ord('n'):
                # Saltar acción
                if self.current_demo_idx < len(self.actions_demo):
                    self.actions_demo[self.current_demo_idx]['completed'] = True
                    self.current_demo_idx += 1
                    self.detection_start_time = None
                    print("⏭️ Acción saltada")
        
        cap.release()
        cv2.destroyAllWindows()

def main():
    demo = InteractiveDemo()
    demo.run()

if __name__ == "__main__":
    main()
