# 🧪 Taller - Cinemática Directa: Animando Brazos Robóticos o Cadenas Articuladas

## 📅 Fecha
`2025-06-17` – Fecha de entrega del taller

---

## 🎯 Objetivo del Taller

Aplicar conceptos de **cinemática directa (Forward Kinematics)** para animar objetos enlazados como brazos robóticos, cadenas de huesos o criaturas segmentadas. El objetivo es comprender cómo rotaciones encadenadas afectan el movimiento y la posición de cada parte en una estructura jerárquica, implementando un sistema de control interactivo que permita manipular cada articulación de forma independiente.

---

## 🧠 Conceptos Aprendidos

Lista los principales conceptos aplicados:

- [x] Transformaciones geométricas (escala, rotación, traslación)
- [x] Cinemática directa con matrices de transformación homogéneas
- [x] Jerarquías de objetos y sistemas de coordenadas locales
- [x] Animación procedural con funciones matemáticas
- [x] Visualización de trayectorias en tiempo real
- [x] Control interactivo mediante interfaces gráficas
- [x] Forward Kinematics aplicado a brazos robóticos
- [x] Composición de transformaciones secuenciales

---

## 🔧 Herramientas y Entornos

Especifica los entornos usados:

- Three.js / React Three Fiber (`@react-three/fiber`, `@react-three/drei`, `leva`)
- React 18 con Vite para desarrollo rápido
- JavaScript ES6+ con hooks y referencias
- CSS3 con gradientes y efectos modernos

📌 Usa las herramientas según la [guía de instalación oficial](./guia_instalacion_entornos_visual.md)

---

## 📁 Estructura del Proyecto

```
2025-06-17_taller_cinematica_directa_fk/
├── threejs/                  # Implementación en React Three Fiber
│   ├── src/
│   │   ├── components/       # Componentes del brazo robótico
│   │   │   ├── RoboticArm.jsx
│   │   │   ├── SimpleRobotArm.jsx
│   │   │   ├── Joint.js
│   │   │   └── Link.js
│   │   ├── utils/           # Utilidades matemáticas
│   │   │   ├── ForwardKinematics.js
│   │   │   └── MatrixUtils.js
│   │   ├── styles/          # Estilos CSS
│   │   └── App.jsx          # Componente principal
│   ├── package.json
│   ├── PROMPTS.md          # Documentación de prompts
│   └── README.md
├── Evidencia/              # GIFs y capturas de funcionamiento
│   └── funcionamiento.gif
└── README.md
```


## 🧪 Implementación

Explica el proceso:

### 🔹 Etapas realizadas
1. **Configuración del entorno**: Setup de React Three Fiber con Vite y dependencias necesarias.
2. **Diseño de la estructura jerárquica**: Creación de componentes anidados representando eslabones y articulaciones.
3. **Implementación de Forward Kinematics**: Cálculo de posiciones usando matrices de transformación homogéneas.
4. **Sistema de control interactivo**: Integración de Leva para manipular ángulos de articulaciones en tiempo real.
5. **Visualización de trayectorias**: Sistema de grabación y renderizado de paths del end-effector.
6. **Optimización visual**: Implementación de iluminación, materiales y efectos visuales.

### 🔹 Código relevante

Componente principal del brazo robótico con Forward Kinematics:

