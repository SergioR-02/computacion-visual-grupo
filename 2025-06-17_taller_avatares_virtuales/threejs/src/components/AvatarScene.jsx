import { useState } from 'react'
import Scene3D from './Scene3D'
import Controls from './Controls'

export default function AvatarScene() {
  // Estados para personalización
  const [selectedColor, setSelectedColor] = useState(0x3498db) // Azul por defecto
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false)
  const [animationIndex, setAnimationIndex] = useState(0)
  const [currentAnimation, setCurrentAnimation] = useState('')

  // Handlers para los controles
  const handleColorChange = color => {
    setSelectedColor(color)
  }

  const handleAnimationToggle = () => {
    setIsAnimationPlaying(!isAnimationPlaying)
  }

  const handleAnimationIndexChange = index => {
    setAnimationIndex(index)
    setIsAnimationPlaying(true) // Activar automáticamente la animación al seleccionar
  }

  const handleAnimationChange = animationName => {
    setCurrentAnimation(animationName)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '20px',
          color: 'white',
        }}
      >
        <h1
          style={{
            fontSize: '2.5em',
            margin: '0 0 10px 0',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          🧍‍♂️ Taller de Avatares Virtuales
        </h1>
        <p
          style={{
            fontSize: '1.2em',
            margin: '0',
            opacity: 0.9,
          }}
        >
          Personaliza tu avatar y controla sus animaciones en tiempo real
        </p>
      </div>

      {/* Escena 3D */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '10px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Scene3D
          selectedColor={selectedColor}
          isAnimationPlaying={isAnimationPlaying}
          onAnimationChange={handleAnimationChange}
          animationIndex={animationIndex}
        />
      </div>

      {/* Controles */}
      <Controls
        onColorChange={handleColorChange}
        onAnimationToggle={handleAnimationToggle}
        isAnimationPlaying={isAnimationPlaying}
        onAnimationIndexChange={handleAnimationIndexChange}
        animationIndex={animationIndex}
        currentAnimation={currentAnimation}
      />

      {/* Información adicional */}
      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '10px',
          textAlign: 'center',
        }}
      >
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
          ℹ️ Instrucciones
        </h3>
        <p style={{ margin: '5px 0', color: '#666' }}>
          • <strong>Rotar vista:</strong> Mantén clic izquierdo y arrastra
        </p>
        <p style={{ margin: '5px 0', color: '#666' }}>
          • <strong>Zoom:</strong> Usa la rueda del ratón
        </p>
        <p style={{ margin: '5px 0', color: '#666' }}>
          • <strong>Personalizar:</strong> Haz clic en los colores para cambiar
          la ropa del avatar
        </p>
        <p style={{ margin: '5px 0', color: '#666' }}>
          • <strong>Animar:</strong> Selecciona una animación y presiona
          reproducir
        </p>
      </div>
    </div>
  )
}
