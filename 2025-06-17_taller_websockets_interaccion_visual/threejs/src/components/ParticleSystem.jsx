import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ParticleSystem({ data, isConnected }) {
  const pointsRef = useRef()
  const particleCount = 100

  // Crear posiciones y colores de partículas
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      // Posiciones aleatorias en una esfera
      const i3 = i * 3
      const radius = Math.random() * 5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      // Colores aleatorios
      colors[i3] = Math.random()
      colors[i3 + 1] = Math.random()
      colors[i3 + 2] = Math.random()
    }

    return [positions, colors]
  }, [particleCount])

  // Animación de partículas
  useFrame(state => {
    if (pointsRef.current && isConnected && data) {
      const positions = pointsRef.current.geometry.attributes.position.array
      const colors = pointsRef.current.geometry.attributes.color.array

      // Usar datos del sensor para influir en las partículas
      const heartRate = data.sensors?.heartRate || 70
      const temperature = data.sensors?.temperature || 36.5
      const motion = data.sensors?.motion || 0

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3

        // Animación basada en el ritmo cardíaco
        const pulse =
          Math.sin(state.clock.elapsedTime * (heartRate / 60) * Math.PI * 2) *
          0.1
        positions[i3 + 1] += pulse

        // Color basado en temperatura
        const tempFactor = (temperature - 36) / 2 // Normalizar temperatura
        colors[i3] = 0.5 + tempFactor // Rojo
        colors[i3 + 1] = 0.5 - tempFactor // Verde
        colors[i3 + 2] = 0.8 // Azul constante

        // Movimiento basado en sensor de movimiento
        const movementFactor = motion / 100
        positions[i3] +=
          Math.sin(state.clock.elapsedTime + i) * movementFactor * 0.01
        positions[i3 + 2] +=
          Math.cos(state.clock.elapsedTime + i) * movementFactor * 0.01
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true
      pointsRef.current.geometry.attributes.color.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach='attributes-color'
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={isConnected ? 0.8 : 0.3}
        sizeAttenuation
      />
    </points>
  )
}
