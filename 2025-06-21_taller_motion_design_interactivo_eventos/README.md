# 🧪 Taller - Motion Design Interactivo: Acciones Visuales según Eventos del Usuario

## 📅 Fecha
`2025-06-21` – Taller de Motion Design con Animaciones Reactivas y Eventos de Usuario

---

## 🎯 Objetivo del Taller

Crear **animaciones reactivas** donde un **modelo 3D animado** (proveniente de Mixamo) responde a eventos del usuario, como clics, teclas o movimientos del cursor. El objetivo es introducir los fundamentos del **motion design aplicado a personajes**, integrando eventos y lógica de interacción con **animaciones esqueléticas**.

---

## 🧠 Conceptos Aprendidos

Lista los principales conceptos aplicados:

- [x] Carga de modelos 3D con animaciones embebidas usando `useGLTF()`
- [x] Control de animaciones esqueléticas con `useAnimations()` de @react-three/drei
- [x] Mapeo de eventos de usuario a acciones del modelo (onClick, onPointerOver, keydown)
- [x] Transiciones suaves entre animaciones usando `.fadeIn()`, `.fadeOut()`, `.stop()`
- [x] Arquitectura modular con componentes React especializados
- [x] Hooks personalizados para control de animaciones y eventos de teclado
- [x] Interfaz de usuario reactiva con botones disparadores de animaciones
- [x] Optimización de rendimiento 3D con React Three Fiber
- [x] Sistemas de feedback visual e interacción inmersiva

---

## 🔧 Herramientas y Entornos

Especifica los entornos usados:

- **React 19.x** con hooks modernos para gestión de estados
- **Three.js** + **React Three Fiber** para renderizado 3D en web
- **@react-three/drei** para utilidades 3D (useGLTF, useAnimations, OrbitControls)
- **Vite** como bundler y servidor de desarrollo
- **Mixamo** para obtención del modelo 3D con animaciones esqueléticas
- **CSS3** con animaciones y diseño responsive moderno
- **JavaScript ES6+** para lógica de eventos e interactividad

---

## 📁 Estructura del Proyecto

```
2025-06-21_taller_motion_design_interactivo_eventos/
├── threejs/                                    # Implementación principal
│   ├── public/
│   │   └── Untitled.glb                       # Modelo 3D de Mixamo
│   ├── src/
│   │   ├── App.jsx                            # Componente principal y escena 3D
│   │   ├── App.css                            # Estilos modernos y responsive
│   │   ├── components/
│   │   │   ├── AnimationController.jsx        # Hooks de control de animaciones
│   │   │   └── UIComponents.jsx               # Componentes de interfaz
│   │   └── main.jsx                           # Punto de entrada React
│   ├── package.json                           # Dependencias del proyecto
│   ├── vite.config.js                         # Configuración de Vite
│   └── README.md                              # Documentación técnica
├── Resultados                                   # Resultados
└── README.md                                  # Este archivo
```

---

## 🧪 Implementación

### 🔹 Descripción del Modelo de Mixamo

**Modelo utilizado**: `Untitled.glb`
- **Origen**: Mixamo - Biblioteca de animaciones 3D de Adobe
- **Formato**: GLTF 2.0 con animaciones embebidas
- **Animaciones incluidas**:
  - **ARM**: Animación de brazos/saludo (idle/alert state)
  - **CROUCHED**: Posición agachado/defensiva
  - **WALK**: Ciclo de caminata natural

### 🔹 Enfoque de Motion Design Aplicado

El motion design implementado sigue los principios de **animación reactiva** y **feedback inmediato**:

1. **Anticipación**: Previews visuales al hacer hover sobre el modelo
2. **Staging**: Estados claros de cada animación con transiciones suaves
3. **Timing**: Uso de `.fadeIn()` y `.fadeOut()` para transiciones naturales (0.3s - 0.5s)
4. **Follow Through**: Efectos visuales que acompañan las transiciones (luces, tooltips)
5. **Appeal**: Interfaz intuitiva con feedback visual inmediato

