# 🎨 Computación Visual - Proyecto Grupal

## 👥 Integrantes del Equipo

- **Cristian Daniel Montañez Pineda**
- **Sergio Alejandro Ruiz Hurtado**
- **Juan Jose Medina Guerrero**
- **Daniel Felipe Soracipa Torres**

---

## 📋 Descripción General

Este repositorio contiene una colección completa de **talleres prácticos de computación visual** desarrollados durante el semestre 2025. El proyecto abarca desde conceptos fundamentales de visión por computadora hasta implementaciones avanzadas de interfaces multimodales, renderizado 3D y sistemas de inteligencia artificial aplicada.

Cada taller está diseñado como una experiencia de aprendizaje práctica que combina **teoría sólida** con **implementación hands-on**, utilizando tecnologías modernas como **Python**, **Three.js**, **React**, **MediaPipe**, **Unity** y **OpenCV**.

---

## 🎯 Objetivos del Proyecto

### 🔬 Objetivos Académicos
- Dominar los fundamentos de **visión por computadora** y **gráficos 3D**
- Implementar **algoritmos de procesamiento de imágenes** y **reconocimiento de patrones**
- Desarrollar **interfaces multimodales** que combinen voz, gestos y visualización
- Aplicar **técnicas de renderizado avanzado** (PBR, shaders, sistemas de partículas)
- Explorar **inteligencia artificial aplicada** a problemas visuales

### 🛠️ Objetivos Técnicos
- Integrar múltiples **tecnologías y frameworks** en proyectos cohesivos
- Optimizar **rendimiento gráfico** para aplicaciones web y de escritorio
- Implementar **sistemas en tiempo real** con procesamiento de señales
- Desarrollar **arquitecturas modulares** y **código reutilizable**
- Crear **experiencias de usuario inmersivas** e **interactivas**

---

## 🗂️ Estructura del Proyecto

```
computacion-visual-grupo/
├── 📁 Talleres de Interfaces y Reconocimiento
│   ├── 2025-05-26_taller_interfaces_multimodales_voz_gestos/
│   ├── 2025-05-24_taller_gestos_webcam_mediapipe/
│   ├── 2025-05-24__taller_reconocimiento_voz_local/
│   └── 2025-05-23_taller_bci_simulado_control_visual/
│
├── 📁 Talleres de Gráficos 3D y Renderizado
│   ├── 2025-05-24_taller_materiales_pbr_unity_threejs/
│   ├── 2025-05-23_taller_shaders_basicos_unity_threejs/
│   ├── 2025-05-24_taller_texturizado_dinamico_shaders_particulas/
│   ├── 2025-05-24_taller_uv_mapping_texturas/
│   └── 2025-05-24_taller_colisiones_y_particulas/
│
├── 📁 Talleres de Visión y Percepción
│   ├── 2025-05-17_taller_modelos_color_percepcion/
│   ├── 2025-05-24_taller_proyecciones_camara_virtual/
│   ├── 2025-05-24_taller_espacios_proyectivos/
│   └── 2025-05-22_taller_imagenes_video_360/
│
├── 📁 Talleres de Modelado y Optimización
│   ├── 2025-05-17_taller_modelado_procedural_basico/
│   ├── 2025-04-24_taller_optimizar_graficos/
│   └── 2025-04-23_taller_input_ui/
│
├── 📁 Talleres de IA y Procesamiento de Señales
│   └── 2025-05-24_taller56_kalman_inferencia/
│
├── 📁 Presentaciones/
│   └── 2025_05_21_proyecto_final_p1.pdf
│
├── .gitignore
├── .gitattributes
└── README.md
```

---

## 🧠 Conceptos y Tecnologías Dominadas

### 🤖 Inteligencia Artificial y Reconocimiento
- **MediaPipe**: Detección de gestos y landmarks faciales/corporales
- **Speech Recognition**: Procesamiento de voz local y en la nube
- **Filtro de Kalman**: Inferencia de variables ocultas y seguimiento de objetos
- **BCI Simulado**: Interfaces cerebro-computadora con señales EEG sintéticas
- **Computer Vision**: Algoritmos de detección, clasificación y seguimiento

### 🎨 Gráficos 3D y Renderizado
- **PBR (Physically Based Rendering)**: Materiales fotorrealistas
- **Shaders GLSL**: Programación de vertex y fragment shaders
- **Three.js + React Three Fiber**: Desarrollo web 3D moderno
- **Unity**: Motor de juegos y aplicaciones interactivas
- **Sistemas de Partículas**: Efectos visuales dinámicos y procedurales
- **UV Mapping**: Texturizado preciso de modelos 3D

### 🔬 Visión por Computadora
- **Modelos de Color**: RGB, HSV, CIE Lab y transformaciones
- **Proyecciones 3D**: Perspectiva vs ortográfica, matrices de cámara
- **Espacios Proyectivos**: Geometría euclidiana, afín y proyectiva
- **Procesamiento de Imágenes**: Filtros, convoluciones y efectos
- **Video 360°**: Visualización inmersiva y mapeo esférico

### 🛠️ Desarrollo y Optimización
- **React + TypeScript**: Interfaces modernas y tipado fuerte
- **Python + OpenCV**: Procesamiento de imágenes y video
- **Optimización Gráfica**: LOD, frustum culling, compresión de texturas
- **Arquitecturas Modulares**: Código reutilizable y mantenible
- **Sistemas en Tiempo Real**: Threading, colas de eventos y sincronización

