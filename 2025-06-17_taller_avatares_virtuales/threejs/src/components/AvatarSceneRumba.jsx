import React, { useRef, useEffect, useState, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useFBX, useAnimations, Text, Html } from '@react-three/drei'

function AvatarScene({ selectedColor, animationName }) {
  return (
    <group>
      <Text
        position={[0, 3, 0]}
        fontSize={0.4}
        color='white'
        anchorX='center'
        anchorY='middle'
      >
        🕺 Rumba Dancing Avatar
      </Text>

      <Suspense fallback={<LoadingAvatar selectedColor={selectedColor} />}>
        <RumbaDancingAvatar
          selectedColor={selectedColor}
          animationName={animationName}
        />
      </Suspense>
    </group>
  )
}

function RumbaDancingAvatar({ selectedColor, animationName }) {
  const group = useRef()
  const [isPlaying, setIsPlaying] = useState(false)

  // Load the FBX model
  const fbx = useFBX('/Rumba_Dancing.fbx')
  const { actions, names } = useAnimations(fbx.animations, group)

  // Apply color to all materials
  useEffect(() => {
    if (fbx) {
      fbx.traverse(child => {
        if (child.isMesh && child.material) {
          // Clone material to avoid affecting other instances
          child.material = child.material.clone()

          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.color) {
                mat.color.setStyle(selectedColor)
              }
            })
          } else {
            if (child.material.color) {
              child.material.color.setStyle(selectedColor)
            }
          }
        }
      })
    }
  }, [fbx, selectedColor])

  // Handle animations
  useEffect(() => {
    if (actions && names.length > 0) {
      // Stop all animations first
      Object.values(actions).forEach(action => action.stop())
      switch (animationName) {
        case 'dance': {
          // Play the rumba animation (should be the main animation in the FBX)
          const danceAction = actions[names[0]] // First animation should be the rumba
          if (danceAction) {
            danceAction.play()
            setIsPlaying(true)
          }
          break
        }

        case 'wave': {
          // If there are multiple animations, try to find a wave or use a slower dance
          const waveAction = actions[names[0]]
          if (waveAction) {
            waveAction.timeScale = 0.3 // Slower for wave effect
            waveAction.play()
            setIsPlaying(true)
          }
          break
        }

        case 'idle': {
          // Very slow animation for idle
          const idleAction = actions[names[0]]
          if (idleAction) {
            idleAction.timeScale = 0.1 // Very slow
            idleAction.play()
            setIsPlaying(true)
          }
          break
        }

        default:
          setIsPlaying(false)
          break
      }
    }
  }, [actions, names, animationName])

  // Scale and position the model
  useEffect(() => {
    if (fbx) {
      // Scale down the model (FBX models are often quite large)
      fbx.scale.set(0.02, 0.02, 0.02)
      fbx.position.set(0, 0, 0)
    }
  }, [fbx])

  // Subtle floating animation when not dancing
  useFrame(state => {
    if (group.current && !isPlaying) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  if (!fbx) {
    return <LoadingAvatar selectedColor={selectedColor} />
  }

  return (
    <group ref={group}>
      <primitive object={fbx} />
      {/* Modern Ground plane with gradient */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial
          color='#1a1a2e'
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Glowing circle under avatar */}
      <mesh position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.2, 32]} />
        <meshBasicMaterial color={selectedColor} transparent opacity={0.3} />
      </mesh>

      {/* Inner glow circle */}
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshBasicMaterial color={selectedColor} transparent opacity={0.1} />
      </mesh>
      {/* Modern Animation Status */}
      <Html position={[0, 2.5, 0]} center>
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '25px',
            fontSize: '14px',
            textAlign: 'center',
            minWidth: '180px',
            border: `2px solid ${selectedColor}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${selectedColor}40`,
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            fontWeight: '600',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '18px' }}>
              {animationName === 'dance'
                ? '🕺'
                : animationName === 'wave'
                ? '👋'
                : animationName === 'idle'
                ? '🧍'
                : '⏸️'}
            </span>
            <span>
              {animationName === 'dance'
                ? 'Rumba Dancing!'
                : animationName === 'wave'
                ? 'Slow Dance'
                : animationName === 'idle'
                ? 'Gentle Sway'
                : 'Ready to Dance'}
            </span>
          </div>
        </div>
      </Html>

      {/* Enhanced Animation Info */}
      {names.length > 0 && (
        <Html position={[0, -1.2, 0]} center>
          <div
            style={{
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(15px)',
              color: '#ccc',
              padding: '8px 16px',
              borderRadius: '15px',
              fontSize: '11px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
              maxWidth: '250px',
            }}
          >
            <div
              style={{
                color: '#4A90E2',
                fontWeight: '600',
                marginBottom: '4px',
              }}
            >
              📊 Model Info
            </div>
            <div>Animations: {names.join(', ')}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Modern Loading fallback component
function LoadingAvatar({ selectedColor }) {
  const meshRef = useRef()
  const particlesRef = useRef()

  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  // Create loading particles
  const particles = []
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const radius = 1.5
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    particles.push([x, 1, z])
  }

  return (
    <group>
      {/* Main loading shape */}
      <mesh ref={meshRef} position={[0, 1, 0]}>
        <octahedronGeometry args={[0.8]} />
        <meshStandardMaterial
          color={selectedColor}
          transparent
          opacity={0.8}
          emissive={selectedColor}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Orbiting particles */}
      <group ref={particlesRef}>
        {particles.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial
              color={selectedColor}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}
      </group>

      {/* Loading text */}
      <Html position={[0, 2.5, 0]} center>
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '25px',
            fontSize: '14px',
            textAlign: 'center',
            border: `1px solid ${selectedColor}40`,
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            fontWeight: '600',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                border: `2px solid ${selectedColor}40`,
                borderTop: `2px solid ${selectedColor}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            ></div>
            Loading Rumba Dancer...
          </div>
        </div>
      </Html>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </group>
  )
}

export default AvatarScene
