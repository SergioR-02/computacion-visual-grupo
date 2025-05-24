# 🎥 Taller - Proyecciones 3D: Cómo ve una Cámara Virtual

## 📅 Fecha

`2025-05-24` – Espacios Proyectivos y Matrices de Proyección

---

## 🎯 Objetivo del Taller

Comprender y aplicar los conceptos fundamentales de geometría proyectiva y el uso de matrices de proyección para representar escenas tridimensionales en un plano bidimensional, base esencial del pipeline gráfico moderno.

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

### 🎯 Espacios Geométricos

- **Geometría Euclidiana**: Preserva distancias, ángulos y formas. Sin puntos en el infinito.
- **Geometría Afín**: Preserva paralelismo y razones de distancias. Las líneas paralelas nunca se encuentran.
- **Geometría Proyectiva**: Preserva colinealidad y razón cruzada. Las líneas paralelas se encuentran en el infinito usando coordenadas homogéneas.

---

## 🔧 Herramientas y Entornos

### Python 🐍

- **NumPy** - Cálculos matriciales y operaciones vectoriales
- **Matplotlib** - Visualización 2D/3D y generación de gráficos
- **mpl_toolkits.mplot3d** - Proyecciones 3D en Matplotlib

### Processing 🎨

- **Processing 4.3** - Entorno de programación visual
- **P3D** - Renderizado 3D en Processing
- **Controles interactivos** - Mouse y teclado para navegación

### Three.js 🌐

- **React 19.1.0** - Framework de interfaz de usuario
- **Three.js v0.176.0** - Motor de renderizado 3D WebGL
- **React Three Fiber v9.1.2** - Integración declarativa de Three.js con React
- **React Three Drei v10.0.8** - Helpers y abstracciones para R3F
- **TypeScript 5.8.3** - Tipado estático para mejor desarrollo
- **Vite 6.3.5** - Build tool ultrarrápido
- **Bun** - Runtime y gestor de paquetes

📌 Implementación completa en Three.js con React Three Fiber

---

## 📁 Estructura del Proyecto

```
2025-05-24_taller_espacios_proyectivos/
├── python/                           # Implementación Python
│   ├── main.py                      # Demostración principal con matrices
│   ├── proyeccion_interactiva.py   # Visualización interactiva
│   ├── requirements.txt            # Dependencias Python
│   ├── demostracion_proyecciones.png # Resultado estático
│   └── README.md                   # Documentación Python
├── processing/                      # Implementación Processing
│   └── processing/
│       └── processing.pde          # Sketch principal
├── threejs/                         # Implementación Three.js
│   ├── src/                        # Código fuente
│   │   ├── App.tsx                # Aplicación principal con toda la lógica
│   │   ├── App.css                # Estilos de la aplicación
│   │   ├── index.css              # Estilos globales
│   │   ├── main.tsx               # Punto de entrada
│   │   └── assets/                # Recursos estáticos
│   ├── public/                     # Archivos públicos
│   ├── package.json               # Dependencias del proyecto
│   ├── tsconfig.json              # Configuración TypeScript
│   ├── vite.config.ts             # Configuración Vite
│   └── index.html                 # HTML principal
├── resultado/                      # Evidencias visuales
│   ├── python_space_proyective.gif    # Demo Python
│   ├── processing_space_proyective.gif # Demo Processing
│   └── threejs_space_proyective.gif   # Demo Three.js
└── README.md                       # Esta documentación
```

---

## 🧪 Implementaciones

### 🐍 Python: Visualización y Cálculo de Proyección

#### 📌 Implementación de Matrices de Proyección

```python
# Función para proyección perspectiva
def proyectar_perspectiva(puntos, d=1.0):
    """
    Aplica proyección perspectiva a puntos 3D.
    d: distancia focal (distancia del punto de vista al plano de proyección)
    """
    # Matriz de proyección perspectiva
    P_perspectiva = np.array([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 1/d, 0]
    ])

    # Convertir a coordenadas homogéneas
    puntos_hom = np.vstack((puntos, np.ones((1, puntos.shape[1]))))

    # Aplicar proyección
    proy = P_perspectiva @ puntos_hom

    # Normalizar dividiendo por w
    proy = proy / proy[-1, :]

    return proy[:2]  # Retornar solo x, y
```

#### 📌 Demostración de Coordenadas Homogéneas

```python
# Punto en coordenadas cartesianas
punto_3d = np.array([2, 3, 4])

# Convertir a coordenadas homogéneas
punto_hom = np.append(punto_3d, 1)  # [2, 3, 4, 1]

# Múltiples representaciones del mismo punto
# [2, 3, 4, 1] ≡ [4, 6, 8, 2] ≡ [6, 9, 12, 3]
```

#### 📌 Resultados Python

![Demostración Python de Proyecciones](./resultado/python_space_proyective.gif)

