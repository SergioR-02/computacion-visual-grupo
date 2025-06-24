import { useRef } from 'react'
import Terrain from './Terrain'
import Obstacles from './Obstacles'
import AICharacter from './AICharacter'
import Player from './Player'
import Lighting from './Lighting'
import PanoramicBackground from './PanoramicBackground'

function Scene({ onAiStateChange, onPlayerPositionChange, onAiPositionChange, detectionRadius, aiSpeed }) {
  return (
    <>
      <PanoramicBackground />
      <Lighting />
      <Terrain />
      <Obstacles />
      <AICharacter 
        onStateChange={onAiStateChange}
        onPositionChange={onAiPositionChange}
        detectionRadius={detectionRadius}
        baseSpeed={aiSpeed}
      />
      <Player 
        onPositionChange={onPlayerPositionChange}
      />
    </>
  )
}

export default Scene
