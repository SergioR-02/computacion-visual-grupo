# 🦾 Taller - Cinemática Inversa: Brazo Robótico Inteligente

## 📅 Fecha

`2025-06-12` – Taller Cinemática Inversa con Algoritmo CCD

---

## 🎯 Objetivo del Taller

Implementar un sistema de **cinemática inversa (IK)** para que un brazo robótico articulado de 3 segmentos persiga un objetivo dinámico en tiempo real. El propósito es comprender cómo los algoritmos de IK resuelven el problema de posicionamiento de extremidades robóticas, comparar con cinemática directa (FK), y explorar aplicaciones en robótica y animación 3D.

---

## 🧠 Conceptos Aprendidos

### 🔄 Cinemática Inversa (IK)

- **Definición**: Dado un objetivo en el espacio, calcular los ángulos de las articulaciones necesarios para que el extremo del brazo lo alcance
- **Algoritmo implementado**: **CCD (Cyclic Coordinate Descent)**
- **Características principales**:
  - ✅ Iterativo: Ajusta una articulación a la vez desde el extremo hacia la base
  - ✅ Converge rápidamente para cadenas cinemáticas simples
  - ✅ Estable y eficiente computacionalmente
  - ✅ No requiere cálculo de jacobiano

### 🔧 Cinemática Directa (FK)

- **Definición**: Dados los ángulos de las articulaciones, calcular la posición del extremo del brazo
- **Características principales**:
  - ✅ Control directo de cada articulación
  - ✅ Predicible y determinístico
  - ✅ Útil para poses predefinidas y animaciones
  - ✅ Base matemática para los cálculos de IK

### 🏗️ Jerarquía de Transformaciones

- **Estructura del brazo**: Cada segmento es hijo del anterior formando una cadena cinemática
- **Transformaciones locales**: Rotaciones aplicadas en el espacio local de cada articulación
- **Forward Kinematics**: Composición de matrices de transformación desde la base hasta el extremo
- **Coordenadas relativas**: Cada articulación define su rotación respecto al segmento padre

---

## 🔧 Herramientas y Entornos

- **React 18** - Framework de interfaz de usuario reactiva
- **Three.js v0.165** - Motor de renderizado 3D WebGL de alto rendimiento
- **React Three Fiber v8** - Integración declarativa de Three.js con React
- **React Three Drei v9** - Helpers y abstracciones avanzadas para R3F
- **Leva** - Panel de controles en tiempo real para debugging y experimentación
- **JavaScript ES6+** - Programación moderna con sintaxis declarativa
- **Vite** - Build tool ultrarrápido con hot-reload

---

## 📁 Estructura del Proyecto

```
2025-06-12_taller_cinematica_inversa_ik/
├── threejs/                          # Implementación Three.js
│   ├── src/                          # Código fuente
│   │   ├── components/               # Componentes React
│   │   │   ├── InverseKinematicsScene.jsx # Escena principal con cámara
│   │   │   ├── SimpleArm.jsx         # Brazo robótico con IK/FK
│   │   │   ├── Target.jsx           # Objetivo arrastrable 3D
│   │   │   └── RoboticArm.jsx       # Versión original (respaldo)
│   │   ├── App.jsx                  # Aplicación principal
│   │   └── main.jsx                 # Punto de entrada
├── resultados/                       # Evidencias visuales
│   ├── ik_working.gif              # IK funcionando correctamente
│   ├── fk_control.gif              # Control manual FK
│   ├── dual_mode.gif               # Cambio entre modos IK/FK
│   └── arm_hierarchy.png           # Diagrama de jerarquía
└── README.md                        # Esta documentación
```

---

## 🧪 Implementación

### 🔹 Etapas Realizadas

1. **Setup del entorno 3D**: Configuración de React Three Fiber con controles y iluminación
2. **Creación del brazo jerárquico**: 3 segmentos con transformaciones padre-hijo
3. **Implementación del algoritmo CCD**: Solver iterativo para cinemática inversa
4. **Sistema de objetivo arrastrable**: Target interactivo con raycasting 3D
5. **Modo dual IK/FK**: Cambio dinámico entre control automático y manual
6. **Visualizaciones avanzadas**: Trayectorias, ángulos, alcance y debug info
7. **Optimizaciones de performance**: Límites de iteración y convergencia

