import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useFBX, useAnimations, Text, Box } from '@react-three/drei'
import * as THREE from 'three'

function AvatarScene({ selectedColor, animationName }) {
  const group = useRef()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true) // Always call the hook
  const fbx = useFBX('/Rumba_Dancing.fbx')

  const { actions } = useAnimations(fbx?.animations || [], group)
  useEffect(() => {
    if (fbx) {
      setIsLoading(false)
      setError(null)

      // Scale and position the avatar
      fbx.scale.set(0.01, 0.01, 0.01) // Adjust scale as needed
      fbx.position.set(0, 0, 0)

      // Apply selected color to avatar materials
      fbx.traverse(child => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.color) {
                mat.color.setStyle(selectedColor)
              }
            })
          } else if (child.material.color) {
            child.material.color.setStyle(selectedColor)
          }
        }
      })
    } else {
      setError('Could not load avatar model')
      setIsLoading(false)
    }
  }, [fbx, selectedColor])

  // Handle animations
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      // Stop all current animations
      Object.values(actions).forEach(action => action.stop())

      if (animationName && actions[animationName]) {
        actions[animationName].play()
      } else if (animationName === 'dance' && Object.keys(actions)[0]) {
        // If specific animation not found, play the first available (likely the dancing animation)
        const firstAnimation = Object.values(actions)[0]
        firstAnimation.play()
      }
    }
  }, [actions, animationName])
  // Rotate avatar slightly for better viewing
  useFrame(state => {
    if (group.current && !isLoading) {
      // Subtle floating animation
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  if (isLoading) {
    return (
      <group>
        <Text
          position={[0, 2, 0]}
          fontSize={0.5}
          color='white'
          anchorX='center'
          anchorY='middle'
        >
          Loading Avatar...
        </Text>
        <Box args={[1, 2, 0.5]} position={[0, 0, 0]}>
          <meshStandardMaterial color={selectedColor} />
        </Box>
      </group>
    )
  }

  if (error || !fbx) {
    return (
      <group>
        <Text
          position={[0, 2, 0]}
          fontSize={0.3}
          color='red'
          anchorX='center'
          anchorY='middle'
        >
          Avatar Model Not Found
        </Text>
        <PrimitivAvatar
          selectedColor={selectedColor}
          animationName={animationName}
        />
      </group>
    )
  }

  return (
    <group ref={group}>
      <primitive object={fbx} />
    </group>
  )
}

// Fallback primitive avatar if FBX doesn't load
function PrimitivAvatar({ selectedColor, animationName }) {
  const meshRef = useRef()
  useFrame(state => {
    if (meshRef.current) {
      // Simple animations based on animationName
      switch (animationName) {
        case 'dance':
          meshRef.current.rotation.y =
            Math.sin(state.clock.elapsedTime * 2) * 0.3
          meshRef.current.position.y =
            Math.sin(state.clock.elapsedTime * 4) * 0.2 + 1
          break
        case 'wave':
          meshRef.current.rotation.z =
            Math.sin(state.clock.elapsedTime * 3) * 0.2
          break
        case 'idle':
          meshRef.current.position.y =
            Math.sin(state.clock.elapsedTime * 0.5) * 0.05 + 1
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
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={selectedColor} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.6, 1, 0.3]} />
        <meshStandardMaterial color={selectedColor} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.4, 1.2, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={selectedColor} />
      </mesh>
      <mesh position={[0.4, 1.2, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={selectedColor} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.15, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={selectedColor} />
      </mesh>
      <mesh position={[0.15, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={selectedColor} />
      </mesh>

      {/* Simple ground plane */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color='#333' transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export default AvatarScene
