import cv2
import mediapipe as mp
import numpy as np
import math
import random

class GestureDetector:
    def __init__(self):
        # Inicializar MediaPipe
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
          # Variables para efectos visuales
        self.background_color = (0, 0, 0)  # Negro inicial
        self.particle_pos = [320, 240]  # Posición inicial del objeto
        self.particles = []  # Para efectos de partículas
        self.scene_mode = 0  # 0: Normal, 1: Juego, 2: Arte
        self.score = 0
        self.targets = []
        self.show_distances = True  # Mostrar distancias por defecto
        self.debug_console = False  # Debug en consola
        
        # Variables para modo arte
        self.canvas = None  # Lienzo para dibujar
        self.prev_drawing_pos = None  # Posición anterior para líneas
        self.is_drawing = False
        
        # Colores predefinidos
        self.colors = [
            (255, 0, 0),    # Rojo
            (0, 255, 0),    # Verde
            (0, 0, 255),    # Azul
            (255, 255, 0),  # Amarillo
            (255, 0, 255),  # Magenta
            (0, 255, 255),  # Cian
            (128, 0, 128),  # Púrpura
            (255, 165, 0),  # Naranja
        ]
        
        self.init_game()
    
    def init_game(self):
        """Inicializar elementos del juego"""
        self.targets = []
        for _ in range(5):
            target = {
                'pos': [random.randint(50, 590), random.randint(50, 430)],
                'color': random.choice(self.colors),
                'radius': random.randint(20, 40)
            }
            self.targets.append(target)
    
    def count_fingers(self, landmarks):
        """Contar dedos extendidos"""
        # Puntos de referencia para las puntas de los dedos
        finger_tips = [4, 8, 12, 16, 20]  # Pulgar, índice, medio, anular, meñique
        finger_mcp = [3, 6, 10, 14, 18]   # Articulaciones base
        
        fingers_up = []
        
        # Pulgar (comparar x en lugar de y)
        if landmarks[finger_tips[0]].x > landmarks[finger_tips[0] - 1].x:
            fingers_up.append(1)
        else:
            fingers_up.append(0)
        
        # Otros dedos (comparar y)
        for i in range(1, 5):
            if landmarks[finger_tips[i]].y < landmarks[finger_mcp[i]].y:
                fingers_up.append(1)
            else:
                fingers_up.append(0)
        
        return sum(fingers_up), fingers_up
    
    def calculate_distance(self, point1, point2):
        """Calcular distancia entre dos puntos"""
        return math.sqrt((point1.x - point2.x)**2 + (point1.y - point2.y)**2)
    
    def calculate_finger_distances(self, landmarks):
        """
        Calcular distancias entre diferentes combinaciones de dedos
        Retorna un diccionario con todas las distancias relevantes
        """
        # Puntos de referencia para las puntas de los dedos
        finger_tips = {
            'thumb': landmarks[4],      # Pulgar
            'index': landmarks[8],      # Índice
            'middle': landmarks[12],    # Medio
            'ring': landmarks[16],      # Anular
            'pinky': landmarks[20]      # Meñique
        }
        
        # Puntos de referencia para las articulaciones base
        finger_bases = {
            'thumb': landmarks[3],      # Base del pulgar
            'index': landmarks[6],      # Base del índice
            'middle': landmarks[10],    # Base del medio
            'ring': landmarks[14],      # Base del anular
            'pinky': landmarks[18]      # Base del meñique
        }
        
        # Centro de la palma (aproximado)
        palm_center = landmarks[9]  # Centro de la mano
        
        distances = {}
        
        # Distancias entre puntas de dedos
        finger_names = list(finger_tips.keys())
        for i, finger1 in enumerate(finger_names):
            for finger2 in finger_names[i+1:]:
                key = f"{finger1}_{finger2}_tips"
                distances[key] = self.calculate_distance(
                    finger_tips[finger1], finger_tips[finger2]
                )
        
        # Distancias desde cada dedo al centro de la palma
        for finger in finger_names:
            key = f"{finger}_to_palm"
            distances[key] = self.calculate_distance(
                finger_tips[finger], palm_center
            )
        
        # Distancias desde puntas a bases (longitud de dedos)
        for finger in finger_names:
            key = f"{finger}_length"
            distances[key] = self.calculate_distance(
                finger_tips[finger], finger_bases[finger]
            )
        
        # Algunas distancias específicas útiles para gestos
        distances['pinch_distance'] = distances['thumb_index_tips']  # Pellizco
        distances['grip_width'] = distances['thumb_pinky_tips']      # Ancho de agarre
        distances['pointer_spread'] = distances['index_middle_tips'] # Separación señalador
        
        return distances
    
    def detect_gestures(self, landmarks):
        """Detectar gestos específicos"""
        finger_count, fingers_up = self.count_fingers(landmarks)
        
        # Calcular todas las distancias entre dedos
        finger_distances = self.calculate_finger_distances(landmarks)
        
        # Distancia entre índice y pulgar (para compatibilidad)
        thumb_index_distance = finger_distances['thumb_index_tips']
        
        gestures = {
            'finger_count': finger_count,
            'fingers_up': fingers_up,
            'thumb_index_distance': thumb_index_distance,
            'finger_distances': finger_distances,  # Todas las distancias
            'palm_open': finger_count == 5,
            'fist': finger_count == 0,
            'peace': fingers_up == [0, 1, 1, 0, 0],
            'pointing': fingers_up == [0, 1, 0, 0, 0],
            'thumbs_up': fingers_up == [1, 0, 0, 0, 0],
            'ok_sign': thumb_index_distance < 0.05 and fingers_up[2:] == [1, 1, 1],
            'pinch': finger_distances['pinch_distance'] < 0.05,  # Gesto de pellizco
            'wide_grip': finger_distances['grip_width'] > 0.15,  # Agarre amplio
            'fingers_spread': finger_distances['pointer_spread'] > 0.08  # Dedos separados
        }
        
        return gestures
    
    def create_particle_effect(self, center_pos):
        """Crear efecto de partículas"""
        for _ in range(10):
            particle = {
                'pos': [center_pos[0], center_pos[1]],
                'vel': [random.randint(-5, 5), random.randint(-5, 5)],
                'life': 30,
                'color': random.choice(self.colors)
            }
            self.particles.append(particle)
    
    def update_particles(self, frame):
        """Actualizar y dibujar partículas"""
        for particle in self.particles[:]:
            # Actualizar posición
            particle['pos'][0] += particle['vel'][0]
            particle['pos'][1] += particle['vel'][1]
            particle['life'] -= 1
            
            # Dibujar partícula
            if particle['life'] > 0:
                alpha = particle['life'] / 30.0
                radius = int(5 * alpha)
                if radius > 0:
                    cv2.circle(frame, tuple(map(int, particle['pos'])), 
                             radius, particle['color'], -1)
            else:
                self.particles.remove(particle)
    
    def process_normal_mode(self, frame, gestures, hand_landmarks):
        """Modo normal: cambios de color y movimiento de objeto"""
        # Cambiar color de fondo según número de dedos
        if gestures['finger_count'] <= len(self.colors) - 1:
            self.background_color = self.colors[gestures['finger_count']]
        
        # Mover objeto con el índice
        if gestures['pointing']:
            index_tip = hand_landmarks.landmark[8]
            self.particle_pos[0] = int(index_tip.x * frame.shape[1])
            self.particle_pos[1] = int(index_tip.y * frame.shape[0])
        
        # Crear partículas con OK sign
        if gestures['ok_sign']:
            self.create_particle_effect(self.particle_pos)
        
        # Aplicar color de fondo
        overlay = np.zeros_like(frame)
        overlay[:] = self.background_color
        frame = cv2.addWeighted(frame, 0.7, overlay, 0.3, 0)
        
        # Dibujar objeto principal
        cv2.circle(frame, tuple(self.particle_pos), 30, (255, 255, 255), -1)
        cv2.circle(frame, tuple(self.particle_pos), 30, (0, 0, 0), 2)
        
        return frame
    
    def process_game_mode(self, frame, gestures, hand_landmarks):
        """Modo juego: atrapar objetivos con la mano"""
        # Posición de la mano
        if hand_landmarks:
            index_tip = hand_landmarks.landmark[8]
            hand_pos = [int(index_tip.x * frame.shape[1]), 
                       int(index_tip.y * frame.shape[0])]
            
            # Verificar colisiones con objetivos
            for target in self.targets[:]:
                distance = math.sqrt((hand_pos[0] - target['pos'][0])**2 + 
                                   (hand_pos[1] - target['pos'][1])**2)
                
                if distance < target['radius'] + 20:  # Colisión
                    self.targets.remove(target)
                    self.score += 10
                    self.create_particle_effect(target['pos'])
            
            # Regenerar objetivos si se acabaron
            if len(self.targets) == 0:
                self.init_game()
            
            # Dibujar cursor de mano
            cv2.circle(frame, tuple(hand_pos), 20, (0, 255, 0), -1)
        
        # Dibujar objetivos
        for target in self.targets:
            cv2.circle(frame, tuple(target['pos']), target['radius'], 
                      target['color'], -1)
            cv2.circle(frame, tuple(target['pos']), target['radius'], 
                      (0, 0, 0), 2)
        
        # Mostrar puntaje
        cv2.putText(frame, f'Score: {self.score}', (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        return frame
    def process_art_mode(self, frame, gestures, hand_landmarks):
        """Modo arte: dibujo libre con líneas continuas"""
        h, w = frame.shape[:2]
        
        # Inicializar canvas si no existe
        if self.canvas is None:
            self.canvas = np.zeros((h, w, 3), dtype=np.uint8)
        
        if hand_landmarks:
            index_tip = hand_landmarks.landmark[8]
            current_pos = [int(index_tip.x * w), int(index_tip.y * h)]
            
            # Elegir color según distancia entre dedos
            color_index = min(int(gestures['thumb_index_distance'] * 50), 
                            len(self.colors) - 1)
            color = self.colors[color_index]
            
            # Determinar grosor del pincel según el ancho del agarre
            grip_width = gestures['finger_distances']['grip_width']
            brush_size = max(2, min(20, int(grip_width * 100)))
            
            if gestures['pointing']:
                # Si estamos dibujando y tenemos posición anterior, dibujar línea
                if self.is_drawing and self.prev_drawing_pos is not None:
                    cv2.line(self.canvas, tuple(self.prev_drawing_pos), 
                           tuple(current_pos), color, brush_size)
                else:
                    # Primer punto, dibujar círculo
                    cv2.circle(self.canvas, tuple(current_pos), brush_size//2, color, -1)
                
                self.prev_drawing_pos = current_pos
                self.is_drawing = True
                
                # Mostrar cursor de dibujo en tiempo real
                cv2.circle(frame, tuple(current_pos), brush_size + 5, color, 2)
                cv2.circle(frame, tuple(current_pos), 5, color, -1)
                
            else:
                # No estamos señalando, parar de dibujar
                self.is_drawing = False
                self.prev_drawing_pos = None
            
            # Mostrar color actual y grosor
            cv2.rectangle(frame, (10, 10), (60, 60), color, -1)
            cv2.rectangle(frame, (10, 10), (60, 60), (255, 255, 255), 2)
            cv2.putText(frame, 'Color', (70, 40), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.5, (255, 255, 255), 1)
            
            # Mostrar grosor del pincel
            cv2.putText(frame, f'Grosor: {brush_size}', (70, 25), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
            
            # Mostrar distancias importantes
            distances = gestures['finger_distances']
            cv2.putText(frame, f'Pellizco: {distances["pinch_distance"]:.3f}', 
                       (10, h - 50), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
            cv2.putText(frame, f'Agarre: {distances["grip_width"]:.3f}', 
                       (10, h - 35), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
        # Combinar canvas con frame
        frame = cv2.addWeighted(frame, 0.7, self.canvas, 0.8, 0)
        
        # Instrucciones en pantalla
        cv2.putText(frame, 'Indice: Dibujar | Pulgar-Indice: Color | Agarre: Grosor', 
                   (10, h - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        return frame
    
    def display_all_distances(self, frame, gestures):
        """Mostrar todas las distancias calculadas en pantalla"""
        if not gestures or 'finger_distances' not in gestures:
            return frame
        
        distances = gestures['finger_distances']
        h, w = frame.shape[:2]
        
        # Lista de distancias importantes a mostrar
        display_distances = [
            ('Pulgar-Indice', 'thumb_index_tips'),
            ('Indice-Medio', 'index_middle_tips'),
            ('Medio-Anular', 'middle_ring_tips'),
            ('Anular-Menique', 'ring_pinky_tips'),
            ('Pulgar-Menique', 'thumb_pinky_tips'),
            ('Pellizco', 'pinch_distance'),
            ('Agarre Total', 'grip_width'),
            ('Separacion', 'pointer_spread'),
        ]
        
        # Fondo semitransparente para mejor legibilidad
        overlay = np.zeros((h, w, 3), dtype=np.uint8)
        cv2.rectangle(overlay, (w - 280, 10), (w - 10, 250), (0, 0, 0), -1)
        frame = cv2.addWeighted(frame, 0.8, overlay, 0.4, 0)
        
        # Título
        cv2.putText(frame, 'DISTANCIAS ENTRE DEDOS', (w - 270, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        cv2.line(frame, (w - 270, 35), (w - 20, 35), (255, 255, 255), 1)
        
        # Mostrar distancias en la esquina derecha
        start_y = 50
        for i, (name, key) in enumerate(display_distances):
            if key in distances:
                value = distances[key]
                # Cambiar color según el valor (verde = cerca, rojo = lejos)
                if value < 0.05:
                    color = (0, 255, 0)  # Verde - muy cerca
                elif value < 0.1:
                    color = (0, 255, 255)  # Amarillo - cerca
                elif value < 0.15:
                    color = (0, 165, 255)  # Naranja - medio
                else:
                    color = (0, 0, 255)  # Rojo - lejos
                
                text = f'{name}: {value:.3f}'
                cv2.putText(frame, text, (w - 270, start_y + i * 25), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)
        
        return frame
    
    def display_distance_debug(self, gestures):
        """Imprimir distancias en consola para debug"""
        if not gestures or 'finger_distances' not in gestures:
            return
        
        distances = gestures['finger_distances']
        print("\n=== DISTANCIAS ENTRE DEDOS ===")
        for key, value in distances.items():
            print(f"{key}: {value:.3f}")
        print("=" * 30)
    
    def run(self):
        """Función principal"""
        cap = cv2.VideoCapture(0)
        
        # Configurar ventana
        cv2.namedWindow('Taller MediaPipe - Gestos', cv2.WINDOW_AUTOSIZE)
        print("🎮 CONTROLES:")
        print("- Espacio: Cambiar modo (Normal/Juego/Arte)")
        print("- ESC: Salir")
        print("- R: Reiniciar juego")
        print("- C: Limpiar canvas (solo en modo Arte)")
        print("- D: Activar/desactivar visualización de distancias")
        print("- F: Activar/desactivar debug en consola")
        print("\n🖐️ GESTOS:")
        print("- Dedos extendidos: Cambiar color de fondo")
        print("- Dedo índice: Mover cursor/dibujar líneas")
        print("- OK (pulgar-índice): Crear partículas")
        print("- Palma abierta: Cambiar escena")
        print("\n🎨 MODO ARTE:")
        print("- Señalar con índice: Dibujar líneas continuas")
        print("- Juntar/separar pulgar-índice: Cambiar color")
        print("- Dejar de señalar: Parar de dibujar")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Voltear horizontalmente para efecto espejo
            frame = cv2.flip(frame, 1)
            h, w, c = frame.shape
            
            # Convertir BGR a RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.hands.process(rgb_frame)
            
            # Procesar detecciones
            gestures = None
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    # Dibujar landmarks
                    self.mp_drawing.draw_landmarks(
                        frame, hand_landmarks, self.mp_hands.HAND_CONNECTIONS)
                    
                    # Detectar gestos
                    gestures = self.detect_gestures(hand_landmarks.landmark)
                    
                    # Procesar según el modo actual
                    if self.scene_mode == 0:  # Modo normal
                        frame = self.process_normal_mode(frame, gestures, hand_landmarks)
                    elif self.scene_mode == 1:  # Modo juego
                        frame = self.process_game_mode(frame, gestures, hand_landmarks)
                    elif self.scene_mode == 2:  # Modo arte
                        frame = self.process_art_mode(frame, gestures, hand_landmarks)
                    
                    # Cambiar escena con palma abierta
                    if gestures['palm_open']:
                        # Evitar cambios muy rápidos
                        pass
              # Actualizar partículas
            self.update_particles(frame)
              # Mostrar todas las distancias en tiempo real
            if gestures and self.show_distances:
                frame = self.display_all_distances(frame, gestures)
                
                # Debug en consola si está activado
                if self.debug_console:
                    self.display_distance_debug(gestures)
            
            # Mostrar información en pantalla
            mode_names = ['Normal', 'Juego', 'Arte']
            cv2.putText(frame, f'Modo: {mode_names[self.scene_mode]}', 
                       (10, h - 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            if gestures:
                cv2.putText(frame, f'Dedos: {gestures["finger_count"]}', 
                           (10, h - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                  # Mostrar gestos detectados
                gesture_text = []
                if gestures['thumbs_up']:
                    gesture_text.append('👍')
                if gestures['peace']:
                    gesture_text.append('✌️')
                if gestures['ok_sign']:
                    gesture_text.append('👌')
                if gestures['fist']:
                    gesture_text.append('✊')
                if gestures['pinch']:
                    gesture_text.append('🤏')
                if gestures['wide_grip']:
                    gesture_text.append('🖐️')
                
                if gesture_text:
                    cv2.putText(frame, ' '.join(gesture_text), 
                               (w - 200, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            # Mostrar frame
            cv2.imshow('Taller MediaPipe - Gestos', frame)
            
            # Controles de teclado
            key = cv2.waitKey(1) & 0xFF
            if key == 27:  # ESC
                break
            elif key == ord(' '):  # Espacebar
                self.scene_mode = (self.scene_mode + 1) % 3
                if self.scene_mode == 1:  # Al entrar al modo juego
                    self.init_game()
                    self.score = 0
                elif self.scene_mode == 2:  # Al entrar al modo arte
                    self.canvas = None  # Limpiar canvas
                    self.prev_drawing_pos = None
                    self.is_drawing = False
            elif key == ord('r'):  # R
                self.init_game()
                self.score = 0
                self.particles.clear()            
            elif key == ord('c') and self.scene_mode == 2:  # C - Limpiar canvas en modo arte
                self.canvas = None
                self.prev_drawing_pos = None
                self.is_drawing = False
            elif key == ord('d'):  # D - Activar/desactivar visualización de distancias
                self.show_distances = not self.show_distances
                print(f"📊 Visualización de distancias: {'ACTIVADA' if self.show_distances else 'DESACTIVADA'}")
            elif key == ord('f'):  # F - Activar/desactivar debug en consola
                self.debug_console = not self.debug_console
                print(f"🐛 Debug en consola: {'ACTIVADO' if self.debug_console else 'DESACTIVADO'}")
        
        cap.release()
        cv2.destroyAllWindows()

# Función principal para ejecutar el taller
def main():
    """
    TALLER MEDIAPIPE - DETECCIÓN DE GESTOS
    =====================================
    
    Este programa demuestra cómo usar MediaPipe para:
    1. Detectar manos en tiempo real
    2. Contar dedos extendidos
    3. Medir distancias entre dedos
    4. Crear acciones visuales basadas en gestos
    5. Implementar diferentes modos interactivos
    
    PREREQUISITOS:
    pip install mediapipe opencv-python numpy
    
    FUNCIONALIDADES:
    - Modo Normal: Cambio de colores y movimiento de objetos
    - Modo Juego: Atrapar objetivos con la mano
    - Modo Arte: Dibujo libre con gestos
    """
    
    print("🚀 Iniciando Taller MediaPipe...")
    print("📋 Verificando dependencias...")
    
    try:
        detector = GestureDetector()
        detector.run()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Asegúrate de tener instaladas las librerías:")
        print("   pip install mediapipe opencv-python numpy")

if __name__ == "__main__":
    main()