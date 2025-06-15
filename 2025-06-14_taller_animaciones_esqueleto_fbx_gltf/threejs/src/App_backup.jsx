import React, { useState, useEffect } from 'react'
import { Canvas } from '@react    <div className="app">
      {/* Barra de controles flotante y arrastrable */}
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
          <div className="controls-layout">port { OrbitControls, Environment } from '@react-three/drei'
import AnimatedModel from './components/AnimatedModel'
import ErrorBoundary from './components/ErrorBoundary'
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
  const [key, setKey] = useState(0) // Para forzar re-render del modelo
  const [isCollapsed, setIsCollapsed] = useState(false) // Estado del panel flotante
  const [position, setPosition] = useState({ x: 20, y: 20 }) // Posición del panel
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Limpiar localStorage al iniciar para evitar problemas de caché
  useEffect(() => {
    // Limpiar cualquier estado persistente relacionado con modelos antiguos
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

  // Forzar recarga del modelo cuando cambie
  const handleModelChange = (newModelPath) => {
    setSelectedModel(newModelPath)
    setCurrentAnimation('')
    setAvailableAnimations([])
    setKey(prev => prev + 1) // Fuerza re-render completo
  }

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

  return (
    <div className="app">
      {/* Barra de controles flotante */}
      <div className={`controls ${isCollapsed ? 'collapsed' : ''}`} style={{ left: position.x, top: position.y }}>
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

        <div className="controls-layout">
          {/* Selector de modelo */}
          <div className="control-section model-section">
            <h4>🎭 Selector de Modelo</h4>
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
            <h4>⏯️ Control de Reproducción</h4>
            <button 
              className={`btn btn-pause ${!isPlaying ? 'paused' : ''}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? '⏸️ Pausar Animación' : '▶️ Reproducir Animación'}
            </button>
          </div>

          {/* Control de velocidad */}
          <div className="control-section speed-section">
            <h4>⚡ Velocidad de Animación</h4>
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

          {/* Animaciones disponibles */}
          <div className="control-section animations-section">
            <h4>🎬 Animaciones Disponibles</h4>
            {availableAnimations.length > 0 ? (
              <div className="animation-buttons">
                {availableAnimations.map((animName, index) => (
                  <button
                    key={index}
                    className={`btn ${currentAnimation === animName ? 'btn-active' : ''}`}
                    onClick={() => setCurrentAnimation(animName)}
                  >
                    🎭 {animName}
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '1rem' }}>
                Cargando animaciones...
              </p>
            )}
          </div>

          {/* Información actual */}
          <div className="control-section info-section">
            <h4>ℹ️ Información del Estado</h4>
            <div className="animation-info">
              <div className="info-item">
                <strong>Modelo:</strong>
                <span className="info-value">{models.find(m => m.path === selectedModel)?.name}</span>
              </div>
              <div className="info-item">
                <strong>Animación:</strong>
                <span className="info-value">{currentAnimation || 'Ninguna seleccionada'}</span>
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

      {/* Canvas 3D */}
      <div className="canvas-container">
        <Canvas
          key={key} // Añadir key aquí para forzar re-render
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
              key={`${selectedModel}-${key}`} // Usar doble key para forzar re-render
              modelPath={selectedModel}
              currentAnimation={currentAnimation}
              setCurrentAnimation={setCurrentAnimation}
              setAvailableAnimations={setAvailableAnimations}
              isPlaying={isPlaying}
              animationSpeed={animationSpeed}
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
