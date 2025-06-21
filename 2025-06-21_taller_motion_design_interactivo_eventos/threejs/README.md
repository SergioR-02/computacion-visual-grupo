# 🎬 Motion Design Interactivo - Three.js + React Three Fiber

Este proyecto implementa un sistema de animaciones interactivas para un modelo 3D usando Three.js con React Three Fiber, cumpliendo con los requisitos específicos del taller de motion design interactivo.

## 📋 Características Implementadas

### ✅ Carga del Modelo
- Modelo `Untitled.glb` cargado con `useGLTF()` de @react-three/drei
- Manejo de animaciones embebidas con `useAnimations()`
- Animaciones disponibles: **ARM**, **CROUCHED**, **WALK**

### ✅ Eventos de Usuario Implementados

#### 1. 🖱️ **onClick** - Reproducir animación de WALK
- **Disparador**: Click en el modelo 3D
- **Acción**: Cambia automáticamente a la animación WALK
- **Efecto visual**: Escala temporal del modelo + indicador de click

#### 2. 👆 **onPointerOver** - Animación de idle/alert
- **Disparador**: Hover del mouse sobre el modelo
- **Acción**: Preview temporal de la animación ARM (idle/alert)
- **Transición**: Suave fadeIn/fadeOut entre animaciones
- **Indicador**: Tooltip con instrucciones

#### 3. ⌨️ **Controles de Teclado** - Tres tipos de evento
- **Teclas 1, 2, 3**: Cambio directo a ARM, CROUCHED, WALK respectivamente
- **Teclas A, C, W**: Accesos alternativos para las mismas animaciones
- **Espacio**: Cicla entre las tres animaciones disponibles
- **R**: Reset rápido a animación ARM
- **ESC**: Parar todas las animaciones

### ✅ Sistema de Transiciones
- **`.fadeIn()`** y **`.fadeOut()`**: Transiciones suaves entre estados
- **`.stop()`**: Control preciso de parada de animaciones
- Tiempo de transición configurable (0.3s - 0.5s)
- Prevención de conflictos durante transiciones

### ✅ Botones en Pantalla (Bonus)
- **Panel de Control**: Botones interactivos para cada animación
- **Estados Visuales**: Indicadores activos y colores diferenciados
- **Información en Tiempo Real**: Estado actual, historial y transiciones
- **Ayuda Contextual**: Overlay con guía completa de controles

## 🚀 Instalación y Ejecución

```bash
# Navegar al directorio del proyecto
cd "2025-06-21_taller_motion_design_interactivo_eventos/threejs"

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🎮 Controles de Interacción

### Controles de Teclado
| Tecla | Acción |
|-------|--------|
| `1` o `A` | Animación ARM |
| `2` o `C` | Animación CROUCHED |
| `3` o `W` | Animación WALK |
| `Espacio` | Siguiente animación |
| `R` | Reset a ARM |
| `ESC` | Parar animaciones |

### Controles de Mouse
| Acción | Resultado |
|--------|-----------|
| Click en modelo | Activar WALK |
| Hover en modelo | Preview ARM |
| Arrastrar | Rotar cámara |
| Scroll | Zoom |
| Click derecho | Pan |

### Botones UI
- **Botones de Animación**: Control directo desde la interfaz
- **Botón de Ayuda**: `❓` en esquina superior derecha
- **Estados Visuales**: Colores y efectos según animación activa

## 🎯 Cumplimiento de Requisitos

| Requisito | Estado | Implementación |
|-----------|--------|----------------|
| ✅ Cargar modelo con `useGLTF()` | Completo | `AnimatedModel` component |
| ✅ Manejar animaciones con `useAnimations()` | Completo | Hook personalizado |
| ✅ onClick para reproducir animación | Completo | Click → WALK |
| ✅ onPointerOver para idle/alert | Completo | Hover → ARM preview |
| ✅ Controlar transiciones con fadeIn/fadeOut | Completo | Sistema de transiciones |
| ✅ Botones en pantalla como disparadores | Completo | Panel de control UI |
| ✅ Tres tipos de evento (clic, teclado, cursor) | Completo | Mouse + Keyboard + UI |
| ✅ Activación de animaciones según interacción | Completo | Sistema de mapeo |
| ✅ Transiciones claras entre estados | Completo | Feedback visual |

## 📄 Licencia

Este proyecto es parte del taller de Computación Visual - Motion Design Interactivo.

---

**Desarrollado con ❤️ usando Three.js + React Three Fiber**
