# 🎭 Taller - Animaciones por Esqueleto: Sistema Interactivo con Audio Sincronizado

## 📅 Fecha

`2025-06-14` – Taller - Animaciones por Esqueleto: Importando y Reproduciendo Animaciones

---

## 🎯 Objetivo del Taller

Implementar un sistema completo de **animaciones esqueléticas** importando modelos GLB/GLTF con rigs y clips de animación predefinidos. El objetivo es comprender cómo funcionan las animaciones basadas en huesos, controlarlas dinámicamente, y crear una experiencia interactiva enriquecida con sonido sincronizado y una interfaz de usuario profesional.

---

## 🧠 Conceptos Aprendidos

### 🦴 Animaciones por Esqueleto (Skeletal Animation)

- **Definición**: Sistema de animación que utiliza una estructura jerárquica de huesos (bones) para deformar la malla 3D
- **Componentes principales**:
  - ✅ **Rig/Skeleton**: Armadura de huesos que define la estructura del modelo
  - ✅ **Skinning**: Proceso de vincular vértices de la malla a huesos específicos
  - ✅ **Animation Clips**: Secuencias predefinidas de transformaciones de huesos
  - ✅ **Keyframes**: Poses clave que definen el estado del esqueleto en momentos específicos

### 🎬 Control de Animaciones con Three.js

- **useGLTF()**: Hook para cargar modelos 3D con animaciones incluidas
- **useAnimations()**: Hook especializado para gestionar clips de animación
- **Animation Actions**: Objetos que controlan la reproducción de clips específicos
- **Características implementadas**:
  - ✅ Play/Pause dinámico de animaciones
  - ✅ Control de velocidad de reproducción
  - ✅ Transiciones suaves entre diferentes clips
  - ✅ Loop automático y gestión de estados

### 🔊 Sincronización Audio-Visual

- **Sound Events**: Sistema de eventos de sonido sincronizados con momentos específicos de las animaciones
- **Audio Web API**: Generación procedural de sonidos sintéticos para diferentes acciones
- **Características de sincronización**:
  - ✅ Detección de eventos específicos en el ciclo de animación
  - ✅ Reproducción de sonidos contextuales (pasos, saltos, música de baile)
  - ✅ Control de volumen y activación/desactivación
  - ✅ Visualización en tiempo real de eventos de audio

---

## 🔧 Herramientas y Entornos

- **React 19** - Framework de interfaz de usuario con hooks modernos
- **Three.js v0.177** - Motor de renderizado 3D WebGL de última generación
- **React Three Fiber v9** - Integración declarativa de Three.js con React
- **React Three Drei v10** - Biblioteca de helpers y abstracciones para R3F
- **GLB/GLTF Models** - Formato estándar para modelos 3D con animaciones
- **Web Audio API** - API nativa para generación y reproducción de audio
- **CSS3 Animations** - Transiciones y efectos visuales en la UI
- **Vite v4** - Build tool ultrarrápido con hot-reload instantáneo

---

## 📁 Estructura del Proyecto

```
2025-06-14_taller_animaciones_esqueleto_fbx_gltf/
├── threejs/                           # Implementación Three.js
│   ├── public/                        # Recursos estáticos
│   ├── src/                          # Código fuente
│   │   ├── components/               # Componentes React
│   │   │   ├── AnimatedModel.jsx     # Controlador principal de animaciones
│   │   │   ├── ErrorBoundary.jsx     # Manejo de errores
│   │   │   ├── SoundEventIndicator.jsx # Indicador visual de eventos
│   │   │   └── SoundEventIndicator.css # Estilos del indicador
│   │   ├── utils/                    # Utilidades
│   │   │   └── SoundManager.js       # Sistema de gestión de audio
│   │   ├── App.jsx                   # Aplicación principal
│   │   ├── App.css                   # Estilos globales
│   │   └── main.jsx                  # Punto de entrada
├── resultados/                       # Evidencias visuales
└── README.md                        # Esta documentación
```

---

## 🧪 Implementación

