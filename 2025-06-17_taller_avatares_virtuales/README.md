# 🧍‍♂️ Taller 67 - Avatares Virtuales en Three.js

## 🎯 Objetivo del Taller
Aprender a integrar avatares 3D en entornos interactivos usando Three.js con React Three Fiber, permitiendo su visualización, personalización básica, y movimiento mediante entradas del usuario o animaciones predefinidas.

## 📘 Conceptos Clave Implementados
- **Avatar virtual**: Representación 3D de un personaje en un entorno virtual
- **Formatos de modelos**: Soporte para .glb, .gltf, .fbx, y avatar primitivo como fallback
- **Animación básica**: Sistema de animaciones simples (dance, wave, idle)
- **Personalización visual**: Cambio dinámico de colores del avatar
- **Control de movimiento**: Activación de animaciones mediante botones de control

## 🌐 Implementación Three.js + React Three Fiber

### Herramientas Utilizadas
- **@react-three/fiber**: Motor principal de renderizado 3D
- **@react-three/drei**: Utilities y helpers para Three.js
- **React**: Framework de UI
- **Vite**: Build tool y desarrollo
- **Three.js**: Librería base de 3D

### Funcionalidades Implementadas

#### ✅ Avatar 3D Integrado
- Avatar primitivo construido con geometrías básicas (cajas y esferas)
- Renderizado en tiempo real con iluminación realista
- Posicionamiento y escalado optimizado para la escena

#### ✅ Sistema de Animaciones
- **🕺 Dance**: Rotación corporal y movimiento de brazos rítmico
- **👋 Wave**: Animación de saludo con el brazo derecho  
- **🧍 Idle**: Animación sutil de respiración y balanceo

