# 🧪 Taller - Explorando el Color: Percepción Humana y Modelos Computacionales

## 📅 Fecha

`2025-05-17` – Fecha de realización

---

## 🎯 Objetivo del Taller

Investigar cómo los seres humanos perciben el color y cómo esta percepción puede ser representada computacionalmente mediante diferentes modelos de color (RGB, HSV, CIE Lab). Además, se aplicaron transformaciones visuales que simulan condiciones especiales como daltonismo o ambientes de baja iluminación para estudiar su impacto perceptual y funcional.
---

## 🧠 Conceptos Aprendidos

Lista de conceptos clave aplicados en el taller:

- Espacios de color: RGB, HSV, CIE Lab
- Separación de canales de color
- Simulación de visión con deficiencia (protanopía)
- Filtros de temperatura (cálido y frío)
- Reducción de contraste y brillo
- Visualización comparativa con `matplotlib`
- Transformaciones de color en NumPy y OpenCV
- Normalización y visualización de canales individuales

---

## 🔧 Herramientas y Entornos

Especifica los entornos usados:

- Python
  - `opencv-python`
  - `numpy`
  - `matplotlib`
- Jupyter Notebook (compatible con Google Colab)

---

## 📁 Estructura del Proyecto
```
2025-04-28_taller_construyendo_mundo_3d/
├── python/              # Implentacion python/
├── threejs/             # Implentacion react usando threejs/
├── datos/               # Imagen base utilizada
├── resultados/          # Comparaciones y GIFs generados
├── README.md
```
## 🧪 Implementación

Explica el proceso:

### 🔹 Etapas realizadas

#### 🐍 Python
1. Carga de una imagen en formato RGB.
2. Conversión a otros modelos de color: HSV, CIE Lab.
3. Separación y visualización de canales individuales.
4. Simulación de protanopía.
5. Aplicación de filtros: grises, cálido, frío, baja luz, inversión.
6. Visualización comparativa de todos los efectos.

#### 🌐 React.js



###  🔹 Código relevante

### 🐍 Python  
Este bloque de código implementa una función dinámica que permite alternar entre diferentes efectos visuales aplicados a una imagen. La función apply_mode recibe una imagen RGB y un parámetro mode que determina el tipo de transformación que se le aplicará. Entre los modos disponibles están:
- original: muestra la imagen sin alteraciones.
- protanopia: simula daltonismo tipo rojo-verde.
- grayscale: convierte la imagen a escala de grises.
- warm: aplica un filtro de temperatura cálida (más tonos rojizos).
- cool: aplica un filtro de temperatura fría (más tonos azulados).
- low_light: simula un entorno con poca luz reduciendo brillo y contraste

```python
#Función dinámica para alternar entre simulaciones
def apply_mode(img, mode):
    if mode == 'original':
        return img / 255.0
    elif mode == 'protanopia':
        return simulate_protanopia(img)
    elif mode == 'grayscale':
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        return np.stack([gray]*3, axis=-1) / 255.0
    elif mode == 'warm':
        return apply_temperature_filter(img, 'warm')
    elif mode == 'cool':
        return apply_temperature_filter(img, 'cool')
    elif mode == 'low_light':
        return reduce_brightness_contrast(img) / 255.0

# Cambia el modo aquí para probar diferentes efectos
mode = 'grayscale'  # Opciones: original, protanopia, grayscale, warm, cool, low_light

# Mostrar imagen con el modo seleccionado
plt.imshow(apply_mode(img_rgb, mode))
plt.title(f"Modo aplicado: {mode}")
plt.axis('off')
plt.show()
```

### 🌐 React Three Fiber (App.jsx)


```jsx

```


## 📊 Resultados Visuales
### 🐍 Python   

#### 🎞️ RGB.
![Resultado Python](resultados/RGB.png)

#### 🎞️ HSV
![Resultado Python](resultados/HSV.png)

#### 🎞️ L* a* b*
![Resultado Python](resultados/Canales.png)

#### 📊 Comparación de transformaciones
![Resultado Python](resultados/Transformaciones.png)

#### 🎞️ Proceso completo en ejecución (GIF)
![Resultado Python](resultados/PythonResultado.gif)


### 🌐 React  




---

🧩 Prompts Usados


- "Simula daltonismo tipo protanopía con matrices de transformación de color"
- "Aplica un filtro cálido y otro frío a una imagen RGB usando NumPy y OpenCV"
- "Genera una comparación visual entre canales HSV y Lab"

---

💬 Reflexión Final  

Este taller nos permitió profundizar en la relación entre percepción visual humana y representaciones digitales de color. Aprendí cómo distintas representaciones (HSV, Lab) separan componentes del color útiles para manipulación visual, segmentación o simulación. Visualizar cada canal ayudó a comprender cómo cada dimensión afecta la percepción global.

La parte más interesante fue simular deficiencias visuales y observar cómo una imagen puede perder distinciones críticas. También fue útil aprender cómo ajustar filtros para lograr efectos visuales cálidos o fríos de manera precisa. En futuros proyectos, aplicaría estos conceptos para mejorar la accesibilidad de interfaces visuales o generar transformaciones más perceptuales en procesamiento de imágenes y videojuegos.