### 🔹 Etapas Realizadas

1. **Setup del entorno 3D**: Configuración completa de React Three Fiber con iluminación profesional
2. **Corrección de carga de modelos**: Resolución de errores 404 y configuración correcta de rutas GLB
3. **Sistema de animaciones esqueléticas**: Implementación de control completo de clips de animación
4. **Interfaz flotante y arrastrable**: Panel de controles repositionable con funcionalidad drag & drop
5. **Sistema de audio sincronizado**: Generación procedural de sonidos y sincronización con animaciones
6. **Visualización de eventos**: Indicadores visuales en tiempo real para eventos de sonido
7. **Optimización y pulimiento**: Corrección de errores, mejora de performance y experiencia de usuario

### 🔹 Carga y Control de Modelos Animados

**Implementación del componente principal:**

```jsx
function AnimatedModel({ 
  modelPath, 
  currentAnimation, 
  setCurrentAnimation, 
  setAvailableAnimations, 
  isPlaying, 
  animationSpeed,
  soundEnabled,
  soundVolume,
  onSoundEvent
}) {
  const group = useRef()
  const { scene, animations } = useGLTF(modelPath)
  const { actions, mixer } = useAnimations(animations, group)
  
  // Configurar animaciones disponibles cuando el modelo se carga
  useEffect(() => {
    if (animations && animations.length > 0) {
      const animNames = animations.map(clip => clip.name)
      setAvailableAnimations(animNames)
      
      // Si no hay animación seleccionada, usar la primera
      if (!currentAnimation && animNames.length > 0) {
        setCurrentAnimation(animNames[0])
      }
    }
  }, [animations, setAvailableAnimations, currentAnimation, setCurrentAnimation])
}
```

**Gestión de estados de animación:**

```jsx
// Controlar la reproducción de animaciones
useEffect(() => {
  if (!actions || !currentAnimation) return

  // Detener todas las animaciones
  Object.values(actions).forEach(action => {
    if (action) {
      action.stop()
      action.reset()
    }
  })

  // Reproducir la animación seleccionada
  const action = actions[currentAnimation]
  if (action) {
    action.setLoop(LoopRepeat)
    action.clampWhenFinished = false
    action.timeScale = animationSpeed
    
    if (isPlaying) {
      action.play()
    }
    
    setCurrentAction(action)
  }
}, [actions, currentAnimation, isPlaying, animationSpeed])
```

### 🔹 Sistema de Audio Sincronizado

**Gestor de sonidos sintéticos:**

```javascript
// SoundManager.js - Sistema completo de gestión de audio
class SoundManager {
  constructor() {
    this.audioContext = null
    this.sounds = new Map()
    this.masterVolume = 0.8
  }

  // Inicializar contexto de audio
  async initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Crear sonidos sintéticos
      this.createSyntheticSounds()
    }
  }

  // Generar sonidos proceduralmente
  createSyntheticSounds() {
    // Sonido de pasos
    this.sounds.set('footstep', this.createFootstepSound())
    
    // Sonido de salto
    this.sounds.set('jump', this.createJumpSound())
    
    // Sonido de aterrizaje
    this.sounds.set('land', this.createLandSound())
    
    // Sonidos de baile
    this.sounds.set('dance_beat', this.createDanceBeatSound())
    this.sounds.set('dance_clap', this.createDanceClapSound())
  }

  // Reproducir sonido específico
  playSound(soundName, volume = 1, playbackRate = 1) {
    const soundBuffer = this.sounds.get(soundName)
    if (!soundBuffer || !this.audioContext) return

    const source = this.audioContext.createBufferSource()
    const gainNode = this.audioContext.createGain()
    
    source.buffer = soundBuffer
    source.playbackRate.value = playbackRate
    gainNode.gain.value = volume * this.masterVolume
    
    source.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    source.start()
  }
}
```
### 🔹 Interfaz de Usuario Avanzada

**Panel flotante y arrastrable:**

