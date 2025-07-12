import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.utils.class_weight import compute_class_weight
import numpy as np
import os
import matplotlib.pyplot as plt

# Configuración
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 20
LEARNING_RATE = 0.0001

# Directorio del dataset
dataset_dir = "garbage-dataset"

def create_model(num_classes):
    """Crear modelo usando MobileNetV2 con transfer learning"""
    # Cargar MobileNetV2 pre-entrenado
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(IMG_SIZE, IMG_SIZE, 3)
    )
    
    # Congelar las capas base inicialmente
    base_model.trainable = False
    
    # Añadir capas personalizadas
    inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
    x = base_model(inputs, training=False)
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.5)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    outputs = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs, outputs)
    return model, base_model

def prepare_data():
    """Preparar generadores de datos con aumento de datos"""
    # Generador para entrenamiento con aumento de datos
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.2
    )
    
    # Generador para validación (solo normalización)
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )
    
    # Generador de entrenamiento
    train_generator = train_datagen.flow_from_directory(
        dataset_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        shuffle=True
    )
    
    # Generador de validación
    validation_generator = val_datagen.flow_from_directory(
        dataset_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )
    
    return train_generator, validation_generator

def calculate_class_weights(train_generator):
    """Calcular pesos de clase para dataset desbalanceado"""
    # Obtener etiquetas
    labels = train_generator.labels
    class_weights = compute_class_weight(
        'balanced',
        classes=np.unique(labels),
        y=labels
    )
    return dict(enumerate(class_weights))

def train_model():
    """Entrenar el modelo completo"""
    print("🚀 Iniciando entrenamiento del modelo de clasificación de basura...")
    
    # Preparar datos
    print("📁 Preparando datos...")
    train_gen, val_gen = prepare_data()
    
    # Obtener número de clases
    num_classes = len(train_gen.class_indices)
    print(f"📊 Clases detectadas: {list(train_gen.class_indices.keys())}")
    print(f"🔢 Total de clases: {num_classes}")
    
    # Crear modelo
    print("🏗️ Creando modelo...")
    model, base_model = create_model(num_classes)
    
    # Compilar modelo
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Calcular pesos de clase
    class_weights = calculate_class_weights(train_gen)
    print(f"⚖️ Pesos de clase calculados para balancear dataset")
    
    # Callbacks
    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=5,
            restore_best_weights=True
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_accuracy',
            factor=0.5,
            patience=3,
            min_lr=1e-7
        ),
        tf.keras.callbacks.ModelCheckpoint(
            'best_garbage_model.h5',
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        )
    ]
    
    print("🎯 Iniciando entrenamiento (Fase 1: Transfer Learning)...")
    
    # Fase 1: Entrenar solo las capas superiores
    history1 = model.fit(
        train_gen,
        epochs=EPOCHS//2,
        validation_data=val_gen,
        class_weight=class_weights,
        callbacks=callbacks,
        verbose=1
    )
    
    print("🔓 Fase 2: Fine-tuning...")
    
    # Fase 2: Descongelar algunas capas del modelo base para fine-tuning
    base_model.trainable = True
    
    # Congelar las primeras capas, entrenar solo las últimas
    for layer in base_model.layers[:-20]:
        layer.trainable = False
    
    # Recompilar con learning rate más bajo
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE/10),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Continuar entrenamiento
    history2 = model.fit(
        train_gen,
        epochs=EPOCHS//2,
        validation_data=val_gen,
        class_weight=class_weights,
        callbacks=callbacks,
        verbose=1
    )
    
    # Guardar modelo final
    model.save('garbage_classifier_final.h5')
    
    # Guardar etiquetas de clase
    import json
    class_labels = {v: k for k, v in train_gen.class_indices.items()}
    with open('class_labels.json', 'w') as f:
        json.dump(class_labels, f)
    
    print("✅ Entrenamiento completado!")
    print("📁 Archivos guardados:")
    print("   - garbage_classifier_final.h5 (modelo completo)")
    print("   - best_garbage_model.h5 (mejor modelo)")
    print("   - class_labels.json (etiquetas de clase)")
    
    # Mostrar gráficas de entrenamiento
    plot_training_history(history1, history2)
    
    return model

def plot_training_history(history1, history2):
    """Mostrar gráficas del entrenamiento"""
    # Combinar historiales
    acc = history1.history['accuracy'] + history2.history['accuracy']
    val_acc = history1.history['val_accuracy'] + history2.history['val_accuracy']
    loss = history1.history['loss'] + history2.history['loss']
    val_loss = history1.history['val_loss'] + history2.history['val_loss']
    
    epochs_range = range(len(acc))
    
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(epochs_range, acc, label='Training Accuracy')
    plt.plot(epochs_range, val_acc, label='Validation Accuracy')
    plt.axvline(x=len(history1.history['accuracy']), color='r', linestyle='--', label='Fine-tuning start')
    plt.legend(loc='lower right')
    plt.title('Training and Validation Accuracy')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    
    plt.subplot(1, 2, 2)
    plt.plot(epochs_range, loss, label='Training Loss')
    plt.plot(epochs_range, val_loss, label='Validation Loss')
    plt.axvline(x=len(history1.history['loss']), color='r', linestyle='--', label='Fine-tuning start')
    plt.legend(loc='upper right')
    plt.title('Training and Validation Loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    
    plt.tight_layout()
    plt.savefig('training_history.png', dpi=300, bbox_inches='tight')
    plt.show()

if __name__ == "__main__":
    # Verificar que existe el dataset
    if not os.path.exists(dataset_dir):
        print(f"❌ Error: No se encontró el directorio {dataset_dir}")
        print("Asegúrate de que el dataset esté en el directorio correcto.")
        exit(1)
    
    # Entrenar modelo
    model = train_model()