### 🔹 Etapas realizadas

1. **Configuración del entorno**: Setup de React Three Fiber con Vite y dependencias
2. **Carga del modelo**: Implementación de `useGLTF()` para cargar `Untitled.glb`
3. **Sistema de animaciones**: Control avanzado con `useAnimations()` y hooks personalizados
4. **Mapeo de eventos**: Asociación de interacciones usuario-animación
5. **Interfaz de usuario**: Desarrollo de controles visuales y botones disparadores
6. **Optimización de UX**: Implementación de estados de carga, ayuda contextual y feedback visual

### 🔹 Código relevante

#### Control de Animaciones y Eventos:
```jsx
// Hook personalizado para control de animaciones
export const useAnimationController = (actions, initialAnimation = 'ARM') => {
  const [currentAnimation, setCurrentAnimation] = useState(initialAnimation)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const changeAnimation = (animationName, fadeTime = 0.5) => {
    if (animationName === currentAnimation || isTransitioning) return

    setIsTransitioning(true)

    // Fade out de la animación actual
    if (currentAnimation && actions[currentAnimation]) {
      actions[currentAnimation].fadeOut(fadeTime / 2)
    }

    // Fade in de la nueva animación
    if (actions[animationName]) {
      setTimeout(() => {
        actions[animationName].reset().fadeIn(fadeTime / 2).play()
        setCurrentAnimation(animationName)
        setTimeout(() => setIsTransitioning(false), fadeTime * 1000 / 2)
      }, fadeTime * 1000 / 2)
    }
  }

  return { currentAnimation, isTransitioning, changeAnimation }
}
```

#### Mapeo de Eventos de Usuario:
```jsx
// Configuración de eventos de teclado
export const ANIMATION_KEYS = {
  '1': 'ARM',      // Tecla 1 -> Animación ARM
  '2': 'CROUCHED', // Tecla 2 -> Animación CROUCHED
  '3': 'WALK',     // Tecla 3 -> Animación WALK
  'a': 'ARM',      // Alternativa con letra A
  'c': 'CROUCHED', // Alternativa con letra C
  'w': 'WALK'      // Alternativa con letra W
}

// Hook para eventos de teclado
export const useKeyboardControls = (changeAnimation, getNextAnimation) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key.toLowerCase()
      
      if (ANIMATION_KEYS[key]) {
        changeAnimation(ANIMATION_KEYS[key])
      } else {
        switch(key) {
          case ' ':
            changeAnimation(getNextAnimation()) // Espacio: siguiente
            break
          case 'r':
            changeAnimation('ARM') // R: reset
            break
          case 'escape':
            changeAnimation(null) // ESC: parar animaciones
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [changeAnimation, getNextAnimation])
}
```

#### Eventos del Modelo 3D:
```jsx
// Componente AnimatedModel con eventos reactivos
function AnimatedModel({ currentAnimation, onAnimationComplete }) {
  const [hovered, setHovered] = useState(false)
  const [clickEffect, setClickEffect] = useState(false)
  
  // onClick: reproducir animación WALK
  const handleClick = (e) => {
    e.stopPropagation()
    setClickEffect(true)
    setTimeout(() => setClickEffect(false), 300)
    onAnimationComplete('WALK')
  }

  // onPointerOver: preview de animación ARM
  const handlePointerOver = (e) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  return (
    <primitive 
      object={scene} 
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  )
}
```

---

## 📊 Resultados Visuales

### 📌 Interacciones Implementadas:

**Eventos de Mouse:**
- **Click en modelo**: Activa automáticamente animación WALK
- **Hover en modelo**: Preview temporal de animación ARM con tooltip
- **Controles de cámara**: Zoom, rotación y pan con OrbitControls