La implementación en Python muestra:

- ✅ **Visualización 3D original** del cubo en el espacio
- ✅ **Proyección ortogonal** donde el tamaño se mantiene constante
- ✅ **Proyección perspectiva** con diferentes distancias focales (d=0.5, 1.0, 2.0, 5.0)
- ✅ **Efecto de la distancia focal**: A menor d, mayor distorsión perspectiva

---

### 🎨 Processing: Simulación 3D Interactiva

#### 📌 Configuración de Cámaras en Processing

```java
void configurarCamara() {
  if (usarPerspectiva) {
    // Proyección en perspectiva
    float fov = PI/2.8; // Campo de visión ~64°
    float aspectRatio = float(width)/float(height);
    float nearPlane = 50;
    float farPlane = 3000;
    perspective(fov, aspectRatio, nearPlane, farPlane);
  } else {
    // Proyección ortográfica
    float orthoSize = 400 * zoom;
    ortho(-orthoSize, orthoSize,
         -orthoSize * height/width, orthoSize * height/width,
         -2000, 2000);
  }
}
```

#### 📌 Controles Interactivos

- **[P]** - Cambiar entre proyección perspectiva/ortográfica
- **[Mouse]** - Rotar vista arrastrando
- **[Rueda]** - Zoom in/out
- **[↑↓]** - Ajustar distancia de cámara
- **[R]** - Resetear vista
- **[SPACE]** - Animación automática

#### 📌 Resultados Processing

![Demostración Processing de Proyecciones](./resultado/processing_space_proyective.gif)

La implementación en Processing demuestra:

- ✅ **8 cubos distribuidos** a lo largo del eje Z con diferentes colores
- ✅ **Grid de referencia** en el plano XZ (Y=0)
- ✅ **Ejes coordenados** con colores distintivos (X=rojo, Y=verde, Z=azul)
- ✅ **Información técnica en tiempo real** de los parámetros de proyección
- ✅ **Transición instantánea** entre modos de proyección
- ✅ **Esferas de referencia** en las esquinas para mejor percepción espacial

---

### 🌐 Three.js: Aplicación Web Moderna

#### 📌 Configuración de Cámaras con React Three Fiber

```tsx
// Cámara Perspectiva
{
  cameraType === 'perspective' && (
    <PerspectiveCamera
      makeDefault
      position={[5, 5, 8]}
      fov={75}
      near={0.1}
      far={1000}
    />
  );
}

// Cámara Ortográfica
{
  cameraType === 'orthographic' && (
    <OrthographicCamera
      makeDefault
      position={[5, 5, 8]}
      left={-10}
      right={10}
      top={10}
      bottom={-10}
      near={0.1}
      far={1000}
    />
  );
}
```

#### 📌 Escena 3D con Objetos en Diferentes Profundidades

```tsx
// Componente para objetos 3D con etiquetas
function Object3D({ position, color, label, scale = 1 }) {
  return (
    <group position={position}>
      <Box scale={[scale, scale, scale]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Text
        position={[0, scale + 0.8, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

// Distribución de objetos en el eje Z
<Object3D
  position={[0, 0, 0]}
  color="#ff6b6b"
  label="Objeto Cerca (z=0)"
  scale={1}
/>
<Object3D
  position={[0, 0, -4]}
  color="#4ecdc4"
  label="Objeto Medio (z=-4)"
  scale={1.2}
/>
<Object3D
  position={[0, 0, -8]}
  color="#45b7d1"
  label="Objeto Lejos (z=-8)"
  scale={1.5}
/>
```

#### 📌 Resultados Three.js

![Demostración Three.js de Proyecciones](./resultado/threejs_space_proyective.gif)

La implementación en Three.js presenta:

- ✅ **3 cubos con etiquetas** posicionados en z=0, z=-4, z=-8
- ✅ **OrbitControls** para navegación libre con mouse
- ✅ **Cambio instantáneo** entre cámaras perspectiva (FOV 75°) y ortográfica
- ✅ **UI informativa con dos paneles**:
  - Panel izquierdo: Controles y navegación
  - Panel derecho: Explicación del tipo de proyección actual
- ✅ **Plano de referencia** semi-transparente y líneas de profundidad
- ✅ **Iluminación múltiple**: Ambiental, puntual y direccional
- ✅ **Código etiquetado**: Cada objeto muestra su posición Z

---

## 📊 Comparación de Resultados

### 🎯 Proyección en Perspectiva:

| Característica         | Python                       | Processing                    | Three.js                |
| ---------------------- | ---------------------------- | ----------------------------- | ----------------------- |
| Efecto de profundidad  | ✅ Visible en gráficos       | ✅ Interactivo en tiempo real | ✅ Fotorrealista        |
| Convergencia de líneas | ✅ Calculado matemáticamente | ✅ Grid convergente           | ✅ Visualmente perfecto |
| FOV configurable       | ✅ Mediante parámetro d      | ✅ PI/2.8 (~64°)              | ✅ 50° ajustable        |
| Puntos de fuga         | ✅ Demostrado                | ✅ Observable                 | ✅ Natural              |

