# 🌀 Taller 64 - Visualización de Imágenes y Video 360° con Three.js

## 📋 Descripción

Este proyecto implementa un visualizador inmersivo de **imágenes panorámicas equirectangulares** y **videos 360°** usando **Three.js** con **React Three Fiber**. La aplicación permite una navegación fluida dentro del entorno 360° con controles intuitivos y múltiples opciones de visualización.

## 🚀 Características

- ✅ **Múltiples imágenes 360°** con navegación entre ellas
- ✅ **Video 360°** funcional con controles de reproducción
- ✅ **Navegación libre** con OrbitControls (arrastrar, zoom)
- ✅ **Cambio de escenas** con botones UI y controles de teclado
- ✅ **Interfaz ocultable** para experiencia inmersiva completa
- ✅ **Diseño responsivo** y moderno
- ✅ **Carga asíncrona** con estados de loading

## 🛠️ Tecnologías Utilizadas

- **React 19** - Framework de interfaz de usuario
- **Three.js v0.170** - Biblioteca 3D para WebGL
- **React Three Fiber v9** - Renderer React para Three.js
- **React Three Drei v10** - Utilidades y helpers para R3F
- **Vite** - Build tool y dev server

## 📦 Instalación y Configuración

1. **Instalar dependencias:**
```bash
bun install
# o
npm install
```

2. **Contenido multimedia incluido:**
   - ✅ 4 imágenes panorámicas ya incluidas
   - ⚠️ **OPCIONAL**: Añadir video 360° como `public/video360.mp4`

3. **Ejecutar en desarrollo:**
```bash
bun dev
# o
npm run dev
```

## 🎮 Controles

### 🖱️ Controles de Ratón
- **Arrastrar**: Rotar la vista 360°
- **Rueda del ratón**: Zoom in/out

### ⌨️ Controles de Teclado
- **Tecla 1**: Cambiar a vista de imagen 360°
- **Tecla 2**: Cambiar a vista de video 360°
- **Tecla N**: Siguiente imagen (en modo imagen)
- **Tecla ESC o H**: Mostrar/ocultar interfaz completa

### 🎥 Controles de Video
- **Botón Play/Pause**: Reproducir o pausar el video
- **Navegación libre**: Mientras se reproduce el video

### 🌅 Controles de Imagen
- **Botón "Siguiente Imagen"**: Cicla entre las 6 imágenes disponibles
- **Indicador visual**: Muestra imagen actual (X/6)

### 👁️ Control de Interfaz
- **Botón flotante** (esquina superior derecha): Oculta/muestra toda la UI
- **Modo inmersivo**: Sin distracciones, solo la experiencia 360°

## 🔧 Implementación Técnica

### Múltiples Imágenes 360°

```jsx
// Lista de imágenes disponibles
const IMAGES_360 = [
  { id: 1, src: '/img_equirectangulares.jpeg', name: 'Imagen 1' },
  { id: 2, src: '/img_equirectangulares2.jpeg', name: 'Imagen 2' },
  { id: 3, src: '/img_equirectangulares3.jpg', name: 'Imagen 3' },
  { id: 4, src: '/img_equirectangulares4.jpeg', name: 'Imagen 4' },
  { id: 5, src: '/img_equirectangulares5.jpg', name: 'Imagen 5' },
  { id: 6, src: '/img_equirectangulares6.jpg', name: 'Imagen 6' }
]

// Navegación entre imágenes
const nextImage = () => {
  setCurrentImageIndex((prev) => (prev + 1) % IMAGES_360.length)
}
```

### Interfaz Ocultable

```jsx
// Estado de visibilidad
const [isUIVisible, setIsUIVisible] = useState(true)

// CSS con transiciones suaves
.controls.hidden {
  transform: translateX(-120%);
  opacity: 0;
  pointer-events: none;
}
```

### Esfera Invertida con Textura Dinámica

```jsx
// Componente actualizado para múltiples imágenes
<PanoramaSphere imageSrc={currentImage.src} />

// Esfera invertida con textura equirectangular
<mesh scale={[-1, 1, 1]}>
  <sphereGeometry args={[10, 60, 40]} />
  <meshBasicMaterial 
    map={texture} 
    side={THREE.BackSide}
  />
</mesh>
```

## 📁 Estructura del Proyecto

