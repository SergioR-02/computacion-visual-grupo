"""
Cargador y preprocesador de datos para CIFAR-10
"""
import numpy as np
from tensorflow import keras

class DataLoader:
    """Clase para cargar y preprocesar datos CIFAR-10"""
    
    def __init__(self):
        self.class_names = [
            'avión', 'automóvil', 'pájaro', 'gato', 'ciervo', 
            'perro', 'rana', 'caballo', 'barco', 'camión'
        ]
        
    def load_and_preprocess(self, validation_split=0.1):
        """
        Carga y preprocesa el dataset CIFAR-10
        
        Args:
            validation_split: Proporción de datos para validación
            
        Returns:
            tuple: (x_train, y_train, x_val, y_val, x_test, y_test)
        """
        print("📦 Cargando dataset CIFAR-10...")
        
        # Cargar datos
        (x_train, y_train), (x_test, y_test) = keras.datasets.cifar10.load_data()
        
        # Normalizar píxeles
        x_train = x_train.astype('float32') / 255.0
        x_test = x_test.astype('float32') / 255.0
        
        # Convertir etiquetas a one-hot
        y_train_onehot = keras.utils.to_categorical(y_train, 10)
        y_test_onehot = keras.utils.to_categorical(y_test, 10)
        
        # Separar conjunto de validación
        if validation_split > 0:
            val_size = int(len(x_train) * validation_split)
            indices = np.random.permutation(len(x_train))
            
            val_indices = indices[:val_size]
            train_indices = indices[val_size:]
            
            x_val = x_train[val_indices]
            y_val = y_train_onehot[val_indices]
            
            x_train = x_train[train_indices]
            y_train_onehot = y_train_onehot[train_indices]
        else:
            x_val, y_val = None, None
        
        print(f"✅ Datos cargados:")
        print(f"  Entrenamiento: {x_train.shape}")
        if x_val is not None:
            print(f"  Validación: {x_val.shape}")
        print(f"  Prueba: {x_test.shape}")
        
        return x_train, y_train_onehot, x_val, y_val, x_test, y_test_onehot
    
    def get_class_names(self):
        """Retorna los nombres de las clases"""
        return self.class_names
