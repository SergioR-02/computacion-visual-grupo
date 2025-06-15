# 🧪 Taller - Dashboards Visuales 3D: Sliders y Botones para Controlar Escenas

## 📅 Fecha

`2025-06-15` – Fecha de entrega

---

## 🎯 Objetivo del Taller

Crear interfaces gráficas 3D interactivas que permitan al usuario controlar elementos de una escena, como transformaciones, colores, materiales y luces. El propósito es construir paneles funcionales y visuales que conecten entradas de usuario (sliders, botones) con la modificación en tiempo real de objetos 3D usando React Three Fiber y la librería Leva para controles GUI.

---

## 🧠 Conceptos Aprendidos

### 🎯 Conceptos Principales Aplicados:

#### 🔄 **Transformaciones Geométricas 3D**

- [x] **Escalado dinámico**: Control en tiempo real del tamaño de objetos
- [x] **Rotación automática**: Animaciones continuas con velocidad variable
- [x] **Traslación interactiva**: Posicionamiento de objetos y luces en el espacio 3D
- [x] **Transformaciones matriciales**: Aplicación de múltiples transformaciones simultáneas

#### 🎨 **Renderizado y Materiales**

- [x] **Materiales PBR (Physically Based Rendering)**:
  - Roughness (rugosidad) para control de reflectividad
  - Metalness (metalicidad) para propiedades metálicas
  - Emissive colors para efectos de brillo
- [x] **Tipos de materiales**: Standard, Phong, Lambert con propiedades diferenciadas
- [x] **Wireframe rendering**: Visualización de estructura geométrica
- [x] **Transparencia y opacidad**: Control de visibilidad de **objetos**

#### 💡 **Sistema de Iluminación 3D**

- [x] **Luz ambiental**: Iluminación global uniforme
- [x] **Luz direccional**: Simulación de luz solar con sombras
- [x] **Luz puntual**: Fuentes de luz localizadas con atenuación
- [x] **Luz de foco (spotlight)**: Iluminación direccional con ángulo y penumbra
- [x] **Proyección de sombras**: Cálculo y renderizado de sombras dinámicas

#### 🖥️ **Interfaces de Usuario 3D**
****
- [x] **Controles GUI interactivos**: Sliders, botones, selectores de color
- [x] **Binding en tiempo real**: Sincronización entre controles y propiedades 3D
- [x] **Organización de paneles**: Agrupación lógica de controles por funcionalidad
- [x] **Feedback visual inmediato**: Respuesta instantánea a cambios de usuario

#### ⚛️ **Arquitectura React 3D**

- [x] **React Three Fiber**: Integración de Three.js con React
- [x] **Hooks personalizados**: useFrame, useControls para lógica 3D
- [x] **Componentes 3D reutilizables**: Modularización de objetos y luces
- [x] **Estado reactivo**: Gestión de estado entre componentes 3D

#### 🔧 **Herramientas de Desarrollo**

- [x] **TypeScript**: Tipado fuerte para desarrollo 3D
- [x] **Leva**: Librería especializada para controles GUI
- [x] **Vite**: Bundling y desarrollo rápido
- [x] **React DevTools**: Debugging de componentes 3D

---

## 🔧 Herramientas y Entornos

- **Three.js / React Three Fiber** ✅
  - React 19.1.0
  - Three.js 0.177.0
  - @react-three/fiber 9.1.2
  - @react-three/drei 10.1.2
  - Leva 0.10.0 (Panel de controles GUI)
  - TypeScript + Vite

---

## 📁 Estructura del Proyecto

```
2025-06-07_taller_dashboards_visuales_3d_sliders_botones/
├── threejs/                   # Aplicación React Three Fiber
│   ├── src/
│   │   ├── components/
│   │   │   ├── Scene.tsx      # Escena principal 3D
│   │   │   │   └── Lights.tsx     # Sistema de iluminación
│   │   │   └── InteractiveObject.tsx  # Objetos controlables
│   │   ├── App.tsx           # Componente principal
│   │   └── main.tsx          # Punto de entrada
│   ├── package.json          # Dependencias del proyecto
│   └── README.md
├── results/                   # Capturas y GIFs de demostración
│   └── Result_slider_buttons.gif
└── README.md                 # Este archivo
```

