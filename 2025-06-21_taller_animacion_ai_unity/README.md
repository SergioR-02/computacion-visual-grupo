# 🎮 Taller 60 - Animación con AI en Three.js para Personajes Autónomos

## 🎯 Objetivo del Taller
Explorar técnicas básicas para implementar comportamientos autónomos en personajes utilizando Three.js y React, simulando conceptos de inteligencia artificial como sistemas de navegación, detección de obstáculos, decisiones reactivas y control de animaciones en tiempo real en el entorno web.

## 🧠 Conceptos Clave Implementados

- **IA en videojuegos web**: Simulación de inteligencia para NPCs (Non-Playable Characters) usando JavaScript
- **Sistema de navegación**: Implementación de pathfinding básico que evita obstáculos (equivalente a NavMesh de Unity)
- **Control de animaciones**: Sistema de estados visuales que cambian según el comportamiento (equivalente a Animator de Unity)
- **Máquinas de estados**: Control de comportamientos y transiciones entre patrullaje, persecución y búsqueda
- **Algoritmos de decisión**: Reglas simples para activar diferentes estados según estímulos del entorno

Este proyecto demuestra cómo implementar conceptos de Unity en un entorno web moderno usando React y Three.js.

## 🚀 Características Implementadas

### 🤖 Personaje AI Avanzado
- **Navegación autónoma**: Patrullaje automático entre puntos predefinidos
- **Detección de jugador**: Radio de detección visual y editable
- **Velocidad editable**: Control en tiempo real de la velocidad del AI
- **Estados de comportamiento**:
  - 🚶 **Patrullaje**: Movimiento entre puntos (Verde) - Velocidad base
  - 🏃 **Persecución**: Sigue al jugador cuando lo detecta (Rojo) - 1.8x velocidad
  - 🔍 **Búsqueda**: Busca en la última posición conocida (Amarillo) - 1.2x velocidad
  - ⏸️ **Idle**: Estado de espera (Gris)

### 🎮 Personajes con Cabezas
- **Jugador (azul)**: Cabeza con ojos, pupilas y boca rosa
- **AI (multicolor)**: Cabeza con ojos que cambia de color según el estado
- **Detalles realistas**: Geometrías más elaboradas y expresivas

### 🎬 Sistema de Animaciones y Controles
- **Estados visuales**: Colores que cambian según el comportamiento del AI
- **Controles en tiempo real**:
  - 👁️ **Radio de detección**: Slider de 1.0 a 8.0 unidades
  - 🏃 **Velocidad del AI**: Slider de 0.5 a 6.0 unidades/segundo
- **Indicadores visuales**: Radio de detección, puntos de patrullaje y estado del AI

## 🛠️ Tecnologías Utilizadas

- **React**: Framework de interfaz de usuario para el desarrollo web
- **Three.js**: Motor de gráficos 3D para navegadores web
- **@react-three/fiber**: React renderer para Three.js, facilitando la integración
- **@react-three/drei**: Utilidades adicionales y componentes helper para Three.js
- **Vite**: Herramienta de desarrollo rápida y moderna para aplicaciones web

## 🔧 Estructura del Código

```
src/
├── components/
│   ├── Scene.jsx          # Escena principal
│   ├── AICharacter.jsx    # Personaje con IA
│   ├── Player.jsx         # Jugador controlable
│   ├── Terrain.jsx        # Suelo del juego
│   ├── Obstacles.jsx      # Obstáculos
│   ├── Lighting.jsx       # Sistema de iluminación
│   └── GameUI.jsx         # Interfaz de usuario
├── utils/
│   └── navigation.js      # Algoritmos de navegación y IA
├── App.jsx               # Componente principal
└── main.jsx             # Punto de entrada
```


## 🧪 Implementación

## 🎯 Controles

- **WASD**: Mover jugador
- **Mouse**: Rotar cámara
- **Scroll**: Hacer zoom

## 🧠 Algoritmo de IA Implementado

### 🔹 Código relevante

### Sistema de Navegación (Equivalente a NavMesh)
```javascript
// Verificación de obstáculos - simula la funcionalidad de NavMesh
isPointClear(x, z, radius = 0.5)

// Búsqueda de ruta básica - pathfinding simplificado
findPath(start, end)
```

### Máquina de Estados para Comportamiento Autónomo
```javascript
// Estados de comportamiento del personaje AI
switch (aiState) {
  case PATROL:
    // Navegar entre puntos de patrullaje
    // Detectar jugador en radio de detección
    break;
  
  case CHASE:
    // Perseguir al jugador activamente
    // Cambiar a búsqueda si se pierde contacto visual
    break;
    
  case SEARCH:
    // Buscar en última posición conocida del jugador
    // Timeout para volver a patrullar
    break;
}
```

### Sistema de Detección y Decisiones Reactivas
```javascript
// Algoritmo de detección por proximidad
const distanceToPlayer = aiPosition.distanceTo(playerPosition)
if (distanceToPlayer < detectionRadius) {
  // Activar comportamiento de persecución
  setState(CHASE)
}
```

