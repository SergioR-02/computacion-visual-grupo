"""
🖼️ Detección de Basura en Imágenes desde URL con YOLO
=====================================================
Este script usa el modelo YOLO entrenado para detectar basura
en imágenes obtenidas desde URLs.
"""

import cv2
import numpy as np
from ultralytics import YOLO
import torch
import os
import argparse
import requests
from collections import defaultdict
from urllib.parse import urlparse
import json
from datetime import datetime

class URLGarbageDetector:
    def __init__(self, model_path, confidence_threshold=0.5, device='auto'):
        """
        Inicializa el detector de basura para URLs
        
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
            
        print(f"🔧 Usando dispositivo: {self.device}")
        
        # Cargar modelo
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"❌ Modelo no encontrado: {model_path}")
            
        print(f"🤖 Cargando modelo: {model_path}")
        self.model = YOLO(model_path)
        self.model.to(self.device)
        
        # Clases de basura
        self.classes = ['BIODEGRADABLE', 'CARDBOARD', 'GLASS', 'METAL', 'PAPER', 'PLASTIC']
        
        # Colores para cada clase (BGR format)
        self.colors = {
            'BIODEGRADABLE': (0, 255, 0),      # Verde
            'CARDBOARD': (0, 165, 255),        # Naranja
            'GLASS': (255, 255, 0),            # Cian
            'METAL': (128, 128, 128),          # Gris
            'PAPER': (255, 255, 255),          # Blanco
            'PLASTIC': (0, 0, 255)             # Rojo
        }
        
        # Crear directorio de salida
        self.output_dir = "detected_images"
        os.makedirs(self.output_dir, exist_ok=True)
        
    def download_image_from_url(self, url, timeout=10):
        """
        Descarga una imagen desde una URL
        
        Args:
            url: URL de la imagen
            timeout: Tiempo límite para la descarga
            
        Returns:
            image: Imagen en formato OpenCV (BGR) o None si falla
        """
        try:
            print(f"📥 Descargando imagen desde: {url}")
            
            # Configurar headers para simular un navegador
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            # Descargar imagen
            response = requests.get(url, headers=headers, timeout=timeout, stream=True)
            response.raise_for_status()
            
            # Verificar que sea una imagen
            content_type = response.headers.get('content-type', '')
            if not content_type.startswith('image/'):
                print(f"⚠️  Advertencia: El contenido no parece ser una imagen (Content-Type: {content_type})")
            
            # Convertir a array numpy
            image_array = np.asarray(bytearray(response.content), dtype=np.uint8)
            
            # Decodificar imagen
            image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            
            if image is None:
                print(f"❌ No se pudo decodificar la imagen desde: {url}")
                return None
                
            print(f"✅ Imagen descargada correctamente: {image.shape}")
            return image
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error al descargar imagen: {e}")
            return None
        except Exception as e:
            print(f"❌ Error inesperado: {e}")
            return None
    
    def preprocess_image(self, image, max_size=1280):
        """
        Preprocesa la imagen antes de la detección
        
        Args:
            image: Imagen original
            max_size: Tamaño máximo para redimensionar
            
        Returns:
            image: Imagen preprocesada
        """
        # Redimensionar si es muy grande
        height, width = image.shape[:2]
        if max(height, width) > max_size:
            scale = max_size / max(height, width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            image = cv2.resize(image, (new_width, new_height))
            print(f"🔄 Imagen redimensionada a: {new_width}x{new_height}")
            
        return image
    
    def detect_garbage(self, image):
        """
        Detecta basura en la imagen
        
        Args:
            image: Imagen en formato OpenCV
            
        Returns:
            results: Resultados de YOLO
        """
        # Realizar detección
        results = self.model(image, conf=self.confidence_threshold, verbose=False)
        return results
    
    def draw_detections(self, image, results):
        """
        Dibuja las detecciones en la imagen
        
        Args:
            image: Imagen original
            results: Resultados de YOLO
            
        Returns:
            image: Imagen con detecciones dibujadas
            detections: Lista de detecciones encontradas
        """
        detections = []
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Obtener coordenadas
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                    
                    # Obtener clase y confianza
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    class_name = self.classes[class_id]
                    
                    # Guardar detección
                    detection = {
                        'class': class_name,
                        'confidence': confidence,
                        'bbox': [int(x1), int(y1), int(x2), int(y2)],
                        'area': int((x2 - x1) * (y2 - y1))
                    }
                    detections.append(detection)
                    
                    # Obtener color
                    color = self.colors.get(class_name, (255, 255, 255))
                    
                    # Dibujar bounding box
                    cv2.rectangle(image, (x1, y1), (x2, y2), color, 3)
                    
                    # Preparar texto
                    text = f"{class_name}: {confidence:.2f}"
                    text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
                    
                    # Dibujar fondo del texto
                    cv2.rectangle(image, (x1, y1 - text_size[1] - 15), 
                                (x1 + text_size[0] + 10, y1), color, -1)
                    
                    # Dibujar texto
                    cv2.putText(image, text, (x1 + 5, y1 - 8), 
                              cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        
        return image, detections
    
    def add_info_panel(self, image, detections, url):
        """
        Añade panel de información a la imagen
        
        Args:
            image: Imagen original
            detections: Lista de detecciones
            url: URL de la imagen
            
        Returns:
            image: Imagen con panel de información
        """
        height, width = image.shape[:2]
        
        # Panel superior
        panel_height = 120
        overlay = image.copy()
        cv2.rectangle(overlay, (0, 0), (width, panel_height), (0, 0, 0), -1)
        image = cv2.addWeighted(image, 0.8, overlay, 0.2, 0)
        
        # Título
        cv2.putText(image, "🗂️ DETECTOR DE BASURA - ANALISIS DE URL", (20, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        # URL (truncada si es muy larga)
        url_display = url if len(url) < 80 else url[:77] + "..."
        cv2.putText(image, f"URL: {url_display}", (20, 55), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        
        # Estadísticas
        total_detections = len(detections)
        cv2.putText(image, f"Detecciones: {total_detections} | Confianza: {self.confidence_threshold:.2f}", 
                   (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        # Timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(image, f"Procesado: {timestamp}", (20, 105), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)
        
        # Panel de estadísticas por clase (lado derecho)
        if detections:
            class_counts = defaultdict(int)
            for det in detections:
                class_counts[det['class']] += 1
            
            stats_width = 250
            stats_height = len(class_counts) * 30 + 60
            stats_x = width - stats_width - 10
            stats_y = 10
            
            # Fondo del panel de estadísticas
            overlay = image.copy()
            cv2.rectangle(overlay, (stats_x, stats_y), (width - 10, stats_y + stats_height), (0, 0, 0), -1)
            image = cv2.addWeighted(image, 0.8, overlay, 0.2, 0)
            
            # Título de estadísticas
            cv2.putText(image, "📊 DETECCIONES POR TIPO:", (stats_x + 10, stats_y + 25), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            # Mostrar contadores
            y_offset = 50
            for class_name, count in sorted(class_counts.items(), key=lambda x: x[1], reverse=True):
                color = self.colors.get(class_name, (255, 255, 255))
                cv2.putText(image, f"{class_name}: {count}", 
                           (stats_x + 15, stats_y + y_offset), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
                y_offset += 30
        
        return image
    
    def save_results(self, image, detections, url, filename_prefix="detected"):
        """
        Guarda la imagen procesada y los resultados en JSON
        
        Args:
            image: Imagen con detecciones dibujadas
            detections: Lista de detecciones
            url: URL original de la imagen
            filename_prefix: Prefijo para el nombre del archivo
            
        Returns:
            tuple: (ruta_imagen, ruta_json)
        """
        # Generar nombre de archivo único
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        parsed_url = urlparse(url)
        url_filename = os.path.basename(parsed_url.path) or "image"
        name_base = f"{filename_prefix}_{timestamp}_{url_filename.split('.')[0]}"
        
        # Guardar imagen
        image_path = os.path.join(self.output_dir, f"{name_base}.jpg")
        cv2.imwrite(image_path, image)
        
        # Preparar datos JSON
        results_data = {
            "timestamp": datetime.now().isoformat(),
            "source_url": url,
            "model_confidence_threshold": self.confidence_threshold,
            "device_used": self.device,
            "total_detections": len(detections),
            "image_saved_as": os.path.basename(image_path),
            "detections": detections,
            "summary": {
                class_name: len([d for d in detections if d['class'] == class_name])
                for class_name in self.classes
                if any(d['class'] == class_name for d in detections)
            }
        }
        
        # Guardar JSON
        json_path = os.path.join(self.output_dir, f"{name_base}.json")
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(results_data, f, indent=2, ensure_ascii=False)
        
        return image_path, json_path
    
    def process_image_from_url(self, url, save_results=True, show_image=True):
        """
        Procesa una imagen desde una URL
        
        Args:
            url: URL de la imagen
            save_results: Si guardar los resultados
            show_image: Si mostrar la imagen procesada
            
        Returns:
            dict: Resultados del procesamiento
        """
        print(f"\n🔍 Procesando imagen desde URL...")
        print(f"🔗 URL: {url}")
        
        # Descargar imagen
        image = self.download_image_from_url(url)
        if image is None:
            return {"error": "No se pudo descargar la imagen"}
        
        # Preprocesar imagen
        image = self.preprocess_image(image)
        
        # Detectar basura
        print("🔍 Realizando detección...")
        results = self.detect_garbage(image)
        
        # Dibujar detecciones
        image_with_detections, detections = self.draw_detections(image.copy(), results)
        
        # Añadir panel de información
        final_image = self.add_info_panel(image_with_detections, detections, url)
        
        # Preparar resultados
        processing_results = {
            "url": url,
            "total_detections": len(detections),
            "detections": detections,
            "success": True
        }
        
        # Guardar resultados si se solicita
        if save_results:
            image_path, json_path = self.save_results(final_image, detections, url)
            processing_results["image_saved"] = image_path
            processing_results["json_saved"] = json_path
            print(f"💾 Imagen guardada: {image_path}")
            print(f"📄 JSON guardado: {json_path}")
        
        # Mostrar imagen si se solicita
        if show_image:
            # Redimensionar para mostrar si es muy grande
            display_image = final_image
            height, width = display_image.shape[:2]
            if max(height, width) > 1200:
                scale = 1200 / max(height, width)
                new_width = int(width * scale)
                new_height = int(height * scale)
                display_image = cv2.resize(display_image, (new_width, new_height))
            
            cv2.imshow('🗂️ Detector de Basura - Resultado', display_image)
            print("👁️  Mostrando imagen. Presiona cualquier tecla para continuar...")
            cv2.waitKey(0)
            cv2.destroyAllWindows()
        
        # Mostrar resumen
        print(f"\n📊 RESUMEN DE DETECCIÓN:")
        print(f"✅ Total de objetos detectados: {len(detections)}")
        
        if detections:
            class_summary = defaultdict(int)
            for det in detections:
                class_summary[det['class']] += 1
            
            for class_name, count in sorted(class_summary.items(), key=lambda x: x[1], reverse=True):
                print(f"   {class_name}: {count}")
                
            # Mostrar detección con mayor confianza
            best_detection = max(detections, key=lambda x: x['confidence'])
            print(f"🎯 Detección más confiable: {best_detection['class']} ({best_detection['confidence']:.2f})")
        else:
            print("   No se detectaron objetos de basura")
        
        return processing_results
    
    def process_multiple_urls(self, urls, save_results=True, show_images=False):
        """
        Procesa múltiples URLs
        
        Args:
            urls: Lista de URLs
            save_results: Si guardar los resultados
            show_images: Si mostrar las imágenes (puede ser lento con muchas imágenes)
            
        Returns:
            list: Lista de resultados para cada URL
        """
        print(f"🔄 Procesando {len(urls)} imágenes...")
        results = []
        
        for i, url in enumerate(urls, 1):
            print(f"\n{'='*50}")
            print(f"📷 Imagen {i}/{len(urls)}")
            
            try:
                result = self.process_image_from_url(url, save_results, show_images)
                results.append(result)
            except Exception as e:
                error_result = {"url": url, "error": str(e), "success": False}
                results.append(error_result)
                print(f"❌ Error procesando {url}: {e}")
        
        # Resumen final
        successful = sum(1 for r in results if r.get("success", False))
        total_detections = sum(r.get("total_detections", 0) for r in results if r.get("success", False))
        
        print(f"\n🏁 PROCESAMIENTO COMPLETADO")
        print(f"✅ Imágenes procesadas exitosamente: {successful}/{len(urls)}")
        print(f"📊 Total de detecciones: {total_detections}")
        
        return results

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description='Detector de basura en imágenes desde URL con YOLO')
    
    parser.add_argument('--model', type=str, 
                       default='runs/detect/garbage_detection_precise/weights/best.pt',
                       help='Ruta al modelo YOLO entrenado')
    
    parser.add_argument('--urls', type=str, nargs='+',
                       help='URLs de las imágenes a procesar')
    
    parser.add_argument('--url-file', type=str,
                       help='Archivo de texto con URLs (una por línea)')
    
    parser.add_argument('--confidence', type=float, default=0.45,
                       help='Umbral de confianza (0.1-0.95)')
    
    parser.add_argument('--device', type=str, default='auto',
                       choices=['auto', 'cpu', 'cuda'],
                       help='Dispositivo a usar')
    
    parser.add_argument('--no-save', action='store_true',
                       help='No guardar las imágenes procesadas')
    
    parser.add_argument('--show', action='store_true',
                       help='Mostrar las imágenes procesadas')
    
    args = parser.parse_args()
    
    print("🖼️ DETECTOR DE BASURA EN IMÁGENES DESDE URL")
    print("=" * 50)
    
    # Obtener lista de URLs
    urls = []
    
    if args.urls:
        urls.extend(args.urls)
    
    if args.url_file:
        try:
            with open(args.url_file, 'r', encoding='utf-8') as f:
                file_urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]
                urls.extend(file_urls)
                print(f"📁 Cargadas {len(file_urls)} URLs desde {args.url_file}")
        except FileNotFoundError:
            print(f"❌ Archivo no encontrado: {args.url_file}")
            return
    
    if not urls:
        print("❌ No se proporcionaron URLs para procesar")
        print("💡 Usa --urls o --url-file para especificar las imágenes")
        return
    
    try:
        # Crear detector
        detector = URLGarbageDetector(
            model_path=args.model,
            confidence_threshold=args.confidence,
            device=args.device
        )
        
        # Procesar URLs
        if len(urls) == 1:
            detector.process_image_from_url(
                urls[0], 
                save_results=not args.no_save,
                show_image=args.show
            )
        else:
            detector.process_multiple_urls(
                urls,
                save_results=not args.no_save,
                show_images=args.show
            )
        
    except FileNotFoundError as e:
        print(f"❌ {e}")
        print("💡 Asegúrate de haber entrenado el modelo primero con train_detection.py")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
