#!/usr/bin/env python3
"""
🧪 Taller IA Visual Colaborativa - Detector YOLO
================================================

Script principal que utiliza YOLOv8 para detectar objetos en imágenes,
guarda los resultados anotados y exporta datos en formato JSON/CSV 
para visualización web.

Autor: Taller Computación Visual
Fecha: 2025-06-20
"""

import cv2
import json
import csv
import os
import argparse
from datetime import datetime
from pathlib import Path
import numpy as np
from ultralytics import YOLO
import matplotlib.pyplot as plt
from typing import List, Dict, Any


class VisualAIDetector:
    """Detector de objetos con YOLO y exportación para web"""
    
    def __init__(self, model_path: str = "yolov8n.pt"):
        """
        Inicializa el detector
        
        Args:
            model_path: Ruta al modelo YOLO (por defecto yolov8n.pt)
        """
        self.model = YOLO(model_path)
        self.results_dir = Path("../results")
        self.web_data_dir = Path("../web/data")
        
        # Crear directorios si no existen
        self.results_dir.mkdir(exist_ok=True)
        (self.results_dir / "images").mkdir(exist_ok=True)
        (self.results_dir / "json").mkdir(exist_ok=True)
        (self.results_dir / "csv").mkdir(exist_ok=True)
        self.web_data_dir.mkdir(exist_ok=True)
        
        print(f"✅ Detector inicializado con modelo: {model_path}")
    
    def detect_objects(self, image_path: str, confidence: float = 0.5) -> Dict[str, Any]:
        """
        Detecta objetos en una imagen
        
        Args:
            image_path: Ruta a la imagen
            confidence: Umbral de confianza mínimo
            
        Returns:
            Diccionario con resultados de detección
        """
        print(f"🔍 Procesando imagen: {image_path}")
        
        # Cargar imagen
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"No se pudo cargar la imagen: {image_path}")
        
        # Ejecutar detección
        results = self.model(image, conf=confidence)
        
        # Procesar resultados
        detections = []
        annotated_image = image.copy()
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Extraer información de la detección
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    conf = float(box.conf[0].cpu().numpy())
                    cls = int(box.cls[0].cpu().numpy())
                    class_name = self.model.names[cls]
                    
                    # Crear diccionario de detección
                    detection = {
                        "class": class_name,
                        "confidence": round(conf, 3),
                        "bbox": {
                            "x1": int(x1), "y1": int(y1),
                            "x2": int(x2), "y2": int(y2),
                            "width": int(x2 - x1),
                            "height": int(y2 - y1),
                            "center_x": int((x1 + x2) / 2),
                            "center_y": int((y1 + y2) / 2)
                        }
                    }
                    detections.append(detection)
                    
                    # Dibujar bounding box en la imagen
                    color = self._get_class_color(cls)
                    cv2.rectangle(annotated_image, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
                    
                    # Agregar etiqueta
                    label = f"{class_name}: {conf:.2f}"
                    label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)[0]
                    cv2.rectangle(annotated_image, (int(x1), int(y1) - label_size[1] - 10),
                                (int(x1) + label_size[0], int(y1)), color, -1)
                    cv2.putText(annotated_image, label, (int(x1), int(y1) - 5),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        # Crear resultado completo
        result_data = {
            "timestamp": datetime.now().isoformat(),
            "image_path": image_path,
            "image_size": {
                "width": image.shape[1],
                "height": image.shape[0],
                "channels": image.shape[2]
            },
            "model_info": {
                "model_name": "YOLOv8",
                "confidence_threshold": confidence
            },
            "detections_count": len(detections),
            "detections": detections,
            "classes_detected": list(set([d["class"] for d in detections])),
            "annotated_image": annotated_image
        }
        
        print(f"✅ Detectados {len(detections)} objetos")
        return result_data
    
    def _get_class_color(self, cls: int) -> tuple:
        """Genera colores únicos para cada clase"""
        colors = [
            (255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0),
            (255, 0, 255), (0, 255, 255), (128, 0, 0), (0, 128, 0),
            (0, 0, 128), (128, 128, 0), (128, 0, 128), (0, 128, 128)
        ]
        return colors[cls % len(colors)]
    
    def save_results(self, result_data: Dict[str, Any], output_name: str = None) -> Dict[str, str]:
        """
        Guarda todos los resultados (imagen, JSON, CSV)
        
        Args:
            result_data: Datos de detección
            output_name: Nombre base para los archivos de salida
            
        Returns:
            Diccionario con rutas de archivos guardados
        """
        if output_name is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_name = f"detection_{timestamp}"
        
        saved_files = {}
        
        # 1. Guardar imagen anotada
        image_path = self.results_dir / "images" / f"{output_name}.jpg"
        cv2.imwrite(str(image_path), result_data["annotated_image"])
        saved_files["image"] = str(image_path)
        
        # 2. Guardar datos JSON
        json_data = {k: v for k, v in result_data.items() if k != "annotated_image"}
        json_path = self.results_dir / "json" / f"{output_name}.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        saved_files["json"] = str(json_path)
        
        # 3. Copiar JSON para web
        web_json_path = self.web_data_dir / f"{output_name}.json"
        with open(web_json_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        saved_files["web_json"] = str(web_json_path)
        
        # 4. Guardar CSV con estadísticas
        csv_path = self.results_dir / "csv" / f"{output_name}.csv"
        self._save_csv_stats(result_data, csv_path)
        saved_files["csv"] = str(csv_path)
        
        print(f"💾 Resultados guardados:")
        for file_type, path in saved_files.items():
            print(f"   {file_type}: {path}")
        
        return saved_files
    
    def _save_csv_stats(self, result_data: Dict[str, Any], csv_path: Path):
        """Guarda estadísticas en formato CSV"""
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Encabezados
            writer.writerow([
                "timestamp", "class", "confidence", "x1", "y1", "x2", "y2",
                "width", "height", "center_x", "center_y", "area"
            ])
            
            # Datos de cada detección
            for detection in result_data["detections"]:
                bbox = detection["bbox"]
                area = bbox["width"] * bbox["height"]
                writer.writerow([
                    result_data["timestamp"],
                    detection["class"],
                    detection["confidence"],
                    bbox["x1"], bbox["y1"], bbox["x2"], bbox["y2"],
                    bbox["width"], bbox["height"],
                    bbox["center_x"], bbox["center_y"],
                    area
                ])
    
    def generate_summary_report(self, result_data: Dict[str, Any]) -> str:
        """Genera un reporte resumen de la detección"""
        detections = result_data["detections"]
        
        if not detections:
            return "❌ No se detectaron objetos en la imagen"
        
        # Estadísticas básicas
        classes = [d["class"] for d in detections]
        class_counts = {cls: classes.count(cls) for cls in set(classes)}
        avg_confidence = np.mean([d["confidence"] for d in detections])
        
        # Crear reporte
        report = f"""
🎯 REPORTE DE DETECCIÓN
=====================

📊 Estadísticas generales:
• Total de objetos detectados: {len(detections)}
• Clases únicas: {len(class_counts)}
• Confianza promedio: {avg_confidence:.3f}

📋 Objetos por clase:
"""
        for cls, count in sorted(class_counts.items()):
            report += f"• {cls}: {count} objeto(s)\n"
        
        report += f"""
🖼️ Información de imagen:
• Tamaño: {result_data['image_size']['width']}x{result_data['image_size']['height']}
• Fecha: {result_data['timestamp']}

🔧 Configuración del modelo:
• Modelo: {result_data['model_info']['model_name']}
• Umbral de confianza: {result_data['model_info']['confidence_threshold']}
"""
        
        return report


def main():
    """Función principal del script"""
    parser = argparse.ArgumentParser(description="Detector YOLO para IA Visual Colaborativa")
    parser.add_argument("--source", "-s", required=True, help="Ruta a la imagen de entrada")
    parser.add_argument("--confidence", "-c", type=float, default=0.5, help="Umbral de confianza (0.0-1.0)")
    parser.add_argument("--model", "-m", default="yolov8n.pt", help="Modelo YOLO a usar")
    parser.add_argument("--output", "-o", help="Nombre base para archivos de salida")
    
    args = parser.parse_args()
    
    try:
        # Verificar que existe el archivo
        if not os.path.exists(args.source):
            print(f"❌ Error: No se encontró la imagen {args.source}")
            return
        
        # Inicializar detector
        detector = VisualAIDetector(args.model)
        
        # Ejecutar detección
        results = detector.detect_objects(args.source, args.confidence)
        
        # Guardar resultados
        saved_files = detector.save_results(results, args.output)
        
        # Mostrar reporte
        report = detector.generate_summary_report(results)
        print(report)
        
        print("\n🌐 Para visualizar los resultados en web, abre: ../web/index.html")
        
    except Exception as e:
        print(f"❌ Error durante la ejecución: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
