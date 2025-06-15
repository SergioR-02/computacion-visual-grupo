# 🧪 Taller - Interpolación de Movimiento: Suavizando Animaciones en Tiempo Real

## 📅 Fecha

`2025-05-07` – Fecha de realización

---

## 🎯 Objetivo del Taller

Implementar técnicas de interpolación (LERP, SLERP, Bézier) para crear animaciones suaves y naturales en objetos 3D. El objetivo es controlar el paso del tiempo y la transición entre estados con efectos realistas como aceleración, desaceleración o movimientos curvos usando React Three Fiber y funciones matemáticas de interpolación.

---

## 🧠 Conceptos Aprendidos

### 🎯 Conceptos Principales Aplicados:

#### 📐 **Técnicas de Interpolación Matemática**

- [x] **LERP (Linear Interpolation)**: Interpolación lineal entre dos puntos
- [x] **SLERP (Spherical Linear Interpolation)**: Interpolación esférica para rotaciones suaves
- [x] **Curvas de Bézier**: Interpolación cúbica con puntos de control
- [x] **Interpolación de cuaterniones**: Rotaciones suaves sin gimbal lock

#### 🎭 **Funciones de Easing/Aceleración**

- [x] **Linear**: Movimiento constante sin aceleración
- [x] **Ease In/Out Quad**: Aceleración/desaceleración cuadrática
- [x] **Ease In/Out Cubic**: Aceleración/desaceleración cúbica
- [x] **Bounce Out**: Efecto de rebote realista
- [x] **Comparación visual**: Múltiples funciones ejecutándose simultáneamente

#### 🔄 **Control de Animaciones**

- [x] **Parámetro t (tiempo)**: Control del progreso de animación (0-1)
- [x] **useFrame hook**: Animaciones sincronizadas con el render loopivos
- [x] **Velocidad variable**: Control de la velocidad de interpolación

#### 🎨 **Visualización de Trayectorias**

- [x] **Líneas de trayectoria**: Visualización del camino de interpolación
- [x] **Puntos de control**: Visualización de puntos clave en curvas Bézier
- [x] **Orientación dinámica**: Objetos que se orientan según la dirección del movimiento
- [x] **Múltiples vistas**: Individual, comparación y funciones de easing


---

## 🔧 Herramientas y Entornos

- **Three.js / React Three Fiber** ✅
  - React 19.1.0
  - Three.js 0.177.0
  - @react-three/fiber 9.1.2
  - @react-three/drei 10.1.2 (Text, OrbitControls)
  - TypeScript + Vite

---

## 📁 Estructura del Proyecto

```
2025-05-07_taller_interpolacion_movimiento_animaciones/
├── threejs/                   # Aplicación React Three Fiber
│   ├── src/
│   │   ├── components/
│   │   │   ├── InterpolationScene.tsx    # Escena de interpolación individual
│   │   │   ├── ComparisonScene.tsx       # Comparación lado a lado
│   │   │   └── EasingScene.tsx          # Funciones de easing múltiples
│   │   ├── App.tsx           # Componente principal con controles
│   │   └── main.tsx          # Punto de entrada
│   ├── package.json          # Dependencias del proyecto
│   └── README.md
├── results/                   # Capturas y GIFs de demostración
│   └── animations_movement_result.gif
└── README.md                 # Este archivo
```

---

## 🧪 Implementación

### 🔹 Etapas realizadas

1. **Configuración del entorno**: Setup de React + Three.js + TypeScript con Vite
2. **Implementación de LERP**: Interpolación lineal básica entre dos puntos
3. **Implementación de curvas Bézier**: Interpolación suave con puntos de control
4. **Implementación de SLERP**: Interpolación esférica para rotaciones
5. **Sistema de funciones de easing**: 7 funciones diferentes de aceleración
6. **Controles interactivos**: Panel de control para modos y parámetros
7. **Visualización comparativa**: Múltiples técnicas ejecutándose simultáneamente

### 🔹 Código relevante

Incluye un fragmento que resuma el corazón del taller:

