# 📋 Instrucciones de Instalación y Ejecución

## 🔧 Requisitos Previos
- Python 3.8 o superior
- pip (gestor de paquetes de Python)

## 📦 Instalación de Dependencias

1. **Crear entorno virtual** (recomendado):
```bash
python -m venv cnn_env
```

2. **Activar entorno virtual**:
```bash
# En Windows:
cnn_env\Scripts\activate

# En Linux/Mac:
source cnn_env/bin/activate
```

3. **Instalar dependencias**:
```bash
pip install -r requirements.txt
```

## 🚀 Ejecución del Proyecto

### Opción 1: Jupyter Notebooks (Recomendado)
1. Ejecutar Jupyter Lab:
```bash
jupyter lab
```

2. Navegar a la carpeta `notebooks/` y ejecutar en orden:
   - `01_data_exploration.ipynb` - Exploración de datos
   - `02_cnn_model.ipynb` - Construcción y entrenamiento del modelo

### Opción 2: Scripts de Python
```bash
cd src/
python train_model.py
```

## 📁 Estructura del Proyecto
```
2025-06-23_taller_cnn_basico_deep_learning_keras_pytorch/
├── notebooks/           # Jupyter notebooks
├── src/                # Código fuente modular
├── models/             # Modelos entrenados guardados
├── results/            # Resultados y visualizaciones
├── requirements.txt    # Dependencias
└── README.md          # Documentación
```

## 🎯 Objetivos del Taller
- Entender los componentes de una CNN
- Implementar una CNN desde cero con TensorFlow
- Entrenar el modelo con CIFAR-10
- Evaluar y visualizar resultados
- Guardar y cargar modelos entrenados

## 📊 Resultados Esperados
- Accuracy > 70% en CIFAR-10
- Visualizaciones de curvas de entrenamiento
- Matriz de confusión
- Predicciones de muestra
