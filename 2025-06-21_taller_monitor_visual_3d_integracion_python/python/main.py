"""
🧪 Taller - Monitor de Actividad Visual 3D
Parte 1: Sistema de Detección Visual con Python

Este script detecta objetos, personas y gestos usando YOLO y MediaPipe,
enviando los datos en tiempo real a la visualización 3D via WebSocket.
"""

import cv2
import numpy as np
import asyncio
import websockets
import json
import time
from ultralytics import YOLO
import mediapipe as mp
from typing import Dict, List, Tuple, Optional
import threading
import queue

class VisualMonitor:
    def __init__(self):
        """Inicializa el monitor visual con todos los detectores optimizado"""
        # Modelos de detección
        self.yolo_model = YOLO('yolov8n.pt')  # Modelo ligero
        
        # MediaPipe para detección de poses y manos (configuración optimizada)
        self.mp_pose = mp.solutions.pose
        self.mp_hands = mp.solutions.hands
        self.mp_face = mp.solutions.face_detection
        
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=0,  # Modelo más ligero
            smooth_landmarks=False,  # Desactivar suavizado para mayor velocidad
            min_detection_confidence=0.7,  # Umbral más alto para menos falsos positivos
            min_tracking_confidence=0.5
        )
        
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.7,  # Umbral más alto
            min_tracking_confidence=0.5
        )
        
        self.face_detection = self.mp_face.FaceDetection(
            model_selection=0,
            min_detection_confidence=0.7  # Umbral más alto
        )
        
        # Configuración de cámara optimizada
        self.cap = cv2.VideoCapture(0)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 320)  # Resolución más baja
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)  # Resolución más baja
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Buffer mínimo para reducir lag
        
        # Cola para datos (tamaño limitado)
        self.data_queue = queue.Queue(maxsize=5)
        
        # Optimización: Contadores de frames para alternar procesamiento
        self.frame_count = 0
        self.yolo_interval = 3      # Ejecutar YOLO cada 3 frames
        self.pose_interval = 2      # Ejecutar pose cada 2 frames  
        self.hands_interval = 2     # Ejecutar hands cada 2 frames
        self.face_interval = 4      # Ejecutar face cada 4 frames
        self.colors_interval = 10   # Ejecutar colores cada 10 frames
        
        # Cache para resultados previos
        self.cached_results = {
            'yolo_data': {'people_count': 0, 'objects_count': 0, 'detections': []},
            'pose_data': {'pose_detected': False, 'landmarks': [], 'visibility_scores': []},
            'hands_data': {'hands_count': 0, 'hands_landmarks': [], 'gestures': []},
            'faces_data': {'faces_count': 0, 'face_positions': []},
            'dominant_colors': [[128, 128, 128], [64, 64, 64], [192, 192, 192]]
        }
        
        # Variables para cálculo de movimiento optimizado
        self.prev_frame = None
        self.movement_history = []
        self.movement_roi = None  # ROI para cálculo de movimiento más eficiente
        
        # WebSocket optimizado
        self.websocket_server = None
        self.connected_clients = set()
        
        # Threading para procesamiento paralelo
        self.processing_threads = []
        self.thread_results = {}
        self.thread_locks = {
            'yolo': threading.Lock(),
            'pose': threading.Lock(),
            'hands': threading.Lock(),
            'faces': threading.Lock()
        }
        
        print("🎯 Monitor Visual OPTIMIZADO inicializado correctamente")
        print("📷 Cámara configurada: 320x240 @ 30fps (optimizada)")
        print("🤖 Modelos cargados: YOLO + MediaPipe (configuración ligera)")
        print("⚡ Procesamiento alternado activado para mayor velocidad")

    def detect_objects_yolo(self, frame: np.ndarray) -> Dict:
        """Detecta objetos usando YOLO"""
        results = self.yolo_model(frame, verbose=False)
        
        people_count = 0
        objects_count = 0
        detections = []
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    
                    if confidence > 0.5:  # Umbral de confianza
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        class_name = self.yolo_model.names[class_id]
                        
                        detection = {
                            'class': class_name,
                            'confidence': confidence,
                            'bbox': [float(x1), float(y1), float(x2), float(y2)],
                            'center': [float((x1 + x2) / 2), float((y1 + y2) / 2)],
                            'area': float((x2 - x1) * (y2 - y1))
                        }
                        detections.append(detection)
                        
                        if class_name == 'person':
                            people_count += 1
                        else:
                            objects_count += 1
        
        return {
            'people_count': people_count,
            'objects_count': objects_count,
            'detections': detections
        }

    def detect_pose_mediapipe(self, frame: np.ndarray) -> Dict:
        """Detecta poses usando MediaPipe"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb_frame)
        
        pose_data = {
            'landmarks': [],
            'visibility_scores': [],
            'pose_detected': False
        }
        
        if results.pose_landmarks:
            pose_data['pose_detected'] = True
            landmarks = []
            visibility_scores = []
            
            for landmark in results.pose_landmarks.landmark:
                landmarks.extend([landmark.x, landmark.y, landmark.z])
                visibility_scores.append(landmark.visibility)
            
            pose_data['landmarks'] = landmarks
            pose_data['visibility_scores'] = visibility_scores
        
        return pose_data

    def detect_hands_mediapipe(self, frame: np.ndarray) -> Dict:
        """Detecta manos usando MediaPipe"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_frame)
        
        hands_data = {
            'hands_count': 0,
            'hands_landmarks': [],
            'gestures': []
        }
        
        if results.multi_hand_landmarks:
            hands_data['hands_count'] = len(results.multi_hand_landmarks)
            
            for hand_landmarks in results.multi_hand_landmarks:
                landmarks = []
                for landmark in hand_landmarks.landmark:
                    landmarks.extend([landmark.x, landmark.y, landmark.z])
                hands_data['hands_landmarks'].append(landmarks)
                
                # Análisis básico de gestos (puño cerrado vs abierto)
                gesture = self.analyze_hand_gesture(hand_landmarks.landmark)
                hands_data['gestures'].append(gesture)
        
        return hands_data

    def analyze_hand_gesture(self, landmarks) -> str:
        """Analiza gestos básicos de la mano"""
        # Puntos clave para análisis de gestos
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]
        
        wrist = landmarks[0]
        
        # Calcular si los dedos están extendidos
        fingers_up = 0
        
        # Pulgar (comparación horizontal)
        if thumb_tip.x > landmarks[3].x:
            fingers_up += 1
            
        # Otros dedos (comparación vertical)
        finger_tips = [8, 12, 16, 20]
        finger_pips = [6, 10, 14, 18]
        
        for tip, pip in zip(finger_tips, finger_pips):
            if landmarks[tip].y < landmarks[pip].y:
                fingers_up += 1
        
        # Clasificar gestos
        if fingers_up == 0:
            return "fist"
        elif fingers_up == 5:
            return "open_hand"
        elif fingers_up == 1:
            return "pointing"
        elif fingers_up == 2:
            return "peace"
        else:
            return "partial"

    def detect_faces_mediapipe(self, frame: np.ndarray) -> Dict:
        """Detecta caras usando MediaPipe"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_detection.process(rgb_frame)
        
        faces_data = {
            'faces_count': 0,
            'face_positions': []
        }
        
        if results.detections:
            faces_data['faces_count'] = len(results.detections)
            
            h, w, _ = frame.shape
            for detection in results.detections:
                bbox = detection.location_data.relative_bounding_box
                x = int(bbox.xmin * w)
                y = int(bbox.ymin * h)
                width = int(bbox.width * w)
                height = int(bbox.height * h)
                
                face_center = [x + width//2, y + height//2]
                faces_data['face_positions'].append({
                    'center': face_center,
                    'bbox': [x, y, x + width, y + height],
                    'confidence': detection.score[0]
                })
        
        return faces_data

    def calculate_movement_intensity_optimized(self, frame: np.ndarray) -> float:
        """Calcula la intensidad del movimiento OPTIMIZADA usando ROI"""
        # Reducir resolución para cálculo más rápido
        small_frame = cv2.resize(frame, (80, 60))
        gray = cv2.cvtColor(small_frame, cv2.COLOR_BGR2GRAY)
        
        if self.prev_frame is not None:
            # Calcular diferencia entre frames
            diff = cv2.absdiff(self.prev_frame, gray)
            
            # Usar ROI central para movimiento (más eficiente)
            h, w = diff.shape
            roi = diff[h//4:3*h//4, w//4:3*w//4]
            
            # Aplicar umbral más agresivo
            _, thresh = cv2.threshold(roi, 30, 255, cv2.THRESH_BINARY)
            
            # Calcular porcentaje de píxeles que cambiaron
            movement_pixels = cv2.countNonZero(thresh)  # Más rápido que np.sum
            total_pixels = roi.shape[0] * roi.shape[1]
            intensity = movement_pixels / total_pixels
            
            # Mantener historial más corto
            self.movement_history.append(intensity)
            if len(self.movement_history) > 5:  # Historial más corto
                self.movement_history.pop(0)
            
            # Promedio suavizado
            smoothed_intensity = np.mean(self.movement_history) if self.movement_history else 0.0
        else:
            smoothed_intensity = 0.0
        
        self.prev_frame = gray.copy()
        return float(smoothed_intensity)

    def calculate_movement_intensity(self, frame: np.ndarray) -> float:
        """Mantener compatibilidad - redirige a versión optimizada"""
        return self.calculate_movement_intensity_optimized(frame)

    def extract_dominant_colors_fast(self, frame: np.ndarray, k: int = 3) -> List[List[int]]:
        """Extrae los colores dominantes ULTRA RÁPIDO"""
        # Frame muy pequeño para máxima velocidad
        tiny_frame = cv2.resize(frame, (50, 50))
        data = tiny_frame.reshape((-1, 3))
        data = np.float32(data)
        
        # K-means con menos iteraciones
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 5, 2.0)
        _, labels, centers = cv2.kmeans(data, k, None, criteria, 3, cv2.KMEANS_RANDOM_CENTERS)
        
        # Convertir a lista de enteros
        dominant_colors = []
        for center in centers:
            color = [int(center[2]), int(center[1]), int(center[0])]  # BGR a RGB
            dominant_colors.append(color)
        
        return dominant_colors

    def extract_dominant_colors(self, frame: np.ndarray, k: int = 3) -> List[List[int]]:
        """Mantener compatibilidad - versión original"""
        # Redimensionar para acelerar el procesamiento
        small_frame = cv2.resize(frame, (150, 150))
        data = small_frame.reshape((-1, 3))
        data = np.float32(data)
        
        # K-means clustering
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
        _, labels, centers = cv2.kmeans(data, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        # Convertir a lista de enteros
        dominant_colors = []
        for center in centers:
            color = [int(center[2]), int(center[1]), int(center[0])]  # BGR a RGB
            dominant_colors.append(color)
        
        return dominant_colors

    def process_frame_threaded(self, frame: np.ndarray, detection_type: str):
        """Procesa un tipo específico de detección en paralelo"""
        try:
            if detection_type == 'yolo':
                with self.thread_locks['yolo']:
                    self.thread_results['yolo'] = self.detect_objects_yolo(frame)
            elif detection_type == 'pose':
                with self.thread_locks['pose']:
                    self.thread_results['pose'] = self.detect_pose_mediapipe(frame)
            elif detection_type == 'hands':
                with self.thread_locks['hands']:
                    self.thread_results['hands'] = self.detect_hands_mediapipe(frame)
            elif detection_type == 'faces':
                with self.thread_locks['faces']:
                    self.thread_results['faces'] = self.detect_faces_mediapipe(frame)
        except Exception as e:
            print(f"❌ Error en thread {detection_type}: {e}")

    def process_frame(self, frame: np.ndarray) -> Dict:
        """Procesa un frame completo OPTIMIZADO con threading y alternancia"""
        timestamp = time.time()
        self.frame_count += 1
        
        # Lista de threads activos
        active_threads = []
        
        # Ejecutar detecciones según intervalos (procesamiento alternado)
        if self.frame_count % self.yolo_interval == 0:
            thread = threading.Thread(target=self.process_frame_threaded, args=(frame, 'yolo'))
            thread.start()
            active_threads.append(thread)
        
        if self.frame_count % self.pose_interval == 0:
            thread = threading.Thread(target=self.process_frame_threaded, args=(frame, 'pose'))
            thread.start()
            active_threads.append(thread)
        
        if self.frame_count % self.hands_interval == 0:
            thread = threading.Thread(target=self.process_frame_threaded, args=(frame, 'hands'))
            thread.start()
            active_threads.append(thread)
        
        if self.frame_count % self.face_interval == 0:
            thread = threading.Thread(target=self.process_frame_threaded, args=(frame, 'faces'))
            thread.start()
            active_threads.append(thread)
        
        # Cálculo de movimiento (siempre, es rápido)
        movement_intensity = self.calculate_movement_intensity_optimized(frame)
        
        # Colores dominantes (menos frecuente)
        if self.frame_count % self.colors_interval == 0:
            dominant_colors = self.extract_dominant_colors_fast(frame)
            self.cached_results['dominant_colors'] = dominant_colors
        else:
            dominant_colors = self.cached_results['dominant_colors']
        
        # Esperar a que terminen los threads activos (con timeout)
        for thread in active_threads:
            thread.join(timeout=0.02)  # Timeout de 20ms máximo
        
        # Actualizar cache con nuevos resultados
        if 'yolo' in self.thread_results:
            self.cached_results['yolo_data'] = self.thread_results['yolo']
        if 'pose' in self.thread_results:
            self.cached_results['pose_data'] = self.thread_results['pose']
        if 'hands' in self.thread_results:
            self.cached_results['hands_data'] = self.thread_results['hands']
        if 'faces' in self.thread_results:
            self.cached_results['faces_data'] = self.thread_results['faces']
        
        # Compilar datos usando cache
        processed_data = {
            'timestamp': timestamp,
            'people_count': self.cached_results['yolo_data']['people_count'],
            'objects_count': self.cached_results['yolo_data']['objects_count'],
            'detections': self.cached_results['yolo_data']['detections'],
            'pose_detected': self.cached_results['pose_data']['pose_detected'],
            'pose_landmarks': self.cached_results['pose_data']['landmarks'],
            'hands_count': self.cached_results['hands_data']['hands_count'],
            'hand_gestures': self.cached_results['hands_data']['gestures'],
            'faces_count': self.cached_results['faces_data']['faces_count'],
            'face_positions': self.cached_results['faces_data']['face_positions'],
            'movement_intensity': movement_intensity,
            'dominant_colors': dominant_colors,
            'frame_size': [frame.shape[1], frame.shape[0]]
        }
        
        return processed_data

    async def websocket_handler(self, websocket):
        """Maneja conexiones WebSocket correctamente"""
        print(f"🔌 Nueva conexión WebSocket desde {websocket.remote_address}")
        self.connected_clients.add(websocket)
        
        try:
            # Enviar mensaje de bienvenida
            welcome_msg = json.dumps({
                "type": "connection",
                "status": "connected",
                "message": "Conectado al monitor visual"
            })
            await websocket.send(welcome_msg)
            
            # Mantener la conexión viva
            async for message in websocket:
                # Procesar mensajes del cliente si es necesario
                try:
                    data = json.loads(message)
                    print(f"📨 Mensaje del cliente: {data}")
                except json.JSONDecodeError:
                    pass
                    
        except websockets.exceptions.ConnectionClosed:
            print(f"🔌 Cliente desconectado: {websocket.remote_address}")
        except Exception as e:
            print(f"⚠️  Error en conexión WebSocket: {e}")
        finally:
            if websocket in self.connected_clients:
                self.connected_clients.remove(websocket)
            print(f"❌ Conexión cerrada: {websocket.remote_address}")

    async def broadcast_data(self, data: Dict):
        """Envía datos a todos los clientes conectados"""
        if self.connected_clients:
            # Crear mensaje JSON
            message = json.dumps(data, default=str)
            
            # Enviar a todos los clientes
            disconnected = []
            for client in list(self.connected_clients):  # Crear copia de la lista
                try:
                    await client.send(message)
                except websockets.exceptions.ConnectionClosed:
                    disconnected.append(client)
                except Exception as e:
                    print(f"⚠️  Error enviando a cliente: {e}")
                    disconnected.append(client)
            
            # Limpiar conexiones cerradas
            for client in disconnected:
                self.connected_clients.discard(client)

    def camera_thread(self):
        """Hilo principal OPTIMIZADO de captura y procesamiento de cámara"""
        print("📹 Iniciando captura de cámara optimizada...")
        
        skip_display = 0  # Contador para saltar frames de visualización
        
        while True:
            ret, frame = self.cap.read()
            if not ret:
                print("❌ Error al capturar frame")
                continue
            
            # Procesar frame
            try:
                processed_data = self.process_frame(frame)
                
                # Añadir a cola para WebSocket (con manejo de overflow)
                if self.data_queue.full():
                    try:
                        self.data_queue.get_nowait()  # Remover dato viejo
                    except queue.Empty:
                        pass
                
                try:
                    self.data_queue.put_nowait(processed_data)
                except queue.Full:
                    pass  # Ignorar si está llena
                
                # Mostrar frame con anotaciones menos frecuente (cada 3 frames)
                skip_display += 1
                if skip_display % 3 == 0:
                    display_frame = frame.copy()  # Copia para no bloquear
                    self.draw_annotations_fast(display_frame, processed_data)
                    cv2.imshow('Monitor Visual OPTIMIZADO - Q para salir', display_frame)
                
                # Check for quit key (non-blocking)
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q') or key == 27:  # Q o ESC
                    break
                    
            except Exception as e:
                print(f"❌ Error procesando frame: {e}")
                continue
        
        self.cap.release()
        cv2.destroyAllWindows()
        print("📹 Cámara detenida correctamente")

    def draw_annotations_fast(self, frame: np.ndarray, data: Dict):
        """Dibuja anotaciones OPTIMIZADAS para visualización rápida"""
        # Solo dibujar detecciones importantes (personas)
        person_count = 0
        for detection in data['detections']:
            if detection['class'] == 'person' and detection['confidence'] > 0.7:
                x1, y1, x2, y2 = [int(coord) for coord in detection['bbox']]
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                person_count += 1
        
        # Información compacta y esencial
        info_text = [
            f"P:{data['people_count']} O:{data['objects_count']} M:{data['hands_count']} F:{data['faces_count']}",
            f"Mov:{data['movement_intensity']:.2f} FPS:{self.frame_count % 30}",
            f"Gestos: {', '.join(data['hand_gestures'][:2]) if data['hand_gestures'] else 'N/A'}"  # Solo primeros 2
        ]
        
        # Dibujar con fuente más pequeña y menos texto
        for i, text in enumerate(info_text):
            cv2.putText(frame, text, (10, 25 + i*20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
        
        # Indicador de estado visual
        status_color = (0, 255, 0) if person_count > 0 else (0, 0, 255)
        cv2.circle(frame, (frame.shape[1] - 30, 30), 10, status_color, -1)

    def draw_annotations(self, frame: np.ndarray, data: Dict):
        """Dibuja anotaciones COMPLETAS en el frame para visualización"""
        # Dibujar detecciones YOLO
        for detection in data['detections']:
            x1, y1, x2, y2 = [int(coord) for coord in detection['bbox']]
            label = f"{detection['class']}: {detection['confidence']:.2f}"
            
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, label, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Información general
        info_text = [
            f"Personas: {data['people_count']}",
            f"Objetos: {data['objects_count']}",
            f"Manos: {data['hands_count']}",
            f"Caras: {data['faces_count']}",
            f"Movimiento: {data['movement_intensity']:.3f}",
            f"Gestos: {', '.join(data['hand_gestures']) if data['hand_gestures'] else 'Ninguno'}"
        ]
        
        for i, text in enumerate(info_text):
            cv2.putText(frame, text, (10, 30 + i*25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    async def websocket_sender(self):
        """Hilo OPTIMIZADO para envío de datos via WebSocket"""
        last_send_time = 0
        min_interval = 0.050  # Máximo 20 FPS para WebSocket (menos carga de red)
        last_data = None  # Guardar último dato enviado
        
        # Datos por defecto para enviar mientras no hay datos reales
        default_data = {
            'timestamp': time.time(),
            'people_count': 0,
            'objects_count': 0,
            'hands_count': 0,
            'faces_count': 0,
            'movement_intensity': 0.0,
            'hand_gestures': [],
            'frame_size': [320, 240],
            'detections': [],
            'dominant_colors': [[128, 128, 128], [64, 64, 64]],
            'pose_landmarks': []
        }
        
        while True:
            try:
                current_time = time.time()
                
                # Controlar frecuencia de envío
                if current_time - last_send_time >= min_interval:
                    # Obtener el dato más reciente (descartar intermedios)
                    latest_data = None
                    while not self.data_queue.empty():
                        try:
                            latest_data = self.data_queue.get_nowait()
                        except queue.Empty:
                            break
                    
                    # Si hay nuevos datos, usarlos. Si no, usar los últimos o default
                    if latest_data:
                        last_data = latest_data
                        data_to_send = latest_data
                    elif last_data:
                        # Actualizar timestamp del último dato
                        last_data['timestamp'] = current_time
                        data_to_send = last_data
                    else:
                        # Usar datos por defecto con timestamp actual
                        default_data['timestamp'] = current_time
                        data_to_send = default_data
                    
                    # Siempre enviar si hay clientes conectados
                    if self.connected_clients:
                        compressed_data = self.compress_data_for_websocket(data_to_send)
                        await self.broadcast_data(compressed_data)
                        last_send_time = current_time
                        
                await asyncio.sleep(0.010)  # Check más frecuente pero envío controlado
                
            except Exception as e:
                print(f"❌ Error enviando datos: {e}")
                import traceback
                traceback.print_exc()
                await asyncio.sleep(0.5)

    def compress_data_for_websocket(self, data: Dict) -> Dict:
        """Comprime los datos para envío más eficiente por WebSocket"""
        # Solo enviar datos esenciales, reducir precision de floats
        compressed = {
            'timestamp': data.get('timestamp', time.time()),
            'people_count': data.get('people_count', 0),
            'objects_count': data.get('objects_count', 0),
            'hands_count': data.get('hands_count', 0),
            'faces_count': data.get('faces_count', 0),
            'movement_intensity': round(data.get('movement_intensity', 0.0), 3),
            'hand_gestures': data.get('hand_gestures', [])[:2],  # Solo primeros 2 gestos, con fallback
            'frame_size': data.get('frame_size', [320, 240]),
            'pose_detected': data.get('pose_detected', False)  # Añadir campo que faltaba
        }
        
        # Solo incluir detecciones de personas (más relevantes)
        detections = data.get('detections', [])
        person_detections = [
            {
                'class': det['class'],
                'confidence': round(det['confidence'], 2),
                'center': [round(det['center'][0]), round(det['center'][1])]
            }
            for det in detections 
            if det.get('class') == 'person' and det.get('confidence', 0) > 0.6
        ]
        compressed['detections'] = person_detections
        
        # Colores dominantes simplificados
        dominant_colors = data.get('dominant_colors', [[128, 128, 128], [64, 64, 64]])
        compressed['dominant_colors'] = dominant_colors[:2]  # Solo 2 colores principales
        
        # Landmarks reducidos (solo si hay pose detectada)
        pose_detected = data.get('pose_detected', False)
        pose_landmarks = data.get('pose_landmarks', [])
        
        if pose_detected and pose_landmarks:
            # Solo puntos clave importantes (cada 3er landmark)
            reduced_landmarks = pose_landmarks[::9]  # Cada 3er punto * 3 coordenadas
            compressed['pose_landmarks'] = [round(x, 2) for x in reduced_landmarks[:15]]  # Max 15 valores
        else:
            compressed['pose_landmarks'] = []
        
        return compressed

    async def start_websocket_server(self):
        """Inicia el servidor WebSocket"""
        print("🌐 Iniciando servidor WebSocket en ws://localhost:8765")
        
        server = await websockets.serve(
            self.websocket_handler,
            "localhost",
            8765,
            ping_interval=20,
            ping_timeout=10
        )
        
        print("✅ Servidor WebSocket activo")
        return server

    def run(self):
        """Ejecuta el monitor visual completo"""
        print("🚀 Iniciando Monitor de Actividad Visual 3D")
        print("=" * 50)
        
        # Iniciar hilo de cámara
        camera_thread = threading.Thread(target=self.camera_thread, daemon=True)
        camera_thread.start()
        print("📷 Hilo de cámara iniciado")
        
        # Ejecutar servidor WebSocket y sender
        async def main():
            # Iniciar servidor
            server = await self.start_websocket_server()
            
            # Crear tarea para el sender
            sender_task = asyncio.create_task(self.websocket_sender())
            
            # Mantener ambos corriendo
            try:
                await asyncio.Future()  # Esperar indefinidamente
            except:
                sender_task.cancel()
                server.close()
                await server.wait_closed()
        
        try:
            asyncio.run(main())
        except KeyboardInterrupt:
            print("\n🛑 Deteniendo monitor...")
        except Exception as e:
            print(f"❌ Error en el servidor: {e}")
            import traceback
            traceback.print_exc()
        finally:
            if self.cap.isOpened():
                self.cap.release()
            cv2.destroyAllWindows()
            print("✅ Monitor detenido correctamente")

if __name__ == "__main__":
    monitor = VisualMonitor()
    monitor.run()
