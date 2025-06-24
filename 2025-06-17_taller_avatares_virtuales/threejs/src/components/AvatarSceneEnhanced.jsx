import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
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
        font='https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff'
      >
        🧍‍♂️ Virtual Avatar Demo
      </Text>
      <PrimitivAvatar
        selectedColor={selectedColor}
        animationName={animationName}
      />
      <EnvironmentElements />
    </group>
  )
}

// Environment elements to make the scene more interesting
function EnvironmentElements() {
  const particlesRef = useRef()

  useFrame(state => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  // Create floating particles around the avatar
  const particles = []
  for (let i = 0; i < 20; i++) {
    const x = (Math.random() - 0.5) * 10
    const y = Math.random() * 3 + 1
    const z = (Math.random() - 0.5) * 10
    particles.push([x, y, z])
  }

  return (
    <group ref={particlesRef}>
      {particles.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial
            color='#4A90E2'
            emissive='#2A5082'
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

// Enhanced primitive avatar with more details
function PrimitivAvatar({ selectedColor, animationName }) {
  const meshRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  const headRef = useRef()

  useFrame(state => {
    if (meshRef.current) {
      // Simple animations based on animationName
      switch (animationName) {
        case 'dance':
          meshRef.current.rotation.y =
            Math.sin(state.clock.elapsedTime * 2) * 0.3
          meshRef.current.position.y =
            Math.sin(state.clock.elapsedTime * 4) * 0.2 + 1

          // Enhanced arm movements for dancing
          if (leftArmRef.current) {
            leftArmRef.current.rotation.z =
              Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.2
            leftArmRef.current.rotation.x =
              Math.sin(state.clock.elapsedTime * 2.5) * 0.3
          }
          if (rightArmRef.current) {
            rightArmRef.current.rotation.z =
              -Math.sin(state.clock.elapsedTime * 3) * 0.5 - 0.2
            rightArmRef.current.rotation.x =
              -Math.sin(state.clock.elapsedTime * 2.5) * 0.3
          }

          // Leg movements
          if (leftLegRef.current) {
            leftLegRef.current.rotation.x =
              Math.sin(state.clock.elapsedTime * 4) * 0.2
          }
          if (rightLegRef.current) {
            rightLegRef.current.rotation.x =
              -Math.sin(state.clock.elapsedTime * 4) * 0.2
          }

          // Head bobbing
          if (headRef.current) {
            headRef.current.rotation.z =
              Math.sin(state.clock.elapsedTime * 2.5) * 0.1
          }
          break

        case 'wave':
          meshRef.current.rotation.z =
            Math.sin(state.clock.elapsedTime * 3) * 0.1

          // Wave with right arm
          if (rightArmRef.current) {
            rightArmRef.current.rotation.z =
              Math.sin(state.clock.elapsedTime * 4) * 0.8 - 0.3
            rightArmRef.current.rotation.x =
              Math.sin(state.clock.elapsedTime * 6) * 0.2
          }

          // Head looking at waving hand
          if (headRef.current) {
            headRef.current.rotation.y =
              Math.sin(state.clock.elapsedTime * 4) * 0.2
          }
          break

        case 'idle':
          meshRef.current.position.y =
            Math.sin(state.clock.elapsedTime * 0.8) * 0.05 + 1

          // Gentle arm sway
          if (leftArmRef.current) {
            leftArmRef.current.rotation.z =
              Math.sin(state.clock.elapsedTime * 0.8) * 0.1 + 0.1
          }
          if (rightArmRef.current) {
            rightArmRef.current.rotation.z =
              -Math.sin(state.clock.elapsedTime * 0.8) * 0.1 - 0.1
          }

          // Subtle head movement
          if (headRef.current) {
            headRef.current.rotation.y =
              Math.sin(state.clock.elapsedTime * 0.5) * 0.05
          }
          break

        default:
          meshRef.current.position.y = 1
          // Reset all positions
          if (leftArmRef.current) leftArmRef.current.rotation.set(0, 0, 0.1)
          if (rightArmRef.current) rightArmRef.current.rotation.set(0, 0, -0.1)
          if (headRef.current) headRef.current.rotation.set(0, 0, 0)
          break
      }
    }
  })

  return (
    <group ref={meshRef}>
      {/* Head with more details */}
      <group ref={headRef} position={[0, 1.7, 0]}>
        {/* Main head */}
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={selectedColor} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.08, 0.05, 0.15]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color='#000' />
        </mesh>
        <mesh position={[0.08, 0.05, 0.15]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color='#000' />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.02, 0.18]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color={selectedColor} />
        </mesh>

        {/* Simple mouth */}
        <mesh position={[0, -0.08, 0.16]}>
          <sphereGeometry args={[0.02, 8, 4]} />
          <meshStandardMaterial color='#400' />
        </mesh>
      </group>

      {/* Body with some details */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.6, 1, 0.3]} />
        <meshStandardMaterial color={selectedColor} />
      </mesh>

      {/* Chest detail */}
      <mesh position={[0, 1.2, 0.16]}>
        <boxGeometry args={[0.3, 0.4, 0.05]} />
        <meshStandardMaterial
          color={selectedColor}
          emissive={selectedColor}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.4, 1.2, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshStandardMaterial color={selectedColor} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={selectedColor} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.4, 1.2, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshStandardMaterial color={selectedColor} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={selectedColor} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.15, 0.2, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshStandardMaterial color={selectedColor} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -0.5, 0.1]}>
          <boxGeometry args={[0.15, 0.1, 0.3]} />
          <meshStandardMaterial color='#333' />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.15, 0.2, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshStandardMaterial color={selectedColor} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -0.5, 0.1]}>
          <boxGeometry args={[0.15, 0.1, 0.3]} />
          <meshStandardMaterial color='#333' />
        </mesh>
      </group>

      {/* Enhanced ground plane */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial
          color='#1a1a1a'
          transparent
          opacity={0.8}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Grid pattern on ground */}
      <lineSegments position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(12, 12, 12, 12)]} />
        <lineBasicMaterial color='#333' transparent opacity={0.5} />
      </lineSegments>

      {/* Status indicator */}
      <Html position={[0, 3, 0]} center>
        <div
          style={{
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '12px',
            textAlign: 'center',
            minWidth: '120px',
          }}
        >
          Animation: {animationName || 'None'}
        </div>
      </Html>
    </group>
  )
}

export default AvatarScene
