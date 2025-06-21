# ♻️ EcoScan 3D

**Autores:** Juan Medina, Daniel Montañez, Daniel Soracipa, Sergio Ruiz  
**Curso:** Computación Visual – Proyecto Final  
**Tecnologías:** Three.js · Flask · YOLOv5 · OpenAI · WebSockets · Python · JavaScript

---

## 📄 Descripción

**EcoScan 3D** es una plataforma web interactiva que combina visión por computador, inteligencia artificial y visualización 3D para fomentar el reciclaje consciente. El sistema permite al usuario subir una imagen o utilizar su cámara en tiempo real para detectar residuos mediante **YOLOv5**, generar **recomendaciones personalizadas** con **ChatGPT**, y visualizar los objetos reciclables en un entorno 3D educativo utilizando **Three.js**.

---

## 🚀 Características principales

- 🖼️ Subida de imágenes o uso de cámara en vivo para análisis
- 🧠 Detección de objetos reciclables usando YOLOv5
- 🤖 Consejos de reciclaje generados por ChatGPT
- 🌐 Visualización 3D interactiva de objetos detectados
- 🔄 Comunicación en tiempo real mediante WebSockets

---

## 📁 Estructura del Proyecto

```plaintext
EcoScan-3D/
 ┣ frontend/         # Visualización 3D con Three.js
 ┣ backend/          # Flask + YOLO + ChatGPT
 ┣ README.md
 ┗ requirements.txt  # Dependencias Python
```

---

## 🔧 Tecnologías utilizadas

**Frontend:**
- Three.js
- HTML/CSS/JavaScript
- WebSocket Client

**Backend:**
- Python 3.10+
- Flask + Flask-SocketIO
- YOLOv5 (Ultralytics)
- OpenAI API (ChatGPT)

---

## 🔗 Recursos externos

- Dataset TACO: [https://tacodataset.org](https://tacodataset.org)
- YOLOv5: [https://github.com/ultralytics/yolov5](https://github.com/ultralytics/yolov5)
- OpenAI API: [https://platform.openai.com/docs](https://platform.openai.com/docs)
- Three.js: [https://threejs.org](https://threejs.org)

---

## 📌 Estado del proyecto

- ✅ Fase de diseño y arquitectura completada
- 🔄 Desarrollo en curso: integración de detección con visualización 3D
- 🎯 Próxima meta: conexión completa con ChatGPT + pruebas en tiempo real

---

## 📜 Licencia

Este proyecto se desarrolla con fines académicos. Licencia educativa abierta.

