# 🧪 Taller - IA Visual Colaborativa: Comparte tus Resultados en Web

## 🔍 Objetivo del taller

Desarrollar una solución donde los **resultados de un modelo visual de IA (detecciones, métricas o imágenes)** puedan compartirse en una **página web sencilla**. El objetivo es permitir que otros usuarios o compañeros vean y comprendan visualmente qué fue detectado, cómo se comportó el sistema y qué resultados produjo.

---

## 📁 Estructura del proyecto

```
2025-06-20_taller_ia_visual_web_colaborativa/
├── README.md
├── python/
│   ├── detector.py          # Script principal de detección con YOLO
│   ├── requirements.txt     # Dependencias de Python
│   ├── models/             # Modelos de IA (YOLO weights)
│   └── data/               # Imágenes de prueba
├── web/
│   ├── index.html          # Página principal
│   ├── style.css           # Estilos CSS
│   ├── script.js           # Lógica JavaScript con Three.js
│   └── data/               # Resultados JSON de Python
├── results/
│   ├── images/             # Imágenes anotadas
│   ├── json/               # Archivos JSON con detecciones
│   └── csv/                # Estadísticas en CSV
└── docs/
    └── tutorial.md         # Guía paso a paso
```

---

## 🔹 Actividades por entorno

### 💻 Parte 1 - Python (procesamiento y exportación)

**Herramientas utilizadas:**
- `ultralytics` (YOLO v8)
- `opencv-python`
- `matplotlib`
- `json`, `csv`, `os`

**Funcionalidades:**
1. Captura de imagen/video y aplicación de YOLO
2. Guardado de resultados como imagen anotada
3. Exportación de datos en JSON con bounding boxes
4. Generación de estadísticas en CSV

### 🌐 Parte 2 - Web interactiva (HTML/Three.js)

**Tecnologías:**
- HTML5 + CSS3
- Three.js para visualización 3D
- JavaScript vanilla

**Funcionalidades:**
1. Carga de resultados JSON desde Python
2. Visualización 3D de detecciones
3. Interfaz interactiva con controles
4. Display de métricas y estadísticas

---

## 🚀 Instrucciones de uso

### ⚡ Configuración automática (recomendado)

```bash
# Ir al directorio Python
cd python

# Ejecutar configuración automática
python setup.py
```

Este script automáticamente:
- ✅ Verifica dependencias
- ✅ Instala paquetes necesarios  
- ✅ Descarga modelo YOLO
- ✅ Crea imagen de prueba
- ✅ Ejecuta detección de test
- ✅ Configura directorios

### 🔧 Configuración manual

1. **Instalar dependencias de Python:**
```bash
cd python
pip install -r requirements.txt
```

2. **Crear imagen de prueba:**
```bash
python create_test_image.py
```

3. **Ejecutar detección:**
```bash
python detector.py --source test_image.jpg
```

4. **Abrir visualización web:**
```bash
cd ../web
python -m http.server 8000
# Visitar: http://localhost:8000
```

---

## 📊 Resultados esperados

- **Imágenes anotadas** con bounding boxes y etiquetas
- **Archivos JSON** con coordenadas y confianza de detecciones
- **Visualización 3D** interactiva en el navegador
- **Métricas** de rendimiento y estadísticas

---

## 🎯 Objetivos de aprendizaje

1. Integración de modelos de IA con interfaces web
2. Exportación y visualización de datos de detección
3. Creación de dashboards interactivos con Three.js
4. Flujo completo de datos desde procesamiento hasta visualización

---

## 🔗 Enlaces útiles

- [YOLO v8 Documentation](https://docs.ultralytics.com/)
- [Three.js Documentation](https://threejs.org/docs/)
- [OpenCV Python Tutorials](https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html)
