# 🤖 Taller - Cinemática Directa: Brazo Robótico Interactivo

## 📋 Descripción del Proyecto

Este proyecto implementa un **brazo robótico de 5 grados de libertad** utilizando **cinemática directa (Forward Kinematics)** con React Three Fiber. El sistema permite controlar cada articulación independientemente y visualizar en tiempo real la posición del end-effector y las trayectorias generadas.

## 🎯 Objetivos Cumplidos

✅ **Estructura jerárquica**: Implementación de eslabones conectados mediante transformaciones padre-hijo  
✅ **Cinemática directa**: Cálculo de posición del end-effector usando matrices de transformación homogéneas  
✅ **Control interactivo**: Sliders para ajustar manualmente cada ángulo de articulación  
✅ **Animación automática**: Modo de animación con patrones sinusoidales  
✅ **Visualización de trayectorias**: Registro y visualización del movimiento del end-effector  
✅ **Interfaz moderna**: Diseño responsivo con controles intuitivos  

## 🔧 Tecnologías Utilizadas

- **React 19** - Framework de interfaz de usuario
- **Three.js** - Biblioteca de gráficos 3D
- **React Three Fiber** - Renderer React para Three.js
- **React Three Drei** - Utilidades adicionales para R3F
- **Leva** - Panel de controles interactivos
- **Vite** - Build tool y servidor de desarrollo

## 🚀 Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## 📐 Implementación de Cinemática Directa

### Conceptos Fundamentales

La **cinemática directa (Forward Kinematics)** es el proceso de calcular la posición y orientación del end-effector de un robot conociendo los valores de las articulaciones. En este proyecto:

1. **Transformaciones Homogéneas**: Cada articulación aplica una transformación 4x4
2. **Composición de Transformaciones**: T_final = T_base × T1 × T2 × T3 × T4 × T_end
3. **Jerarquía de Coordenadas**: Cada eslabón tiene su propio sistema de coordenadas local

### Estructura del Brazo Robótico

```
Base (rotación Y)
├── Hombro (rotación Z) - 2.0 unidades
    ├── Codo (rotación Z) - 1.8 unidades  
        ├── Muñeca 1 (rotación Z) - 1.0 unidad
            ├── Muñeca 2 (rotación Z) - 0.8 unidades
                └── End-effector
```

### Cálculo de Posición

```javascript
// Transformaciones homogéneas secuenciales
const T_base = new THREE.Matrix4().makeRotationY(baseRotation)
const T1 = new THREE.Matrix4()
  .makeTranslation(0, linkLengths.base, 0)
  .multiply(new THREE.Matrix4().makeRotationZ(joint1Angle))

// ... más transformaciones

// Composición final
const finalTransform = new THREE.Matrix4()
  .multiplyMatrices(T_base, T1)
  .multiply(T2)
  .multiply(T3)
  .multiply(T4)
  .multiply(T_end)
```

## 🎮 Controles Disponibles

### Panel de Animación
- **Auto Animación**: Activa/desactiva el movimiento automático
- **Velocidad**: Controla la velocidad de la animación (0.1x - 3.0x)

### Panel de Trayectoria
- **Grabar Trayectoria**: Registra el movimiento del end-effector
- **Limpiar Trayectoria**: Borra la trayectoria visualizada

### Panel de Articulaciones
- **Base Y**: Rotación de la base (-π a π radianes)
- **Hombro**: Articulación del hombro (-π/2 a π/2 radianes)
- **Codo**: Articulación del codo (-π a π radianes)
- **Muñeca 1**: Primera articulación de muñeca (-π/2 a π/2 radianes)
- **Muñeca 2**: Segunda articulación de muñeca (-π a π radianes)

## 📊 Características Visuales

### Elementos del Brazo
- **Articulaciones**: Esferas rojas que representan los puntos de rotación
- **Eslabones**: Cilindros de colores diferentes para cada segmento
- **End-effector**: Cono naranja al final del brazo
- **Etiquetas**: Nombres identificativos de cada eslabón

### Sistema de Referencia
- **Eje X**: Línea roja (2 unidades)
- **Eje Y**: Línea verde (2 unidades)  
- **Eje Z**: Línea azul (2 unidades)
- **Grid**: Cuadrícula de referencia en el plano XZ

### Información en Tiempo Real
- **Posición del End-effector**: Coordenadas X, Y, Z actuales
- **Trayectoria**: Línea verde que muestra el recorrido
- **Indicador de posición**: Esfera verde en la posición actual

## 🔄 Patrones de Animación

El modo de animación automática utiliza funciones sinusoidales con diferentes frecuencias:

```javascript
baseRotation: Math.sin(time * 0.3) * 0.5
joint1Angle: Math.sin(time * 0.5) * 0.3
joint2Angle: Math.sin(time * 0.7) * 0.8
joint3Angle: Math.sin(time * 0.9) * 0.4
joint4Angle: Math.sin(time * 1.1) * 0.6
```

## 📁 Estructura del Código

```
src/
├── App.jsx                 # Componente principal
├── components/
│   └── RoboticArm.jsx     # Implementación del brazo robótico
├── styles/
│   └── App.css            # Estilos de la aplicación
└── main.js                # Punto de entrada
```

## 🎓 Conceptos Aprendidos

### Cinemática Directa
- Implementación de transformaciones homogéneas 4x4
- Composición secuencial de rotaciones y traslaciones
- Cálculo de posición del end-effector en espacio 3D

### Jerarquía de Transformaciones
- Sistemas de coordenadas locales vs globales
- Propagación de transformaciones padre-hijo
- Ventajas de la estructura jerárquica en robotica

### Visualización 3D
- Renderizado en tiempo real con Three.js
- Gestión de referencias y estado en React
- Optimización de rendimiento para animaciones fluidas

### Control Interactivo
- Interfaz de usuario para parámetros de robot
- Retroalimentación visual inmediata
- Grabación y visualización de trayectorias

## 🤖 Casos de Uso

Este tipo de implementación es fundamental en:

- **Robótica Industrial**: Control de brazos manipuladores
- **Animación 3D**: Rigging de personajes y criaturas
- **Simulación**: Modelado de sistemas articulados
- **Educación**: Enseñanza de conceptos de cinemática

## 🎯 Reflexión Final

Este taller demuestra la potencia de la cinemática directa para controlar sistemas articulados complejos. La implementación en React Three Fiber permite una visualización intuitiva y interactiva que facilita la comprensión de los conceptos fundamentales de robótica.

**Aspectos destacados del aprendizaje:**

1. **Matemáticas aplicadas**: Las matrices de transformación son herramientas poderosas para representar movimientos en 3D
2. **Jerarquía de sistemas**: La estructura padre-hijo simplifica el control de sistemas complejos
3. **Visualización interactiva**: Ver los resultados en tiempo real acelera el proceso de aprendizaje
4. **Optimización**: Balancear precisión visual con rendimiento en aplicaciones interactivas

La cinemática directa es solo el primer paso hacia sistemas más complejos como la cinemática inversa y el control avanzado de robots. Este proyecto sienta las bases para explorar conceptos más avanzados en robótica y animación 3D.

---

**Desarrollado como parte del curso de Computación Visual - 7° Semestre**
