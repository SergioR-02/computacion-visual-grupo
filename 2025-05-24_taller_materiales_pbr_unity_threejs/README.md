# 🎨 Taller - Materiales PBR (Physically Based Rendering) con Three.js

📅 **Fecha:** 2025-05-24 – Fecha de realización

🎯 **Objetivo del Taller:**
Implementar y experimentar con materiales PBR (Physically Based Rendering) utilizando Three.js y React Three Fiber. El taller explora los fundamentos del renderizado basado en física, permitiendo crear materiales realistas que responden correctamente a la iluminación y el entorno. Se desarrolló una aplicación interactiva para experimentar con diferentes propiedades de materiales en tiempo real.

---

## 🧠 Conceptos Aprendidos

Lista de conceptos clave aplicados en el taller:

* Fundamentos del renderizado basado en física (PBR)
* Propiedades fundamentales: albedo, roughness, metalness y normal maps
* Diferencias entre materiales dieléctricos y metálicos
* Implementación de MeshStandardMaterial y MeshPhysicalMaterial
* Uso de texturas para definir propiedades de superficie
* Configuración de iluminación para materiales PBR
* Mapas de entorno para reflexiones realistas
* Arquitectura de componentes React para visualización 3D

---

## 🔧 Herramientas y Entornos

* **React 19.1+** con React Three Fiber
* **Three.js** para renderizado 3D y materiales PBR
* **React Three Drei** para helpers y componentes adicionales
* **Leva** para controles interactivos en tiempo real
* **Vite** como bundler y servidor de desarrollo
* **IDE:** VSCode con extensiones para React y Three.js

---

## 📁 Estructura del Proyecto

```
taller_materiales_pbr/
├── threejs/
│   ├── src/
│   │   ├── App.jsx              # Componente principal con escena 
│   ├── public/
│   │   └── textures/            # Carpeta para texturas PBR
├── README.md                    # Este archivo
└── resultados/
    └── demo_pbr.gif             # Demostración del taller
```

---

## 🧪 Implementación

Este taller demuestra cómo Three.js puede crear materiales fotorrealistas mediante el uso de PBR. El sistema utiliza principios físicos para simular cómo la luz interactúa con diferentes tipos de superficies, desde metales pulidos hasta materiales rugosos y dieléctricos.

---

### 🔹 Fundamentos de PBR

PBR utiliza principios físicos para simular la interacción luz-materia de manera realista:

1. **Conservación de energía:** La luz reflejada nunca excede la luz incidente
2. **Microsuperficies:** Las superficies se modelan como conjuntos de microfacetas
3. **Función de distribución bidireccional (BRDF):** Define cómo se refleja la luz
4. **Separación difuso/especular:** Distinción clara entre reflexión difusa y especular

#### 📊 Propiedades fundamentales:
```javascript
// Propiedades básicas de un material PBR
const pbrMaterial = {
  albedo: color,           // Color base del material
  roughness: 0.5,          // Rugosidad de la superficie (0=espejo, 1=mate)
  metalness: 0.0,          // Carácter metálico (0=dieléctrico, 1=metálico)
  normal: normalMap,       // Detalles de superficie mediante normales
  ao: ambientOcclusion     // Oclusión ambiental para mayor realismo
}
```

---

### 🔹 Materiales Implementados

#### 🎯 **MeshPhysicalMaterial - PBR Avanzado**
```jsx
<meshPhysicalMaterial
  map={colorTexture}              // Albedo/Color base
  roughnessMap={roughnessTexture} // Variación de rugosidad
  metalnessMap={metalnessTexture} // Variación de metalness
  normalMap={normalTexture}       // Detalles de superficie
  
  roughness={roughness}           // Control global de rugosidad
  metalness={metalness}           // Control global de metalness
  color={color}                   // Tint de color
  
  clearcoat={clearcoat}           // Capa transparente adicional
  clearcoatRoughness={clearcoatRoughness}
  envMapIntensity={envMapIntensity} // Intensidad de reflexiones
/>
```


#### 📏 **Diferencias Clave:**
- **PBR:** Responde a iluminación, reflexiones realistas, conservación de energía
- **Básico:** Color uniforme, sin interacción lumínica, rendimiento optimizado


---

### 🔹 Sistema de Iluminación

#### 🌅 **Configuración de Luces**
```jsx
function Lighting() {
  return (
    <>
      {/* Luz ambiental suave */}
      <ambientLight intensity={0.3} />
      
      {/* Luz direccional principal con sombras */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Luz puntual de acento */}
      <pointLight 
        position={[-5, 5, 0]} 
        intensity={0.5} 
        color="#4fc3f7" 
      />
    </>
  )
}
```