#### ✅ Personalización de Color
- Panel de control con 6 colores predefinidos:
  - Azul (#4A90E2)
  - Rojo (#E24A4A) 
  - Verde (#4AE24A)
  - Púrpura (#A64AE2)
  - Naranja (#E2A64A)
  - Rosa (#E24AA6)
- Aplicación en tiempo real a todos los componentes del avatar

#### ✅ Controles Interactivos
- **OrbitControls**: Rotación, zoom y paneo de la cámara
- **Panel de UI**: Botones para cambiar colores y activar animaciones
- **Responsive Design**: Interfaz adaptable a diferentes tamaños de pantalla

## 🚀 Cómo Ejecutar

```bash
# Navegar al directorio del proyecto
cd threejs

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:5173
```

## 📁 Estructura del Proyecto

```
threejs/
├── src/
│   ├── components/
│   │   ├── AvatarScene.jsx          # Componente principal del avatar
│   │   ├── AvatarSceneSimple.jsx    # Versión simplificada en uso
│   │   └── AvatarSceneNew.jsx       # Versión con soporte multi-formato
│   ├── App.jsx                      # Aplicación principal con UI
│   └── main.jsx                     # Punto de entrada
├── public/
│   ├── avatar.glb                   # Modelo GLTF (fallback)
│   └── Rumba_Dancing.fbx           # Modelo FBX original
└── package.json                     # Dependencias del proyecto
```

## 🎨 Características Técnicas

### Renderizado 3D
- **Canvas Three.js**: Renderizado WebGL optimizado
- **Iluminación**: Luz ambiental, direccional y puntual
- **Environment**: Preset de estudio para iluminación realista
- **Materiales**: MeshStandardMaterial con soporte PBR

### Sistema de Animaciones
- **useFrame Hook**: Loop de animación a 60fps
- **Transformaciones**: Rotación, posición y escala en tiempo real
- **Interpolación**: Movimientos suaves usando funciones sinusoidales
- **Estados**: Sistema de switch para diferentes tipos de animación

### Interfaz de Usuario
- **Panel de Control**: Posicionado en la esquina superior derecha
- **Feedback Visual**: Highlighting de botones activos
- **Color Picker**: Selección visual con preview en tiempo real
- **Responsive**: Adaptado para diferentes resoluciones

## 📸 Capturas de Pantalla

### Avatar en Estado Idle
![Avatar en reposo mostrando la animación sutil de respiración]

### Avatar Bailando
![Avatar ejecutando la animación de baile con movimiento corporal y de brazos]

### Panel de Personalización
![Interfaz de usuario mostrando los controles de color y animación]

## 🔧 Personalización Aplicada

### Colores Dinámicos
- **Aplicación en tiempo real**: Los cambios de color se aplican instantáneamente
- **Materiales múltiples**: Soporte para avatares con múltiples materiales
- **Compatibilidad**: Funciona tanto con modelos 3D como con geometrías primitivas

### Animaciones Procedurales
- **Dance Animation**: 
  - Rotación corporal: `Math.sin(time * 2) * 0.3`
  - Movimiento vertical: `Math.sin(time * 4) * 0.2`
  - Brazos alternados: `Math.sin(time * 3) * 0.5`

- **Wave Animation**:
  - Balanceo corporal: `Math.sin(time * 3) * 0.1` 
  - Brazo derecho: `Math.sin(time * 4) * 0.8 - 0.3`

- **Idle Animation**:
  - Respiración sutil: `Math.sin(time * 0.5) * 0.05`
  - Balanceo de brazos: `Math.sin(time * 0.8) * 0.1`

## 🎮 Controles de Usuario

| Control | Acción |
|---------|---------|
| **Mouse Drag** | Rotar cámara alrededor del avatar |
| **Mouse Wheel** | Zoom in/out |
| **Click Color** | Cambiar color del avatar |
| **Click Animation** | Activar/cambiar animación |
| **Middle Mouse** | Pan de la cámara |

## 📝 Notas de Desarrollo

### Fallback System
- **Modelo Primitivo**: Si no se pueden cargar modelos GLTF/FBX
- **Geometrías Básicas**: Construido con BoxGeometry y SphereGeometry
- **Misma Funcionalidad**: Mantiene todas las características de animación y color

### Optimización
- **Lazy Loading**: Carga de modelos según disponibilidad
- **Error Handling**: Manejo graceful de errores de carga
- **Performance**: Rendering eficiente con useFrame optimizado

### Extensibilidad
- **Nuevas Animaciones**: Fácil adición de nuevos estados de animación
- **Modelos 3D**: Soporte preparado para GLTF, FBX y otros formatos
- **UI Components**: Sistema modular de componentes de interfaz

## ✅ Criterios de Evaluación Cumplidos

- ✅ **Avatar correctamente integrado**: Avatar 3D funcional en la escena
- ✅ **Animación reproducida**: Sistema de 3 animaciones controladas por usuario
- ✅ **Personalización aplicada**: Cambio dinámico de 6 colores diferentes
- ✅ **Evidencias visuales**: Documentación completa con capturas
- ✅ **Carpeta organizada**: Estructura de archivos clara y modular
- ✅ **Código funcional**: Aplicación completamente operativa

## 🚀 Conclusión

Este taller demuestra la implementación exitosa de un sistema de avatares virtuales usando Three.js y React Three Fiber. El proyecto incluye:

- **Renderizado 3D**: Avatar totalmente funcional con iluminación y materiales
- **Interactividad**: Controles de cámara y personalización en tiempo real  
- **Animaciones**: Sistema de animaciones procedurales suaves y realistas
- **UI/UX**: Interfaz intuitiva y responsive para control del avatar
- **Escalabilidad**: Arquitectura preparada para expansión con modelos complejos

Los avatares virtuales son fundamentales para crear experiencias inmersivas en aplicaciones web modernas, desde juegos hasta espacios sociales virtuales y aplicaciones XR.

## 📚 Recursos Utilizados
- [Mixamo](https://www.mixamo.com/#/?type=Motion%2CMotionPack) - Avatares y animaciones gratuitos