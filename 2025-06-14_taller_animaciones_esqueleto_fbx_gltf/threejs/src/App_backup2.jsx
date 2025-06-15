import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import AnimatedModel from './components/AnimatedModel'
import ErrorBoundary from './components/ErrorBoundary'
import SoundEventIndicator from './components/SoundEventIndicator'
import './App.css'

const models = [
  { name: 'Bailando Rumba', path: '/Dorchester3D.com_Rumba+Dancing/Rumba Dancing.glb' },
  { name: 'Saltando', path: '/ImageToStl.com_Jump/Jump.glb' },
  { name: 'Subiendo Escaleras', path: '/ImageToStl.com_Running+Up+Stairs/Running Up Stairs.glb' }
]

function App() {
  const [selectedModel, setSelectedModel] = useState(models[0].path)
  const [currentAnimation, setCurrentAnimation] = useState('')
  const [availableAnimations, setAvailableAnimations] = useState([])
  const [isPlaying, setIsPlaying] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [key, setKey] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [soundEnabled, setSoundEnabled] = useState(true) // Control de sonido
  const [soundVolume, setSoundVolume] = useState(0.8) // Volumen global
  const [currentSoundEvent, setCurrentSoundEvent] = useState(null) // Evento de sonido actual

  // Limpiar localStorage al iniciar
  useEffect(() => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('soldier') || key.includes('zombie') || key.includes('vehicle')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('No se pudo limpiar localStorage:', error)
    }
  }, [])

  // Funciones para arrastrar el panel
  const handleMouseDown = (e) => {
    if (isCollapsed) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const newX = Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragOffset.x))
    const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y))
    setPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Event listeners para el arrastre
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  // Forzar recarga del modelo cuando cambie
  const handleModelChange = (newModelPath) => {
    setSelectedModel(newModelPath)
    setCurrentAnimation('')
    setAvailableAnimations([])
    setKey(prev => prev + 1)
  }

  return (
    <div className="app">
      {/* Panel de controles flotante y arrastrable */}
      <div 
        className={`controls ${isCollapsed ? 'collapsed' : ''} ${isDragging ? 'draggable' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      >
        {/* Handle para arrastrar */}
        <div 
          className="drag-handle"
          onMouseDown={handleMouseDown}
          title="Arrastra para mover el panel"
        />

        {/* Botón de colapsar/expandir */}
        <button 
          className="toggle-button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expandir controles' : 'Colapsar controles'}
        >
          {isCollapsed ? '▶' : '◀'}
        </button>

        {/* Título cuando está colapsado */}
        <div className="collapsed-title">CONTROLES</div>

        <div className="controls-content">
          <div className="controls-layout">
            {/* Selector de modelo */}
            <div className="control-section model-section">
              <h4>🎭 Modelo</h4>
              <select 
                value={selectedModel} 
                onChange={(e) => handleModelChange(e.target.value)}
                className="model-selector select"
              >
                {models.map((model, index) => (
                  <option key={index} value={model.path}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Control de reproducción */}
            <div className="control-section playback-section">
              <h4>⏯️ Reproducción</h4>
              <button 
                className={`btn btn-pause ${!isPlaying ? 'paused' : ''}`}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? '⏸️ Pausar' : '▶️ Reproducir'}
              </button>
            </div>            {/* Control de velocidad */}
            <div className="control-section speed-section">
              <h4>⚡ Velocidad</h4>
              <div className="speed-control">
                <div className="speed-slider-container">
                  <label>0.1x</label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                  />
                  <label>3x</label>
                </div>
                <div className="speed-value">{animationSpeed.toFixed(1)}x</div>
              </div>
            </div>

            {/* Control de sonido */}
            <div className="control-section sound-section">
              <h4>🔊 Audio</h4>
              <div className="sound-controls">
                <button 
                  className={`btn ${soundEnabled ? 'btn-active' : ''}`}
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? '🔊 Sonido ON' : '🔇 Sonido OFF'}
                </button>
                {soundEnabled && (
                  <div className="volume-control">
                    <div className="speed-slider-container">
                      <label>🔈</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={soundVolume}
                        onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                      />
                      <label>🔊</label>
                    </div>
                    <div className="speed-value">{(soundVolume * 100).toFixed(0)}%</div>
                  </div>
                )}
              </div>
            </div>

            {/* Animaciones disponibles */}
            <div className="control-section animations-section">
              <h4>🎬 Animaciones</h4>
              {availableAnimations.length > 0 ? (
                <div className="animation-buttons">
                  {availableAnimations.map((animName, index) => (
                    <button
                      key={index}
                      className={`btn ${currentAnimation === animName ? 'btn-active' : ''}`}
                      onClick={() => setCurrentAnimation(animName)}
                    >
                      {animName}
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '0.5rem', fontSize: '0.8rem' }}>
                  Cargando...
                </p>
              )}
            </div>

            {/* Información actual */}
            <div className="control-section info-section">
              <h4>ℹ️ Estado</h4>
              <div className="animation-info">
                <div className="info-item">
                  <strong>Modelo:</strong>
                  <span className="info-value">{models.find(m => m.path === selectedModel)?.name}</span>
                </div>
                <div className="info-item">
                  <strong>Animación:</strong>
                  <span className="info-value">{currentAnimation || 'Ninguna'}</span>
                </div>
                <div className="info-item">
                  <strong>Estado:</strong>
                  <span className="info-value">{isPlaying ? '▶️ Reproduciendo' : '⏸️ Pausado'}</span>
                </div>
                <div className="info-item">
                  <strong>Velocidad:</strong>
                  <span className="info-value">{animationSpeed.toFixed(1)}x</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas 3D - Ahora ocupa toda la pantalla */}
      <div className="canvas-container">
        <Canvas
          key={key}
          camera={{ position: [0, 2, 5], fov: 50 }}
          shadows
        >
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
            <ErrorBoundary>
            <AnimatedModel
              key={`${selectedModel}-${key}`}
              modelPath={selectedModel}
              currentAnimation={currentAnimation}
              setCurrentAnimation={setCurrentAnimation}
              setAvailableAnimations={setAvailableAnimations}
              isPlaying={isPlaying}
              animationSpeed={animationSpeed}
              soundEnabled={soundEnabled}
              soundVolume={soundVolume}
            />
          </ErrorBoundary>
          
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <planeGeometry args={[20, 20]} />
            <shadowMaterial opacity={0.3} />
          </mesh>
          
          <Environment preset="sunset" />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>
    </div>
  )
}

export default App
