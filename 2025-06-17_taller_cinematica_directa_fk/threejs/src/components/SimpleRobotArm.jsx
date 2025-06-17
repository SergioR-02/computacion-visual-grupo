import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'

function SimpleRobotArm() {
  const baseRef = useRef()
  const arm1Ref = useRef()
  const arm2Ref = useRef()

  const { baseRotation, arm1Rotation, arm2Rotation } = useControls({
    Articulaciones: {
      baseRotation: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
      arm1Rotation: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
      arm2Rotation: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1 },
    },
  })

  useFrame(() => {
    if (baseRef.current) baseRef.current.rotation.y = baseRotation
    if (arm1Ref.current) arm1Ref.current.rotation.z = arm1Rotation
    if (arm2Ref.current) arm2Ref.current.rotation.z = arm2Rotation
  })

  return (
    <group>
      {/* Ejes de referencia del sistema de coordenadas */}
      <group>
        {/* Eje X - Rojo */}
        <mesh position={[1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshBasicMaterial color='#ff0000' />
        </mesh>

        {/* Eje Y - Verde */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshBasicMaterial color='#00ff00' />
        </mesh>

        {/* Eje Z - Azul */}
        <mesh position={[0, 0, 1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshBasicMaterial color='#0000ff' />
        </mesh>
      </group>

      {/* Base */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[1, 1, 0.5, 16]} />
        <meshBasicMaterial color='#ccc' />
      </mesh>

      {/* Objetos de prueba en posiciones fijas */}
      <mesh position={[3, 0, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshBasicMaterial color='red' />
      </mesh>

      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshBasicMaterial color='green' />
      </mesh>

      <mesh position={[0, 0, 3]}>
        <sphereGeometry args={[0.3]} />
        <meshBasicMaterial color='blue' />
      </mesh>

      {/* Torre vertical directa */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 3, 8]} />
        <meshBasicMaterial color='yellow' />
      </mesh>

      {/* Brazo horizontal simple */}
      <mesh position={[2, 3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 4, 8]} />
        <meshBasicMaterial color='purple' />
      </mesh>
    </group>
  )
}

export default SimpleRobotArm
