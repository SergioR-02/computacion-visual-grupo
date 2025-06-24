"""
Utilidades para el proyecto CNN
"""
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix
import tensorflow as tf

def plot_training_history(history):
    """
    Visualiza las curvas de entrenamiento
    
    Args:
        history: Historial de entrenamiento de Keras
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
    
    # Accuracy
    ax1.plot(history.history['accuracy'], label='Entrenamiento', linewidth=2)
    ax1.plot(history.history['val_accuracy'], label='Validación', linewidth=2)
    ax1.set_title('📈 Precisión del Modelo', fontweight='bold', fontsize=14)
    ax1.set_xlabel('Época')
    ax1.set_ylabel('Precisión')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # Loss
    ax2.plot(history.history['loss'], label='Entrenamiento', linewidth=2)
    ax2.plot(history.history['val_loss'], label='Validación', linewidth=2)
    ax2.set_title('📉 Pérdida del Modelo', fontweight='bold', fontsize=14)
    ax2.set_xlabel('Época')
    ax2.set_ylabel('Pérdida')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.show()

def plot_confusion_matrix(y_true, y_pred, class_names):
    """
    Visualiza la matriz de confusión
    
    Args:
        y_true: Etiquetas verdaderas
        y_pred: Predicciones del modelo
        class_names: Nombres de las clases
    """
    cm = confusion_matrix(y_true, y_pred)
    
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_names, yticklabels=class_names)
    plt.title('🎯 Matriz de Confusión', fontweight='bold', fontsize=16)
    plt.xlabel('Predicción')
    plt.ylabel('Verdadero')
    plt.xticks(rotation=45)
    plt.yticks(rotation=0)
    plt.tight_layout()
    plt.show()

def plot_sample_predictions(model, x_test, y_test, class_names, num_samples=8):
    """
    Visualiza predicciones de muestra
    
    Args:
        model: Modelo entrenado
        x_test: Imágenes de prueba
        y_test: Etiquetas verdaderas
        class_names: Nombres de las clases
        num_samples: Número de muestras a mostrar
    """
    # Obtener predicciones
    predictions = model.predict(x_test[:num_samples])
    predicted_classes = np.argmax(predictions, axis=1)
    true_classes = y_test[:num_samples].flatten()
    
    fig, axes = plt.subplots(2, 4, figsize=(16, 8))
    fig.suptitle('🔍 Predicciones del Modelo', fontsize=16, fontweight='bold')
    
    for i in range(num_samples):
        row = i // 4
        col = i % 4
        
        # Mostrar imagen
        axes[row, col].imshow(x_test[i])
        
        # Determinar color del título
        true_class = true_classes[i]
        pred_class = predicted_classes[i]
        confidence = predictions[i][pred_class] * 100
        
        color = 'green' if true_class == pred_class else 'red'
        
        # Título con predicción
        title = f'Real: {class_names[true_class]}\n'
        title += f'Pred: {class_names[pred_class]}\n'
        title += f'Conf: {confidence:.1f}%'
        
        axes[row, col].set_title(title, color=color, fontweight='bold')
        axes[row, col].axis('off')
    
    plt.tight_layout()
    plt.show()

def evaluate_model(model, x_test, y_test, class_names):
    """
    Evalúa el modelo de forma completa
    
    Args:
        model: Modelo entrenado
        x_test: Imágenes de prueba
        y_test: Etiquetas verdaderas
        class_names: Nombres de las clases
    
    Returns:
        dict: Métricas de evaluación
    """
    # Predicciones
    predictions = model.predict(x_test)
    predicted_classes = np.argmax(predictions, axis=1)
    true_classes = y_test.flatten()
    
    # Accuracy
    test_accuracy = np.mean(predicted_classes == true_classes)
    
    print(f"🎯 Accuracy en test: {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")
    
    # Reporte de clasificación
    print(f"\n📊 Reporte de clasificación:")
    print(classification_report(true_classes, predicted_classes, 
                              target_names=class_names))
    
    return {
        'accuracy': test_accuracy,
        'predictions': predictions,
        'predicted_classes': predicted_classes,
        'true_classes': true_classes
    }
