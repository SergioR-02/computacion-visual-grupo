"""
API Server para clasificación de imágenes de basura
Expone la funcionalidad de PhotoClassifier a través de endpoints HTTP y WebSockets
Incluye integración con ChatGPT para consejos sobre reciclaje
NUEVA: Integración con YOLO para detección de objetos
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import cv2
import numpy as np
import io
import base64
from PIL import Image
import os
import sys
import threading
import time
import uuid
import torch
from collections import defaultdict

# Agregar el directorio actual al path para importar PhotoClassifier
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from photo_classifier import PhotoClassifier
from chatgpt_adviser import ChatGPTAdviser

# Importaciones para YOLO
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
    print("✅ YOLO disponible")
except ImportError:
    YOLO_AVAILABLE = False
    print("⚠️ YOLO no disponible - instala ultralytics")

app = Flask(__name__)
CORS(app, origins="*")  # Permitir requests desde el frontend
socketio = SocketIO(app, cors_allowed_origins="*", ping_timeout=60, ping_interval=25)

# Inicializar el clasificador globalmente con el modelo final entrenado
print("🚀 Inicializando clasificador...")
classifier = PhotoClassifier(model_path='garbage_classifier_final.h5')
print("✅ Clasificador listo con modelo final entrenado!")

# Inicializar YOLO Detector
yolo_detector = None
if YOLO_AVAILABLE:
    try:
        print("🎯 Inicializando YOLO Detector...")
        
        class YOLODetector:
            def __init__(self, model_path='yolotest/runs/detect/garbage_detection_precise/weights/best.pt', confidence_threshold=0.5, device='auto'):
                """
                Inicializa el detector YOLO para el API server
                
                Args:
                    model_path: Ruta al modelo YOLO entrenado
                    confidence_threshold: Umbral de confianza para detecciones
                    device: Dispositivo a usar ('auto', 'cpu', 'cuda')
                """
                self.confidence_threshold = confidence_threshold
                
                # Configurar dispositivo
                if device == 'auto':
                    self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
                else:
                    self.device = device
                    
                print(f"🔧 YOLO usando dispositivo: {self.device}")
                
                # Cargar modelo
                if not os.path.exists(model_path):
                    raise FileNotFoundError(f"❌ Modelo YOLO no encontrado: {model_path}")
                    
                print(f"🤖 Cargando modelo YOLO: {model_path}")
                self.model = YOLO(model_path)
                self.model.to(self.device)
                
                # Clases de basura que detecta YOLO
                self.classes = ['BIODEGRADABLE', 'CARDBOARD', 'GLASS', 'METAL', 'PAPER', 'PLASTIC']
                
                # Colores para cada clase (RGB format para web)
                self.colors = {
                    'BIODEGRADABLE': '#00FF00',    # Verde
                    'CARDBOARD': '#FF6600',       # Naranja
                    'GLASS': '#00FFFF',           # Cian
                    'METAL': '#808080',           # Gris
                    'PAPER': '#FFFFFF',           # Blanco
                    'PLASTIC': '#FF0000'          # Rojo
                }
                
                # Mapeo de clases YOLO a categorías del frontend
                self.class_mapping = {
                    'BIODEGRADABLE': 'biological',
                    'CARDBOARD': 'cardboard',
                    'GLASS': 'glass',
                    'METAL': 'metal',
                    'PAPER': 'paper',
                    'PLASTIC': 'plastic'
                }
                
                print("✅ YOLO Detector inicializado correctamente")
            
            def detect_objects(self, image):
                """
                Detecta objetos en una imagen
                
                Args:
                    image: Imagen en formato OpenCV (BGR)
                    
                Returns:
                    dict: Resultados de detección
                """
                try:
                    # Realizar detección
                    start_time = time.time()
                    results = self.model(image, conf=self.confidence_threshold, verbose=False)
                    inference_time = (time.time() - start_time) * 1000  # en ms
                    
                    detections = []
                    
                    for result in results:
                        boxes = result.boxes
                        if boxes is not None:
                            for box in boxes:
                                # Obtener coordenadas (normalizar a 0-1)
                                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                                img_height, img_width = image.shape[:2]
                                
                                # Obtener clase y confianza
                                class_id = int(box.cls[0])
                                confidence = float(box.conf[0])
                                class_name = self.classes[class_id]
                                
                                detection = {
                                    'class': class_name,
                                    'category': self.class_mapping.get(class_name, 'trash'),
                                    'confidence': confidence,
                                    'confidence_percentage': round(confidence * 100, 2),
                                    'bbox': {
                                        'x1': float(x1) / img_width,
                                        'y1': float(y1) / img_height,
                                        'x2': float(x2) / img_width,
                                        'y2': float(y2) / img_height,
                                        'width': float(x2 - x1) / img_width,
                                        'height': float(y2 - y1) / img_height
                                    },
                                    'color': self.colors.get(class_name, '#FFFFFF')
                                }
                                
                                detections.append(detection)
                    
                    return {
                        'success': True,
                        'detections': detections,
                        'detection_count': len(detections),
                        'inference_time_ms': round(inference_time, 1),
                        'image_size': {'width': img_width, 'height': img_height},
                        'model_confidence_threshold': self.confidence_threshold
                    }
                    
                except Exception as e:
                    print(f"❌ Error en detección YOLO: {e}")
                    return {
                        'success': False,
                        'error': str(e),
                        'detections': [],
                        'detection_count': 0
                    }
        
        yolo_detector = YOLODetector()
        print("✅ YOLO Detector listo!")
        
    except Exception as e:
        print(f"⚠️ No se pudo inicializar YOLO Detector: {e}")
        yolo_detector = None

# Inicializar ChatGPT Adviser
try:
    print("🤖 Inicializando ChatGPT Adviser...")
    chatgpt_adviser = ChatGPTAdviser()
    print("✅ ChatGPT Adviser listo!")
except Exception as e:
    print(f"⚠️ ChatGPT Adviser no disponible: {e}")
    print("📋 Se usarán consejos de respaldo")
    chatgpt_adviser = None

# Variables globales para control de streaming
active_streams = {}  # Dict para manejar múltiples sesiones de streaming
current_session_id = None  # Sesión actual simplificada

def process_image_data(image_data):
    """
    Procesar datos de imagen desde el frontend
    Soporta tanto base64 como archivos binarios
    """
    try:
        # Si es base64, decodificar
        if isinstance(image_data, str):
            # Remover el prefijo data:image/... si existe
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            # Decodificar base64
            image_bytes = base64.b64decode(image_data)
        else:
            # Si es un archivo binario directamente
            image_bytes = image_data
        
        # Convertir a PIL Image
        pil_image = Image.open(io.BytesIO(image_bytes))
        
        # Convertir a array numpy (OpenCV format)
        image_array = np.array(pil_image)
        
        # Convertir RGB a BGR para OpenCV
        if len(image_array.shape) == 3 and image_array.shape[2] == 3:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
        
        return image_array
    
    except Exception as e:
        print(f"❌ Error procesando imagen: {e}")
        return None

@app.route('/health', methods=['GET'])
def health_check():
    """Verificar que la API está funcionando"""
    return jsonify({
        'status': 'ok',
        'message': 'API de clasificación de basura funcionando correctamente'
    })

@app.route('/classify', methods=['POST'])
def classify_image():
    """
    Clasificar una imagen subida
    Acepta tanto archivos multipart/form-data como JSON con base64
    """
    try:
        image_array = None
        
        # Verificar si es un archivo subido
        if 'image' in request.files:
            file = request.files['image']
            if file.filename != '':
                # Leer archivo directamente
                image_bytes = file.read()
                image_array = process_image_data(image_bytes)
        
        # Verificar si es JSON con base64
        elif request.is_json:
            data = request.get_json()
            if 'image' in data:
                image_array = process_image_data(data['image'])
        
        # Verificar si es form-data con base64
        elif 'image' in request.form:
            image_data = request.form['image']
            image_array = process_image_data(image_data)
        
        if image_array is None:
            return jsonify({
                'error': 'No se pudo procesar la imagen',
                'message': 'Asegúrate de enviar la imagen como archivo o base64'
            }), 400
        
        # Clasificar imagen
        result = classifier.classify_image(image_array)
        
        # Mapear nombres de categorías a español
        category_names = {
            'battery': 'Batería',
            'biological': 'Orgánico',
            'cardboard': 'Cartón',
            'clothes': 'Ropa',
            'glass': 'Vidrio',
            'metal': 'Metal',
            'paper': 'Papel',
            'plastic': 'Plástico',
            'shoes': 'Zapatos',
            'trash': 'Basura General',
            'unknown': 'Desconocido'
        }
        
        # Obtener consejos de ChatGPT
        advice_data = None
        if chatgpt_adviser and result['garbage_class'] != 'unknown':
            try:
                print(f"🤖 Consultando ChatGPT para: {result['garbage_class']}")
                advice_response = chatgpt_adviser.get_product_advice(
                    result['garbage_class'], 
                    result['original_class'], 
                    result['confidence']
                )
                if advice_response['success']:
                    advice_data = advice_response['advice']
                    print("✅ Consejos obtenidos de ChatGPT")
                else:
                    print(f"⚠️ Error en ChatGPT: {advice_response.get('error', 'Error desconocido')}")
                    advice_data = advice_response.get('advice')
            except Exception as e:
                print(f"❌ Error consultando ChatGPT: {e}")
                # Usar consejos de respaldo
                if chatgpt_adviser:
                    advice_data = chatgpt_adviser._get_fallback_advice(result['garbage_class'])
        
        # Formatear respuesta
        response = {
            'success': True,
            'result': {
                'category': result['garbage_class'],
                'category_name': category_names.get(result['garbage_class'], result['garbage_class']),
                'confidence': float(result['confidence']),
                'confidence_percentage': round(float(result['confidence']) * 100, 2),
                'original_class': result['original_class'],
                'inference_time_ms': round(result['inference_time'], 1),
                'top_predictions': [
                    {
                        'class': classifier.class_labels[str(idx)],
                        'confidence': float(result['all_predictions'][idx]),
                        'confidence_percentage': round(float(result['all_predictions'][idx]) * 100, 2)
                    }
                    for idx in np.argsort(result['all_predictions'])[-3:][::-1]
                ],
                'advice': advice_data,
                'has_chatgpt_advice': chatgpt_adviser is not None
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"❌ Error en clasificación: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor',
            'message': str(e)
        }), 500

@app.route('/categories', methods=['GET'])
def get_categories():
    """Obtener lista de categorías disponibles"""
    categories = {
        'battery': 'Batería',
        'biological': 'Orgánico',
        'cardboard': 'Cartón',
        'clothes': 'Ropa',
        'glass': 'Vidrio',
        'metal': 'Metal',
        'paper': 'Papel',
        'plastic': 'Plástico',
        'shoes': 'Zapatos',
        'trash': 'Basura General'
    }
    
    return jsonify({
        'success': True,
        'categories': categories
    })

@app.route('/detect', methods=['POST'])
def detect_objects():
    """
    Detectar objetos en una imagen usando YOLO
    Acepta tanto archivos multipart/form-data como JSON con base64
    """
    if not yolo_detector:
        return jsonify({
            'success': False,
            'error': 'YOLO Detector no disponible',
            'message': 'El sistema de detección de objetos no está inicializado'
        }), 503
    
    try:
        image_array = None
        
        # Verificar si es un archivo subido
        if 'image' in request.files:
            file = request.files['image']
            if file.filename != '':
                # Leer archivo directamente
                image_bytes = file.read()
                image_array = process_image_data(image_bytes)
        
        # Verificar si es JSON con base64
        elif request.is_json:
            data = request.get_json()
            if 'image' in data:
                image_array = process_image_data(data['image'])
        
        # Verificar si es form-data con base64
        elif 'image' in request.form:
            image_data = request.form['image']
            image_array = process_image_data(image_data)
        
        if image_array is None:
            return jsonify({
                'error': 'No se pudo procesar la imagen',
                'message': 'Asegúrate de enviar la imagen como archivo o base64'
            }), 400
        
        # Detectar objetos usando YOLO
        detection_result = yolo_detector.detect_objects(image_array)
        
        if not detection_result['success']:
            return jsonify({
                'success': False,
                'error': 'Error en detección',
                'message': detection_result.get('error', 'Error desconocido')
            }), 500
        
        # Mapear nombres de categorías a español
        category_names = {
            'biological': 'Orgánico',
            'cardboard': 'Cartón',
            'glass': 'Vidrio',
            'metal': 'Metal',
            'paper': 'Papel',
            'plastic': 'Plástico'
        }
        
        # Enriquecer detecciones con nombres en español
        enriched_detections = []
        for detection in detection_result['detections']:
            enriched_detection = detection.copy()
            enriched_detection['category_name'] = category_names.get(
                detection['category'], detection['class']
            )
            enriched_detections.append(enriched_detection)
        
        # Formatear respuesta
        response = {
            'success': True,
            'result': {
                'detections': enriched_detections,
                'detection_count': detection_result['detection_count'],
                'inference_time_ms': detection_result['inference_time_ms'],
                'image_size': detection_result['image_size'],
                'model_confidence_threshold': detection_result['model_confidence_threshold'],
                'model_type': 'YOLO',
                'model_classes': yolo_detector.classes
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"❌ Error en detección de objetos: {e}")
        return jsonify({
            'success': False,
            'error': 'Error interno del servidor',
            'message': str(e)
        }), 500

@app.route('/detect/status', methods=['GET'])
def detection_status():
    """Verificar estado del sistema de detección YOLO"""
    if yolo_detector:
        return jsonify({
            'success': True,
            'yolo_available': True,
            'device': yolo_detector.device,
            'classes': yolo_detector.classes,
            'confidence_threshold': yolo_detector.confidence_threshold,
            'message': 'Sistema de detección YOLO operativo'
        })
    else:
        return jsonify({
            'success': False,
            'yolo_available': False,
            'message': 'Sistema de detección YOLO no disponible'
        })

# ===== WEBSOCKET EVENTS =====

@socketio.on('connect')
def handle_connect():
    """Manejar nueva conexión WebSocket"""
    global current_session_id
    current_session_id = str(uuid.uuid4())
    print(f"🔌 Cliente conectado: {current_session_id}")
    emit('connection_response', {
        'status': 'connected',
        'message': 'Conectado al servidor de clasificación en tiempo real'
    })

@socketio.on('disconnect')
def handle_disconnect():
    """Manejar desconexión WebSocket"""
    global current_session_id
    print(f"🔌 Cliente desconectado: {current_session_id}")
    
    # Limpiar sesión activa si existe
    if current_session_id and current_session_id in active_streams:
        active_streams[current_session_id]['active'] = False
        del active_streams[current_session_id]
    current_session_id = None

@socketio.on('start_detection')
def handle_start_detection(data=None):
    """Iniciar detección en tiempo real"""
    global current_session_id
    if not current_session_id:
        current_session_id = str(uuid.uuid4())
    
    # Obtener configuración del cliente
    use_detection = False
    if data and isinstance(data, dict):
        use_detection = data.get('use_detection', False)
    
    detection_type = "YOLO" if use_detection and yolo_detector else "Clasificación"
    print(f"🎥 Iniciando {detection_type} para cliente: {current_session_id}")
    
    # Marcar sesión como activa
    active_streams[current_session_id] = {
        'active': True,
        'last_detection': time.time(),
        'fps_limit': 2,  # Máximo 2 FPS para no sobrecargar
        'use_detection': use_detection and yolo_detector is not None
    }
    
    emit('detection_started', {
        'status': 'active',
        'message': f'{detection_type} en tiempo real iniciada',
        'detection_type': detection_type.lower(),
        'yolo_available': yolo_detector is not None
    })

@socketio.on('stop_detection')
def handle_stop_detection():
    """Detener detección en tiempo real"""
    global current_session_id
    print(f"🛑 Deteniendo detección para cliente: {current_session_id}")
    
    # Marcar sesión como inactiva
    if current_session_id and current_session_id in active_streams:
        active_streams[current_session_id]['active'] = False
        del active_streams[current_session_id]
    
    emit('detection_stopped', {
        'status': 'inactive',
        'message': 'Detección en tiempo real detenida'
    })

@socketio.on('frame_data')
def handle_frame_data(data):
    """Procesar frame de video en tiempo real"""
    try:
        global current_session_id
        
        # Verificar si la sesión está activa
        if not current_session_id or current_session_id not in active_streams or not active_streams[current_session_id]['active']:
            return
        
        # Control de FPS - evitar procesar frames muy rápido
        current_time = time.time()
        session_data = active_streams[current_session_id]
        time_since_last = current_time - session_data['last_detection']
        min_interval = 1.0 / session_data['fps_limit']  # Intervalo mínimo entre frames
        
        if time_since_last < min_interval:
            return  # Saltar este frame para controlar FPS
        
        session_data['last_detection'] = current_time
        
        # Procesar imagen
        frame_base64 = data.get('frame')
        if not frame_base64:
            emit('error', {'message': 'No se recibió frame de video'})
            return
        
        # Convertir frame a imagen
        image_array = process_image_data(frame_base64)
        if image_array is None:
            emit('error', {'message': 'Error procesando frame'})
            return
        
        # Determinar qué modelo usar basado en la configuración de la sesión
        use_detection = session_data.get('use_detection', False)
        
        if use_detection and yolo_detector:
            # Usar YOLO para detección de objetos
            detection_result = yolo_detector.detect_objects(image_array)
            
            if detection_result['success']:
                # Mapear nombres de categorías a español
                category_names = {
                    'biological': 'Orgánico',
                    'cardboard': 'Cartón',
                    'glass': 'Vidrio',
                    'metal': 'Metal',
                    'paper': 'Papel',
                    'plastic': 'Plástico'
                }
                
                # Enriquecer detecciones
                enriched_detections = []
                for detection in detection_result['detections']:
                    enriched_detection = {
                        'category': str(detection['category']),
                        'class': str(detection['class']),
                        'confidence': float(detection['confidence']),
                        'bbox': [float(x) for x in detection['bbox']],
                        'category_name': category_names.get(
                            detection['category'], detection['class']
                        )
                    }
                    enriched_detections.append(enriched_detection)
                
                # Preparar respuesta de detección en tiempo real
                realtime_result = {
                    'success': True,
                    'timestamp': float(current_time),
                    'result': {
                        'type': 'detection',
                        'detections': enriched_detections,
                        'detection_count': int(detection_result['detection_count']),
                        'inference_time_ms': float(detection_result['inference_time_ms']),
                        'image_size': [int(x) for x in detection_result['image_size']],
                        'model_type': 'YOLO',
                        'model_used': 'best.pt',
                        'realtime': True
                    }
                }
                
                # Enviar resultado de detección
                emit('detection_result', realtime_result)
            else:
                emit('error', {'message': 'Error en detección YOLO de frame'})
        else:
            # Usar clasificador tradicional
            result = classifier.classify_image_realtime(image_array)
            
            if result:
                # Obtener consejos (usar consejos básicos para tiempo real para mayor velocidad)
                advice_data = get_recycling_advice(result['category'], result['original_class'])
                
                # Mapear nombres de categorías a español
                category_names = {
                    'battery': 'Batería',
                    'biological': 'Orgánico', 
                    'cardboard': 'Cartón',
                    'clothes': 'Ropa',
                    'glass': 'Vidrio',
                    'metal': 'Metal',
                    'paper': 'Papel',
                    'plastic': 'Plástico',
                    'shoes': 'Zapatos',
                    'trash': 'Basura General'
                }
                
                # Preparar respuesta en tiempo real
                realtime_result = {
                    'success': True,
                    'timestamp': float(current_time),
                    'result': {
                        'type': 'classification',
                        'category': str(result['category']),
                        'category_name': category_names.get(result['category'], result['category']),
                        'confidence': float(result['confidence']),
                        'confidence_percentage': float(result['confidence_percentage']),
                        'original_class': str(result['original_class']),
                        'inference_time_ms': float(result['inference_time_ms']),
                        'advice': advice_data,
                        'has_chatgpt_advice': False,  # Deshabilitado en tiempo real para velocidad
                        'realtime': True,
                        'model_used': 'garbage_classifier_final.h5'  # Modelo actualizado
                    }
                }
                
                # Enviar resultado en tiempo real
                emit('detection_result', realtime_result)
                
            else:
                emit('error', {'message': 'Error en clasificación de frame'})
            
    except Exception as e:
        print(f"❌ Error procesando frame: {e}")
        emit('error', {'message': f'Error interno: {str(e)}'})

def get_recycling_advice(category, original_class):
    """Obtener consejos básicos de reciclaje (versión simplificada para tiempo real)"""
    
    basic_advice = {
        'biological': {
            'consejos': 'Separa los residuos orgánicos sin bolsas plásticas. Evita carnes y productos lácteos.',
            'impacto': 'El compostaje reduce emisiones de metano y genera fertilizante natural.',
            'datos': 'Los orgánicos representan 40% de la basura doméstica.',
            'alternativas': 'Haz compost casero o usa biodigestor.'
        },
        'plastic': {
            'consejos': 'Limpia el plástico antes de reciclar. Retira etiquetas y tapas si es necesario.',
            'impacto': 'Reciclar plástico ahorra 70% de energía vs producción nueva.',
            'datos': 'Solo 9% del plástico mundial se recicla efectivamente.',
            'alternativas': 'Usa botellas reutilizables y reduce plásticos de un solo uso.'
        },
        'paper': {
            'consejos': 'Papel limpio y seco al contenedor azul. No mezcles con papel sucio.',
            'impacto': 'Reciclar papel salva 17 árboles por tonelada.',
            'datos': 'El papel puede reciclarse hasta 7 veces antes de degradarse.',
            'alternativas': 'Digitaliza documentos y usa papel reciclado.'
        },
        'glass': {
            'consejos': 'Separa por colores si es posible. Retira tapas y corchos.',
            'impacto': 'El vidrio es 100% reciclable sin pérdida de calidad.',
            'datos': 'Reciclar vidrio ahorra 30% de energía vs fabricación nueva.',
            'alternativas': 'Reutiliza frascos para almacenamiento.'
        },
        'metal': {
            'consejos': 'Limpia latas y separa diferentes tipos de metal.',
            'impacto': 'Reciclar aluminio ahorra 95% de energía vs producción nueva.',
            'datos': 'Una lata de aluminio se recicla en 60 días.',
            'alternativas': 'Compra productos con menos embalaje metálico.'
        },
        'cardboard': {
            'consejos': 'Aplana cajas y retira cintas adhesivas. Mantén seco.',
            'impacto': 'Reciclar cartón reduce tala de árboles en 24%.',
            'datos': 'El cartón puede reciclarse hasta 25 veces.',
            'alternativas': 'Reutiliza cajas para almacenamiento o mudanzas.'
        }
    }
    
    return basic_advice.get(category, {
        'consejos': 'Consulta las normas locales de reciclaje.',
        'impacto': 'Separar correctamente mejora las tasas de reciclaje.',
        'datos': 'La separación adecuada es clave para el reciclaje efectivo.',
        'alternativas': 'Reduce, reutiliza y recicla en ese orden de prioridad.'
    })

if __name__ == '__main__':
    print("🌐 Iniciando servidor API...")
    print("📡 Disponible en: http://localhost:5000")
    print("🔗 Endpoints HTTP:")
    print("   GET  /health - Verificar estado")
    print("   POST /classify - Clasificar imagen")
    print("   POST /detect - Detectar objetos con YOLO")
    print("   GET  /detect/status - Estado del detector YOLO")
    print("   GET  /categories - Obtener categorías")
    print("🔗 WebSocket Events:")
    print("   connect - Conectar cliente")
    print("   start_detection - Iniciar detección tiempo real")
    print("   frame_data - Enviar frame para análisis")
    print("   stop_detection - Detener detección")
    print("🎯 Modelos disponibles:")
    print("   📊 Clasificación: garbage_classifier_final.h5")
    if yolo_detector:
        print("   🎯 Detección YOLO: best.pt ✅")
    else:
        print("   🎯 Detección YOLO: No disponible ❌")
    print("=" * 50)
    
    socketio.run(app, debug=True, host='0.0.0.0', port=5000) 