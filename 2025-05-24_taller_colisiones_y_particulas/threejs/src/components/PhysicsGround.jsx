import React from 'react'
import { usePlane } from '@react-three/cannon'
import * as THREE from 'three'

function PhysicsGround() {
  // Physics ground plane
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: {
      friction: 0.6,
      restitution: 0.3,
    },
  }))

  return (
    <group>
      {/* Invisible physics plane */}
      <mesh ref={ref} receiveShadow visible={false}>
        <planeGeometry args={[50, 50]} />
      </mesh>

      {/* Visible ground mesh */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color='#2c3e50'
          roughness={0.8}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Grid pattern for visual reference */}
      <lineSegments position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <edgesGeometry
          attach='geometry'
          args={[new THREE.PlaneGeometry(50, 50, 25, 25)]}
        />
        <lineBasicMaterial
          attach='material'
          color='#34495e'
          opacity={0.3}
          transparent
        />
      </lineSegments>
    </group>
  )
}

export default PhysicsGround
