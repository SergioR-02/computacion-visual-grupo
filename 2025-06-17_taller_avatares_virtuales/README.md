# 🧪 Taller - Avatares Virtuales en Unity y Three.js

## 📅 Fecha
`2025-06-17` – Fecha de entrega del taller

---

## 🎯 Objetivo del Taller

Aprender a integrar **avatares 3D** en entornos interactivos usando **Three.js con React Three Fiber**, permitiendo su visualización, personalización básica, y movimiento mediante animaciones predefinidas. El objetivo es crear un sistema completo de avatares virtuales con múltiples animaciones, personalización de colores en tiempo real, y una interfaz moderna que permita controlar el comportamiento del personaje de forma intuitiva.

---

## 🧠 Conceptos Aprendidos

Lista los principales conceptos aplicados:

- [x] Integración de avatares 3D en entornos virtuales
- [x] Carga y manejo de modelos FBX y GLB
- [x] Sistema de animaciones con esqueletos (Skeletal Animation)
- [x] Personalización visual de materiales y colores
- [x] Control interactivo de animaciones en tiempo real
- [x] Optimización de rendimiento con Suspense y fallbacks
- [x] Interface de usuario moderna para control de avatares
- [x] Gestión de múltiples estados de animación

---

## 🔧 Herramientas y Entornos

Especifica los entornos usados:

- Three.js / React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
- React 19 con Vite para desarrollo moderno
- Modelos 3D en formato FBX y GLB con animaciones
- Mixamo para avatares y animaciones predefinidas
- CSS3 con gradientes y efectos glassmorphism


---

## 📁 Estructura del Proyecto

```
2025-06-17_taller_avatares_virtuales/
├── threejs/                    # Implementación en React Three Fiber
│   ├── src/
│   │   ├── components/        # Componentes de avatares
│   │   │   ├── AvatarSceneRumba.jsx      # Avatar con baile rumba
│   │   │   ├── AvatarScene.jsx           # Escena principal
│   │   │   ├── AvatarSceneEnhanced.jsx   # Versión mejorada
│   │   │   ├── AvatarSceneNew.jsx        # Nueva implementación
│   │   │   └── AvatarSceneSimple.jsx     # Versión simplificada
│   │   ├── App.jsx            # Aplicación principal con UI
│   │   ├── App_Modern.jsx     # Versión moderna alternativa
│   │   └── main.jsx           # Punto de entrada
│   ├── public/               # Modelos 3D y assets
│   │   ├── avatar.glb        # Avatar base en formato GLB
│   │   ├── Rumba_Dancing.fbx # Avatar con animación de rumba
│   │   └── vite.svg          # Ícono de Vite
│   ├── package.json          # Dependencias del proyecto
│   └── README.md
├── Evidencia/                # GIFs y capturas de funcionamiento
│   └── Evidecia.gif         # Demostración del sistema de avatares
└── README.md
```


---

## 🧪 Implementación

Explica el proceso:

### 🔹 Etapas realizadas
1. **Selección y preparación de modelos**: Descarga de avatares animados desde Mixamo en formato FBX.
2. **Sistema de carga de modelos**: Implementación de cargadores para FBX y GLB con fallbacks de loading.
3. **Control de animaciones**: Sistema para reproducir, pausar y cambiar entre diferentes animaciones.
4. **Personalización visual**: Sistema dinámico de cambio de colores aplicado a materiales del avatar.
5. **Interface de usuario**: Panel moderno con controles para animaciones y personalización.
6. **Optimización de rendimiento**: Uso de Suspense y técnicas de optimización para carga suave.

### 🔹 Código relevante

Componente principal de avatar con animaciones FBX:

```jsx
function RumbaDancingAvatar({ selectedColor, animationName }) {
  const group = useRef()
  const [isPlaying, setIsPlaying] = useState(false)

  // Cargar modelo FBX con animaciones
  const fbx = useFBX('/Rumba_Dancing.fbx')
  const { actions, names } = useAnimations(fbx.animations, group)

  // Aplicar color dinámicamente a todos los materiales
  useEffect(() => {
    if (fbx) {
      fbx.traverse(child => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone()
          
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.color) {
                mat.color.setStyle(selectedColor)
              }
            })
          } else {
            if (child.material.color) {
              child.material.color.setStyle(selectedColor)
            }
          }
        }
      })
    }
  }, [fbx, selectedColor])

  // Control de animaciones por nombre
  useEffect(() => {
    if (actions && names.length > 0) {
      Object.values(actions).forEach(action => action.stop())
      
      switch (animationName) {
        case 'dance':
          const danceAction = actions[names[0]]
          if (danceAction) {
            danceAction.play()
            setIsPlaying(true)
          }
          break
        case 'wave':
          const waveAction = actions[names[0]]
          if (waveAction) {
            waveAction.timeScale = 0.3 // Velocidad reducida para efecto wave
            waveAction.play()
            setIsPlaying(true)
          }
          break
        case 'idle':
          const idleAction = actions[names[0]]
          if (idleAction) {
            idleAction.timeScale = 0.1 // Muy lento para idle
            idleAction.play()
            setIsPlaying(true)
          }
          break
      }
    }
  }, [actions, names, animationName])

  return (
    <group ref={group} dispose={null}>
      <primitive 
        object={fbx} 
        scale={0.02} 
        position={[0, -1, 0]} 
        rotation={[0, 0, 0]} 
      />
    </group>
  )
}
```