**Eventos de Teclado:**
- **Teclas 1, 2, 3**: Cambio directo a ARM, CROUCHED, WALK
- **Teclas A, C, W**: Accesos alternativos a las mismas animaciones
- **Espacio**: Cicla entre las tres animaciones disponibles
- **R**: Reset rápido a animación ARM
- **ESC**: Parar todas las animaciones

**Botones de Interfaz:**
- **Panel de control**: Botones visuales para cada animación
- **Estados activos**: Indicadores de color y efectos de brillo
- **Información en tiempo real**: Estado actual, historial y transiciones

### 📌 **GIFs animados requeridos**:

![Motion Design Interactivo](./resultados/Funcionamiento.gif)

> ✅ **Interacciones disparadas por eventos:**

**Características demostradas:**
- **Click en modelo 3D** → Transición inmediata a animación WALK
- **Hover sobre modelo** → Preview temporal de ARM con tooltip
- **Controles de teclado** → Cambios rápidos entre animaciones
- **Botones de UI** → Control visual directo desde pantalla
- **Estados de carga** → Feedback durante transiciones

> ✅ **Transiciones entre animaciones en tiempo real:**

**Flujo demostrado:**
- **Transiciones suaves** con fadeIn/fadeOut (0.5s)
- **Prevención de conflictos** durante cambios simultáneos
- **Efectos visuales** acompañantes (scaling, luces, tooltips)
- **Historial de animaciones** mostrado en tiempo real
- **Estados de transición** claramente identificados

---

## 💬 Prompts y Metodología Utilizada

### 🔹 Descripción general de los prompts usados:

**Prompts principales aplicados durante el desarrollo:**

1. implementación completa con useGLTF() y useAnimations() con asociación de eventos onClick, onPointerOver y keydown
2. Crear arquitectura modular para control de animaciones
3. Implementar interfaz de usuario reactiva con botones disparadores

---

## 🔗 Instrucciones de Ejecución

### **Paso 1: Instalación de dependencias**
```bash
cd threejs
npm install
```

### **Paso 2: Ejecutar en modo desarrollo**
```bash
npm run dev
```

### **Paso 3: Abrir en navegador**
```
http://localhost:5173
```

### **Controles disponibles:**
- **Mouse**: Click y hover en modelo 3D
- **Teclado**: 1,2,3 o A,C,W para animaciones, Espacio para siguiente, R para reset, ESC para parar
- **UI**: Botones de control visual y botón de ayuda (❓)

---

## 💬 Reflexión Final

Este taller me ayudó a entender profundamente cómo integrar **motion design con interacción del usuario** en entornos 3D web. La combinación de React Three Fiber con animaciones esqueléticas de Mixamo abre posibilidades enormes para experiencias inmersivas.

**¿Cómo mejoró la experiencia visual al vincular interacción con animación esquelética?**

La vinculación directa entre eventos del usuario y animaciones del personaje crea una **sensación de control inmediato** que transforma la experiencia de observador pasivo a **participante activo**. Las transiciones suaves con fadeIn/fadeOut eliminan los saltos abruptos, creando una **narrativa visual fluida** donde cada acción tiene consecuencias visibles.

**Aspectos técnicos más valiosos:**
- **Hooks personalizados** simplifican enormemente el control de estados complejos de animación
- **Separación de responsabilidades** entre lógica de eventos, control de animaciones y UI
- **Feedback inmediato** (visual y auditivo) mejora significativamente la percepción de responsividad
- **Sistema de transiciones** previene conflictos y mantiene coherencia visual

**Impacto en motion design:**
- Las **animaciones reactivas** crean engagement emocional más profundo
- **Estados intermedios** (como hover previews) guían la exploración del usuario
- **Consistencia temporal** en transiciones genera sensación de sistema cohesivo
- **Anticipación visual** reduce la fricción cognitiva en la interacción

En el futuro, me gustaría explorar **animación procedural**, **blend trees** para transiciones más complejas, y **sistemas de partículas** reactivos a las animaciones del personaje. También sería valioso implementar **reconocimiento de gestos** o **control por voz** para interacciones más naturales.

---