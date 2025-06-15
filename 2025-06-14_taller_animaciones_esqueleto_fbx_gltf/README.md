# 🧪 Taller - Animaciones por Esqueleto: Importando y Reproduciendo Animaciones

## 🎯 Objetivo

Este taller tiene como objetivo trabajar con animaciones basadas en huesos (esqueleto) y reproducirlas desde archivos externos como `.FBX` o `.GLTF`. Se busca comprender cómo funcionan las animaciones esqueléticas, cómo importarlas correctamente y cómo integrarlas en escenas interactivas.

## 🦴 ¿Qué son las Animaciones por Esqueleto?

### Concepto Principal

Las **animaciones por esqueleto** (skeletal animation) son una técnica de animación 3D que utiliza un sistema jerárquico de huesos (bones) para deformar la geometría de un modelo. Este sistema permite crear animaciones complejas y realistas de manera eficiente.

### Componentes del Sistema

1. **Rig/Armature (Esqueleto)**
   - Estructura jerárquica de huesos conectados
   - Define la "columna vertebral" del modelo
   - Cada hueso puede influir en partes específicas de la geometría

2. **Skinning (Vinculación)**
   - Proceso que vincula los vértices del modelo a los huesos
   - Cada vértice tiene pesos que determinan qué huesos lo afectan
   - Permite deformaciones suaves y naturales

3. **Animation Clips (Clips de Animación)**
   - Secuencias de keyframes que definen el movimiento de cada hueso
   - Pueden incluir rotación, posición y escala a lo largo del tiempo
   - Se pueden combinar y mezclar para crear animaciones complejas

4. **Animation Mixer (Mezclador)**
   - Sistema que gestiona la reproducción de múltiples animaciones
   - Permite transiciones suaves entre diferentes clips
   - Controla el timing y la velocidad de reproducción

### Ventajas del Sistema

✅ **Eficiencia de almacenamiento**: Los datos de animación se almacenan como transformaciones de huesos, no como posiciones de vértices

✅ **Transiciones suaves**: El mixer permite fundidos entre animaciones para evitar saltos bruscos

✅ **Reutilización**: Un mismo esqueleto puede usarse para múltiples animaciones

✅ **Control granular**: Posibilidad de controlar partes específicas del cuerpo independientemente

✅ **Escalabilidad**: Funciona bien tanto para modelos simples como complejos

## 🛠️ Implementación Técnica

### Tecnologías Utilizadas

- **Three.js**: Motor de renderizado 3D
- **React Three Fiber**: Wrapper de React para Three.js
- **@react-three/drei**: Utilidades y helpers adicionales
- **GLTF**: Formato de archivo 3D estándar para web

### Estructura del Proyecto

```
threejs/
├── src/
│   ├── components/
│   │   ├── AnimatedCharacter.jsx    # Componente principal del personaje animado
│   │   ├── AnimationInfo.jsx        # Panel de información sobre el sistema
│   │   ├── FallbackCharacter.jsx    # Modelo de respaldo simple
│   │   └── TestCharacter.jsx        # Componente experimental
│   ├── App.jsx                      # Aplicación principal
│   └── main.jsx                     # Punto de entrada
├── public/
│   └── ImageToStl.com_Running+Up+Stairs/
│       └── Running Up Stairs.glb    # Modelo 3D con animaciones
└── package.json                     # Dependencias del proyecto
```

### Componentes Clave

#### `AnimatedCharacter.jsx`

Este es el componente principal que maneja la carga y reproducción de animaciones:

**Características principales:**
- Utiliza `useGLTF()` para cargar el modelo .glb
- Implementa `useAnimations()` para controlar los clips de animación
- Gestiona transiciones suaves con `fadeIn()` y `fadeOut()`
- Configura automáticamente sombras y materiales
- Proporciona feedback visual durante la carga

**Funcionalidades:**
- Carga automática del modelo desde el directorio público
- Detección automática de animaciones disponibles
- Control de reproducción con transiciones suaves
- Escalado y posicionamiento automático del modelo
- Manejo de errores y estados de carga

#### `AnimationInfo.jsx`

Componente educativo que explica el sistema de animación:

**Contenido:**
- Explicación teórica del sistema de esqueleto
- Descripción de cada componente (rig, skinning, clips, mixer)
- Ventajas del sistema de animación por huesos
- Información específica de la animación actual
- Consejos y tips de uso

### Flujo de Animación

1. **Carga del Modelo**
   ```javascript
   const { scene, animations } = useGLTF('/path/to/model.glb')
   ```

2. **Configuración del Mixer**
   ```javascript
   const { actions, mixer } = useAnimations(animations, groupRef)
   ```

3. **Reproducción de Animación**
   ```javascript
   const action = actions[animationName]
   action.reset()
   action.fadeIn(0.5)
   action.play()
   ```

4. **Actualización en el Loop**
   ```javascript
   useFrame((state, delta) => {
     if (mixer) mixer.update(delta)
   })
   ```

## 🎮 Controles de la Aplicación

### Interfaz de Usuario

- **Panel de Control**: Botones para cambiar entre animaciones disponibles
- **Información del Modelo**: Muestra el nombre del archivo y animación actual
- **Panel Educativo**: Accesible mediante el botón "ℹ️ Info Esqueleto"
- **Controles de Cámara**: Zoom, rotación y paneo con el mouse