```tsx
// Interpolación lineal (LERP)
const applyLinearInterpolation = (mesh: Mesh, t: number) => {
  const position = new Vector3().lerpVectors(startPoint, endPoint, t);
  mesh.position.copy(position);
  mesh.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 2, t);
};

// Interpolación con curvas Bézier
const applyBezierInterpolation = (mesh: Mesh, t: number) => {
  const position = bezierCurve.getPoint(t);
  mesh.position.copy(position);

  // Orientar objeto según dirección del movimiento
  if (t < 1) {
    const tangent = bezierCurve.getTangent(t);
    mesh.lookAt(mesh.position.clone().add(tangent));
  }
};

// Interpolación esférica (SLERP) para rotaciones
const applySlerpInterpolation = (mesh: Mesh, t: number) => {
  const position = new Vector3().lerpVectors(startPoint, endPoint, t);
  mesh.position.copy(position);

  const startQuat = new Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
  const endQuat = new Quaternion().setFromEuler(
    new THREE.Euler(Math.PI, Math.PI * 2, Math.PI),
  );

  const currentQuat = new Quaternion().slerpQuaternions(startQuat, endQuat, t);
  mesh.quaternion.copy(currentQuat);
};
```

---

## 📊 Resultados Visuales

### 📌 Este taller **requiere explícitamente un GIF animado**:

![Interpolación y Animaciones](./results/animations_movement_result.gif)

**Demostración de técnicas de interpolación y animación:**

- 🔴 **LERP**: Movimiento lineal constante entre puntos
- 🟡 **Bézier**: Curvas suaves con puntos de control visualizados
- 🔵 **SLERP**: Rotaciones suaves usando cuaterniones
- 📊 **Funciones de Easing**: 7 tipos diferentes ejecutándose simultáneamente
- 🎛️ **Controles interactivos**: Play, pause, reset y control manual del tiempo
- 📈 **Comparación visual**: Múltiples técnicas lado a lado

> ✅ GIF incluido mostrando todas las técnicas de interpolación implementadas

---

## 🧩 Prompts Usados

Durante el desarrollo de este taller se utilizaron los siguientes prompts para resolver dudas técnicas y obtener mejores prácticas:

### 🔍 **Prompts de Interpolación Matemática:**

- "¿Cómo implementar interpolación lineal (LERP) en Three.js para movimiento suave?"
- "¿Cuál es la diferencia entre LERP y SLERP y cuándo usar cada uno?"
- "¿Cómo crear curvas de Bézier cúbicas en Three.js con puntos de control?"
- "¿Cómo usar cuaterniones para rotaciones suaves sin gimbal lock?"

### 🎭 **Prompts de Funciones de Easing:**

- "¿Cuáles son las funciones de easing más comunes para animaciones naturales?"
- "¿Cómo implementar ease-in, ease-out y ease-in-out matemáticamente?"
- "¿Cómo crear un efecto de rebote (bounce) realista en animaciones?"
- "¿Cómo comparar visualmente múltiples funciones de easing simultáneamente?"


---

## 💬 Reflexión Final

**¿Qué aprendiste o reforzaste con este taller?**

Este taller me permitió profundizar en las matemáticas detrás de las animaciones suaves y naturales. Aprendí las diferencias fundamentales entre LERP, SLERP y curvas de Bézier, y cuándo es apropiado usar cada técnica. La implementación de múltiples funciones de easing me ayudó a entender cómo pequeños cambios matemáticos pueden crear efectos visuales dramáticamente diferentes, desde movimientos robóticos hasta animaciones orgánicas y naturales.

**¿Qué parte fue más compleja o interesante?**

La parte más fascinante fue implementar la interpolación esférica (SLERP) con cuaterniones para evitar problemas de gimbal lock en rotaciones complejas. También fue muy interesante crear el sistema de comparación visual que permite ver múltiples técnicas ejecutándose simultáneamente, lo que hace evidente las diferencias entre cada método. La implementación de curvas de Bézier con visualización de puntos de control fue particularmente desafiante pero gratificante.

---
