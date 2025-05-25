# 🚀 Taller - Optimización Visual en Escenas 3D con React Three Fiber

📅 **Fecha:** 2025-05-24 – Fecha de realización

🎯 **Objetivo del Taller:**
Aprender y aplicar técnicas de optimización visual en proyectos desarrollados con Unity y Three.js (o React Three Fiber), con el fin de mejorar el rendimiento, reducir tiempos de carga y garantizar una experiencia fluida, especialmente en dispositivos con recursos limitados.

## 🧠 Conceptos Aprendidos

* Geometría simplificada (low poly vs high poly)
* Uso de LOD (Level of Detail) para alternar modelos según distancia
* Compresión de texturas con `.webp`
* Frustum culling automático en React Three Fiber
* Visualización de estadísticas de rendimiento con `<Stats />` de `@react-three/drei`
* Organización de escenas con carga eficiente de modelos

## 🔧 Herramientas y Entornos

* React + Vite
* Three.js
* React Three Fiber
* @react-three/drei
* Blender (para crear modelos low poly)
* tinypng.com / squoosh.app (para comprimir texturas)
* GLB model viewer + gltf.report (para inspección de modelos)
* VSCode + navegador local

## 📁 Estructura del Proyecto

```
2025-05-24_taller_optimizacion__graficos/
├── public/
│ ├── textures/
│ │ └── suelo.webp
│ └── models/
│ ├── tree_high.glb
│ ├── tree_low.glb
│ └── sofa.glb
├── src/
│ ├── components/
│ │ ├── Scene.jsx
│ │ └── TreeLOD.jsx
│ ├── App.jsx
│ └── index.css
├── README.md

```


## 🧪 Implementación

Se creó una escena 3D con varios árboles y sofás distribuidos sobre un terreno. Se implementaron múltiples técnicas de optimización visual para reducir la carga de geometría, texturas y renderizado.

### 🔹 Etapas realizadas

1. **Geometría simplificada:** Se utilizaron versiones low poly de los árboles para cuando están lejos del usuario.
2. **LOD (Level of Detail):** Se implementó un sistema que cambia el modelo mostrado automáticamente según la distancia de la cámara.
3. **Compresión de Texturas:** El terreno usa una textura `.webp` que pesa menos y se carga más rápido.
4. **Frustum Culling:** React Three Fiber oculta automáticamente los objetos fuera del campo de visión.
5. **Estadísticas de rendimiento:** Se integró el componente `<Stats />` para monitorear FPS, draw calls y otros recursos en tiempo real.

### 🔹 Código relevante

📌 **1. Uso de LOD (TreeLOD.jsx)**

```jsx
<LOD>
  <primitive object={highPolyScene} position={[0, 0, 0]} />
  <primitive object={lowPolyScene} position={[0, 0, 0]} />
</LOD>
```

Cambia automáticamente entre un árbol detallado y uno simplificado según la distancia de la cámara.

**📌 2. Carga de texturas comprimidas**

```jsx
const texture = useTexture('/textures/suelo.webp')
<meshStandardMaterial map={texture} />
```

Carga una textura .webp optimizada en peso para el terreno.

**📌 3. Estadísticas de rendimiento**

```jsx
<Stats />
```

Muestra un panel en pantalla con métricas como FPS y draw calls para evaluar la fluidez de la escena.

**📌 4. Distribución de árboles optimizados**

```jsx
{positions.map((pos, i) => (
  <TreeLOD key={i} position={pos} />
))}
```

Coloca múltiples árboles con detección de LOD en la escena, usando la versión low o high poly según la posición.



**📊 Resultados Visuales**

Aquí se mostrarán los resultados visuales de la optimización implementada:

🌐 React Three Fiber

🎞️ Escena con árboles optimizados y textura comprimida (GIF)

![Resultado tree](resultados/Graphic%20Optimization.gif)

🎞️ Estadísticas en tiempo real intercambiado distancias  entre low y high poly tree optimización (GIF)

![Resultado tree stadistics](resultados/Graphic%20Optimization%20stadisitcs.gif)


🧩 Prompts Usados


"Implementa LOD con modelos GLB de árbol low poly y high poly"

"Agrega textura .webp a un plano en R3F"

"Visualiza FPS y draw calls con @react-three/drei/stats"

"Distribuye modelos con optimización en una escena"

💬 Reflexión Final


Este taller me ayudó a comprender cómo reducir la carga visual de una escena 3D usando herramientas y técnicas concretas. Las técnicas más útiles fueron la simplificación de geometría (low poly) y el uso de LOD, ya que lograron reducir los draw calls sin comprometer el aspecto visual general. La compresión de texturas también ayudó a acelerar los tiempos de carga. Visualizar las estadísticas de rendimiento me permitió medir los beneficios reales de cada técnica aplicada, haciendo tangible el impacto de una buena optimización.