### 🔹 Jerarquía del Brazo Robótico

```
Brazo (base fija)
├── Segmento 1: Hombro-Codo (Verde 🟢)
│   └── Segmento 2: Codo-Muñeca (Azul 🔵)
│       └── Segmento 3: Muñeca-Extremo (Naranja 🟠)
│           └── End Effector (Rojo 🔴)
```

**Estructura jerárquica implementada:**

```jsx
<group ref={baseRef} position={[0, 0, 0]}>
  {/* Segmento 1: Base-Hombro-Codo */}
  <group ref={segment1Ref} position={[0, 0, 0]}>
    <mesh>{/* Articulación del hombro */}</mesh>
    <mesh>{/* Eslabón 1 (verde) */}</mesh>

    {/* Segmento 2: Codo-Muñeca */}
    <group ref={segment2Ref} position={[segments[0].length, 0, 0]}>
      <mesh>{/* Articulación del codo */}</mesh>
      <mesh>{/* Eslabón 2 (azul) */}</mesh>

      {/* Segmento 3: Muñeca-Extremo */}
      <group ref={segment3Ref} position={[segments[1].length, 0, 0]}>
        <mesh>{/* Articulación de la muñeca */}</mesh>
        <mesh>{/* Eslabón 3 (naranja) */}</mesh>
        <mesh>{/* End Effector (rojo) */}</mesh>
      </group>
    </group>
  </group>
</group>
```

### 🔹 Algoritmo CCD (Cyclic Coordinate Descent)

**Implementación del solver principal:**

```javascript
const solveCCD = () => {
  const target = new Vector3(...targetPosition)
  let currentAngles = [...jointAngles]
  let iterations = 0
  let converged = false

  // Iteraciones del algoritmo CCD
  for (let iter = 0; iter < maxIterations; iter++) {
    iterations++
    let hasChanged = false

    // Procesar articulaciones desde el extremo hacia la base
    for (let i = segments.length - 1; i >= 0; i--) {
      // Calcular posiciones actuales con FK
      const positions = calculatePositions(currentAngles)
      const jointPos = new Vector3(...positions[i])
      const endEffectorPos = new Vector3(...positions[positions.length - 1])
      
      // Vectores desde la articulación actual
      const toEndEffector = endEffectorPos.clone().sub(jointPos)
      const toTarget = target.clone().sub(jointPos)
      
      // Evitar división por cero
      if (toEndEffector.length() < 0.001) continue
      
      // Calcular ángulos y diferencia
      const currentAngle = Math.atan2(toEndEffector.y, toEndEffector.x)
      const targetAngle = Math.atan2(toTarget.y, toTarget.x)
      
      let angleDiff = targetAngle - currentAngle
      
      // Normalizar ángulo a rango [-π, π]
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI
      
      // Aplicar cambio con suavizado para estabilidad
      if (Math.abs(angleDiff) > 0.01) {
        currentAngles[i] += angleDiff * 0.5
        hasChanged = true
      }
    }
    
    // Verificar convergencia
    const finalPositions = calculatePositions(currentAngles)
    const finalEndEffector = new Vector3(...finalPositions[finalPositions.length - 1])
    const distance = finalEndEffector.distanceTo(target)
    
    if (distance < tolerance) {
      converged = true
      break
    }
    
    if (!hasChanged) break
  }
}
```

**Forward Kinematics para cálculo de posiciones:**

```javascript
const calculatePositions = (angles = jointAngles) => {
  const positions = [[0, 0, 0]] // Posición base
  let currentPos = new Vector3(0, 0, 0)
  let accumulatedAngle = 0
  
  // Calcular posición de cada articulación
  for (let i = 0; i < angles.length; i++) {
    accumulatedAngle += angles[i]
    const segmentLength = segments[i].length
    
    // Aplicar transformación basada en ángulo acumulado
    currentPos.x += segmentLength * Math.cos(accumulatedAngle)
    currentPos.y += segmentLength * Math.sin(accumulatedAngle)
    
    positions.push([currentPos.x, currentPos.y, currentPos.z])
  }
  
  return positions
}
```