## 🎨 Elementos Visuales

### Indicadores de Estado
- **Verde**: Patrullando normalmente
- **Rojo**: Persiguiendo al jugador
- **Amarillo**: Buscando al jugador
- **Gris**: En estado idle

### Puntos de Patrullaje
- **Cilindros verdes**: Puntos de ruta normal
- **Cilindro rojo**: Punto objetivo actual

### Radio de Detección
- **Anillo verde**: Modo patrullaje
- **Anillo rojo**: Modo persecución


## 📊 Resultados Visuales

### 📌 Funcionamiento:
![Interfaz Web IA Visual](./resultados/Funcionamiento.gif)

## 🎓 Conceptos Implementados - De Unity a Three.js

### Equivalencias y Adaptaciones de Conceptos

| Concepto Unity | Implementación Three.js | Descripción |
|----------------|-------------------------|-------------|
| **NavMesh** | `PathFinder class` | Sistema de detección de obstáculos y navegación |
| **NavMeshAgent** | `moveTowards()` | Movimiento autónomo con evitación de obstáculos |
| **Animator Controller** | Sistema de estados visuales | Cambios de color y animación según comportamiento |
| **Collider.OnTriggerEnter** | Detección por distancia | Radio de proximidad para activar eventos |
| **Transform.position** | `mesh.position` | Control de posición de objetos 3D |
| **GameObject** | `React components + Three.js objects` | Entidades del juego como componentes reutilizables |

### Algoritmos de IA para Personajes Autónomos
1. **Patrullaje**: Navegación cíclica entre puntos predefinidos
2. **Detección**: Cálculo de distancia euclidiana para awareness del jugador
3. **Persecución**: Seguimiento dinámico del objetivo con velocidad aumentada
4. **Búsqueda**: Exploración de área específica con timeout automático
5. **Evitación**: Detección de colisiones básica para navegación realista

### Control de Animaciones en Tiempo Real
- **Estados visuales**: Cambios de color que representan el estado mental del AI
- **Transiciones**: Cambios suaves entre diferentes comportamientos
- **Indicadores**: Elementos visuales que muestran el radio de detección y objetivos

## 🚀 Extensiones y Mejoras Futuras

- [ ] **Integración con modelos 3D**: Usar modelos de Mixamo para animaciones realistas
- [ ] **Sistema de animaciones complejo**: Implementar blend trees para transiciones suaves
- [ ] **Pathfinding A* avanzado**: Algoritmo de búsqueda de rutas más sofisticado
- [ ] **Múltiples personajes AI**: Sistema multi-agente con interacciones
- [ ] **Audio dinámico**: Sonidos y efectos reactivos al comportamiento
- [ ] **Estados de comportamiento adicionales**: Huida, curiosidad, colaboración
- [ ] **Sistema de combate**: Mecánicas de interacción entre personajes
- [ ] **Optimización de rendimiento**: LOD y culling para escenas complejas

## 📝 Notas de Desarrollo y Aprendizaje

Este taller demuestra la transición exitosa de conceptos de desarrollo de videojuegos desde Unity hacia el ecosistema web moderno. La implementación se centra en:

- **Principios fundamentales**: Los conceptos de IA y navegación son universales
- **Adaptación tecnológica**: Cómo traducir APIs de Unity a JavaScript/Three.js
- **Desarrollo web**: Aprovechar las ventajas del desarrollo web (accesibilidad, distribución)
- **Arquitectura de componentes**: Usar React para organizar la lógica del juego

## 🎯 Objetivos de Aprendizaje Alcanzados

- ✅ **Escenas 3D interactivas**: Crear entornos urbanos complejos en el navegador
- ✅ **Navegación autónoma**: Implementar sistemas de pathfinding para NPCs
- ✅ **Máquinas de estado**: Desarrollar comportamientos complejos con transiciones
- ✅ **Detección y respuesta**: Gestionar eventos de proximidad y decisiones reactivas
- ✅ **Animaciones por comportamiento**: Controlar elementos visuales según el estado del AI
- ✅ **Optimización 3D web**: Técnicas de rendimiento para aplicaciones Three.js
- ✅ **Adaptación Unity→Web**: Trasladar conceptos de game engine a desarrollo web
- ✅ **Arquitectura de componentes**: Organizar sistemas complejos con React

## 💡 Conclusiones del Taller

Este taller demuestra que los conceptos fundamentales de inteligencia artificial en videojuegos son transferibles entre diferentes tecnologías. La transición de Unity a Three.js requiere:

1. **Comprensión conceptual**: Entender qué hace cada sistema, no solo cómo usarlo
2. **Adaptación técnica**: Encontrar equivalencias funcionales en diferentes APIs
3. **Optimización específica**: Cada plataforma tiene sus propias limitaciones y ventajas
4. **Pensamiento en componentes**: React facilita la organización modular de sistemas complejos

La implementación web ofrece ventajas únicas como distribución instantánea, accesibilidad universal y facilidad de iteración durante el desarrollo.
