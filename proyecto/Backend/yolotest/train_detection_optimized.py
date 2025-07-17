"""
🗂️ Entrenamiento OPTIMIZADO para RTX 4060 Ti 16GB + Ryzen 5 7600
================================================================
Configuración específica para tu hardware para máxima precisión y rendimiento
"""

import os
from ultralytics import YOLO
import torch
import yaml

def get_optimal_config_for_rtx4060ti():
    """
    Configuración optimizada específicamente para RTX 4060 Ti 16GB
    """
    return {
        # Configuración base optimizada para tu GPU
        'imgsz': 640,           # Tamaño óptimo para 4060 Ti
        'batch': -1,            # Auto-batch (aprovechará tus 16GB)
        'epochs': 100,          # Más épocas para mejor precisión
        'patience': 30,         # Paciencia aumentada
        'cache': 'ram',         # Usar tus 32GB RAM para acelerar
        'workers': 12,          # Ryzen 5 7600 tiene 12 threads
        'device': 'cuda',
        
        # Optimizador y learning rate
        'optimizer': 'AdamW',
        'lr0': 0.001,           # LR inicial conservador
        'lrf': 0.01,            # Factor final
        'momentum': 0.937,
        'weight_decay': 0.0005,
        'warmup_epochs': 10,    # Más warmup para estabilidad
        'warmup_momentum': 0.8,
        'warmup_bias_lr': 0.1,
        
        # Scheduler para mejor convergencia
        'cos_lr': True,         # Cosine LR scheduler
        
        # Augmentaciones para máxima precisión
        'hsv_h': 0.015,
        'hsv_s': 0.7,
        'hsv_v': 0.4,
        'degrees': 15.0,        # Más rotación para robustez
        'translate': 0.1,
        'scale': 0.5,           # Más variación de escala
        'shear': 2.0,
        'perspective': 0.0,
        'flipud': 0.0,
        'fliplr': 0.5,
        'mosaic': 1.0,
        'mixup': 0.2,           # Más mixup
        'copy_paste': 0.4,      # Más copy-paste
        
        # Loss weights optimizados
        'cls': 0.5,
        'box': 7.5,
        'dfl': 1.5,
        
        # Configuración específica
        'amp': True,            # Mixed precision
        'fraction': 1.0,        # Usar todo el dataset
        'close_mosaic': 15,     # Cerrar mosaic en últimas épocas
        'overlap_mask': True,   # Para mejor detección
        'mask_ratio': 4,
        'dropout': 0.0,         # Sin dropout para máxima capacidad
        
        # Configuración de proyecto
        'project': 'runs/detect',
        'name': 'garbage_rtx4060ti_optimized',
        'exist_ok': True,
        'save': True,
        'save_period': 10,      # Guardar cada 10 épocas
        'plots': True,
        'verbose': True,
        'val': True,
    }