### Interacciones

1. **Cambio de Animación**: Click en los botones del panel de control
2. **Navegación 3D**: 
   - **Rotar**: Arrastrar con botón izquierdo
   - **Zoom**: Rueda del mouse
   - **Paneo**: Arrastrar con botón derecho
3. **Información**: Toggle del panel educativo

## 📊 Características Implementadas

### ✅ Funcionalidades Básicas

- [x] Importación correcta de modelo con animación esquelética
- [x] Reproducción y control funcional de animaciones
- [x] Transiciones suaves entre animaciones
- [x] Escena clara, interactiva y sin errores de rigging
- [x] Código limpio, organizado y comentado

### ✅ Funcionalidades Avanzadas

- [x] Sistema de fallback para errores de carga
- [x] Precarga de modelos para mejor rendimiento
- [x] Panel educativo interactivo
- [x] Configuración automática de sombras
- [x] Interfaz responsive
- [x] Feedback visual de estados de carga
- [x] Detección automática de animaciones disponibles

### ✅ Características Técnicas

- [x] Manejo apropiado de memoria con `dispose()`
- [x] Optimización de renderizado
- [x] Manejo de errores robusto
- [x] Documentación completa del código
- [x] Separación clara de responsabilidades

## 🚀 Instrucciones de Ejecución

### Prerrequisitos

- Node.js v16+ instalado
- npm o yarn como gestor de paquetes

### Instalación y Ejecución

1. **Navegar al directorio del proyecto**:
   ```bash
   cd threejs/
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abrir en navegador**:
   - La aplicación se ejecutará en `http://localhost:5173`
   - Se abrirá automáticamente en el navegador predeterminado

### Comandos Adicionales

```bash
# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview

# Ejecutar linter
npm run lint
```

## 📁 Modelo Utilizado

### Archivo: `Running Up Stairs.glb`

**Características:**
- Formato: GLTF Binary (.glb)
- Fuente: ImageToStl.com
- Tipo: Modelo humanoide con animación de correr
- Esqueleto: Sistema completo de huesos para cuerpo humano
- Animaciones: Incluye clips de movimiento realista

**Ubicación**: `/public/ImageToStl.com_Running+Up+Stairs/Running Up Stairs.glb`

## 🔬 Análisis Técnico del Sistema

### Pipeline de Animación

1. **Carga**: El modelo se carga asincrónicamente usando `useGLTF`
2. **Parseo**: Three.js extrae la geometría, materiales y clips de animación
3. **Configuración**: Se configura el mixer y se crean las acciones
4. **Reproducción**: El mixer actualiza las transformaciones de huesos cada frame
5. **Renderizado**: Three.js aplica las deformaciones y renderiza el resultado

### Optimizaciones Implementadas

- **Preload**: `useGLTF.preload()` carga el modelo antes de renderizar
- **Dispose**: Limpieza automática de recursos para evitar memory leaks
- **Suspense**: Renderizado progresivo con fallbacks
- **Memoización**: Evita recrear objetos innecesariamente

## 🎓 Aprendizajes del Taller

### Conceptos Técnicos

1. **Jerarquía de Huesos**: Comprensión de cómo los huesos padres afectan a los hijos
2. **Pesos de Skinning**: Influencia de cada hueso en los vértices del modelo
3. **Interpolación**: Cómo se calculan las posiciones intermedias entre keyframes
4. **Mixing**: Técnicas para combinar múltiples animaciones

### Habilidades Prácticas

1. **Importación de Modelos**: Manejo de archivos GLTF/GLB en web
2. **Control de Animaciones**: Uso de APIs de Three.js para animación
3. **Gestión de Estado**: Sincronización entre React y Three.js
4. **Optimización**: Técnicas para mejorar el rendimiento de animaciones 3D

## 🔮 Posibles Extensiones

### Funcionalidades Adicionales

- **Control de Velocidad**: Slider para ajustar la velocidad de animación
- **Modo Wireframe**: Visualización del esqueleto de huesos
- **Análisis de Performance**: Métricas de FPS y uso de memoria
- **Grabación**: Capacidad de exportar animaciones como video
- **Editor de Transiciones**: Control manual de tiempos de fade

### Integración con Otros Sistemas

- **Física**: Integración con motores de física (Cannon.js, Ammo.js)
- **IA**: Control de animaciones mediante algoritmos de comportamiento
- **Multijugador**: Sincronización de animaciones entre múltiples usuarios
- **VR/AR**: Adaptación para realidad virtual y aumentada

## 📚 Referencias y Recursos

### Documentación Técnica

- [Three.js Animation System](https://threejs.org/docs/#manual/en/introduction/Animation-system)
- [React Three Fiber Animations](https://docs.pmnd.rs/react-three-fiber/tutorials/loading-models)
- [GLTF Specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)

### Herramientas Recomendadas

- **Blender**: Para crear y editar modelos con animaciones
- **Mixamo**: Biblioteca de animaciones predefinidas
- **GLTF Viewer**: Para validar modelos antes de la implementación

---

**Fecha de creación**: 14 de Junio, 2025  
**Autor**: Taller de Computación Visual  
**Tecnologías**: Three.js, React, GLTF, JavaScript ES6+