```jsx
// Función para calcular posición del end-effector (Forward Kinematics)
const calculateEndEffectorPosition = angles => {
  const { baseRotation, joint1Angle, joint2Angle, joint3Angle } = angles;
  
  // Matriz de transformación base
  const baseMatrix = new THREE.Matrix4().makeRotationZ(baseRotation);
  
  // Transformación acumulativa a través de la cadena cinemática
  let transform = baseMatrix.clone();
  
  // Joint 1: rotación + traslación
  const joint1Transform = new THREE.Matrix4()
    .makeTranslation(linkLengths.base, 0, 0)
    .multiply(new THREE.Matrix4().makeRotationZ(joint1Angle));
  transform.multiply(joint1Transform);
  
  // Joint 2: continuar la cadena
  const joint2Transform = new THREE.Matrix4()
    .makeTranslation(linkLengths.link1, 0, 0)
    .multiply(new THREE.Matrix4().makeRotationZ(joint2Angle));
  transform.multiply(joint2Transform);
  
  // Joint 3: posición final del end-effector
  const joint3Transform = new THREE.Matrix4()
    .makeTranslation(linkLengths.link2, 0, 0)
    .multiply(new THREE.Matrix4().makeRotationZ(joint3Angle));
  transform.multiply(joint3Transform);
  
  // Extraer posición final
  const finalPosition = new THREE.Vector3();
  finalPosition.setFromMatrixPosition(transform);
  
  return finalPosition;
};
```

Estructura jerárquica de articulaciones:

```jsx
// Componente RobotJoint reutilizable
function RobotJoint({ children, rotation, length, color, name }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z = rotation;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Articulación visual */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color='#ff6b6b' />
      </mesh>
      
      {/* Eslabón */}
      <mesh position={[length / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, length, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* Grupo hijo al final del eslabón */}
      <group position={[length, 0, 0]}>{children}</group>
    </group>
  );
}
```

---

## 📊 Resultados Visuales

### 📌 Este taller **requiere explícitamente un GIF animado**:


El GIF muestra el funcionamiento completo del sistema de cinemática directa:
- Movimiento articulado del brazo robótico de 4 eslabones
- Control interactivo mediante sliders para cada articulación  
- Visualización en tiempo real de la trayectoria del end-effector
- Animación automática con patrones sinusoidales
- Interface de usuario con controles de Leva integrados

![funcionamiento](./Evidencia/funcionamiento.gif)

### 🔹 Características implementadas:

- **Sistema jerárquico**: 4 articulaciones con rotaciones independientes
- **Forward Kinematics**: Cálculo matemático preciso de posiciones
- **Trayectorias dinámicas**: Visualización del path del end-effector en verde
- **Controles interactivos**: Sliders para manipulación manual de ángulos
- **Animación automática**: Modo de demostración con movimientos sinusoidales
- **Feedback visual**: Indicadores de posición y etiquetas informativas

---

## 🧩 Prompts Usados

Enumera los prompts utilizados:

```text
"Implementar Forward Kinematics correctamente usando matrices de transformación homogéneas 4x4, aplicar rotaciones y traslaciones en el orden correcto, componer transformaciones secuencialmente"

"Agregar controles interactivos con Leva para cada articulación, visualización de trayectorias del end-effector, sistema de animación automática con patrones sinusoidales"

"Crear estilos CSS modernos con gradiente de fondo atractivo, panel Leva personalizado con transparencia, diseño responsivo para móviles"

"Usar paleta de colores moderna: eslabones en azul (#3498db), rojo (#e74c3c), naranja (#f39c12), articulaciones en rojo claro (#ff6b6b), trayectoria en verde (#00ff00)"
```


## 💬 Reflexión Final

Este taller me permitió comprender profundamente los conceptos de **cinemática directa** y su aplicación práctica en sistemas robóticos. La implementación con React Three Fiber fue especialmente enriquecedora, ya que combina programación 3D con matemáticas aplicadas de forma visual e interactiva.

La parte más compleja fue el cálculo correcto de las **matrices de transformación homogéneas** y su composición secuencial para obtener la posición final del end-effector. Entender cómo cada rotación local afecta todo el sistema downstream fue fundamental para lograr un comportamiento realista del brazo robótico.

Para futuros proyectos, aplicaría estos conocimientos en **simulaciones más complejas** incluyendo cinemática inversa (IK), detección de colisiones, y control de múltiples brazos robóticos. También sería interesante integrar sensores virtuales y algoritmos de planificación de trayectorias para crear sistemas robóticos más autónomos y sofisticados.

