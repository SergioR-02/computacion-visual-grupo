# 🧪 Taller 65 - Colisiones y Partículas: Reacciones Visuales Interactivas

## 📅 Fecha
`2025-05-24` – Taller de Colisiones y Sistemas de Partículas

---

## 🎯 Objetivo del Taller

Implementar escenas interactivas donde los objetos reaccionan visualmente al colisionar, mediante sistemas de partículas y uso de colisiones físicas o detección de contacto. El objetivo es entender cómo conectar eventos de colisión con respuestas visuales, como explosiones, chispas o burbujas, utilizando Three.js + React Three Fiber.

---

## 🧠 Conceptos Aprendidos

Lista los principales conceptos aplicados:

- [x] Transformaciones geométricas (escala, rotación, traslación)
- [x] Sistemas de partículas dinámicos
- [x] Física computacional con Cannon.js
- [x] Detección de colisiones en tiempo real
- [x] Shaders y efectos visuales
- [x] Gestión de estado global con Zustand
- [x] Interactividad en entornos 3D
- [x] Optimización de rendimiento en WebGL

---

## 🔧 Herramientas y Entornos

Especifica los entornos usados:

- **Three.js / React Three Fiber** (`@react-three/fiber`, `@react-three/cannon`, `@react-three/drei`)
- **React 18** con hooks personalizados
- **Vite** como bundler de desarrollo
- **Zustand** para gestión de estado
- **Cannon.js** como motor de físicas
- **Node.js >= 16** para desarrollo


---

## 📁 Estructura del Proyecto

```
2025-05-24_taller_colisiones_y_particulas/
├── threejs/                    # Implementación Three.js + React
│   ├── src/
│   │   ├── components/
│   │   │   ├── CollisionScene.jsx      # Escena principal con objetos
│   │   │   ├── PhysicsBall.jsx         # Pelotas con física y detección
│   │   │   ├── PhysicsGround.jsx       # Suelo físico para colisiones
│   │   │   └── ParticleSystem.jsx      # Sistema de partículas dinámico
│   │   ├── hooks/
│   │   │   └── useCollisionStore.js    # Estado global con Zustand
│   │   ├── App.jsx                     # Componente principal
│   │   └── main.jsx                    # Punto de entrada
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── resultados/                         # Resultados del taller
│   └── funcionamiento_colisiones.gif   # GIF demostrativo
└── README.md
```



---

## 🧪 Implementación

Explica el proceso:

### 🔹 Etapas realizadas
1. **Configuración del entorno**: Setup de React Three Fiber con motor de físicas Cannon.js
2. **Creación de objetos físicos**: Implementación de pelotas con propiedades de masa, fricción y rebote
3. **Sistema de detección de colisiones**: Configuración de callbacks para eventos de impacto
4. **Sistema de partículas**: Generación dinámica de efectos visuales en puntos de colisión
5. **Interactividad**: Implementación de controles para añadir objetos con click del mouse
6. **Optimización visual**: Efectos de escala, colores emisivos y limpieza automática de partículas

### 🔹 Código relevante

Incluye un fragmento que resuma el corazón del taller:

```javascript
// Detección de colisiones y generación de partículas
const [ref, api] = useSphere(() => ({
  mass: 1,
  position,
  material: { friction: 0.3, restitution: 0.8 },
  onCollide: e => {
    const impactStrength = velocityVector.length()
    
    if (impactStrength > 2) {
      // Crear partículas en el punto de colisión
      const particleCount = Math.min(Math.floor(impactStrength / 2), 8)
      
      for (let i = 0; i < particleCount; i++) {
        const particleVelocity = new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          Math.random() * 4 + 2,
          (Math.random() - 0.5) * 6
        )
        addParticleEffect(collisionPoint, particleVelocity)
      }
      
      // Feedback visual inmediato
      setScale(1.3)
      incrementCollisions()
    }
  }
}))
```

---

## 📊 Resultados Visuales

### 📌 Este taller **requiere explícitamente un GIF animado**:

> ✅ El GIF muestra la funcionalidad completa del sistema de colisiones y partículas

![funcionamiento_colisiones](./resultados/funcionamiento_colisiones.gif)

**Características demostradas en el GIF:**
- **Interactividad**: Click para añadir nuevas pelotas coloridas
- **Física realista**: Gravedad, rebotes y colisiones entre objetos
- **Efectos de partículas**: Explosiones de partículas en puntos de impacto
- **Feedback visual**: Escalado de pelotas al colisionar
- **Contador en tiempo real**: Seguimiento de colisiones en la interfaz
- **Obstáculos estáticos**: Plataformas y rampas para colisiones más complejas




---

## 💬 Reflexión Final

Este taller me permitió profundizar en el ecosistema de React Three Fiber y la integración de motores de físicas en aplicaciones web 3D. La parte más compleja fue sincronizar correctamente los eventos de colisión con la generación de partículas, especialmente manejar la suscripción a velocidades del motor de físicas Cannon.js para evitar errores de referencias undefined.

Lo más interesante fue descubrir cómo los eventos de colisión pueden ser el punto de entrada para sistemas complejos e inmersivos. Durante el desarrollo, experimenté con diferentes enfoques para el manejo de eventos de pointer que no interfirieran con los controles de cámara, lo que me enseñó sobre la precedencia de eventos en entornos 3D interactivos.

Para futuros proyectos, aplicaría este conocimiento en la creación de juegos web 3D más complejos, integrando sonido espacial 3D, efectos de vibración háptica, y sistemas de puntuación basados en la intensidad de las colisiones. También exploraría el uso de shaders personalizados para efectos de partículas más avanzados y la integración con APIs externas para experiencias multisensoriales.

---

