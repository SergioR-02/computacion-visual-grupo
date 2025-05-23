# 🌀 Taller 64 - Visualización de Imágenes y Video 360° con Three.js

## 📅 Fecha
`2025-05-22` – Taller de visualización inmersiva 360°

---

## 🎯 Objetivo del Taller

Implementar un visualizador web inmersivo para **imágenes panorámicas equirectangulares** y **videos 360°** usando **Three.js con React Three Fiber**. El objetivo es crear una experiencia navegable que permita explorar contenido 360° con controles intuitivos y múltiples opciones de visualización, aplicando conceptos de mapeo de texturas esféricas y renderizado 3D en tiempo real.

---

## 🧠 Conceptos Aprendidos

Lista los principales conceptos aplicados:

- [x] Transformaciones geométricas (escala, rotación, traslación)
- [x] Mapeo UV y proyección de texturas esféricas
- [x] Renderizado 3D en tiempo real con WebGL
- [x] Navegación 3D con controles orbitales
- [x] Manejo de texturas de video dinámicas
- [x] Interfaz de usuario reactiva e inmersiva
- [x] Proyección equirectangular en geometría esférica invertida

---

## 🔧 Herramientas y Entornos

Especifica los entornos usados:

- **React 19** - Framework de interfaz de usuario moderna
- **Three.js v0.170** - Biblioteca 3D para renderizado WebGL
- **React Three Fiber v9** - Bridge declarativo entre React y Three.js
- **React Three Drei v10** - Utilidades y helpers para R3F
- **Vite** - Build tool y servidor de desarrollo rápido
- **Bun** - Runtime de JavaScript para gestión de dependencias

📌 Proyecto implementado completamente en entorno web con tecnologías modernas

---

## 📁 Estructura del Proyecto

```
2025-05-22_taller_imagenes_video_360_unity_threejs/
├── threejs/                          # Implementación Three.js + React
│   ├── public/                       # Recursos estáticos
│   │   ├── img_equirectangulares.jpeg    # Imagen panorámica 1
│   │   ├── img_equirectangulares2.jpeg   # Imagen panorámica 2
│   │   ├── img_equirectangulares3.jpg    # Imagen panorámica 3
│   │   ├── img_equirectangulares4.jpeg   # Imagen panorámica 4
│   │   ├── img_equirectangulares5.jpg    # Imagen panorámica 5
│   │   ├── img_equirectangulares6.jpg    # Imagen panorámica 6
│   │   └── video360.mp4              # Video 360° (opcional)
│   ├── src/                          # Código fuente
│   │   ├── components/               # Componentes React
│   │   │   ├── Scene360.jsx         # Componente imagen 360°
│   │   │   └── VideoScene360.jsx    # Componente video 360°
│   │   ├── App.jsx                  # Aplicación principal
│   │   ├── App.css                  # Estilos de la aplicación
│   │   └── main.jsx                 # Punto de entrada
│   ├── package.json                 # Dependencias del proyecto
│   └── vite.config.js              # Configuración de Vite
├── resultados/                       # Capturas y evidencias
│   └── resultados.gif               # Demostración animada del proyecto
└── README.md                        # Esta documentación
```

📎 Estructura optimizada para desarrollo web moderno con React y Three.js

---

## 🧪 Implementación

### 🔹 Etapas realizadas
1. **Configuración del entorno**: Setup de React + Three.js con Vite
2. **Creación de geometría esférica invertida**: Implementación de esfera con normales hacia adentro
3. **Mapeo de texturas equirectangulares**: Aplicación de imágenes 360° como texturas
4. **Sistema de navegación**: Integración de OrbitControls para exploración libre
5. **Interfaz de usuario**: Controles para cambio de escenas y modo inmersivo
6. **Implementación de video 360°**: Integración de texturas de video dinámicas

### 🔹 Código relevante

Núcleo de la implementación - Esfera invertida con textura 360°:

```jsx
// Componente principal para imagen 360°
function PanoramaSphere({ imageSrc }) {
  const texture = useTexture(imageSrc)
  
  return (
    <mesh scale={[-1, 1, 1]}> {/* Escala negativa en X para invertir */}
      <sphereGeometry args={[10, 60, 40]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.BackSide} // Renderizar cara interna
      />
    </mesh>
  )
}

// Navegación entre múltiples imágenes
const IMAGES_360 = [
  { id: 1, src: '/img_equirectangulares.jpeg', name: 'Imagen 1' },
  { id: 2, src: '/img_equirectangulares2.jpeg', name: 'Imagen 2' },
  // ... más imágenes
]

const nextImage = () => {
  setCurrentImageIndex((prev) => (prev + 1) % IMAGES_360.length)
}
```

Video 360° con textura dinámica:

```jsx
// Implementación de video 360°
useEffect(() => {
  const video = document.createElement('video')
  video.src = '/video360.mp4'
  video.crossOrigin = 'anonymous'
  video.loop = true
  video.muted = true
  
  const videoTexture = new THREE.VideoTexture(video)
  videoTexture.minFilter = THREE.LinearFilter
  videoTexture.magFilter = THREE.LinearFilter
  
  setTexture(videoTexture)
  setVideoElement(video)
}, [])
```

---

## 📊 Resultados Visuales

### 📌 Demostración completa del visualizador 360°:

![Visualizador 360° con navegación inmersiva](./resultados/resultados.gif)

El GIF muestra:
- ✅ **Navegación fluida 360°** con controles de mouse
- ✅ **Cambio entre múltiples imágenes panorámicas** (6 escenas diferentes)
- ✅ **Reproducción de video 360°** con controles integrados
- ✅ **Interfaz ocultable** para experiencia inmersiva completa
- ✅ **Controles de teclado** y navegación intuitiva
- ✅ **Transiciones suaves** entre diferentes modos de visualización

---

## 🎮 Controles Implementados

### 🖱️ Controles de Ratón
- **Arrastrar**: Rotar la vista 360° en cualquier dirección
- **Rueda del ratón**: Zoom in/out para explorar detalles

### ⌨️ Controles de Teclado
- **Tecla 1**: Cambiar a modo de imagen 360°
- **Tecla 2**: Cambiar a modo de video 360°
- **Tecla N**: Siguiente imagen panorámica
- **Tecla ESC o H**: Mostrar/ocultar interfaz completa

### 🎥 Controles de Video
- **Botón Play/Pause**: Control de reproducción del video 360°
- **Navegación libre**: Exploración mientras se reproduce

### 👁️ Control de Interfaz
- **Botón flotante**: Oculta/muestra toda la UI para modo inmersivo
- **Modo sin distracciones**: Experiencia 360° pura

---

## 💬 Reflexión Final

Este taller me permitió profundizar en el **renderizado 3D en tiempo real** aplicado a experiencias inmersivas. La implementación de visualización 360° requirió comprender conceptos fundamentales como la **proyección equirectangular**, el **mapeo UV en geometrías esféricas** y la **inversión de normales** para crear una experiencia desde el interior de la esfera.

La parte más interesante fue integrar **texturas dinámicas de video** con **Three.js**, lo que implicó manejar el ciclo de vida de elementos HTML video y sincronizarlos con el renderizado WebGL. También fue desafiante crear una **interfaz de usuario no intrusiva** que permitiera alternar entre modo de exploración y modo inmersivo completo.

Para futuros proyectos, aplicaría estos conceptos en **experiencias VR/AR**, **recorridos virtuales interactivos** y **visualización de datos en entornos 3D**. La base técnica establecida es sólida para expandir hacia **realidad virtual** usando WebXR o **aplicaciones móviles** con tecnologías híbridas.