### 🔹 Sistema Dual IK/FK

**Cambio dinámico entre modos:**

```javascript
// Hook useFrame para actualización en tiempo real
useFrame(() => {
  // Solo ejecutar IK si está habilitado y no estamos en modo FK
  if (enableIK && !enableFK) {
    solveCCD()
  }
  
  // Aplicar rotaciones calculadas a los segmentos 3D
  if (segment1Ref.current) segment1Ref.current.rotation.z = jointAngles[0]
  if (segment2Ref.current) segment2Ref.current.rotation.z = jointAngles[1]
  if (segment3Ref.current) segment3Ref.current.rotation.z = jointAngles[2]
})
```

**Controles Leva para configuración en tiempo real:**

```javascript
const controls = useControls('Inverse Kinematics', {
  enableIK: { value: true, label: 'Enable IK Mode' },
  enableFK: { value: false, label: 'Enable FK Mode' },
  maxIterations: { value: 15, min: 1, max: 50, step: 1 },
  tolerance: { value: 0.1, min: 0.01, max: 1.0, step: 0.01 },
  
  // Solo visible en modo FK
  joint1: { 
    value: 0, min: -Math.PI, max: Math.PI, step: 0.01,
    render: (get) => get('enableFK')
  },
  joint2: { 
    value: 0, min: -2.5, max: 0.3, step: 0.01,
    render: (get) => get('enableFK')
  },
  joint3: { 
    value: 0, min: -1.9, max: 1.9, step: 0.01,
    render: (get) => get('enableFK')
  }
})
```

---

## 📊 Resultados Visuales

### 📌 Demostración del Sistema IK:

![Funcionamiento del IK](./resultados/ik_working.gif)

**Características mostradas:**
- ✅ **Seguimiento en tiempo real**: El brazo persigue el objetivo instantáneamente cuando se arrastra la esfera roja
- ✅ **Convergencia rápida**: El algoritmo CCD converge en 5-15 iteraciones típicamente
- ✅ **Movimiento natural**: Las articulaciones se mueven de forma fluida y coordinada
- ✅ **Visualizaciones avanzadas**: Líneas de trayectoria, indicadores de ángulo, y círculo de alcance máximo

### 🔄 Cambio entre Modos IK/FK:

![Modo dual](./resultados/dual_mode.gif)

**Sistema dual implementado:**
- ✅ **Cambio instantáneo**: Switch entre modo automático (IK) y manual (FK)
- ✅ **Estado preservado**: Los ángulos se mantienen al cambiar de modo
- ✅ **Ángulos en tiempo real**: Visualización de grados de rotación en cada articulación
- ✅ **UI adaptativa**: Los controles se muestran/ocultan según el modo activo
- ✅ **Performance optimizada**: Solo ejecuta el algoritmo necesario
- ✅ **Transformaciones padre-hijo**: Cada segmento hereda la rotación del anterior
- ✅ **Coordenadas locales**: Rotaciones aplicadas en el espacio local de cada articulación
- ✅ **Forward Kinematics**: Propagación de transformaciones desde la base hasta el extremo
- ✅ **Alcance máximo**: Cuando el objetivo está fuera del alcance


---

## ✨ Características Destacadas

- ✅ **Algoritmo CCD completamente funcional** con optimizaciones de estabilidad
- ✅ **Sistema dual IK/FK** con cambio dinámico entre modos
- ✅ **Interfaz interactiva profesional** con controles Leva y debug en tiempo real
- ✅ **Visualizaciones avanzadas** incluyendo trayectorias y indicadores de ángulos
- ✅ **Documentación exhaustiva** con explicaciones técnicas y código comentado
- ✅ **Optimizado para rendimiento** con criterios de convergencia adaptativos
- ✅ **Código modular y extensible** siguiendo mejores prácticas de React

---

## 🎮 Controles Implementados

### 🖱️ Controles de Interacción 3D

