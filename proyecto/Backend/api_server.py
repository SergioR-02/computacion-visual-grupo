"""
API Server para clasificación de imágenes de basura
Expone la funcionalidad de PhotoClassifier a través de endpoints HTTP
Incluye integración con ChatGPT para consejos sobre reciclaje
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import io
import base64
from PIL import Image
import os
import sys

# Agregar el directorio actual al path para importar PhotoClassifier
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from photo_classifier import PhotoClassifier
from chatgpt_adviser import ChatGPTAdviser

app = Flask(__name__)
CORS(app)  # Permitir requests desde el frontend

# Inicializar el clasificador globalmente
print("🚀 Inicializando clasificador...")
classifier = PhotoClassifier()
print("✅ Clasificador listo!")

# Inicializar ChatGPT Adviser
try:
    print("🤖 Inicializando ChatGPT Adviser...")
    chatgpt_adviser = ChatGPTAdviser()
    print("✅ ChatGPT Adviser listo!")
except Exception as e:
    print(f"⚠️ ChatGPT Adviser no disponible: {e}")
    print("📋 Se usarán consejos de respaldo")
    chatgpt_adviser = None

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
                        'class': pred[1],
                        'confidence': float(pred[2]),
                        'confidence_percentage': round(float(pred[2]) * 100, 2)
                    }
                    for pred in result['all_predictions'][:3]
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

if __name__ == '__main__':
    print("🌐 Iniciando servidor API...")
    print("📡 Disponible en: http://localhost:5000")
    print("🔗 Endpoints:")
    print("   GET  /health - Verificar estado")
    print("   POST /classify - Clasificar imagen")
    print("   GET  /categories - Obtener categorías")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000) 