"""
Definición del modelo CNN para clasificación CIFAR-10
"""
from tensorflow import keras
from tensorflow.keras import layers, models

def create_basic_cnn(input_shape=(32, 32, 3), num_classes=10):
    """
    Crea un modelo CNN básico para CIFAR-10
    
    Args:
        input_shape: Forma de las imágenes de entrada
        num_classes: Número de clases
    
    Returns:
        Modelo CNN compilado
    """
    model = models.Sequential([
        # Primera capa convolucional
        layers.Conv2D(32, (3, 3), activation='relu', 
                     input_shape=input_shape, name='conv2d_1'),
        layers.MaxPooling2D((2, 2), name='maxpool_1'),
        
        # Segunda capa convolucional  
        layers.Conv2D(64, (3, 3), activation='relu', name='conv2d_2'),
        layers.MaxPooling2D((2, 2), name='maxpool_2'),
        
        # Tercera capa convolucional
        layers.Conv2D(64, (3, 3), activation='relu', name='conv2d_3'),
        
        # Flatten y capas densas
        layers.Flatten(name='flatten'),
        layers.Dense(64, activation='relu', name='dense_1'),
        layers.Dropout(0.5, name='dropout'),
        layers.Dense(num_classes, activation='softmax', name='output')
    ])
    
    return model

def create_improved_cnn(input_shape=(32, 32, 3), num_classes=10):
    """
    Crea un modelo CNN mejorado con más capas y regularización
    
    Args:
        input_shape: Forma de las imágenes de entrada
        num_classes: Número de clases
    
    Returns:
        Modelo CNN compilado
    """
    model = models.Sequential([
        # Primer bloque convolucional
        layers.Conv2D(32, (3, 3), activation='relu', 
                     input_shape=input_shape, padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Segundo bloque convolucional
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Tercer bloque convolucional
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Capas densas
        layers.Flatten(),
        layers.Dense(512, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    return model

def compile_model(model, optimizer='adam', learning_rate=0.001):
    """
    Compila el modelo con configuración estándar
    
    Args:
        model: Modelo a compilar
        optimizer: Optimizador a usar
        learning_rate: Tasa de aprendizaje
    
    Returns:
        Modelo compilado
    """
    if optimizer == 'adam':
        opt = keras.optimizers.Adam(learning_rate=learning_rate)
    elif optimizer == 'sgd':
        opt = keras.optimizers.SGD(learning_rate=learning_rate, momentum=0.9)
    else:
        opt = optimizer
    
    model.compile(
        optimizer=opt,
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model
