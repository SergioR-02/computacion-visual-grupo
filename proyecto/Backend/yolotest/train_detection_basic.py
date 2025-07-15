"""
🗂️ Entrenamiento de Modelo YOLO para DETECCIÓN de Basura
======================================================
Este script entrena un modelo YOLOv8 para DETECTAR objetos de basura
con bounding boxes precisas, no solo clasificación.
"""

import os
from ultralytics import YOLO
import torch

def train_garbage_detection_model():
    """
    Entrena un modelo YOLO para detección de basura
    """
    print("🗂️ ENTRENAMIENTO DE DETECCIÓN DE BASURA")
    print("=" * 50)
    
    # Verificar GPU
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"🔧 Dispositivo: {device}")
    if device == 'cuda':
        print(f"🚀 GPU: {torch.cuda.get_device_name()}")
        print(f"💾 VRAM: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
    
    # Verificar dataset
    data_yaml = "GARBAGE CLASSIFICATION 3.v2-gc1.yolov8/data.yaml"
    if not os.path.exists(data_yaml):
        print(f"❌ Error: No se encontró {data_yaml}")
        return
    
    print(f"📁 Dataset: {data_yaml}")
    
    # Crear modelo para DETECCIÓN (no clasificación)
    print("🤖 Cargando modelo YOLOv8n para detección...")
    # Para MÁS PRECISIÓN, considera usar modelos más grandes:
    # 'yolov8s.pt' (11M parámetros) - Mejor balance precisión/velocidad
    # 'yolov8m.pt' (25M parámetros) - Muy buena precisión
    # 'yolov8l.pt' (43M parámetros) - Alta precisión
    # 'yolov8x.pt' (68M parámetros) - Máxima precisión
    
    model_size = input("\n🎯 Elige el tamaño del modelo para balancear precisión/velocidad:\n"
                      "   n - Nano (más rápido, menos preciso)\n"
                      "   s - Small (balance)\n" 
                      "   m - Medium (recomendado para precisión)\n"
                      "   l - Large (alta precisión)\n"
                      "   x - Extra Large (máxima precisión)\n"
                      "Ingresa opción (n/s/m/l/x) [por defecto: m]: ").strip().lower()
    
    if model_size not in ['n', 's', 'm', 'l', 'x']:
        model_size = 'm'  # Por defecto medium
    
    model_path = f'yolov8{model_size}.pt'
    print(f"📦 Usando modelo: {model_path}")
    
    model = YOLO(model_path)  # Modelo de DETECCIÓN, no clasificación
    
    # Configuración de entrenamiento OPTIMIZADA PARA PRECISIÓN
    train_config = {
        'data': data_yaml,
        'epochs': 30,  # Más épocas para mejor aprendizaje
        'imgsz': 640,   # Mantener 640 para balance velocidad/precisión
        'batch': 12,    # Reducir batch para mejor gradientes
        'device': device,
        'patience': 25, # Más paciencia para evitar parada temprana
        'save': True,
        'plots': True,
        'verbose': True,
        'val': True,
        'cache': False,
        'workers': 4,
        'project': 'runs/detect',
        'name': 'garbage_detection_precise',
        'exist_ok': True,
        
        # Parámetros de optimización MEJORADOS
        'optimizer': 'AdamW',  # AdamW es mejor que SGD para detección
        'lr0': 0.002,          # Learning rate más bajo para precisión
        'lrf': 0.01,           # Factor de reducción de LR al final
        'momentum': 0.937,
        'weight_decay': 0.0005,
        'warmup_epochs': 5,    # Más warmup para estabilidad
        'warmup_momentum': 0.8,
        'warmup_bias_lr': 0.1,
        
        # Augmentaciones BALANCEADAS para precisión
        'hsv_h': 0.015,        # Color hue
        'hsv_s': 0.7,          # Saturación
        'hsv_v': 0.4,          # Brillo
        'degrees': 10.0,       # Rotación ligera
        'translate': 0.1,      # Traslación
        'scale': 0.9,          # Escalado más conservador
        'shear': 2.0,          # Shear ligero
        'perspective': 0.0001, # Perspectiva mínima
        'flipud': 0.0,         # Sin volteo vertical
        'fliplr': 0.5,         # Volteo horizontal 50%
        'mosaic': 1.0,         # Mosaic para diversidad
        'mixup': 0.15,         # Mixup ligero para generalización
        'copy_paste': 0.3,     # Copy-paste para más variaciones
        
        # Parámetros adicionales para PRECISIÓN
        'cls': 0.5,            # Peso loss clasificación
        'box': 7.5,            # Peso loss bounding box
        'dfl': 1.5,            # Distribution focal loss
        'close_mosaic': 10,    # Cerrar mosaic en últimas épocas
    }
    
    print("\n🔥 Configuración OPTIMIZADA para PRECISIÓN:")
    print(f"   📊 Épocas: {train_config['epochs']} (más épocas = mejor aprendizaje)")
    print(f"   🖼️  Tamaño imagen: {train_config['imgsz']}")
    print(f"   📦 Batch size: {train_config['batch']} (menor = mejores gradientes)")
    print(f"   🛑 Paciencia: {train_config['patience']} (más paciencia = menos parada temprana)")
    print(f"   💻 Dispositivo: {train_config['device']}")
    print(f"   🧠 Optimizador: {train_config['optimizer']} (AdamW para mejor precisión)")
    print(f"   📈 Learning rate: {train_config['lr0']} (más bajo = más estable)")
    print(f"   🎨 Augmentaciones: Activadas para mejor generalización")
    print(f"   🔄 Copy-paste: {train_config['copy_paste']} (más variaciones)")
    print(f"   📐 Mixup: {train_config['mixup']} (mejor generalización)")
    
    try:
        print("\n🚀 Iniciando entrenamiento de DETECCIÓN...")
        print("⏱️  Esto puede tomar varias horas...")
        
        # Entrenar modelo
        results = model.train(**train_config)
        
        print("\n✅ ¡Entrenamiento completado!")
        print("\n📊 Resultados finales:")
        print(f"   📍 Proyecto: runs/detect/garbage_detection")
        print(f"   🏆 Mejor modelo: runs/detect/garbage_detection/weights/best.pt")
        print(f"   📈 Último modelo: runs/detect/garbage_detection/weights/last.pt")
        
        # Información sobre el mejor modelo
        best_model_path = "runs/detect/garbage_detection_precise/weights/best.pt"
        if os.path.exists(best_model_path):
            print(f"\n🎯 El modelo entrenado detectará 6 clases de basura:")
            classes = ['BIODEGRADABLE', 'CARDBOARD', 'GLASS', 'METAL', 'PAPER', 'PLASTIC']
            for i, class_name in enumerate(classes):
                print(f"   {i}: {class_name}")
            
            print(f"\n💡 Para usar el modelo:")
            print(f"   from ultralytics import YOLO")
            print(f"   model = YOLO('{best_model_path}')")
            print(f"   results = model('imagen.jpg')")
            
            print(f"\n📊 Métricas de precisión disponibles en:")
            print(f"   📈 runs/detect/garbage_detection_precise/results.png")
            print(f"   📋 runs/detect/garbage_detection_precise/confusion_matrix.png")
            print(f"   🎯 runs/detect/garbage_detection_precise/val_batch0_pred.jpg")
        
        return results
        
    except Exception as e:
        print(f"\n❌ Error durante el entrenamiento: {e}")
        print("💡 Posibles soluciones:")
        print("   - Verificar que el dataset esté completo")
        print("   - Reducir batch_size si hay problemas de memoria")
        print("   - Verificar que las rutas sean correctas")
        print("   - Usar un modelo más pequeño (yolov8n.pt) si hay problemas de VRAM")
        print("   - Reducir imgsz a 416 si hay limitaciones de memoria")
        return None

def validate_dataset():
    """
    Valida que el dataset esté correctamente estructurado
    """
    print("🔍 Validando dataset...")
    
    data_yaml = "GARBAGE CLASSIFICATION 3.v2-gc1.yolov8/data.yaml"
    if not os.path.exists(data_yaml):
        print(f"❌ No se encontró {data_yaml}")
        return False
    
    # Verificar directorios
    base_dir = "GARBAGE CLASSIFICATION 3.v2-gc1.yolov8"
    required_dirs = [
        f"{base_dir}/train/images",
        f"{base_dir}/train/labels", 
        f"{base_dir}/valid/images",
        f"{base_dir}/valid/labels"
    ]
    
    for dir_path in required_dirs:
        if not os.path.exists(dir_path):
            print(f"❌ Directorio faltante: {dir_path}")
            return False
        
        files = os.listdir(dir_path)
        print(f"✅ {dir_path}: {len(files)} archivos")
    
    print("✅ Dataset validado correctamente")
    return True

def main():
    """Función principal"""
    print("🗂️ ENTRENADOR DE DETECCIÓN DE BASURA")
    print("=" * 45)
    
    # Validar dataset
    if not validate_dataset():
        print("❌ Dataset no válido. Saliendo...")
        return
    
    # Confirmar entrenamiento
    print("\n⚠️  IMPORTANTE:")
    print("   Este entrenamiento es para DETECCIÓN (bounding boxes)")
    print("   No es para clasificación de imagen completa")
    print("   El modelo detectará objetos individuales de basura")
    
    response = input("\n¿Continuar con el entrenamiento? (s/n): ").strip().lower()
    if response not in ['s', 'si', 'yes', 'y']:
        print("❌ Entrenamiento cancelado")
        return
    
    # Entrenar modelo
    results = train_garbage_detection_model()
    
    if results:
        print("\n🎉 ¡Entrenamiento exitoso!")
        print("🚀 Ahora puedes usar el modelo para detectar basura con bounding boxes precisas")
    else:
        print("\n❌ El entrenamiento falló")

if __name__ == "__main__":
    main()
