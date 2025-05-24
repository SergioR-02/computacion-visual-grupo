import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Scene from './components/Scene'
import { Stats } from '@react-three/drei'

export default function App() {
  return (
    <Canvas shadows
      camera={{ position: [10, 10, 10], fov: 45 }}
      style={{ width: '100vw', height: '100vh', background: '#e0e0e0' }}>
      <color attach="background" args={['#e0e0e0']} />
      <OrbitControls />
      <Stats />
      <Scene />
    </Canvas>
  )
}
