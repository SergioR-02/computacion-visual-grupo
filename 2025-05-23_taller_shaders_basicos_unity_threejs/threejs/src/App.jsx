import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'
import { useRef } from 'react'

// 1. Definición del shader material
const ColorShiftMaterial = shaderMaterial(
  { uTime: 0 },
  vertex,
  fragment,
)

extend({ ColorShiftMaterial })

// 2. Componente que usa el shader animado
function AnimatedBox() {
  const ref = useRef()
  useFrame(({ clock }) => {
    ref.current.uTime = clock.getElapsedTime()
  })

  return (
    <mesh>
      <boxGeometry />
      <colorShiftMaterial ref={ref} />
    </mesh>
  )
}

// 3. Canvas con OrbitControls añadido correctamente
export default function App() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} />

      <AnimatedBox />

      <OrbitControls /> {/* Permite mover la cámara con el mouse */}
    </Canvas>
  )
}