---

## 🏆 Talleres Destacados

### 🌟 **Interfaces Multimodales: Voz + Gestos**
**Tecnologías**: Python, MediaPipe, SpeechRecognition, OpenCV
- Sistema completo que fusiona **detección de gestos** con **comandos de voz**
- Reconocimiento de 5 gestos diferentes (mano abierta, puño, paz, OK, señalar)
- Comandos de voz en español con síntesis de respuesta
- Objeto interactivo que responde a **combinaciones específicas** de gesto+voz
- **Arquitectura modular** con 4 clases principales y threading avanzado

### 🎨 **Materiales PBR Fotorrealistas**
**Tecnologías**: Three.js, React Three Fiber, GLSL, Leva
- Implementación completa de **Physically Based Rendering**
- Materiales que responden correctamente a **iluminación física**
- Control en tiempo real de **roughness**, **metalness** y **normal maps**
- Comparación directa entre materiales básicos y PBR
- **Mapas de entorno HDRI** para reflexiones realistas

### 🧪 **Simulador BCI (Brain-Computer Interface)**
**Tecnologías**: Python, SciPy, NumPy, Pygame
- Generación de **señales EEG sintéticas** en tiempo real
- Procesamiento de **bandas espectrales** (Alpha, Beta, Theta)
- Clasificación de **estados mentales** (concentración, relajación, alerta)
- **Visualización interactiva** con efectos reactivos a la actividad cerebral
- **Arquitectura concurrente** con hilos separados para cada proceso

### 🎮 **Sistemas de Colisiones y Partículas**
**Tecnologías**: Three.js, Cannon.js, React Three Fiber
- **Motor de físicas** completo con gravedad y colisiones realistas
- **Sistema de partículas dinámico** que reacciona a impactos
- **Efectos visuales** procedurales (explosiones, chispas, trails)
- **Interactividad avanzada** con click para añadir objetos
- **Optimización de rendimiento** para cientos de partículas simultáneas

---

## 📊 Estadísticas del Proyecto

### 📈 Métricas de Desarrollo
- **20+ Talleres** implementados y documentados
- **2 Tecnologías principales**: Python, JavaScript
- **15+ Librerías** integradas (MediaPipe, Three.js, OpenCV, etc.)
- **50+ Conceptos** de computación visual aplicados

### 🛠️ Tecnologías por Categoría
```
🐍 Python: MediaPipe, OpenCV, NumPy, SciPy, Pygame
🌐 Web: Three.js, React, TypeScript, GLSL
🔧 Herramientas: Git, Vite, Jupyter, Blender
```

### 📚 Áreas de Conocimiento
```
🤖 IA/ML: Reconocimiento, Clasificación, Filtros
🎨 Gráficos 3D: Renderizado, Shaders, Materiales
🔬 Visión Computacional: Procesamiento, Transformaciones
🖥️ Interfaces: Multimodal, Tiempo Real, UX
```

---

### 📖 Documentación Detallada
Cada taller incluye su propio **README.md** con:
- ✅ Objetivos específicos y conceptos aprendidos
- ✅ Instrucciones de instalación paso a paso
- ✅ Código comentado y explicaciones técnicas
- ✅ Resultados visuales (GIFs, imágenes, videos)
- ✅ Reflexiones y aprendizajes obtenidos

---

## 🎓 Aprendizajes y Reflexiones

### 💡 Conceptos Clave Dominados

**🔬 Visión por Computadora**
- La **percepción visual humana** es compleja y puede simularse computacionalmente
- Los **modelos de color** (RGB, HSV, Lab) tienen aplicaciones específicas según el contexto
- La **detección de patrones** requiere algoritmos robustos y tolerantes al ruido
- Las **transformaciones geométricas** son fundamentales para el procesamiento de imágenes

**🎨 Gráficos 3D**
- El **renderizado físicamente correcto** (PBR) produce resultados fotorrealistas
- Los **shaders** ofrecen control total sobre la apariencia visual
- La **optimización** es crucial para aplicaciones en tiempo real
- Las **proyecciones de cámara** determinan cómo percibimos el espacio 3D

**🤖 Interfaces Inteligentes**
- Las **interfaces multimodales** son más naturales e intuitivas
- La **fusión de modalidades** requiere sincronización temporal precisa
- Los **sistemas en tiempo real** necesitan arquitecturas concurrentes robustas
- El **feedback inmediato** es esencial para la experiencia de usuario


---

## 🔮 Perspectivas Futuras

### 🎯 Próximos Desarrollos
- **Integración con IA generativa** para contenido dinámico
- **Optimización para dispositivos móviles** y edge computing
- **Implementación de realidad mixta** (MR) avanzada
- **Sistemas distribuidos** para procesamiento colaborativo

### 🌐 Impacto Esperado
- **Contribución al conocimiento** en computación visual
- **Desarrollo de herramientas** open source para la comunidad
- **Formación de especialistas** en tecnologías emergentes
- **Innovación en interfaces** humano-computadora

---

**🎨 Computación Visual - Transformando Ideas en Experiencias Visuales Interactivas**

*Desarrollado con ❤️ por el equipo de Computación Visual 2025*