import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { useState, useEffect, useRef } from 'react'
import { Leva, useControls } from 'leva'

function Box() {
  const meshRef = useRef()
  const [position, setPosition] = useState([0, 0, 0])
  const [active, setActive] = useState(false)
  const { camera } = useThree()

  const { scale } = useControls({
    scale: { value: 1, min: 0.5, max: 3, step: 0.1 }
  })

  // Movimiento del mouse (rotar hacia el mouse)
  useFrame(({ pointer }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = pointer.x * Math.PI
      meshRef.current.rotation.x = pointer.y * Math.PI
    }
  })

  // Captura teclas
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'r') setPosition([0, 0, 0])
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onClick={() => setActive(!active)}
      
    >
      
      <boxGeometry />
      <meshStandardMaterial color={active ? 'hotpink' : 'orange'} />
      <Html position={[0, 1.2, 0]} center>
        <button onClick={() => setPosition([Math.random() * 2, 0, 0])}>
          Mover Aleatorio
        </button>
      </Html>
    </mesh>
    
  )
}

export default function App() {
  return (
    <>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box />
        
        <OrbitControls />
      </Canvas>
      <Leva collapsed />
    </>
  )
}

