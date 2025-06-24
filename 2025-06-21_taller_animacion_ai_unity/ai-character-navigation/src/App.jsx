import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import { useState } from 'react'
import Scene from './components/Scene'
import GameUI from './components/GameUI'
import './App.css'

function App() {
  const [aiState, setAiState] = useState('patrol')
  const [playerPosition, setPlayerPosition] = useState(null)
  const [aiPosition, setAiPosition] = useState(null)
  const [detectionRadius, setDetectionRadius] = useState(3)
  const [aiSpeed, setAiSpeed] = useState(2)

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 50 }}>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <Stats />
        <Scene 
          onAiStateChange={setAiState}
          onPlayerPositionChange={setPlayerPosition}
          onAiPositionChange={setAiPosition}
          detectionRadius={detectionRadius}
          aiSpeed={aiSpeed}
        />
      </Canvas>
      <GameUI 
        aiState={aiState}
        playerPosition={playerPosition}
        aiPosition={aiPosition}
        detectionRadius={detectionRadius}
        onDetectionRadiusChange={setDetectionRadius}
        aiSpeed={aiSpeed}
        onAiSpeedChange={setAiSpeed}
      />
    </div>
  )
}

export default App