#### 🌍 **Entorno HDRI**
```jsx
<Environment preset="sunset" />
```
- **Función:** Proporciona reflexiones realistas y iluminación ambiental
- **Presets:** sunset, dawn, night, warehouse, forest, apartment

---

### 🔹 Código Relevante

#### 📌 **Componente Principal PBR**
```jsx
function PBRObject({ position, geometry = "sphere" }) {
  const {
    roughness,
    metalness,
    color,
    normalScale,
    envMapIntensity
  } = useControls('Material PBR', {
    roughness: { value: 0.5, min: 0, max: 1, step: 0.01 },
    metalness: { value: 0.5, min: 0, max: 1, step: 0.01 },
    color: '#ffffff',
    normalScale: { value: 1, min: 0, max: 2, step: 0.1 },
    envMapIntensity: { value: 1, min: 0, max: 3, step: 0.1 }
  })

  // Cargar texturas PBR
  const colorTexture = useTexture('/textures/color.jpg')
  const roughnessTexture = useTexture('/textures/roughness.jpg')
  const metalnessTexture = useTexture('/textures/metalness.jpg')
  const normalTexture = useTexture('/textures/normal.jpg')

  return (
    <mesh position={position} castShadow receiveShadow>
      <GeometryComponent />
      <meshPhysicalMaterial
        map={colorTexture}
        roughnessMap={roughnessTexture}
        metalnessMap={metalnessTexture}
        normalMap={normalTexture}
        roughness={roughness}
        metalness={metalness}
        color={color}
        normalScale={[normalScale, normalScale]}
        envMapIntensity={envMapIntensity}
      />
    </mesh>
  )
}
```

#### 📌 **Escena Principal**
```jsx
function Scene() {
  const { objectType } = useControls('Geometría', {
    objectType: {
      value: 'sphere',
      options: ['sphere', 'box', 'torus']
    }
  })

  return (
    <>
      <Lighting />
      <Floor />
      
      {/* Objeto PBR para experimentación */}
      <PBRObject position={[-3, 0, 0]} geometry={objectType} />
      
      {/* Objeto básico para comparación */}
      <BasicObject position={[3, 0, 0]} />
      
      <Labels />
      <OrbitControls />
      <Environment preset="sunset" />
    </>
  )
}
```

---

## 🎮 Controles y Uso

### 🎛️ **Panel de Control Leva:**

#### **Material PBR:**
- **Roughness (0-1):** Controla la rugosidad de la superficie
- **Metalness (0-1):** Define si el material es metálico o dieléctrico
- **Color:** Tint de color aplicado al material
- **Normal Scale (0-2):** Intensidad del mapa de normales
- **Env Map Intensity (0-3):** Intensidad de las reflexiones del entorno
- **Clearcoat (0-1):** Capa transparente adicional
- **Clearcoat Roughness (0-1):** Rugosidad de la capa transparente

#### **Geometría:**
- **Object Type:** Selector entre esfera, cubo y toro

#### **Iluminación:**
- **Ambient Intensity:** Intensidad de luz ambiental
- **Directional Intensity:** Intensidad de luz direccional
- **Directional Position:** Posición XYZ de la luz direccional

#### **Material Básico:**
- **Basic Color:** Color del material de comparación

#### **Piso:**
- **Floor Color:** Color del suelo
- **Floor Roughness:** Rugosidad del suelo

### 🖱️ **Controles de Cámara:**
- **Rotación:** Clic izquierdo + arrastrar
- **Zoom:** Rueda del mouse
- **Pan:** Clic derecho + arrastrar (o Shift + clic izquierdo)

---

