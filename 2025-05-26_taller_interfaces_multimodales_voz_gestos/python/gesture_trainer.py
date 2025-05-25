#!/usr/bin/env python3
"""
🎯 Gesture Trainer - Entrenador de Gestos Personalizados
Módulo adicional para entrenar y guardar gestos personalizados usando MediaPipe.
"""

import cv2
import mediapipe as mp
import numpy as np
import json
import os
from typing import List, Dict, Any
import time

class GestureTrainer:
    """Entrenador de gestos personalizados"""
    
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Almacenamiento de gestos
        self.gesture_database = {}
        self.current_gesture_name = ""
        self.samples = []
        self.recording = False
        
        # Configuraciones
        self.samples_per_gesture = 20
        self.gesture_file = "custom_gestures.json"
        
        # Cargar gestos existentes
        self.load_gestures()
    
    def extract_features(self, hand_landmarks) -> List[float]:
        """Extrae características de un gesto para el entrenamiento"""
        if not hand_landmarks:
            return []
        
        features = []
        landmarks = hand_landmarks.landmark
        
        # Normalizar respecto a la muñeca
        wrist = landmarks[0]
        
        for landmark in landmarks:
            # Posición relativa a la muñeca
            features.append(landmark.x - wrist.x)
            features.append(landmark.y - wrist.y)
            features.append(landmark.z - wrist.z)
        
        return features
    
    def calculate_gesture_similarity(self, features1: List[float], features2: List[float]) -> float:
        """Calcula la similitud entre dos gestos usando distancia euclidiana"""
        if len(features1) != len(features2):
            return 0.0
        
        features1 = np.array(features1)
        features2 = np.array(features2)
        
        # Distancia euclidiana normalizada
        distance = np.linalg.norm(features1 - features2)
        similarity = 1.0 / (1.0 + distance)
        
        return similarity
    
    def start_recording(self, gesture_name: str):
        """Inicia la grabación de un nuevo gesto"""
        self.current_gesture_name = gesture_name
        self.samples = []
        self.recording = True
        print(f"🎯 Iniciando grabación del gesto: {gesture_name}")
        print(f"📝 Necesito {self.samples_per_gesture} muestras")
    
    def stop_recording(self):
        """Detiene la grabación y guarda el gesto"""
        if not self.recording or len(self.samples) == 0:
            return False
        
        # Calcular el gesto promedio
        avg_features = np.mean(self.samples, axis=0).tolist()
        
        # Guardar en la base de datos
        self.gesture_database[self.current_gesture_name] = {
            'features': avg_features,
            'samples': len(self.samples),
            'timestamp': time.time()
        }
        
        self.save_gestures()
        self.recording = False
        
        print(f"✅ Gesto '{self.current_gesture_name}' guardado con {len(self.samples)} muestras")
        return True
    
    def recognize_custom_gesture(self, hand_landmarks) -> str:
        """Reconoce un gesto personalizado"""
        if not hand_landmarks or not self.gesture_database:
            return "unknown"
        
        features = self.extract_features(hand_landmarks)
        if not features:
            return "unknown"
        
        best_match = "unknown"
        best_similarity = 0.0
        threshold = 0.7  # Umbral de similitud
        
        for gesture_name, gesture_data in self.gesture_database.items():
            similarity = self.calculate_gesture_similarity(features, gesture_data['features'])
            
            if similarity > best_similarity and similarity > threshold:
                best_similarity = similarity
                best_match = gesture_name
        
        return best_match if best_similarity > threshold else "unknown"
    
    def train_interactive(self):
        """Modo interactivo de entrenamiento"""
        cap = cv2.VideoCapture(0)
        
        print("🎓 Modo de Entrenamiento Interactivo")
        print("=" * 40)
        print("Controles:")
        print("  'n' + nombre: Nuevo gesto")
        print("  'space': Capturar muestra")
        print("  's': Guardar gesto actual")
        print("  'l': Listar gestos guardados")
        print("  'q': Salir")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.hands.process(rgb_frame)
            
            # Dibujar landmarks
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    self.mp_drawing.draw_landmarks(
                        frame, hand_landmarks, self.mp_hands.HAND_CONNECTIONS
                    )
                    
                    # Si estamos grabando, capturar muestra automáticamente
                    if self.recording and len(self.samples) < self.samples_per_gesture:
                        features = self.extract_features(hand_landmarks)
                        if features:
                            self.samples.append(features)
                            print(f"📸 Muestra {len(self.samples)}/{self.samples_per_gesture}")
                    
                    # Reconocer gesto personalizado
                    if not self.recording:
                        recognized = self.recognize_custom_gesture(hand_landmarks)
                        cv2.putText(frame, f"Gesto: {recognized}", 
                                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            # Información en pantalla
            info_y = 60
            if self.recording:
                cv2.putText(frame, f"Grabando: {self.current_gesture_name}", 
                           (10, info_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                cv2.putText(frame, f"Muestras: {len(self.samples)}/{self.samples_per_gesture}", 
                           (10, info_y + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            cv2.putText(frame, "Presiona 'h' para ayuda", 
                       (10, frame.shape[0] - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            cv2.imshow('Entrenador de Gestos', frame)
            
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('q'):
                break
            elif key == ord('h'):
                self.show_help()
            elif key == ord('n'):
                gesture_name = input("Nombre del nuevo gesto: ")
                self.start_recording(gesture_name)
            elif key == ord(' ') and self.recording:
                # Captura manual (aunque ya se hace automáticamente)
                pass
            elif key == ord('s'):
                if self.recording:
                    self.stop_recording()
            elif key == ord('l'):
                self.list_gestures()
            elif key == ord('d'):
                self.delete_gesture()
        
        cap.release()
        cv2.destroyAllWindows()
    
    def show_help(self):
        """Muestra ayuda"""
        print("\n🎓 Ayuda - Entrenador de Gestos")
        print("=" * 40)
        print("1. Presiona 'n' y escribe el nombre del gesto")
        print("2. Mantén el gesto estable frente a la cámara")
        print("3. El sistema captura automáticamente las muestras")
        print("4. Presiona 's' cuando termine la captura")
        print("5. El gesto se guarda automáticamente")
        print("\nTips:")
        print("- Mantén buena iluminación")
        print("- Haz el gesto de forma consistente")
        print("- Evita movimientos bruscos")
        print("- Usa gestos distintivos\n")
    
    def list_gestures(self):
        """Lista todos los gestos guardados"""
        print("\n📋 Gestos Guardados:")
        print("=" * 30)
        if not self.gesture_database:
            print("No hay gestos guardados")
        else:
            for i, (name, data) in enumerate(self.gesture_database.items(), 1):
                print(f"{i}. {name} ({data['samples']} muestras)")
        print()
    
    def delete_gesture(self):
        """Elimina un gesto"""
        self.list_gestures()
        if not self.gesture_database:
            return
        
        gesture_name = input("Nombre del gesto a eliminar: ")
        if gesture_name in self.gesture_database:
            del self.gesture_database[gesture_name]
            self.save_gestures()
            print(f"✅ Gesto '{gesture_name}' eliminado")
        else:
            print(f"❌ Gesto '{gesture_name}' no encontrado")
    
    def save_gestures(self):
        """Guarda los gestos en un archivo JSON"""
        try:
            with open(self.gesture_file, 'w') as f:
                json.dump(self.gesture_database, f, indent=2)
            print(f"💾 Gestos guardados en {self.gesture_file}")
        except Exception as e:
            print(f"❌ Error guardando gestos: {e}")
    
    def load_gestures(self):
        """Carga los gestos desde un archivo JSON"""
        try:
            if os.path.exists(self.gesture_file):
                with open(self.gesture_file, 'r') as f:
                    self.gesture_database = json.load(f)
                print(f"📂 Gestos cargados desde {self.gesture_file}")
                print(f"   Gestos disponibles: {len(self.gesture_database)}")
        except Exception as e:
            print(f"⚠️  Error cargando gestos: {e}")
            self.gesture_database = {}

def main():
    """Función principal del entrenador"""
    print("🎯 Entrenador de Gestos Personalizados")
    print("=" * 40)
    
    trainer = GestureTrainer()
    
    while True:
        print("\n🎓 Opciones:")
        print("1. Entrenar nuevos gestos (interactivo)")
        print("2. Listar gestos guardados")
        print("3. Eliminar gesto")
        print("4. Probar reconocimiento")
        print("5. Salir")
        
        try:
            choice = input("\nSelecciona una opción: ")
            
            if choice == '1':
                trainer.train_interactive()
            elif choice == '2':
                trainer.list_gestures()
            elif choice == '3':
                trainer.delete_gesture()
            elif choice == '4':
                print("🔍 Modo prueba - Muestra gestos frente a la cámara")
                trainer.train_interactive()  # Reutilizar la interfaz
            elif choice == '5':
                print("👋 ¡Hasta luego!")
                break
            else:
                print("❌ Opción no válida")
                
        except KeyboardInterrupt:
            print("\n👋 ¡Hasta luego!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    main() 