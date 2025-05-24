# 🎥 Taller - Proyecciones 3D: Cómo ve una Cámara Virtual

## 📅 Fecha

`2025-05-24` – Taller Proyecciones 3D: Cómo ve una Cámara Virtual

---

## 🎯 Objetivo del Taller

Entender cómo se genera una escena tridimensional desde el punto de vista de una cámara, explorando los efectos de proyección en perspectiva y ortográfica. El propósito es visualizar cómo los cambios en la cámara afectan directamente la representación en pantalla, y comprender el papel de las matrices de proyección.

---

## 🧠 Conceptos Aprendidos

### 📐 Proyección en Perspectiva

- **Definición**: Simula cómo el ojo humano percibe el mundo, donde los objetos lejanos se ven más pequeños
- **Características principales**:
  - ✅ Los objetos disminuyen de tamaño con la distancia
  - ✅ Las líneas paralelas convergen en puntos de fuga
  - ✅ Campo de visión (FOV) configurable
  - ✅ Genera sensación de profundidad realista

### 📏 Proyección Ortográfica

- **Definición**: Mantiene las proporciones y tamaños independientemente de la distancia
- **Características principales**:
  - ✅ Los objetos mantienen su tamaño sin importar la distancia
  - ✅ Las líneas paralelas permanecen paralelas
  - ✅ No hay puntos de fuga
  - ✅ Ideal para representaciones técnicas y planos

### 🔄 Transformación de Matrices

- **Pipeline de renderizado**: Modelo → Vista → Proyección → Viewport
- **Matriz de proyección**: Transforma coordenadas 3D del espacio de cámara a coordenadas normalizadas
- **Frustum**: Volumen visible definido por los planos near/far y el FOV (perspectiva) o dimensiones (ortográfica)

---

## 🔧 Herramientas y Entornos

- **React 19** - Framework de interfaz de usuario
- **Three.js v0.176** - Motor de renderizado 3D WebGL
- **React Three Fiber v9** - Integración declarativa de Three.js con React
- **React Three Drei v10** - Helpers y abstracciones para R3F
- **TypeScript** - Tipado estático para mejor desarrollo
- **Vite** - Build tool ultrarrápido
- **Bun** - Runtime y gestor de paquetes

📌 Implementación completa en Three.js con React Three Fiber

---

## 📁 Estructura del Proyecto

```
2025-05-24_taller_proyecciones_camara_virtual/
├── threejs/                          # Implementación Three.js
│   ├── src/                          # Código fuente
│   │   ├── components/               # Componentes React
│   │   │   ├── Scene3D.tsx          # Escena 3D con objetos
│   │   │   ├── CameraInfo.tsx       # Información de cámara en tiempo real
│   │   │   ├── CameraControls.tsx   # Controles para cambiar tipo de cámara
│   │   │   ├── CameraExplanation.tsx # Explicación de cada tipo
│   │   │   ├── GridHelper.tsx       # Grid de referencia
│   │   │   ├── ProjectionIndicator.tsx # Indicador de proyección
│   │   │   ├── TargetSphere.tsx     # Esfera objetivo
│   │   │   └── UIHeader.tsx         # Encabezado UI
│   │   ├── hooks/                    # Custom hooks
│   │   │   ├── useCameraConfig.ts   # Configuración de cámaras
│   │   │   └── useProjection.ts     # Cálculos de proyección
│   │   ├── types/                    # Tipos TypeScript
│   │   ├── App.tsx                  # Aplicación principal
│   │   └── main.tsx                 # Punto de entrada
│   ├── package.json                 # Dependencias
│   └── vite.config.ts              # Configuración Vite
├── resultado/                        # Evidencias visuales
│   └── proyectiones_camera_result.gif # Demostración animada
└── README.md                        # Esta documentación
```

---

## 🧪 Implementación

### 🔹 Etapas realizadas

1. **Setup del entorno 3D**: Configuración de React Three Fiber con TypeScript
2. **Creación de escena con profundidad**: Objetos distribuidos a diferentes distancias (z=-3, z=-6, z=-10)
3. **Implementación de cámaras**:
   - Cámara perspectiva con FOV configurable
   - Cámara ortográfica con dimensiones ajustables
4. **Sistema de visualización en tiempo real**:
   - Información de matrices de cámara
   - Posición y rotación actualizadas
   - Parámetros específicos de cada tipo
5. **Controles interactivos**: OrbitControls para navegación libre
6. **UI informativa**: Explicaciones contextuales de cada modo

### 🔹 Código relevante

**Configuración de cámaras con parámetros específicos:**

```tsx
// Hook para configuración de cámaras
export function useCameraConfig() {
  return {
    perspective: {
      position: [7, 5, 8] as [number, number, number],
      fov: 50,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 100,
    },
    orthographic: {
      position: [7, 5, 8] as [number, number, number],
      left: -10,
      right: 10,
      top: 10,
      bottom: -10,
      near: 0.1,
      far: 100,
      zoom: 1,
    },
  };
}
```

**Escena 3D con objetos en diferentes profundidades:**

```tsx
// Distribución estratégica de objetos para visualizar diferencias
<>
  {/* Objetos cercanos (z=-3) */}
  <Box position={[-3, 0, -3]} args={[1, 1, 1]}>
    <meshStandardMaterial color="#3b82f6" />
  </Box>

  {/* Objetos medios (z=-6) */}
  <Sphere position={[-4, 1, -6]} args={[0.7, 32, 32]}>
    <meshStandardMaterial color="#f59e0b" />
  </Sphere>

  {/* Objetos lejanos (z=-10) */}
  <Box position={[-5, -1, -10]} args={[1.5, 1.5, 1.5]}>
    <meshStandardMaterial color="#6366f1" />
  </Box>
</>
```