### **Scripts Disponibles:**
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Construir para producción
npm run preview  # Vista previa de la build
npm run lint     # Verificar código con ESLint
```

### **Dependencias Principales:**
```json
{
  "@react-three/drei": "^10.0.8",    // Helpers para R3F
  "@react-three/fiber": "^9.1.2",    // React Three Fiber
  "leva": "^0.10.0",                 // Panel de controles
  "react": "^19.1.0",                // React
  "three": "^0.176.0"                // Three.js
}
```

---

## 📊 Resultados Visuales

| Propiedad | Efecto Visual | Aplicación |
|-----------|---------------|------------|
| **Roughness 0.0** | Superficie espejada, reflexiones nítidas | Metales pulidos, vidrio |
| **Roughness 1.0** | Superficie mate, reflexiones difusas | Madera, tela, piedra |
| **Metalness 0.0** | Material dieléctrico, conserva color | Plásticos, cerámica |
| **Metalness 1.0** | Material metálico, reflexiones coloreadas | Oro, plata, cobre |
| **Normal Maps** | Detalles de superficie sin geometría extra | Texturas de superficie |
| **Environment** | Reflexiones realistas del entorno | Integración con el mundo |

![Demo PBR](resultados/ReactResultado.gif)

---

## 💬 Reflexión y Aprendizajes

### ✅ **Aspectos Exitosos:**
- **Realismo visual:** Los materiales PBR proporcionan un aspecto fotorrealista convincente
- **Interactividad:** Los controles en tiempo real facilitan la experimentación
- **Comparación directa:** El objeto con material básico muestra claramente las diferencias
- **Flexibilidad:** Múltiples geometrías demuestran cómo el material se adapta

### 📈 **Comprensión del PBR:**
- **Principios físicos:** Conservación de energía y comportamiento realista de la luz
- **Workflow moderno:** Uso de texturas especializadas para cada propiedad
- **Optimización:** Balance entre calidad visual y rendimiento
- **Versatilidad:** Un mismo sistema para materiales muy diversos

### 🔧 **Limitaciones Identificadas:**
- **Complejidad inicial:** PBR requiere comprensión de principios físicos
- **Dependencia de texturas:** Materiales realistas necesitan texturas de calidad
- **Rendimiento:** Más costoso computacionalmente que materiales básicos
- **Configuración de luces:** Requiere iluminación adecuada para mostrar todo el potencial

### 🚀 **Mejoras Posibles:**

- **Editor de materiales:** Interfaz visual para crear y guardar materiales
- **Biblioteca de materiales:** Colección de materiales predefinidos realistas
- **Raytracing en tiempo real:** Integración con tecnologías de trazado de rayos
- **Materiales procedurales:** Generación algorítmica de texturas
- **Exportación/Importación:** Compatibilidad con formatos estándar de la industria

### 🌟 **Casos de Uso Potenciales:**
- **Visualización de productos:** E-commerce con materiales realistas
- **Arquitectura:** Renderizado de materiales de construcción
- **Gaming:** Materiales realistas para videojuegos
- **Educación:** Enseñanza de principios de óptica y materiales
- **Arte digital:** Creación de obras con materiales fotorrealistas

### 🎨 **Comparación Material Básico vs PBR:**

| Característica | Material Básico | Material PBR |
|----------------|-----------------|--------------|
| **Iluminación** | Sin respuesta | Físicamente correcta |
| **Reflexiones** | No soporta | Reflexiones realistas |
| **Complejidad** | Muy simple | Moderadamente compleja |
| **Rendimiento** | Muy eficiente | Moderadamente costoso |
| **Realismo** | Limitado | Fotorrealista |
| **Flexibilidad** | Básica | Muy alta |

---

### 🧩 Prompts Usados

- "¿Cómo implementar materiales PBR en Three.js con React Three Fiber?"
- "¿Cuáles son las diferencias entre MeshStandardMaterial y MeshPhysicalMaterial?"
- "¿Cómo cargar y aplicar texturas PBR (albedo, roughness, metalness, normal) en Three.js?"
- "¿Cómo configurar iluminación adecuada para mostrar materiales PBR correctamente?"
- "¿Cómo crear controles interactivos con Leva para experimentar con propiedades PBR?"

---

### 💬 Reflexión Final  

Este taller demostró la potencia y versatilidad del renderizado basado en física (PBR) para crear materiales realistas en aplicaciones web. Más allá de los aspectos técnicos de Three.js y React Three Fiber, el proyecto proporcionó una comprensión profunda de cómo la luz interactúa con diferentes tipos de superficies en el mundo real.

La experimentación interactiva con diferentes valores de roughness y metalness reveló cómo pequeños cambios en las propiedades pueden transformar completamente la apariencia de un material. La comparación directa con materiales básicos destacó las ventajas del PBR para crear experiencias visuales convincentes.

El uso de herramientas modernas como Leva para controles en tiempo real y React Three Fiber para la integración con React demostró cómo las tecnologías web actuales pueden crear experiencias 3D sofisticadas y accesibles. Este conocimiento es fundamental para desarrollar aplicaciones de visualización, gaming, e-commerce y arte digital que requieran materiales realistas y convincentes.