```
threejs/
├── public/
│   ├── img_equirectangulares.jpeg   ✅ Imagen 1 incluida
│   ├── img_equirectangulares2.jpeg  ✅ Imagen 2 incluida
│   ├── img_equirectangulares3.jpg   ✅ Imagen 3 incluida
│   ├── img_equirectangulares4.jpeg  ✅ Imagen 4 incluida
│   ├── img_equirectangulares5.jpg   ✅ Imagen 5 incluida
│   ├── img_equirectangulares6.jpg   ✅ Imagen 6 incluida
│   └── video360.mp4                ⚠️ OPCIONAL - Añadir si deseas video
├── src/
│   ├── components/
│   │   ├── Scene360.jsx            # Componente imagen 360° (actualizado)
│   │   └── VideoScene360.jsx       # Componente video 360°
│   ├── App.jsx                     # Aplicación principal (con nuevas features)
│   ├── App.css                     # Estilos modernos actualizados
│   ├── main.jsx                    # Punto de entrada
│   └── index.css                   # Estilos globales
├── package.json                    # Dependencias React 19 + R3F v9
└── README.md                       # Esta documentación
```

## 🎨 Diseño UI/UX

### Interfaz Principal
- **Panel de control** flotante con todos los controles
- **Botones de navegación** para cambiar entre escenas
- **Controles específicos** para cada modo (imagen/video)
- **Indicadores visuales** del estado actual

### Experiencia Inmersiva
- **Modo oculto** para experiencia sin distracciones
- **Botón flotante** siempre accesible para restaurar UI
- **Transiciones suaves** entre estados
- **Feedback visual** inmediato

### Navegación de Imágenes
- **Ciclo automático** entre las 6 imágenes disponibles
- **Contador visual** (X/6) para orientación
- **Nombres descriptivos** para cada imagen
- **Carga optimizada** con Suspense

## 🚨 Recursos Incluidos

### ✅ Imágenes 360° (INCLUIDAS)
- **Imagen 1**: `img_equirectangulares.jpeg` (514KB)
- **Imagen 2**: `img_equirectangulares2.jpeg` (548KB) 
- **Imagen 3**: `img_equirectangulares3.jpg` (77KB)
- **Imagen 4**: `img_equirectangulares4.jpeg` (1.1MB)
- **Imagen 5**: `img_equirectangulares5.jpg` (191KB)
- **Imagen 6**: `img_equirectangulares6.jpg` (500KB)

### ⚠️ Video 360° (OPCIONAL)
Si deseas activar la funcionalidad de video, descarga un video 360° y guárdalo como `public/video360.mp4`

**Fuentes recomendadas:**
- [Pexels - Videos 360°](https://www.pexels.com/search/360%20video/)
- [Sample Videos - 360°](https://sample-videos.com/download-mp4-360-video/)

## 🎓 Nuevas Funcionalidades Añadidas

### 1. 🔄 Navegación entre Imágenes
- **6 imágenes panorámicas** diferentes incluidas
- **Botón dedicado** para cambiar entre imágenes
- **Contador visual** del progreso
- **Atajo de teclado** (N) para navegación rápida

### 2. 👁️ Interfaz Ocultable
- **Botón flotante** para ocultar/mostrar toda la UI
- **Modo inmersivo** sin distracciones
- **Atajos de teclado** (ESC, H) para control rápido
- **Transiciones suaves** entre estados

### 3. 🎮 Controles Mejorados
- **Más atajos de teclado** para todas las funciones
- **Feedback visual** mejorado
- **Instrucciones actualizadas** en tiempo real
- **Diseño responsivo** optimizado

## 🔄 Próximas Mejoras

- [ ] **Carga de imágenes personalizadas** desde archivo
- [ ] **Playlist de imágenes** con reproducción automática
- [ ] **Hotspots interactivos** en las imágenes
- [ ] **Efectos de transición** entre imágenes
- [ ] **Metadatos de imágenes** (ubicación, descripción)
- [ ] **Modo presentación** automático

## 📚 Referencias

- [Three.js VideoTexture Documentation](https://threejs.org/docs/#api/en/textures/VideoTexture)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
- [React Three Drei Components](https://github.com/pmndrs/drei)
- [Equirectangular Projection](https://en.wikipedia.org/wiki/Equirectangular_projection)

---

**Desarrollado para el Taller 64 - Computación Visual**  
*Visualización inmersiva con Three.js y React - Versión Mejorada*
