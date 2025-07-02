# Implementación de Tiny NeRF con TensorFlow

Este proyecto contiene una implementación optimizada de Tiny NeRF (Neural Radiance Fields) utilizando TensorFlow, demostrando cómo renderizar vistas 3D de una escena a partir de un conjunto de imágenes 2D y sus poses de cámara.

## 1. Configuración del Entorno

El código está diseñado para ejecutarse en un entorno Python, preferiblemente con acceso a una GPU para acelerar los cálculos de TensorFlow. Las principales dependencias incluyen:

- **TensorFlow:** Versión 2.x o superior.
- **NumPy:** Para operaciones numéricas.
- **Imageio:** Para cargar y guardar imágenes.
- **Matplotlib:** Para visualización de resultados.
- **Tqdm:** Para barras de progreso (especialmente en entornos de notebook).
- **IPython.display y base64:** Para visualización de videos en entornos como Google Colab.
- **Urllib.request y Zipfile:** Para la descarga y extracción de datasets.

Se verifica la versión de TensorFlow al inicio del script:

```python
print("TensorFlow version:", tf.__version__)
```

## 2. Dataset Utilizado

El proyecto utiliza un dataset sintético de Blender para NeRF. Por defecto, intenta descargar y usar el dataset `lego`.

Se incluye una lógica robusta para la gestión del dataset:

1.  **Descarga de `tiny_nerf_data.npz`:** Como primera alternativa, se intenta descargar un dataset más pequeño y confiable (`tiny_nerf_data.npz`) desde una URL de Berkeley. Este dataset se convierte luego a la estructura de directorios esperada por NeRF (con imágenes PNG y archivos JSON de transformaciones).
2.  **Descarga de la escena específica de Blender:** Si la opción anterior falla, se intenta descargar la escena `lego` directamente desde repositorios de GitHub/Oxford. Este es el formato de dataset de Blender original.
3.  **Generación de Dataset Sintético Simple:** Si ninguna de las descargas tiene éxito, el código tiene una función de fallback (`create_simple_synthetic_dataset`) que genera un dataset sintético básico con un objeto simple y cámaras en una órbita. Esto asegura que el script siempre pueda ejecutarse, incluso sin una conexión a internet activa para descargar los datasets.

El dataset se carga en la memoria y se divide en conjuntos de entrenamiento, validación y prueba. Las imágenes se redimensionan a la mitad de su resolución (`half_res=True`) para un entrenamiento más rápido.

## 3. Tiempo de Entrenamiento

El entrenamiento de NeRF es un proceso iterativo. El modelo se entrena para un número predefinido de iteraciones (`N_iters`). El tiempo por iteración y el progreso general se muestran en la consola.

- **Número de Iteraciones:** El modelo se entrena por `500` iteraciones (`N_iters = 500`).
- **Frecuencia de Reporte:** Los resultados de pérdida y PSNR, junto con las visualizaciones, se muestran cada `50` iteraciones (`i_plot = 50`).
- **Optimización para Velocidad:** Se han implementado varias optimizaciones para un entrenamiento más rápido:
  - `L_embed` reducido de 6 a 4 en la codificación posicional.
  - Modelo NeRF más pequeño (`D=4` capas, `W=128` neuronas).
  - Skip connections cada 2 capas en lugar de cada 4.
  - `chunk` de `render_rays` más pequeño (`1024*16`).
  - `N_samples` reducido de 64 a 32 por rayo.
  - Learning rate ajustado para Blender.

Durante el entrenamiento, se mide y reporta el tiempo transcurrido por cada `i_plot` iteraciones, lo que permite monitorear la velocidad del proceso.

## 4. Calidad de Reconstrucción

La calidad de la reconstrucción se evalúa visualmente mediante imágenes renderizadas y cuantitativamente mediante la métrica PSNR (Peak Signal-to-Noise Ratio).

Durante el entrenamiento, cada `i_plot` iteraciones, se realiza un renderizado completo de una imagen de prueba. Esto permite comparar visualmente la imagen renderizada por el modelo con la imagen real del dataset. También se calcula y se grafica el PSNR, que es una medida común de la calidad de reconstrucción de imagen; un PSNR más alto indica una mejor reconstrucción.

**Ejemplo de Visualización de Calidad de Reconstrucción durante el entrenamiento:**

<p align="center">
  <img src="https://i.imgur.com/your_rendered_image_1.png" alt="Imagen Renderizada y Real" width="600"/>
  <br/>
  <em>Gráfico de PSNR que muestra la convergencia durante el entrenamiento.</em>
</p>

Al finalizar el entrenamiento, se renderizan vistas adicionales de la escena (`render_poses`) para demostrar la capacidad del modelo para sintetizar nuevas vistas desde diferentes ángulos. Estas vistas se visualizan en una cuadrícula.

**Ejemplo de Vistas Renderizadas Adicionales:**

<p align="center">
  <img src="https://i.imgur.com/your_rendered_image_2.png" alt="Vistas Renderizadas Adicionales" width="800"/>
  <br/>
  <em>Múltiples vistas renderizadas por el modelo NeRF después del entrenamiento.</em>
</p>

Finalmente, si el entorno de ejecución es Google Colab, el script intenta generar un video a partir de las vistas renderizadas, lo que proporciona una demostración dinámica de la reconstrucción 3D.

```python
# Ejemplo de cómo se muestra una imagen de prueba
plt.figure(figsize=(8, 8))
plt.imshow(testimg)
plt.title(f"Imagen de prueba del dataset {scene}")
plt.axis('off')
plt.show()

# Ejemplo de visualización de resultados durante el entrenamiento
plt.figure(figsize=(15,4))
plt.subplot(131)
plt.imshow(np.clip(rgb, 0, 1))
plt.title(f'Iteración: {i}')
plt.axis('off')
plt.subplot(132)
plt.imshow(testimg)
plt.title('Imagen Real')
plt.axis('off')
plt.subplot(133)
plt.plot(iternums, psnrs)
plt.title('PSNR')
plt.xlabel('Iteración')
plt.ylabel('PSNR (dB)')
plt.grid(True)
plt.show()
```

**Nota:** Las URL de las imágenes en las secciones "Calidad de Reconstrucción" son marcadores de posición. Deberás reemplazarlas con capturas de pantalla reales de las salidas de tu notebook si deseas incluir las imágenes en el README final.