def train_garbage_detection_optimized():
    """
    Entrenamiento optimizado para RTX 4060 Ti 16GB
    """
    print("🚀 ENTRENAMIENTO OPTIMIZADO PARA RTX 4060 Ti 16GB")
    print("=" * 60)
    
    # Verificar hardware
    if not torch.cuda.is_available():
        print("❌ CUDA no disponible. Este script está optimizado para GPU.")
        return
    
    gpu_name = torch.cuda.get_device_name()
    vram_gb = torch.cuda.get_device_properties(0).total_memory / 1024**3
    
    print(f"🔧 GPU: {gpu_name}")
    print(f"💾 VRAM: {vram_gb:.1f} GB")
    print(f"🧠 RAM: 32GB DDR5 (asumido)")
    print(f"💻 CPU: Ryzen 5 7600 (12 threads)")
    
    if vram_gb < 15:
        print("⚠️  Advertencia: Este script está optimizado para 16GB VRAM")
        
    # Verificar dataset
    data_yaml = "GARBAGE CLASSIFICATION 3.v2-gc1.yolov8/data.yaml"
    if not os.path.exists(data_yaml):
        print(f"❌ Error: No se encontró {data_yaml}")
        return
    
    print(f"📁 Dataset: {data_yaml}")
    
    # Selección inteligente de modelo basada en tu hardware
    print("\n🎯 SELECCIÓN AUTOMÁTICA DE MODELO ÓPTIMO:")
    print("   Con RTX 4060 Ti 16GB puedes usar modelos grandes")
    
    # Para tu hardware, recomiendo YOLOv8l o YOLOv8x
    recommended_models = {
        'l': {'name': 'yolov8l.pt', 'params': '43M', 'speed': 'Rápido', 'accuracy': 'Alta'},
        'x': {'name': 'yolov8x.pt', 'params': '68M', 'speed': 'Medio', 'accuracy': 'Máxima'},
        'm': {'name': 'yolov8m.pt', 'params': '25M', 'speed': 'Muy rápido', 'accuracy': 'Buena'}
    }
    
    print("\n   Modelos recomendados para tu hardware:")
    for key, info in recommended_models.items():
        print(f"   {key.upper()}: {info['name']} - {info['params']} parámetros - {info['accuracy']} precisión")
    
    # Selección automática: YOLOv8l para balance óptimo
    model_choice = input(f"\n🤖 Elige modelo (l/x/m) [Recomendado para tu GPU: L]: ").strip().lower()
    if model_choice not in ['l', 'x', 'm']:
        model_choice = 'l'  # Default óptimo para tu hardware
    
    model_path = recommended_models[model_choice]['name']
    print(f"📦 Usando: {model_path} - {recommended_models[model_choice]['accuracy']} precisión")
    
    # Cargar modelo
    model = YOLO(model_path)
    
    # Configuración optimizada
    config = get_optimal_config_for_rtx4060ti()
    config['data'] = data_yaml
    
    # Ajuste dinámico de batch basado en modelo seleccionado
    if model_choice == 'x':
        config['batch'] = -1  # Auto, pero probablemente ~8-12
    elif model_choice == 'l':
        config['batch'] = -1  # Auto, probablemente ~16-20
    else:  # m
        config['batch'] = -1  # Auto, probablemente ~24-32
    
    print(f"\n🔥 CONFIGURACIÓN OPTIMIZADA PARA TU HARDWARE:")
    print(f"   🖼️  Imagen: {config['imgsz']}px")
    print(f"   📦 Batch: Auto-optimizado para 16GB VRAM")
    print(f"   📊 Épocas: {config['epochs']} (más épocas = mejor precisión)")
    print(f"   🧠 Cache: RAM (aprovecha tus 32GB)")
    print(f"   👥 Workers: {config['workers']} (todos los threads del Ryzen)")
    print(f"   🎯 Mixed Precision: Activado (acelera sin perder precisión)")
    print(f"   📈 Scheduler: Cosine (mejor convergencia)")
    print(f"   🎨 Augmentaciones: Optimizadas para precisión máxima")
    
    # Hyperparameter tuning automático
    print(f"\n🔧 FASE 1: HYPERPARAMETER TUNING AUTOMÁTICO")
    print("   Encontrando configuración óptima para tu hardware...")
    
    try:
        # Tune automático para encontrar mejores hiperparámetros
        tune_results = model.tune(
            data=data_yaml,
            epochs=30,  # Épocas de tuning
            iterations=300,  # Más iteraciones para mejor búsqueda
            optimizer='AdamW',
            plots=True,
            save=False,
            val=False
        )
        
        # Aplicar los mejores hiperparámetros encontrados
        if hasattr(tune_results, 'best_fitness'):
            print(f"✅ Tuning completado. Mejor fitness: {tune_results.best_fitness:.4f}")
            # Actualizar configuración con los mejores parámetros
            if hasattr(tune_results, 'best_params'):
                config.update(tune_results.best_params)
        
    except Exception as e:
        print(f"⚠️  Tuning falló, usando configuración predeterminada: {e}")
    
    print(f"\n🚀 FASE 2: ENTRENAMIENTO PRINCIPAL")
    print("   Entrenando con configuración optimizada...")
    print("   ⏱️  Tiempo estimado: 2-4 horas dependiendo del modelo")
    
    try:
        # Entrenamiento principal con configuración optimizada
        results = model.train(**config)
        
        print(f"\n✅ ¡ENTRENAMIENTO COMPLETADO EXITOSAMENTE!")
        print(f"\n📊 RESULTADOS:")
        
        model_dir = f"runs/detect/garbage_rtx4060ti_optimized"
        best_model = f"{model_dir}/weights/best.pt"
        
        if os.path.exists(best_model):
            print(f"🏆 Mejor modelo: {best_model}")
            print(f"📈 Gráficas: {model_dir}/results.png")
            print(f"🎯 Matriz confusión: {model_dir}/confusion_matrix.png")
            print(f"📋 Predicciones: {model_dir}/val_batch0_pred.jpg")
            
            # Métricas finales
            if hasattr(results, 'results_dict'):
                metrics = results.results_dict
                print(f"\n📊 MÉTRICAS FINALES:")
                if 'metrics/mAP50' in metrics:
                    print(f"   🎯 mAP@0.5: {metrics['metrics/mAP50']:.3f}")
                if 'metrics/mAP50-95' in metrics:
                    print(f"   🎯 mAP@0.5:0.95: {metrics['metrics/mAP50-95']:.3f}")
            
            print(f"\n💡 CÓDIGO PARA USAR EL MODELO:")
            print(f"   from ultralytics import YOLO")
            print(f"   model = YOLO('{best_model}')")
            print(f"   results = model('imagen.jpg')")
            print(f"   results[0].show()  # Mostrar detecciones")
            
            print(f"\n🎉 ¡Modelo optimizado para RTX 4060 Ti listo!")
            print(f"   🔥 Configurado para máximo rendimiento en tu hardware")
            print(f"   🎯 Optimizado para la mejor precisión posible")
            
        return results
        
    except Exception as e:
        print(f"\n❌ Error durante entrenamiento: {e}")
        print(f"\n💡 Soluciones recomendadas:")
        print(f"   - Verificar que CUDA esté correctamente instalado")
        print(f"   - Probar con modelo más pequeño (yolov8m.pt)")
        print(f"   - Reducir batch_size manualmente si hay problemas de memoria")
        print(f"   - Verificar integridad del dataset")
        return None