📎 Sigue la estructura de entregas descrita en la [guía GitLab](./guia_gitlab_computacion_visual.md)

---

## 🧪 Implementación

### 🔹 Etapas realizadas

1. **Configuración del entorno**: Setup de React + Three.js + TypeScript con Vite
2. **Creación de objetos 3D**: Implementación de geometrías interactivas (cubo, esfera, toro)
3. **Sistema de controles GUI**: Integración de Leva para sliders y botones
4. **Sistema de iluminación**: Luces ambiental, direccional, puntual y de foco controlables
5. **Interactividad en tiempo real**: Conexión de controles con propiedades de objetos y luces

### 🔹 Código relevante

Incluye un fragmento que resuma el corazón del taller:

```tsx
// Control interactivo de objetos 3D con Leva
const { scale, color, roughness, metalness, rotationSpeed } = useControls(
  name,
  {
    scale: { value: 1, min: 0.1, max: 3, step: 0.1 },
    color: { value: '#ff6b6b' },
    roughness: { value: 0.5, min: 0, max: 1 },
    metalness: { value: 0.5, min: 0, max: 1 },
    rotationSpeed: { value: 1, min: 0, max: 5 },
  },
);

// Aplicación en tiempo real a la geometría
<mesh scale={[scale, scale, scale]}>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial
    color={color}
    roughness={roughness}
    metalness={metalness}
  />
</mesh>;
```

---

## 📊 Resultados Visuales

### 📌 Este taller **requiere explícitamente un GIF animado**:

![Dashboard 3D Interactivo](./results/Result_slider_buttons.gif)

**Demostración del dashboard 3D con controles interactivos:**

- 🎛️ Panel de controles Leva con sliders para transformaciones
- 📦 Objetos 3D (cubo, esfera, toro) con materiales PBR controlables
- 💡 Sistema de iluminación dinámico (ambiental, direccional, puntual, foco)
- 🎨 Control en tiempo real de colores, rugosidad, metalicidad
- 🔄 Animaciones y rotaciones automáticas
- 👁️ Controles de visibilidad y wireframe

> ✅ GIF incluido mostrando la interacción completa del dashboard

---

## 🧩 Prompts Usados

No se utilizaron prompts de IA generativa en este taller, ya que se enfoca en el desarrollo de interfaces interactivas 3D usando librerías especializadas.

📎 Usa buenas prácticas de prompts según la [guía de IA actualizada](./guia_prompts_inteligencias_artificiales_actualizada.md)

---

## 💬 Reflexión Final

**¿Qué aprendiste o reforzaste con este taller?**

Este taller me permitió profundizar en el ecosistema de React Three Fiber y la creación de interfaces 3D interactivas. Aprendí a integrar controles GUI usando Leva para manipular propiedades de objetos 3D en tiempo real, desde transformaciones básicas hasta propiedades avanzadas de materiales PBR (Physically Based Rendering). También reforcé conceptos de iluminación 3D y cómo diferentes tipos de luces afectan la apariencia de los materiales.

**¿Qué parte fue más compleja o interesante?**

La parte más interesante fue la sincronización en tiempo real entre los controles de la interfaz y las propiedades de los objetos 3D. Implementar un sistema de iluminación completo con múltiples tipos de luces (ambiental, direccional, puntual y de foco) y sus respectivos controles fue particularmente desafiante, especialmente al manejar las sombras y la interacción entre diferentes fuentes de luz.

**¿Qué mejorarías o qué aplicarías en futuros proyectos?**

Para futuros proyectos, me gustaría implementar presets de configuración que permitan guardar y cargar diferentes estados de la escena, añadir más tipos de geometrías y efectos post-procesamiento. También sería interesante integrar controles de animación más avanzados y la posibilidad de importar modelos 3D externos. Este conocimiento es directamente aplicable para crear herramientas de visualización de datos 3D, configuradores de productos, o aplicaciones educativas interactivas.

---