**Cambio dinámico entre tipos de cámara:**

```tsx
// Componente principal con cambio de cámara
{
  cameraType === 'perspective' ? (
    <PerspectiveCamera
      makeDefault
      position={cameraConfig.perspective.position}
      fov={cameraConfig.perspective.fov}
      near={cameraConfig.perspective.near}
      far={cameraConfig.perspective.far}
    />
  ) : (
    <OrthographicCamera
      makeDefault
      position={cameraConfig.orthographic.position}
      left={cameraConfig.orthographic.left}
      right={cameraConfig.orthographic.right}
      zoom={cameraConfig.orthographic.zoom}
    />
  );
}
```

---

## 📊 Resultados Visuales

### 📌 Comparación Visual entre Proyecciones:

![Demostración de proyecciones de cámara](./resultado/proyectiones_camera_result.gif)

El GIF muestra claramente:

### 🎯 Proyección en Perspectiva:

- ✅ **Efecto de profundidad realista**: Los cubos lejanos se ven notablemente más pequeños
- ✅ **Convergencia de líneas**: El grid muestra líneas convergiendo hacia puntos de fuga
- ✅ **Campo de visión angular**: Se aprecia el FOV de 50° en la vista
- ✅ **Sensación de inmersión**: La escena se siente tridimensional y natural

### 📐 Proyección Ortográfica:

- ✅ **Tamaño uniforme**: Todos los objetos mantienen su tamaño relativo
- ✅ **Líneas paralelas**: El grid mantiene sus líneas perfectamente paralelas
- ✅ **Vista técnica**: Ideal para analizar proporciones y distancias reales
- ✅ **Sin distorsión perspectiva**: Perfecta para planos y diseño técnico

### 🔄 Elementos Interactivos:

- ✅ **Navegación orbital fluida**: Rotación 360° alrededor de la escena
- ✅ **Información en tiempo real**: Matrices y parámetros actualizados dinámicamente
- ✅ **Cambio instantáneo**: Transición inmediata entre tipos de proyección
- ✅ **UI informativa**: Explicaciones contextuales para cada modo

---

## 🎮 Controles Implementados

### 🖱️ Controles de Navegación

- **Clic + Arrastrar**: Rotar la cámara alrededor de la escena
- **Rueda del ratón**: Acercar/alejar (zoom)
- **Clic derecho + Arrastrar**: Desplazar la vista (pan)

### 🔘 Controles de Interfaz

- **Botón de cambio**: Alterna entre proyección perspectiva y ortográfica
- **Panel de información**: Muestra parámetros de cámara en tiempo real
- **Panel explicativo**: Describe las características de cada proyección

---

## 🔍 Comprensión de las Matrices de Proyección

### Matriz de Proyección en Perspectiva (4x4)

La cámara transforma puntos 3D usando:

1. **Matriz de Vista**: Posiciona la cámara en el espacio
2. **Matriz de Proyección**: Aplica la perspectiva basada en FOV, aspect ratio, near/far
3. **División perspectiva**: w-division para obtener coordenadas normalizadas

### Matriz de Proyección Ortográfica (4x4)

Mapeo lineal sin división perspectiva:

1. **Escalado uniforme**: Basado en left/right/top/bottom
2. **Sin componente w**: Preserva paralelismo
3. **Transformación afín**: Mantiene proporciones

---

## 💡 Prompts Utilizados

Para la implementación de este proyecto, utilicé los siguientes prompts principales:

1. **"Crear una aplicación Three.js con React que muestre la diferencia entre proyección perspectiva y ortográfica"**

   - Generó la estructura base del proyecto con TypeScript

2. **"Añadir objetos 3D distribuidos en diferentes profundidades para visualizar mejor las diferencias de proyección"**

   - Creó la escena con objetos en z=-3, z=-6, z=-10

3. **"Implementar panel de información que muestre los parámetros de la cámara en tiempo real"**

   - Desarrolló el componente CameraInfo con matrices actualizadas

4. **"Agregar explicaciones visuales sobre las características de cada tipo de proyección"**
   - Generó el componente CameraExplanation con descripciones claras

---

## 💬 Reflexión Final

Este taller me permitió comprender profundamente cómo las **matrices de proyección** transforman una escena 3D en una imagen 2D. La diferencia entre **proyección perspectiva y ortográfica** no es solo visual, sino matemática: mientras la perspectiva utiliza división por w para crear profundidad, la ortográfica mantiene una transformación lineal.

Lo más revelador fue observar cómo el **frustum de la cámara** define qué se renderiza y cómo. En perspectiva, el frustum es una pirámide truncada que explica por qué los objetos lejanos se ven pequeños. En ortográfica, es un prisma rectangular que mantiene las proporciones.

La implementación práctica me ayudó a entender que la cámara no "ve" realmente, sino que **transforma coordenadas mediante multiplicación de matrices**: `Proyección × Vista × Modelo × Vértice = Posición en pantalla`.

Para futuros proyectos, estos conceptos son fundamentales para:

- **Optimización de renderizado** mediante frustum culling
- **Efectos visuales** como profundidad de campo o niebla
- **Interfaces técnicas** que requieran vistas ortográficas precisas
- **Realidad aumentada** donde la proyección debe coincidir con la cámara real