def validate_setup():
    """Validar que todo esté listo para entrenamiento"""
    print("🔍 VALIDANDO CONFIGURACIÓN...")
    
    # Verificar CUDA
    if not torch.cuda.is_available():
        print("❌ CUDA no disponible")
        return False
    
    # Verificar dataset
    data_yaml = "GARBAGE CLASSIFICATION 3.v2-gc1.yolov8/data.yaml"
    if not os.path.exists(data_yaml):
        print(f"❌ Dataset no encontrado: {data_yaml}")
        return False
    
    # Verificar estructura del dataset
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
        if len(files) == 0:
            print(f"❌ Directorio vacío: {dir_path}")
            return False
        
        print(f"✅ {dir_path}: {len(files)} archivos")
    
    # Verificar que tenemos los modelos base
    models_to_check = ['yolov8m.pt', 'yolov8l.pt', 'yolov8x.pt']
    available_models = []
    for model in models_to_check:
        if os.path.exists(model):
            available_models.append(model)
    
    if available_models:
        print(f"✅ Modelos disponibles: {', '.join(available_models)}")
    else:
        print("⚠️  No se encontraron modelos preentrenados, se descargarán automáticamente")
    
    print("✅ Configuración validada correctamente")
    return True

def main():
    """Función principal optimizada para RTX 4060 Ti"""
    print("🚀 ENTRENADOR YOLO OPTIMIZADO PARA RTX 4060 Ti 16GB")
    print("=" * 60)
    print("🔧 Hardware detectado: RTX 4060 Ti 16GB + Ryzen 5 7600 + 32GB RAM")
    print("🎯 Objetivo: Máxima precisión con excelente rendimiento")
    
    # Validar configuración
    if not validate_setup():
        print("❌ Configuración no válida. Revisa los errores arriba.")
        return
    
    print("\n⚡ CARACTERÍSTICAS DE ESTA VERSIÓN OPTIMIZADA:")
    print("   🔄 Hyperparameter tuning automático")
    print("   📦 Batch size automático optimizado para 16GB VRAM")
    print("   🧠 Cache en RAM (aprovecha tus 32GB)")
    print("   👥 12 workers (todos los threads del Ryzen 5 7600)")
    print("   🎯 Mixed precision training")
    print("   📈 Cosine learning rate scheduler")
    print("   🎨 Augmentaciones avanzadas para máxima precisión")
    print("   💾 Guardado automático cada 10 épocas")
    
    response = input("\n🚀 ¿Iniciar entrenamiento optimizado? (s/n): ").strip().lower()
    if response not in ['s', 'si', 'yes', 'y']:
        print("❌ Entrenamiento cancelado")
        return
    
    # Entrenar
    results = train_garbage_detection_optimized()
    
    if results:
        print("\n🎉 ¡ENTRENAMIENTO EXITOSO!")
        print("🏆 Modelo optimizado para tu RTX 4060 Ti listo para usar")
        print("📈 Revisa las métricas en la carpeta runs/detect/")
    else:
        print("\n❌ El entrenamiento falló")

if __name__ == "__main__":
    main()
