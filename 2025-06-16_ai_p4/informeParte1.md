# Informe del Proyecto: Reconocimiento de Dígitos con CNN (MNIST)

## Análisis y descripción del flujo paso a paso

### 1. Carga de datos MNIST
Se utiliza el dataset `MNIST` proporcionado por `TensorFlow`, que contiene:
- 60,000 imágenes de entrenamiento.
- 10,000 imágenes de prueba.
Cada imagen es de 28x28 píxeles en escala de grises y representa un dígito del 0 al 9.

### 2. Visualización de imágenes
- Se imprimen matrices individuales para comprender los valores de los píxeles.
- Se utiliza `matplotlib` para mostrar las imágenes en formato visual.
- Se grafican múltiples dígitos para observar la diversidad en la escritura manuscrita.

### 3. Preprocesamiento: reshape + normalización
- Las imágenes se redimensionan de `(28, 28)` a `(28, 28, 1)` para añadir el canal de color.
- Se normalizan dividiendo los valores por 255, llevando el rango de píxeles de `[0, 255]` a `[0, 1]`.

### 4. Construcción del modelo CNN
- Se utiliza `tf.keras.Sequential` para definir la red.
- La arquitectura incluye:
  - 2 capas de convolución con `ReLU` y `MaxPooling2D`.
  - Una capa `Flatten` para aplanar la entrada.
  - Una capa `Dense` oculta con 128 neuronas y `Dropout` para reducir overfitting.
  - Una capa de salida `Dense` con 10 neuronas y activación `Softmax`.

### 5. Entrenamiento y validación
- Optimización con `Adam` y función de pérdida `sparse_categorical_crossentropy`.
- Se entrena el modelo por 10 épocas, evaluando el rendimiento con un conjunto de validación.
- Se registran métricas con `TensorBoard`.

### 6. Evaluación y exportación
- Se evalúa el modelo con el conjunto de prueba para medir precisión y pérdida.
- Se grafican curvas de pérdida y precisión.
- Se muestra la matriz de confusión para visualizar errores comunes.
- Se guarda el modelo en formato `.h5` y se menciona cómo convertirlo a `TensorFlow.js` para uso en la web.

---

## Lo aprendido

- Cómo preparar datos de imágenes para un modelo CNN en TensorFlow.
- Cómo construir y entrenar una red convolucional desde cero.
- El uso de herramientas como `matplotlib`, `seaborn` y `TensorBoard` para visualización y monitoreo.
- La importancia del preprocesamiento (reshape y normalización).
- Cómo exportar modelos para reutilizarlos en producción, incluso en el navegador.

---

## Aplicación de ideas al taller actual

- Podemos utilizar la misma estrategia de preprocesamiento (normalización y redimensionamiento) para imágenes en otros contextos del taller.
- La arquitectura CNN y el flujo de entrenamiento son una base sólida para resolver problemas similares, como clasificación de otras imágenes u objetos.
- El uso de `TensorBoard` como herramienta de monitoreo será muy útil para detectar overfitting o ajustar hiperparámetros.
- Exportar el modelo a `TensorFlow.js` nos permitirá integrar el modelo entrenado en aplicaciones web interactivas, lo cual es clave para experiencias en tiempo real.

---
