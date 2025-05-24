# 📋 Instrucciones de Ejecución - Taller 56

## 🚀 Cómo ejecutar el proyecto

### 1. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 2. Ejecutar el script principal
```bash
python kalman_script.py
```

### 3. Ejecutar el ejemplo básico
```bash
python ejemplo_basico.py
```

### 4. Abrir el notebook interactivo
```bash
jupyter notebook kalman_filter.ipynb
```

## 📁 Descripción de archivos

### Archivos principales:
- **`kalman_filter.ipynb`**: Notebook interactivo con explicaciones paso a paso
- **`kalman_script.py`**: Script completo con implementación 1D y 2D
- **`ejemplo_basico.py`**: Ejemplo simple siguiendo la estructura del taller
- **`README.md`**: Documentación completa con fundamentos matemáticos

### Archivos generados:
- **`grafico_resultado_1d.png`**: Visualización del experimento 1D
- **`grafico_resultado_2d.png`**: Visualización del experimento 2D
- **`ejemplo_basico.png`**: Gráfico del ejemplo básico
- **`datos_1d.csv`**: Datos del experimento 1D
- **`datos_2d.csv`**: Datos del experimento 2D

### Archivos de configuración:
- **`requirements.txt`**: Dependencias de Python
- **`INSTRUCCIONES.md`**: Este archivo

## 🎯 Objetivos cumplidos

✅ **Implementación funcional del filtro de Kalman**
- Filtro 1D para posición y velocidad
- Filtro 2D para seguimiento de objetos

✅ **Visualización clara de resultados**
- Comparación entre señal real, observada y estimada
- Bandas de confianza e incertidumbre
- Elipses de confianza en 2D

✅ **Explicación matemática en el README.md**
- Ecuaciones del filtro de Kalman
- Interpretación de parámetros
- Mecanismo de inferencia

✅ **Estructura del proyecto organizada**
- Separación clara de archivos
- Documentación completa

✅ **Código comentado correctamente**
- Docstrings en todas las funciones
- Comentarios explicativos

✅ **Comparación entre variable real, observada y estimada**
- Métricas MSE y MAE
- Análisis de mejora relativa

## 🔬 Resultados esperados

El filtro de Kalman demuestra su capacidad para:

1. **Reducir ruido** en las mediciones
2. **Inferir variables ocultas** (velocidad a partir de posición)
3. **Proporcionar estimaciones óptimas** con incertidumbre cuantificada
4. **Seguir trayectorias complejas** en 2D

## 🧠 Conceptos clave demostrados

- **Inferencia estadística**: Estimación de estados no observados
- **Procesamiento secuencial**: Actualización recursiva
- **Fusión de información**: Combinación de modelo y mediciones
- **Cuantificación de incertidumbre**: Matrices de covarianza 