Sistema de personalización de colores:

```jsx
const colors = [
  {
    name: 'Azure',
    value: '#4A90E2',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    name: 'Crimson', 
    value: '#E24A4A',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    name: 'Emerald',
    value: '#4AE24A', 
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  // ... más colores
]

// Interface para selección de colores
{colors.map((color, index) => (
  <button
    key={index}
    onClick={() => setSelectedColor(color.value)}
    style={{
      width: '45px',
      height: '45px',
      borderRadius: '12px',
      background: color.gradient,
      border: selectedColor === color.value ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    }}
    title={color.name}
  />
))}
```

Control de animaciones con interface moderna:

```jsx
const animations = [
  {
    id: 'dance',
    name: 'Dance', 
    icon: '🕺',
    description: 'Full rumba dancing',
  },
  { 
    id: 'wave', 
    name: 'Wave', 
    icon: '👋', 
    description: 'Slow elegant wave' 
  },
  { 
    id: 'idle', 
    name: 'Idle', 
    icon: '🧍', 
    description: 'Gentle breathing' 
  },
]

// Botones de control de animación
{animations.map((anim, index) => (
  <button
    key={index}
    onClick={() => setAnimationName(anim.id)}
    style={{
      padding: '12px 20px',
      background: animationName === anim.id 
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    }}
  >
    <span style={{ fontSize: '20px', marginRight: '8px' }}>
      {anim.icon}
    </span>
    {anim.name}
  </button>
))}
```

---

## 📊 Resultados Visuales

### 📌 Este taller **requiere explícitamente un GIF animado**:


El GIF demuestra el funcionamiento completo del sistema de avatares virtuales:
- Avatar 3D animado cargado desde modelo FBX con esqueleto completo
- Múltiples animaciones disponibles: baile rumba, saludo y estado idle
- Sistema de personalización de colores en tiempo real aplicado a materiales
- Interface moderna con controles intuitivos para animaciones y colores
- Carga optimizada con fallbacks visuales durante el loading
- Efectos visuales con glassmorphism y gradientes modernos

![Evidecia](./Evidencia/Evidecia.gif)

### 🔹 Características implementadas:

- **Carga de modelos FBX**: Avatar completo con esqueleto y animaciones de Mixamo
- **Sistema de animaciones**: Control de múltiples animaciones con diferentes velocidades
- **Personalización visual**: 6 esquemas de colores aplicables en tiempo real
- **Interface moderna**: Panel de control con efectos glassmorphism y gradientes
- **Optimización de rendimiento**: Suspense boundaries y loading states
- **Responsive design**: Interface adaptable a diferentes tamaños de pantalla
- **Feedback visual**: Indicadores de estado y transiciones suaves

---

## 🧩 Prompts Usados

Enumera los prompts utilizados:

```text
"Crear sistema de avatares virtuales en React Three Fiber que cargue modelos FBX desde Mixamo con animaciones de baile, saludo e idle, incluyendo controles para reproducir cada animación"

"Implementar sistema de personalización de colores que permita cambiar dinámicamente los materiales del avatar usando una paleta de 6 colores con gradientes modernos"

"Desarrollar interface de usuario moderna con efectos glassmorphism para controlar animaciones del avatar y personalización de colores, usando React hooks para gestión de estados"

"Optimizar carga de modelos 3D con Suspense boundaries, fallbacks de loading, y componentes de avatar modulares reutilizables"

"Crear múltiples variantes de escenas de avatar: simple, enhanced, modern, con diferentes niveles de complejidad y características visuales"
```


---

## 💬 Reflexión Final

Este taller me permitió explorar profundamente el mundo de los **avatares virtuales** y su integración en aplicaciones web modernas. La experiencia de trabajar con modelos FBX animados desde Mixamo fue especialmente enriquecedora, ya que combina modelado 3D, animación por esqueletos, y programación interactiva de forma integrada.

La parte más compleja fue el **manejo correcto de las animaciones** y la sincronización entre los controles de la interfaz y las acciones del avatar. Entender cómo aplicar transformaciones de color dinámicamente a todos los materiales del modelo sin afectar el rendimiento fue un desafío técnico importante que requirió optimización cuidadosa.

Para futuros proyectos, aplicaría estos conocimientos en **aplicaciones más inmersivas** como espacios sociales virtuales, simuladores de entrenamiento, videojuegos web, y experiencias de realidad virtual. También sería interesante integrar reconocimiento de gestos para controlar el avatar en tiempo real y desarrollar sistemas de vestimenta intercambiable.

