import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

function AvatarScene({ selectedColor, animationName }) {
  return (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.4}
        color='white'
        anchorX='center'
        anchorY='middle'
      >
        Virtual Avatar Demo
      </Text>
      <PrimitivAvatar
        selectedColor={selectedColor}
        animationName={animationName}
      />
    </group>
  )
}

// Primitive avatar with animations
function PrimitivAvatar({ selectedColor, animationName }) {
  const meshRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()

  useFrame(state => {
    if (meshRef.current) {
      // Simple animations based on animationName
      switch (animationName) {
        case 'dance':
          meshRef.current.rotation.y =
            Math.sin(state.clock.elapsedTime * 2) * 0.3
          meshRef.current.position.y =
            Math.sin(state.clock.elapsedTime * 4) * 0.2 + 1
          // Arm movements for dancing
          if (leftArmRef.current) {
            leftArmRef.current.rotation.z =
              Math.sin(state.clock.elapsedTime * 3) * 0.5
          }
          if (rightArmRef.current) {
            rightArmRef.current.rotation.z =
              -Math.sin(state.clock.elapsedTime * 3) * 0.5
          }
          break
        case 'wave':
          meshRef.current.rotation.z =
            Math.sin(state.clock.elapsedTime * 3) * 0.1
          // Wave with right arm
          if (rightArmRef.current) {
            rightArmRef.current.rotation.z =
              Math.sin(state.clock.elapsedTime * 4) * 0.8 - 0.3
          }
          break
        case 'idle':
          meshRef.current.position.y =
            Math.sin(state.clock.elapsedTime * 0.5) * 0.05 + 1
          // Gentle arm sway
          if (leftArmRef.current) {
            leftArmRef.current.rotation.z =
              Math.sin(state.clock.elapsedTime * 0.8) * 0.1
          }
          if (rightArmRef.current) {
            rightArmRef.current.rotation.z =
              -Math.sin(state.clock.elapsedTime * 0.8) * 0.1
          }
          break
        default:
          meshRef.current.position.y = 1
          break
      }
    }
  })

  return (
    <group ref={meshRef}>
      {/* Head */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={selectedColor} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.1, 1.75, 0.15]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color='#000' />
      </mesh>
      <mesh position={[0.1, 1.75, 0.15]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color='#000' />
      </mesh>

      {/* Body */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.6, 1, 0.3]} />
        <meshStandardMaterial color={selectedColor} />
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.4, 1.2, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={selectedColor} />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.4, 1.2, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={selectedColor} />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.15, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={selectedColor} />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.15, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={selectedColor} />
      </mesh>

      {/* Ground plane */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color='#2a2a2a' transparent opacity={0.5} />
      </mesh>

      {/* Simple grid pattern on ground */}
      <lineSegments position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(10, 10, 10, 10)]} />
        <lineBasicMaterial color='#444' />
      </lineSegments>
    </group>
  )
}

export default AvatarScene
