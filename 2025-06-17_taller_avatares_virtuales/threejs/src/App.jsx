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
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background:
          'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
        position: 'relative',
        fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Modern Header */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '80px',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 30px',
        }}
      >
        <div>
          <h1
            style={{
              margin: '0',
              fontSize: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '700',
            }}
          >
            🧍‍♂️ Virtual Avatars Lab
          </h1>
          <p
            style={{
              margin: '5px 0 0 0',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: '400',
            }}
          >
            Three.js + React Three Fiber • Real-time 3D Avatar System
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              padding: '8px 16px',
              background: 'rgba(74, 144, 226, 0.1)',
              border: '1px solid rgba(74, 144, 226, 0.3)',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#4A90E2',
            }}
          >
            FBX Model Loaded
          </div>
        </div>
      </div>

      {/* Floating Control Panel */}
      <div
        style={{
          position: 'absolute',
          top: '110px',
          right: '30px',
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(30px)',
          padding: '25px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          minWidth: '280px',
          maxWidth: '320px',
        }}
      >
        {/* Color Customization */}
        <div style={{ marginBottom: '25px' }}>
          <h3
            style={{
              margin: '0 0 15px 0',
              fontSize: '16px',
              color: 'white',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🎨 Avatar Colors
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
            }}
          >
            {colors.map(color => (
              <div key={color.value} style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setSelectedColor(color.value)}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    border:
                      selectedColor === color.value
                        ? '3px solid white'
                        : '2px solid rgba(255, 255, 255, 0.2)',
                    background: color.gradient,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform:
                      selectedColor === color.value ? 'scale(1.1)' : 'scale(1)',
                    boxShadow:
                      selectedColor === color.value
                        ? '0 8px 25px rgba(255, 255, 255, 0.3)'
                        : '0 4px 15px rgba(0, 0, 0, 0.2)',
                    display: 'block',
                    margin: '0 auto 8px auto',
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    color:
                      selectedColor === color.value
                        ? 'white'
                        : 'rgba(255, 255, 255, 0.6)',
                    fontWeight: selectedColor === color.value ? '600' : '400',
                  }}
                >
                  {color.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Animation Controls */}
        <div>
          <h3
            style={{
              margin: '0 0 15px 0',
              fontSize: '16px',
              color: 'white',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🎭 Animations
          </h3>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            {animations.map(anim => (
              <button
                key={anim.id}
                onClick={() =>
                  setAnimationName(animationName === anim.id ? '' : anim.id)
                }
                style={{
                  padding: '15px 20px',
                  backgroundColor:
                    animationName === anim.id
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                  background:
                    animationName === anim.id
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  border:
                    animationName === anim.id
                      ? '1px solid rgba(255, 255, 255, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                  transform:
                    animationName === anim.id
                      ? 'translateY(-2px)'
                      : 'translateY(0)',
                  boxShadow:
                    animationName === anim.id
                      ? '0 8px 25px rgba(102, 126, 234, 0.4)'
                      : '0 2px 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span style={{ fontSize: '20px' }}>{anim.icon}</span>
                <div>
                  <div style={{ fontWeight: '600' }}>{anim.name}</div>
                  <div
                    style={{
                      fontSize: '11px',
                      opacity: 0.8,
                      marginTop: '2px',
                    }}
                  >
                    {anim.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div
          style={{
            marginTop: '20px',
            padding: '12px 16px',
            background: 'rgba(74, 144, 226, 0.1)',
            border: '1px solid rgba(74, 144, 226, 0.2)',
            borderRadius: '10px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '4px',
            }}
          >
            Current Status
          </div>
          <div
            style={{
              fontSize: '14px',
              color: selectedColor,
              fontWeight: '600',
            }}
          >
            {animationName
              ? animations.find(a => a.id === animationName)?.name
              : 'Stopped'}{' '}
            • {colors.find(c => c.value === selectedColor)?.name}
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        <color attach='background' args={['#0a0a0a']} />

        {/* Enhanced Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color='#4A90E2' />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color={selectedColor}
        />

        <Environment preset='city' />

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
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '60px',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '30px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '12px',
        }}
      >
        <div>🖱️ Drag to rotate</div>
        <div>🔍 Scroll to zoom</div>
        <div>🎨 Click colors to customize</div>
        <div>🎭 Select animations to play</div>
      </div>
    </div>
  )
}

export default App
