// Importaciones principales de React Three Fiber y utilidades
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'

// Hooks de React
import { useState, useEffect, useRef } from 'react'

// Herramienta de UI externa para sliders y controles
import { Leva, useControls } from 'leva'

// Componente del cubo interactivo
function Box() {
  const meshRef = useRef()                        // Referencia al mesh para manipulación directa
  const [position, setPosition] = useState([0, 0, 0]) // Estado de posición del cubo
  const [active, setActive] = useState(false)         // Estado booleano para alternar color
  const { camera } = useThree()                   // Accedemos a la cámara (no se usa directamente aquí)

  // Slider de escala usando Leva
  const { scale } = useControls({
    scale: { value: 1, min: 0.5, max: 3, step: 0.1 }
  })

  // Animación de rotación dinámica usando el puntero del mouse
  useFrame(({ pointer }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = pointer.x * Math.PI // Rota en Y según posición del mouse
      meshRef.current.rotation.x = pointer.y * Math.PI // Rota en X según posición del mouse
    }
  })

  // Captura global de la tecla 'r' para resetear la posición del cubo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'r') setPosition([0, 0, 0])   // Vuelve a la posición inicial
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onClick={() => setActive(!active)} // Alterna color al hacer clic
    >
      <boxGeometry />
      <meshStandardMaterial color={active ? 'hotpink' : 'orange'} />

      {/* Botón HTML dentro de la escena 3D */}
      <Html position={[0, 1.2, 0]} center>
        <button onClick={() => setPosition([Math.random() * 2, 0, 0])}>
          Mover Aleatorio
        </button>
      </Html>
    </mesh>
  )
}

// Componente principal que define la escena 3D
export default function App() {
  return (
    <>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight />                         {/* Luz ambiente suave */}
        <pointLight position={[10, 10, 10]} />   {/* Luz puntual para sombras y brillos */}
        <Box />                                  {/* Se renderiza el cubo interactivo */}
        <OrbitControls />                        {/* Permite rotar la cámara con el mouse */}
      </Canvas>
      <Leva collapsed />                         {/* UI externa para controlar escala */}
    </>
  )
}