```jsx
// Sistema de drag & drop para el panel de controles
const handleMouseDown = (e) => {
  if (isCollapsed) return
  setIsDragging(true)
  setDragOffset({
    x: e.clientX - position.x,
    y: e.clientY - position.y
  })
}

const handleMouseMove = (e) => {
  if (!isDragging) return
  const newX = Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragOffset.x))
  const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y))
  setPosition({ x: newX, y: newY })
}

// Panel JSX con todas las funcionalidades
<div 
  className={`controls ${isCollapsed ? 'collapsed' : ''} ${isDragging ? 'draggable' : ''}`}
  style={{
    left: `${position.x}px`,
    top: `${position.y}px`
  }}
>
  {/* Handle para arrastrar */}
  <div 
    className="drag-handle"
    onMouseDown={handleMouseDown}
    title="Arrastra para mover el panel"
  />
  
  {/* Controles organizados por secciones */}
  <div className="controls-content">
    {/* Selector de modelo, reproducción, velocidad, audio, etc. */}
  </div>
</div>
```
---

## 📊 Resultados Visuales

### 📌 Sistema Completo Funcionando:

![Demo Principal](./resultados/skeletal_animation.gif)

**Características mostradas:**
- ✅ **Carga correcta de modelos GLB**: Tres modelos diferentes con animaciones esqueléticas complejas
- ✅ **Control dinámico de animaciones**: Cambio fluido entre diferentes clips de animación
- ✅ **Panel de controles flotante**: Interfaz repositionable y colapsable
- ✅ **Información en tiempo real**: Estado de reproducción, velocidad, y animación actual
- ✅ **Carga dinámica**: Cambio instantáneo entre diferentes modelos GLB

### 🔊 Sincronización de Audio:

![Sincronización Audio](./resultados/audio_sync.gif)

**Sistema de audio implementado:**
- ✅ **Eventos sincronizados**: Sonidos generados en momentos específicos de cada animación
- ✅ **Indicadores visuales**: Iconos animados que aparecen cuando se reproduce un sonido
- ✅ **Control de volumen**: Slider para ajustar el volumen global
- ✅ **Toggle de audio**: Activar/desactivar sonido completamente
- ✅ **Sonidos contextuales**: Diferentes efectos para pasos, saltos, baile, etc.

---

## ✨ Características Destacadas

### 🎭 Sistema de Animaciones Esqueléticas
- ✅ **Importación completa de GLB/GLTF** con rigs y clips de animación preservados
- ✅ **Control granular de animaciones** con play/pause, velocidad variable y loop
- ✅ **Detección automática de clips** disponibles en cada modelo
- ✅ **Transiciones suaves** entre diferentes estados de animación
- ✅ **Compatibilidad con múltiples modelos** y arquitecturas de esqueleto

### 🔊 Audio Procedural Sincronizado
- ✅ **Generación sintética de sonidos** usando Web Audio API
- ✅ **Sincronización precisa** con eventos específicos en el ciclo de animación
- ✅ **Sonidos contextuales** adaptados a cada tipo de movimiento
- ✅ **Control completo de audio** con volumen, activación y feedback visual
- ✅ **Performance optimizada** sin archivos de audio externos

### 🎨 Interfaz de Usuario Profesional
- ✅ **Panel flotante y arrastrable** con funcionalidad drag & drop completa
- ✅ **Design responsive** que se adapta a cualquier tamaño de pantalla
- ✅ **Organización temática** de controles agrupados por funcionalidad
- ✅ **Estados visuales claros** con feedback inmediato de todas las acciones
- ✅ **Experiencia de usuario pulida** con transiciones y efectos profesionales

---

## 🔍 Análisis Profundo del Sistema

### 🦴 Arquitectura de Animaciones Esqueléticas

**Jerarquía de Huesos y Skinning:**
- Cada modelo GLB incluye un **armature** (esqueleto) con jerarquía padre-hijo de huesos
- Los vértices de la malla están **weighted** (ponderados) a huesos específicos
- Las transformaciones de huesos se propagan por la jerarquía afectando múltiples vértices
- **Three.js** maneja automáticamente la deformación de la malla basada en las poses del esqueleto

