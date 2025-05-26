import React, { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { OrbitControls, Stars, Text, Html } from '@react-three/drei'
import * as THREE from 'three'

import CollisionScene from './components/CollisionScene'
import { useCollisionStore } from './hooks/useCollisionStore'

function Loading() {
  return (
    <Html center>
      <div style={{ color: 'white', fontSize: '18px' }}>
        Loading collision physics...
      </div>
    </Html>
  )
}

function App() {
  const { collisionCount } = useCollisionStore()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Update collision counter in DOM
    const counter = document.getElementById('collision-count')
    if (counter) {
      counter.textContent = collisionCount
    }
  }, [collisionCount])

  useEffect(() => {
    // Handle keyboard events
    const handleKeyPress = event => {
      if (event.code === 'Space') {
        event.preventDefault()
        window.location.reload() // Simple reset by reloading
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <Canvas
      camera={{
        position: [0, 5, 10],
        fov: 60,
        near: 0.1,
        far: 1000,
      }}
      shadows
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onCreated={() => setIsReady(true)}
    >
      {/* Environment setup */}
      <color attach='background' args={['#0a0a0a']} />
      <fog attach='fog' args={['#0a0a0a', 10, 50]} />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight
        position={[10, 10, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight
        position={[-10, 10, 5]}
        intensity={0.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Stars background */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade={true}
      />

      {/* Physics world */}
      <Physics
        gravity={[0, -9.81, 0]}
        defaultContactMaterial={{
          friction: 0.4,
          restitution: 0.8,
        }}
      >
        <Suspense fallback={<Loading />}>
          <CollisionScene />
        </Suspense>
      </Physics>

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={50}
      />

      {/* Title - using default font */}
      <Text
        position={[0, 8, 0]}
        fontSize={1}
        color='#ffffff'
        anchorX='center'
        anchorY='middle'
      >
        Collision Particles Workshop
      </Text>
    </Canvas>
  )
}

export default App
