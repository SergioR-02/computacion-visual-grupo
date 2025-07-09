# 📦 BACKLOG - Proyecto de Reciclaje

## 🧠 Objetivo del Proyecto

Desarrollar una aplicación web que utiliza inteligencia artificial para detectar objetos reciclables en imágenes o cámara en tiempo real, mostrando visualizaciones 3D interactivas y proporcionando consejos personalizados de reciclaje mediante IA generativa.

## 🎯 Descripción del Proyecto

Nuestro proyecto busca educar al usuario mientras interactúa con sus propios residuos, permitiéndole cargar imágenes o usar su cámara para detectar objetos reciclables. Luego, a través de modelos de inteligencia artificial como YOLO, identificamos estos elementos y mostramos visualizaciones 3D representativas. Finalmente, utilizando ChatGPT, generamos consejos personalizados para reciclar de forma adecuada.

La experiencia completa ocurre en un entorno web accesible, con visualización interactiva en Three.js que guía al usuario de forma dinámica y educativa.

## 🛠️ Planificación de Desarrollo

| Fecha | Tarea | Descripción | Entregable | Recursos/Tecnologías |
|-------|-------|-------------|------------|---------------------|
| **Junio 18** | Análisis de requerimientos | Levantamiento de requerimientos y definición de alcance del proyecto | Documento de requerimientos y casos de uso | Google Docs |
| **Junio 23** | Diseño de mockups | Creación de wireframes y mockups de la interfaz de usuario | Prototipo visual en Figma | Figma |
| **Junio 25** | Landing page inicial | Implementación de la página de inicio con información sobre reciclaje | Sitio web básico funcionando | HTML, CSS, JavaScript |
| **Junio 30** | Animaciones y scroll | Renderizado con scroll y animación, búsqueda de datasets para entrenamiento YOLO | Landing page con animaciones + Dataset curado | Three.js, GSAP, Datasets de residuos |
| **Julio 2** | Funcionalidad de cámara | Implementación de captura de video y maquetado de la interfaz | Sistema de cámara web funcionando | WebRTC, HTML5 Canvas |
| **Julio 7** | Maquetado de objetos 3D | Modelado de objetos para detección de basuras y búsqueda de ejemplos para entrenamiento | Modelos 3D de residuos + Dataset ampliado | Three.js, Python |
| **Julio 9** | Integración de IA generativa | Implementación de API de Google IA, ChatGPT o alternativa para consejos de reciclaje | Sistema de consejos personalizado | OpenAI API, Google AI, Python |
| **Julio 14** | Modelo YOLO finalizado | Finalización del modelo de IA para reconocimiento correcto de residuos | Modelo YOLO entrenado y optimizado | YOLOv8, PyTorch, Python |
| **Julio 16** | Integración Backend-Frontend | Conexión por WebSockets entre backend y frontend para tiempo real | Sistema completo integrado | WebSockets, Node.js, Python |
| **Julio 21** | Pruebas y despliegue | Testing completo del sistema y despliegue en producción | Aplicación desplegada y funcional | Docker, AWS/Heroku, Testing |

