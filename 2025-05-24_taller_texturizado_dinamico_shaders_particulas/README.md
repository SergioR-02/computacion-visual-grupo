## 📅 Fecha

`2025-05-24` – Taller - Texturizado Dinámico: Materiales Creativos con Shaders y Sistemas de Partículas

---

## 🎯 Objetivo del Taller

Crear materiales dinámicos que cambien en tiempo real mediante shaders personalizados, respondiendo a interacciones del usuario, paso del tiempo y efectos visuales complejos. Se integran sistemas de partículas avanzados con múltiples tipos de efectos (orbitales, explosivos, reactivos al hover, trails y ambientales) para crear experiencias visuales inmersivas que simulan fenómenos como energía, líquidos, fuego, electricidad y portales dimensionales.

---

## 🧠 Conceptos Aprendidos

Lista los principales conceptos aplicados:

- [x] **Shaders personalizados** (Vertex y Fragment Shaders con GLSL)
- [x] **Materiales dinámicos** con 5 tipos diferentes (energy, liquid, fire, electric, portal)
- [x] **Sistemas de partículas complejos** con múltiples capas y comportamientos
- [x] **Interactividad avanzada** (hover, click, mouse tracking)
- [x] **Efectos visuales procedurales** (ruido 3D, ondas, distorsiones)
- [x] **Animaciones temporales** con uniforms y controles en tiempo real
- [x] **Optimización de rendimiento** en WebGL con geometrías instanciadas
- [x] **Efectos de post-procesamiento** (glow, blending modes, transparencias)
- [x] **Gestión de estado reactivo** con controles GUI (Leva)
- [x] **Física visual** (gravedad, fricción, colisiones simuladas)

---

## 🔧 Herramientas y Entornos

Especifica los entornos usados:

- **Three.js / React Three Fiber** (`@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`)
- **React 19** con TypeScript y hooks personalizados
- **Vite** como bundler de desarrollo rápido
- **Leva** para controles GUI interactivos en tiempo real
- **GLSL Shaders** para efectos visuales personalizados
- **Node.js >= 16** para desarrollo

---

## 📁 Estructura del Proyecto

```
2025-05-24_taller_texturizado_dinamico_shaders_particulas/
├── threejs/                           # Implementación Three.js + React
│   ├── src/
│   │   ├── components/
│   │   │   ├── InteractiveScene.tsx           # Escena principal coordinadora
│   │   │   ├── DynamicMaterialSphere.tsx      # Esfera con 5 materiales dinámicos
│   │   │   ├── ParticleSystem.tsx             # Sistema complejo de partículas
│   │   │   ├── ShockwaveEffect.tsx            # Efectos de ondas de choque
│   │   │   └── SpaceDistortion.tsx            # Distorsión espacial con shaders
│   │   ├── App.tsx                            # Componente principal con Canvas
│   │   ├── main.tsx                           # Punto de entrada
│   │   └── assets/                            # Recursos estáticos
│   ├── package.json                           # Dependencias TypeScript
│   ├── vite.config.ts                         # Configuración Vite
│   ├── tsconfig.json                          # Configuración TypeScript
│   └── index.html                             # HTML base
├── resultados/                                # Resultados del taller
│   └── dinamic_texture_result.gif             # GIF demostrativo
└── README.md                                  # Documentación completa
```

---

## 🧪 Implementación

Explica el proceso:

### 🔹 Etapas realizadas

1. **Configuración del entorno**: Setup de React Three Fiber con TypeScript y Vite
2. **Desarrollo de shaders personalizados**: Implementación de vertex y fragment shaders con GLSL
3. **Sistema de materiales dinámicos**: 5 tipos de materiales (energy, liquid, fire, electric, portal)
4. **Sistema de partículas multicapa**: Orbitales, hover-reactivas, trails, ambientales y explosivas
5. **Efectos visuales avanzados**: Ondas de choque, distorsión espacial, glow effects
6. **Interactividad completa**: Mouse tracking, hover effects, click explosions
7. **Optimización y controles**: Panel GUI con Leva para ajustes en tiempo real

### 🔹 Código relevante

Incluye un fragmento que resuma el corazón del taller:

```glsl
// Fragment Shader - Materiales dinámicos procedurales
void main() {
  float time = uTime * uSpeed;
  vec2 uv = vUv * uScale;
  vec3 color = uBaseColor;

  // Material tipo ENERGY - Patrones sinusoidales
  if (uMaterialType == 0) {
    float pattern = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time * 1.5);
    float energy = pattern * 0.5 + 0.5;
    color = mix(uBaseColor, vec3(0.0, 1.0, 1.0), energy * uIntensity);

    if (uEnablePulse) {
      float pulse = sin(time * 3.0) * 0.3 + 0.7;
      color *= pulse;
    }
  }

  // Material tipo FIRE - Ruido procedural
  else if (uMaterialType == 2) {
    float fireNoise = noise(uv * 5.0 + time * 2.0);
    float fire = pow(1.0 - vUv.y, 2.0) * fireNoise;
    color = mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 0.0), fire);
    color = mix(uBaseColor, color, uIntensity);
  }

  // Efecto de click - flash explosivo
  if (uClickEffect > 0.0) {
    vec3 flashColor = vec3(1.0, 1.0, 1.0);
    float flashIntensity = uClickEffect * (1.0 + sin(time * 50.0) * 0.5);
    color = mix(color, flashColor, flashIntensity * 0.7);

    // Ondas expansivas
    float radius = length(vUv - 0.5);
    float wave = sin(radius * 30.0 - time * 15.0) * uClickEffect;
    color += vec3(wave * 0.5);
  }

  gl_FragColor = vec4(color, alpha);
}
```

```typescript
// Sistema de partículas con múltiples comportamientos
const ParticleSystem: React.FC = ({ centerPosition, isExploded }) => {
  // 5 tipos de partículas diferentes:
  // 1. Orbitales: Órbitas complejas alrededor de la esfera
  // 2. Hover: Reaccionan al hover expandiéndose/contrayéndose
  // 3. Trail: Siguen el mouse con efecto de estela
  // 4. Ambient: Flotan suavemente en el fondo
  // 5. Explosion: Explosión desde la superficie con física

  useFrame(state => {
    // Animación orbital con múltiples capas
    for (let i = 0; i < particleCount; i++) {
      const layerOffset = (i % 3) * Math.PI * 0.6667;
      const theta = time + particlePhase + layerOffset;
      const phi = Math.sin(time * 0.5 + particlePhase) * 0.5;

      const radius = orbitalRadius + Math.sin(time * 2 + particlePhase) * 0.5;

      positions[i3] =
        centerPosition[0] + radius * Math.cos(theta) * Math.cos(phi);
      positions[i3 + 1] =
        centerPosition[1] + radius * Math.sin(theta) * Math.cos(phi);
      positions[i3 + 2] = centerPosition[2] + radius * Math.sin(phi);
    }
  });
};
```

---

## 📊 Resultados Visuales

### 📌 Este taller **requiere explícitamente un GIF animado**:

> ✅ El GIF muestra la funcionalidad completa del sistema de materiales dinámicos y partículas

![dinamic_texture_result](./resultados/dinamic_texture_result.gif)

**Características demostradas en el GIF:**

- **5 Materiales dinámicos**: Energy (ondas cian), Liquid (fluidos azules), Fire (llamas procedurales), Electric (chispas), Portal (anillos dimensionales)
- **Interactividad completa**: Hover para cambios de escala y material, click para explosiones espectaculares
- **Sistema de partículas multicapa**: Orbitales, reactivas al hover, trails del mouse, ambientales y explosivas
- **Efectos visuales avanzados**: Ondas de choque, distorsión espacial, glow effects, flash explosivo
- **Controles en tiempo real**: Panel Leva para ajustar todos los parámetros dinámicamente
- **Optimización visual**: Blending modes, transparencias, efectos de profundidad

---

## 💬 Reflexión Final

Este taller me permitió profundizar significativamente en el desarrollo de shaders personalizados con GLSL y la creación de sistemas de partículas complejos en React Three Fiber. La parte más desafiante fue sincronizar correctamente los múltiples tipos de partículas (orbitales, hover-reactivas, trails, ambientales y explosivas) con los efectos de materiales dinámicos, especialmente el manejo de uniforms compartidos y la optimización de rendimiento con miles de partículas simultáneas.

Lo más fascinante fue descubrir cómo los shaders procedurales pueden crear efectos visuales complejos que serían imposibles con texturas estáticas. El desarrollo de los 5 tipos de materiales (energy, liquid, fire, electric, portal) me enseñó sobre técnicas avanzadas como ruido procedural, patrones sinusoidales, efectos de distorsión temporal y la combinación de múltiples funciones matemáticas para crear comportamientos orgánicos.

---
