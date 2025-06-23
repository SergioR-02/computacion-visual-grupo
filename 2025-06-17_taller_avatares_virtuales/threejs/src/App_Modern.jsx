import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Center } from '@react-three/drei'
import AvatarScene from './components/AvatarSceneRumba'
import './App.css'

function App() {
  const [selectedColor, setSelectedColor] = useState('#4A90E2')
  const [animationName, setAnimationName] = useState('')

  const colors = [
    {
      name: 'Azure',
      value: '#4A90E2',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      name: 'Crimson',
      value: '#E24A4A',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      name: 'Emerald',
      value: '#4AE24A',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      name: 'Amethyst',
      value: '#A64AE2',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    {
      name: 'Sunset',
      value: '#E2A64A',
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    },
    {
      name: 'Rose',
      value: '#E24AA6',
      gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    },
  ]

  const animations = [
    {
      id: 'dance',
      name: 'Dance',
      icon: '🕺',
      description: 'Full rumba dancing',
    },
    { id: 'wave', name: 'Wave', icon: '👋', description: 'Slow elegant wave' },
    { id: 'idle', name: 'Idle', icon: '🧍', description: 'Gentle breathing' },
  ]

  return (
    <div className="canvas-container">
      {/* Modern Header */}
      <header className="modern-header">
        <div>
          <h1 className="header-title">🧍‍♂️ Virtual Avatars Lab</h1>
          <p className="header-subtitle">
            Three.js + React Three Fiber • Real-time 3D Avatar System
          </p>
        </div>
        
        <div className="header-status">
          <div className="status-badge">FBX Model Loaded</div>
        </div>
      </header>

      {/* Control Panel */}
      <aside className="control-panel">
        {/* Color Customization */}
        <section>
          <h3 className="section-title">
            🎨 Avatar Colors
          </h3>
          
          <div className="color-grid">
            {colors.map((color) => (
              <div 
                key={color.value} 
                className={`color-option ${selectedColor === color.value ? 'active' : ''}`}
              >
                <button
                  className={`color-button ${selectedColor === color.value ? 'active' : ''}`}
                  onClick={() => setSelectedColor(color.value)}
                  style={{ background: color.gradient }}
                  aria-label={`Select ${color.name} color`}
                />
                <span className="color-name">{color.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Animation Controls */}
        <section>
          <h3 className="section-title">
            🎭 Animations
          </h3>
          
          <div className="animation-grid">
            {animations.map((anim) => (
              <button
                key={anim.id}
                className={`animation-button ${animationName === anim.id ? 'active' : ''}`}
                onClick={() => setAnimationName(animationName === anim.id ? '' : anim.id)}
                aria-label={`${anim.name} animation`}
              >
                <span className="animation-icon">{anim.icon}</span>
                <div className="animation-details">
                  <h4>{anim.name}</h4>
                  <p>{anim.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Current Status */}
        <section className="status-display">
          <div className="status-label">Current Status</div>
          <div 
            className="status-value" 
            style={{ color: selectedColor }}
          >
            {animationName ? animations.find(a => a.id === animationName)?.name : 'Stopped'} • {colors.find(c => c.value === selectedColor)?.name}
          </div>
        </section>
      </aside>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={['#0a0a0a']} />
        
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.2} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4A90E2" />
        <spotLight 
          position={[0, 10, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={0.5}
          color={selectedColor}
        />
        
        <Environment preset="city" />
        
        <Center>
          <AvatarScene 
            selectedColor={selectedColor}
            animationName={animationName}
          />
        </Center>
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={15}
          target={[0, 1, 0]}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Bottom Info Bar */}
      <footer className="bottom-bar">
        <div className="control-tip">🖱️ Drag to rotate</div>
        <div className="control-tip">🔍 Scroll to zoom</div>
        <div className="control-tip">🎨 Click colors to customize</div>
        <div className="control-tip">🎭 Select animations to play</div>
      </footer>
    </div>
  )
}

export default App