- **Arrastrar esfera roja**: Mover el objetivo para que el brazo lo persiga (solo en modo IK)
- **Clic + Arrastrar (área libre)**: Rotar cámara orbital alrededor de la escena
- **Rueda del ratón**: Zoom in/out para acercar/alejar la vista
- **Clic medio + Arrastrar**: Pan de cámara para desplazar la vista

#### 🎨 Poses Predefinidas FK:
- **Home**: Posición inicial relajada (todos los ángulos en 0°)
- **Extended**: Brazo completamente extendido hacia adelante
- **Folded**: Brazo plegado hacia el cuerpo con codo flexionado
- **Reach Up**: Configuración para alcanzar objetos elevados
- **Reach Down**: Posición para interactuar con objetos bajos

### 📊 Panel de Debug (tiempo real):
- **Distance to Target**: Distancia actual entre end effector y objetivo
- **Iterations Used**: Número de iteraciones del último frame CCD
- **Convergence Status**: Indicador visual de si el algoritmo ha convergido
- **Joint Angles**: Valores actuales de rotación en grados para cada articulación
---

## 🔍 Análisis Profundo del Algoritmo CCD

### 🧮 Funcionamiento Matemático

### ✅ Ventajas del CCD:

1. **📐 Simplicidad matemática**: Solo requiere cálculos trigonométricos básicos
2. **⚡ Convergencia rápida**: Típicamente 5-15 iteraciones para cadenas de 3 segmentos
3. **🎯 Estabilidad numérica**: No sufre de oscilaciones como métodos jacobiano
4. **🔧 Restricciones simples**: Fácil aplicar límites de ángulo por articulación
5. **💾 Memoria eficiente**: No requiere almacenar matrices jacobiano grandes

---

## 💡 Prompts Utilizados

Para la implementación de este proyecto, utilicé los siguientes prompts principales en orden cronológico:


1. "Como crear un brazo robótico articulado de 3 segmentos usando Three.js con React Three Fiber, implementando una jerarquía padre-hijo correcta"

2. "Implementar el algoritmo CCD (Cyclic Coordinate Descent) para cinemática inversa que haga que el extremo del brazo persiga un objetivo en tiempo real"

3. "Crear un objetivo arrastrable en 3D usando raycasting, evitando que el arrastre interfiera con los controles de cámara OrbitControls"


4. "Agregar un modo FK (Forward Kinematics) con control manual de articulaciones usando Leva, incluyendo poses predefinidas y la capacidad de cambiar entre modos IK/FK dinámicamente"

---

## 💬 Reflexión Final

La implementación de cinemática inversa (IK) con el algoritmo CCD fue más desafiante y enriquecedora de lo esperado. CCD resultó ser una introducción ideal al mundo IK por su simplicidad iterativa, aunque su aplicación reveló complejidades ocultas en la propagación de rotaciones locales dentro de una cadena jerárquica. Comprender cómo cada articulación afecta a las siguientes permitió afianzar conceptos clave de transformación y control.

Uno de los principales aprendizajes fue la no unicidad de las soluciones IK: múltiples configuraciones articulares pueden alcanzar un mismo objetivo. Además, la convergencia del algoritmo exige criterios de parada adecuados, como tolerancia angular o número máximo de iteraciones. La visualización en tiempo real de trayectorias, ángulos y estructuras jerárquicas fue esencial para asimilar estos conceptos y facilitar la depuración.

La utilidad del sistema va más allá del aula, con aplicaciones directas en robótica, animación 3D, realidad virtual, simulación biomecánica y videojuegos. En todos estos contextos, los sistemas IK permiten controlar articulaciones de forma realista y dinámica, adaptándose a objetivos cambiantes en tiempo real, como ocurre en los sistemas de rigging o los avatares interactivos.

Finalmente, la experiencia sienta una base sólida para explorar métodos más sofisticados como FABRIK o algoritmos basados en Jacobianos, así como integrar restricciones avanzadas, colisiones o simulaciones físicas. El proyecto confirmó que convertir matemáticas abstractas en visualizaciones interactivas es una poderosa herramienta educativa y de prototipado rápido en computación visual.

