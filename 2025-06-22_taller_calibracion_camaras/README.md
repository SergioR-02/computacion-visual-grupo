# 🎯 Taller de Calibración de Cámaras: Una y Dos Cámaras con Python

📅 **Fecha:** 2025-06-22 – Fecha de realización

🎯 **Objetivo del Taller:**
Aprender los fundamentos de la calibración de cámaras mediante patrones de tablero de ajedrez, incluyendo la calibración de una sola cámara y de un sistema estéreo. Aplicar estos conocimientos para tareas como reconstrucción 3D, estimación de profundidad y visión estéreo.

## 🧠 Conceptos Aprendidos

Lista de conceptos clave aplicados en el taller:

* **Modelado de cámara**: El modelo pinhole y cómo se relaciona con los parámetros intrínsecos.
* **Distorsión óptica**: Identificación y corrección de distorsiones radiales y tangenciales.
* **Geometría epipolar**: Fundamentos matemáticos de la visión estéreo.
* **Validación visual**: Importancia de verificar visualmente los resultados de calibración.

## 🔧 Herramientas y Entornos

* Python + OpenCV
* NumPy
* Matplotlib
* SciPy

## 📁 Estructura del Proyecto

```
taller_calibracion_camaras/
├── python/
│   ├── una_camara/
│   │   └── calibracion_una_camara.py
│   ├── dos_camaras/
│   │   └── calibracion_estereo.py
│   ├── imagenes/
│   │   ├── calibracion_una_camara/
│   │   ├── calibracion_estereo/
│   │   │   ├── izquierda/
│   │   │   └── derecha/
│   │   └── patron_ajedrez.jpg
│   ├── generar_patron.py
│   └── README.md
├── resultados
└── requirements.txt
```

## 🧪 Implementación

La implementación de este taller se centra en la calibración de cámaras utilizando imágenes de patrones de tablero de ajedrez. Se desarrollaron scripts en Python que permiten realizar las siguientes tareas:

- **Generación de imágenes**: Crear imágenes sintéticas y reales del patrón de calibración.
- **Calibración de una cámara**: Determinar los parámetros intrínsecos y extrínsecos de una cámara.
- **Calibración estéreo**: Establecer la relación geométrica entre dos cámaras.
- **Rectificación**: Alinear imágenes para facilitar la correspondencia estéreo.
- **Visualización de resultados**: Generar gráficos y correcciones visuales para validar los resultados obtenidos.

### 🔹 Etapas realizadas

1. **Generación de patrón**: Creación de un patrón de tablero de ajedrez personalizable.
2. **Calibración una cámara**: Detección de esquinas y cálculo de parámetros intrínsecos.
3. **Validación**: Cálculo de error de reproyección y corrección de distorsión.
4. **Calibración estéreo**: Calibración individual y conjunta de dos cámaras.
5. **Rectificación**: Alineación de imágenes estéreo para correspondencia.
6. **Visualización**: Generación de imágenes de validación y resultados.

### 🔹 Código relevante

📌 **1. Calibración de una cámara**

```python
ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera(
    objpoints, imgpoints, gray.shape[::-1], None, None
)
```
📌 **2. Calibración estéreo**

```python
retStereo, cameraMatrix1, distCoeffs1, cameraMatrix2, distCoeffs2, R, T, E, F = cv2.stereoCalibrate(
    objpoints, imgpoints_left, imgpoints_right,
    mtx_left, dist_left,
    mtx_right, dist_right,
    gray_left.shape[::-1],
    criteria=criteria,
    flags=flags
)
```

📌 **3. Rectificación estéreo**

```python
R1, R2, P1, P2, Q, roi_left, roi_right = cv2.stereoRectify(
    cameraMatrix1, distCoeffs1,
    cameraMatrix2, distCoeffs2,
    gray_left.shape[::-1], R, T,
    flags=cv2.CALIB_ZERO_DISPARITY,
    alpha=0.9
)
```

## 📊 Resultados y Análisis

### 📌 Patrón de Calibración
![Patrón de Calibración](./resutados/Resultados_Calibraciones.gif)

### 📌 Calibración de Una Cámara y dos Camaras

![Detección de Esquinas](./resutados/Resultados_Visualizacion_unaCamara-DosCamras.gif)





🧩 **Prompts Usados**

"Detecta esquinas en imágenes de calibración para una cámara."

"Realiza calibración estéreo y calcula parámetros geométricos."

"Genera imágenes rectificadas para correspondencia estéreo."

"Calcula error de reproyección y valida resultados visualmente."

## 💬 Reflexión Final

Este taller me permitió comprender los fundamentos matemáticos y prácticos de la calibración de cámaras, un proceso esencial en visión por computador. Aprendí a extraer los parámetros intrínsecos de una sola cámara y a establecer la relación geométrica entre dos cámaras en un sistema estéreo.

