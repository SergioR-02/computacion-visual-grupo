import { useState } from 'react'
import AnimatedModel from './AnimatedModel'
import AnimationControls from './AnimationControls'

// Configuración de los modelos disponibles
const MODELS = {
  rumba: {
    path: '/Dorchester3D.com_Rumba+Dancing/Rumba Dancing.glb',
    name: 'Rumba Dancing',
    position: [0, 0, 0],
    scale: 1
  },
  jump: {
    path: '/ImageToStl.com_Jump/Jump.glb',
    name: 'Jump Animation',
    position: [0, 0, 0],
    scale: 1
  },
  stairs: {
    path: '/ImageToStl.com_Running+Up+Stairs/Running Up Stairs.glb',
    name: 'Running Up Stairs',
    position: [0, 0, 0],
    scale: 1
  }
}

function AnimatedScene() {
  const [selectedModel, setSelectedModel] = useState('rumba')
  const [currentAnimation, setCurrentAnimation] = useState(null)
  const [availableAnimations, setAvailableAnimations] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)

  const handleModelChange = (modelKey) => {
    setSelectedModel(modelKey)
    setCurrentAnimation(null)
    setAvailableAnimations([])
    setIsPlaying(false)
  }

  const handleAnimationsLoaded = (animations) => {
    setAvailableAnimations(animations)
    // Reproducir automáticamente la primera animación si existe
    if (animations.length > 0) {
      setCurrentAnimation(animations[0])
      setIsPlaying(true)
    }
  }

  const handleAnimationChange = (animationName) => {
    setCurrentAnimation(animationName)
    setIsPlaying(true)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const selectedModelConfig = MODELS[selectedModel]

  return (
    <>
      {/* Modelo animado */}
      <AnimatedModel
        key={selectedModel} // Fuerza re-render al cambiar modelo
        modelPath={selectedModelConfig.path}
        position={selectedModelConfig.position}
        scale={selectedModelConfig.scale}
        currentAnimation={currentAnimation}
        isPlaying={isPlaying}
        onAnimationsLoaded={handleAnimationsLoaded}
      />

      {/* Controles de la interfaz */}
      <AnimationControls
        models={MODELS}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        availableAnimations={availableAnimations}
        currentAnimation={currentAnimation}
        onAnimationChange={handleAnimationChange}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
      />
    </>
  )
}

export default AnimatedScene