**Clips de Animación y Keyframes:**
- Cada clip contiene **tracks** (pistas) que definen transformaciones de huesos específicos
- Los **keyframes** almacenan posición, rotación y escala en momentos temporales específicos
- El **mixer** interpola entre keyframes creando movimiento fluido
- El sistema permite múltiples clips simultáneos con **blending** (mezcla) de animaciones

### ⚡ Optimizaciones de Performance

**Gestión de Memoria:**
```jsx
// Limpieza automática de recursos al cambiar modelos
useEffect(() => {
  return () => {
    if (mixer) {
      mixer.stopAllAction()
      mixer.uncacheRoot(group.current)
    }
  }
}, [mixer])
```

**Preload de Modelos:**
```jsx
// Precarga de todos los modelos para transiciones instantáneas
useGLTF.preload('/Dorchester3D.com_Rumba+Dancing/Rumba Dancing.glb')
useGLTF.preload('/ImageToStl.com_Jump/Jump.glb')
useGLTF.preload('/ImageToStl.com_Running+Up+Stairs/Running Up Stairs.glb')
```


### 🎯 Ventajas del Sistema Implementado

1. **🔄 Flexibilidad**: Soporte para cualquier modelo GLB con animaciones esqueléticas
2. **⚡ Performance**: Optimizado para múltiples modelos y transiciones frecuentes
3. **🎨 UX/UI**: Interfaz intuitiva y profesional sin interferir con la experiencia 3D
4. **🔊 Inmersión**: Audio sincronizado que enriquece la experiencia visual
5. **🛠️ Extensibilidad**: Arquitectura modular fácil de expandir con nuevas funcionalidades

---

## 💡 Prompts Utilizados

Para la implementación de este proyecto completo, utilicé los siguientes prompts principales en orden cronológico:

- "Quiero transformar la barra de controles horizontal en un panel vertical flotante que sea arrastrable, colapsable y bien organizado. El panel debe tener secciones temáticas para diferentes tipos de controles y no debe interferir con el canvas 3D."

- "Implementa un sistema de sonido que genere sonidos sintéticos usando Web Audio API y los sincronice con eventos específicos de las animaciones. Cada tipo de animación (baile, salto, caminar) debe tener sonidos contextuales que se reproduzcan en momentos precisos del ciclo de animación."

- "Añade controles de audio a la interfaz: un toggle para activar/desactivar el sonido y un slider para controlar el volumen. También incluye indicadores visuales cuando se reproduce un sonido, mostrando iconos específicos para cada tipo de evento (pasos, saltos, música)."

---

## 💬 Reflexión Final

### 🎓 Aprendizajes Clave sobre Animaciones Esqueléticas

La implementación de animaciones esqueléticas en Three.js me permitió comprender cómo funcionan los *rigs* y *clips* de animación, así como la matemática detrás del *skinning* y la deformación de mallas. Con `useAnimations()` de React Three Drei, pude controlar múltiples clips, aplicar transiciones suaves y ajustar velocidades con precisión.

La interpolación de *keyframes* fue clave para sincronizar animaciones con audio generado proceduralmente mediante la **Web Audio API**, utilizando:

* Osciladores y filtros para crear sonidos desde cero.
* Envolventes ADSR para definir dinámicas sonoras.
* `useFrame()` para coordinar sonido y movimiento en tiempo real.

Este sistema dio lugar a firmas sonoras personalizadas para cada tipo de animación (pasos, saltos, baile), mejorando la inmersión. El proyecto consolidó conocimientos en:

* Transformaciones jerárquicas 3D.
* Animación por keyframes.
* Arquitectura modular en React.
* Síntesis de audio digital.

Las aplicaciones van desde videojuegos y simuladores industriales hasta educación interactiva y rehabilitación. La integración fluida entre 3D, audio y UI demuestra el valor del pensamiento sistémico en experiencias web interactivas.