### 📐 Proyección Ortográfica:

| Característica   | Python                    | Processing           | Three.js                  |
| ---------------- | ------------------------- | -------------------- | ------------------------- |
| Tamaño uniforme  | ✅ Matemáticamente exacto | ✅ Visualmente claro | ✅ Perfectamente paralelo |
| Líneas paralelas | ✅ Sin convergencia       | ✅ Grid rectangular  | ✅ Preservadas            |
| Vista técnica    | ✅ Ideal para análisis    | ✅ Modo diseño       | ✅ Precisión técnica      |
| Sin distorsión   | ✅ Comprobado             | ✅ Evidente          | ✅ Garantizado            |

---

## 🔍 Comprensión de las Matrices de Proyección

### Matriz de Proyección en Perspectiva (4x4)

```
┌─            ─┐
│ 1  0  0   0 │
│ 0  1  0   0 │
│ 0  0  1   0 │
│ 0  0  1/d 0 │
└─            ─┘
```

La cámara transforma puntos 3D usando:

1. **Matriz de Vista**: Posiciona la cámara en el espacio
2. **Matriz de Proyección**: Aplica la perspectiva basada en FOV, aspect ratio, near/far
3. **División perspectiva**: w-division para obtener coordenadas normalizadas

### Matriz de Proyección Ortográfica (4x4)

```
┌─                    ─┐
│ 2/(r-l)   0    0  0 │
│ 0    2/(t-b)  0  0 │
│ 0    0    -2/(f-n) 0 │
│ 0    0    0    1    │
└─                    ─┘
```

Mapeo lineal sin división perspectiva:

1. **Escalado uniforme**: Basado en left/right/top/bottom
2. **Sin componente w**: Preserva paralelismo
3. **Transformación afín**: Mantiene proporciones

---

## 💡 Prompts Utilizados

### Para Python:

1. **"Implementar funciones de proyección ortogonal y perspectiva usando numpy con coordenadas homogéneas"**
2. **"Crear visualización comparativa de un cubo 3D con diferentes distancias focales"**
3. **"Agregar demostración de coordenadas homogéneas y explicación de geometrías"**

### Para Processing:

1. **"Crear sketch interactivo que muestre diferencia entre proyección perspectiva y ortográfica con cubos en el eje Z"**
2. **"Añadir controles de mouse y teclado para navegación 3D y cambio de proyección"**
3. **"Implementar grid de referencia y ejes coordenados con información técnica en pantalla"**

### Para Three.js:

1. **"Crear una aplicación Three.js con React que muestre la diferencia entre proyección perspectiva y ortográfica"**
2. **"Añadir objetos 3D distribuidos en diferentes profundidades para visualizar mejor las diferencias de proyección"**
3. **"Implementar panel de información que muestre los parámetros de la cámara en tiempo real"**
4. **"Agregar explicaciones visuales sobre las características de cada tipo de proyección"**

---

## 💬 Reflexión Final

Este taller me permitió comprender profundamente cómo las **matrices de proyección** transforman una escena 3D en una imagen 2D. La diferencia entre **proyección perspectiva y ortográfica** no es solo visual, sino matemática: mientras la perspectiva utiliza división por w para crear profundidad, la ortográfica mantiene una transformación lineal.

### 🎯 Aprendizajes Clave:

1. **Coordenadas Homogéneas**: La cuarta componente (w) permite representar puntos en el infinito y facilita las transformaciones proyectivas.

2. **Pipeline de Transformación**: `Proyección × Vista × Modelo × Vértice = Posición en pantalla`

3. **Frustum de Cámara**:

   - En perspectiva: pirámide truncada que explica la convergencia
   - En ortográfica: prisma rectangular que mantiene el paralelismo

4. **Aplicaciones Prácticas**:
   - **Perspectiva**: Videojuegos, simulaciones, renderizado fotorrealista
   - **Ortográfica**: CAD, diseño técnico, interfaces 2D en 3D

### 🚀 Para Futuros Proyectos:

- **Optimización de renderizado** mediante frustum culling
- **Efectos visuales** como profundidad de campo o niebla volumétrica
- **Interfaces técnicas** que requieran vistas ortográficas precisas
- **Realidad aumentada** donde la proyección debe coincidir con la cámara real
- **Sistemas multi-cámara** con diferentes tipos de proyección simultáneas

La implementación práctica en tres entornos diferentes (Python para cálculos, Processing para interactividad, Three.js para web) me dio una comprensión completa de cómo funcionan las proyecciones en el pipeline gráfico moderno.
