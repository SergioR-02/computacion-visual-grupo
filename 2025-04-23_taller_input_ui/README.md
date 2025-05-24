# 🖱️ Taller - Interacción y UI en Escenas 3D con React Three Fiber

📅 **Fecha:** 2025-05-23 – Fecha de realización

🎯 **Objetivo del Taller:**
Aprender a manejar entradas del usuario (mouse, clics y teclado) y a superponer interfaces gráficas dentro y fuera del canvas 3D. Se exploran eventos dinámicos con `useFrame` y `useThree`, y el uso de bibliotecas como `@react-three/drei` y `leva` para crear UI embebida y externa. El entorno usado es React Three Fiber, una adaptación de Three.js para el ecosistema React.

## 🧠 Conceptos Aprendidos
Lista de conceptos clave aplicados en el taller:

* `useFrame()` para detectar movimiento del mouse por frame
* Eventos de clic (`onClick`) sobre objetos 3D
* Escucha de teclas globales con `window.addEventListener("keydown", ...)`
* Uso de `<Html />` de `@react-three/drei` para insertar botones 2D dentro del espacio 3D
* Uso de `leva` para sliders y controles externos visuales
* Manejo de estado y referencias (`useState`, `useRef`) para alterar posición, rotación y color en tiempo real

## 🔧 Herramientas y Entornos
* React + Vite
* Three.js
* React Three Fiber
* @react-three/drei
* leva
* VSCode + navegador local

## 📁 Estructura del Proyecto
```
2025-05-23_taller_interaccion_ui_r3f/
├── src/
│ ├── App.jsx # Componente principal de escena
│ └── index.css # Estilos base
├── public/
│ └── gifs/ # Carpeta para colocar los GIFs generados
├── README.md
```


## 🧪 Implementación

Este taller se centró en cómo permitir que el usuario interactúe con una escena 3D desde múltiples ángulos: mouse, clics, teclado y botones. También se integró una interfaz gráfica tanto en el espacio 3D como flotando sobre el canvas.

### 🔹 Etapas realizadas

#### 🖱️ Interacciones del Usuario
1. **Movimiento del mouse con `useFrame()`**: La rotación del cubo cambia dinámicamente con la posición del cursor.
2. **Clics sobre el objeto**: Al hacer clic en el cubo, cambia de color (naranja ↔ rosado).
3. **Presionar tecla `r`**: Se detecta una tecla presionada globalmente, y se reinicia la posición del cubo.

#### 🧩 Interfaz Gráfica
4. **Botón HTML dentro de la escena**: Con `<Html />`, se inserta un botón en el espacio 3D para cambiar la posición del cubo.
5. **Panel `leva`**: Slider externo que permite escalar el objeto visualmente.

### 🔹 Código relevante

📌 **1. Movimiento del cubo con el mouse**

```jsx
useFrame(({ mouse }) => {
  meshRef.current.rotation.y = mouse.x * Math.PI
})
```

Rota el cubo horizontalmente de acuerdo al movimiento del mouse.

**📌 2. Clic para cambiar color**

```jsx
<mesh onClick={() => setActive(!active)}>
  <meshStandardMaterial color={active ? 'hotpink' : 'orange'} />
</mesh>
```

Al hacer clic sobre el cubo, cambia entre dos colores.

**📌 3. Tecla r para reiniciar posición**
```jsx
useEffect(() => {
  const handleKeyDown = e => e.key === 'r' && setPosition([0, 0, 0])
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

Al presionar r, el cubo vuelve a la posición central.

**📌 4. Botón HTML embebido en el espacio 3D**

```jsx
<Html>
  <button onClick={() => setPosition([Math.random(), 0, 0])}>Mover</button>
</Html>
```

Botón visible dentro del mundo 3D para mover el cubo aleatoriamente.

**📌 5. Control de escala con Leva**
```jsx
const { scale } = useControls({ scale: { value: 1, min: 0.5, max: 3 } })
```

Slider externo que permite escalar el cubo desde la UI.


**📊 Resultados Visuales**

Aquí se mostrarán los resultados visuales de las interacciones y UI implementadas en el taller:


🌐 React Three Fiber

**🎞️ Cubo interactivo (GIF)**

![Resultado tree](resultados/%20Input%20y%20UI%20.gif)


🧩 Prompts Usados


"Detecta movimiento del mouse y rota un cubo con useFrame"

"Agrega un botón <Html> dentro de una escena R3F que cambia posición"

"Controla el tamaño de un objeto 3D con un slider de leva"

"Captura la tecla 'r' para resetear posición con useEffect"


💬 Reflexión Final


Este taller me permitió entender cómo mezclar interacción 2D y 3D en un solo espacio visual, y cómo las bibliotecas como drei y leva facilitan mucho el trabajo visual dentro de React Three Fiber. Aprendí a manejar inputs del usuario en diferentes formas y a sincronizar eventos como teclas, clics y movimientos del mouse con los cambios de estado en React. También vi cómo se pueden combinar elementos clásicos de UI con componentes 3D para lograr interfaces más inmersivas y dinámicas.