"""
Script principal para entrenar el modelo CNN en CIFAR-10
"""
import os
import sys
import numpy as np
import matplotlib.pyplot as plt

# Agregar el directorio src al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import tensorflow as tf
    from tensorflow import keras
    from data_loader import DataLoader
    from model import create_basic_cnn, compile_model
    from utils import plot_training_history, plot_confusion_matrix, evaluate_model
except ImportError as e:
    print(f"❌ Error importando dependencias: {e}")
    print("🔧 Asegúrate de instalar las dependencias con: pip install -r requirements.txt")
    sys.exit(1)

def main():
    """Función principal de entrenamiento"""
    print("🧪 Iniciando Taller CNN - Clasificación CIFAR-10")
    print("=" * 60)
    
    # Configuración
    EPOCHS = 10
    BATCH_SIZE = 32
    VALIDATION_SPLIT = 0.2
    
    # Configurar seeds para reproducibilidad
    tf.random.set_seed(42)
    np.random.seed(42)
    
    # 1. Cargar datos
    print("\n📦 Paso 1: Cargando datos...")
    data_loader = DataLoader()
    x_train, y_train, x_val, y_val, x_test, y_test = data_loader.load_and_preprocess(
        validation_split=VALIDATION_SPLIT
    )
    class_names = data_loader.get_class_names()
    
    # 2. Crear modelo
    print("\n🏗️ Paso 2: Construyendo modelo CNN...")
    model = create_basic_cnn()
    model = compile_model(model)
    
    print("📋 Resumen del modelo:")
    model.summary()
    
    # 3. Entrenar modelo
    print(f"\n🚀 Paso 3: Entrenando modelo ({EPOCHS} épocas)...")
    history = model.fit(
        x_train, y_train,
        batch_size=BATCH_SIZE,
        epochs=EPOCHS,
        validation_data=(x_val, y_val) if x_val is not None else None,
        verbose=1
    )
    
    # 4. Visualizar entrenamiento
    print("\n📈 Paso 4: Visualizando curvas de entrenamiento...")
    plot_training_history(history)
    
    # 5. Evaluar modelo
    print("\n🎯 Paso 5: Evaluando modelo...")
    results = evaluate_model(model, x_test, y_test.flatten(), class_names)
    
    # 6. Matriz de confusión
    print("\n🎯 Paso 6: Generando matriz de confusión...")
    plot_confusion_matrix(results['true_classes'], 
                         results['predicted_classes'], 
                         class_names)
    
    # 7. Guardar modelo
    print("\n💾 Paso 7: Guardando modelo...")
    models_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, 'cnn_cifar10_model.h5')
    model.save(model_path)
    
    print(f"✅ Entrenamiento completado!")
    print(f"📁 Modelo guardado en: {model_path}")
    print(f"🎯 Accuracy final: {results['accuracy']:.4f}")

if __name__ == "__main__":
    main()
