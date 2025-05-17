import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function WavyPlane() {
  const meshRef = useRef()
  const freq = 2

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    const position = meshRef.current.geometry.attributes.position

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i)
      const z = Math.sin(x * freq + time) * 0.5
      position.setZ(i, z)
    }

    position.needsUpdate = true
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[10, 10, 32, 32]} />
      <meshStandardMaterial color="cyan" wireframe />
    </mesh>
  )
}
