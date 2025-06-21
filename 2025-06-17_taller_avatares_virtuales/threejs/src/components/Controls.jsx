import { useState } from 'react'

export default function Controls({
  onColorChange,
  onAnimationToggle,
  isAnimationPlaying,
  onAnimationIndexChange,
  animationIndex,
  currentAnimation,
}) {
  // Colores predefinidos para la ropa del avatar
  const colors = [
    { name: 'Azul', value: 0x3498db },
    { name: 'Rojo', value: 0xe74c3c },
    { name: 'Verde', value: 0x2ecc71 },
    { name: 'Morado', value: 0x9b59b6 },
    { name: 'Naranja', value: 0xf39c12 },
    { name: 'Rosa', value: 0xe91e63 },
    { name: 'Gris', value: 0x95a5a6 },
    { name: 'Negro', value: 0x2c3e50 },
  ]

  // Animaciones dinámicas basadas en las disponibles en el modelo
  const animations = currentAnimation
    ? [
        { name: 'Animación 1', description: 'Primera animación disponible' },
        { name: 'Animación 2', description: 'Segunda animación disponible' },
        { name: 'Animación 3', description: 'Tercera animación disponible' },
        { name: 'Animación 4', description: 'Cuarta animación disponible' },
      ]
    : []

  return (
    <div
      style={{
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginTop: '20px',
      }}
    >
      <h2 style={{ marginBottom: '20px', color: '#333' }}>
        🎨 Personalización del Avatar
      </h2>

      {/* Sección de colores */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#555' }}>
          👔 Color de la Ropa
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '10px',
          }}
        >
          {colors.map((color, index) => (
            <button
              key={index}
              onClick={() => onColorChange(color.value)}
              style={{
                padding: '10px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                background: `linear-gradient(135deg, #${color.value.toString(
                  16
                )}, #${(color.value * 0.8).toString(16)})`,
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                transition: 'transform 0.2s ease',
                ':hover': {
                  transform: 'scale(1.05)',
                },
              }}
              onMouseEnter={e => (e.target.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.target.style.transform = 'scale(1)')}
            >
              {color.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sección de animaciones */}
      <div>
        <h3 style={{ marginBottom: '15px', color: '#555' }}>
          🕺 Control de Animaciones
        </h3>

        {/* Botón de play/pause */}
        <div style={{ marginBottom: '15px' }}>
          <button
            onClick={onAnimationToggle}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '25px',
              background: isAnimationPlaying
                ? 'linear-gradient(135deg, #e74c3c, #c0392b)'
                : 'linear-gradient(135deg, #2ecc71, #27ae60)',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.target.style.transform = 'translateY(0)')}
          >
            {isAnimationPlaying ? '⏸️ Pausar' : '▶️ Reproducir'} Animación
          </button>
        </div>

        {/* Selector de animaciones */}
        {animations.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
            }}
          >
            {animations.map((anim, index) => (
              <button
                key={index}
                onClick={() => onAnimationIndexChange(index)}
                style={{
                  padding: '12px',
                  border:
                    animationIndex === index
                      ? '3px solid #3498db'
                      : '2px solid #ddd',
                  borderRadius: '8px',
                  background:
                    animationIndex === index
                      ? 'linear-gradient(135deg, #3498db, #2980b9)'
                      : 'linear-gradient(135deg, #ecf0f1, #bdc3c7)',
                  color: animationIndex === index ? 'white' : '#333',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                }}
                onMouseEnter={e => {
                  if (animationIndex !== index) {
                    e.target.style.background =
                      'linear-gradient(135deg, #74b9ff, #0984e3)'
                    e.target.style.color = 'white'
                  }
                }}
                onMouseLeave={e => {
                  if (animationIndex !== index) {
                    e.target.style.background =
                      'linear-gradient(135deg, #ecf0f1, #bdc3c7)'
                    e.target.style.color = '#333'
                  }
                }}
              >
                <div>{anim.name}</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>
                  {anim.description}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '20px',
              background: 'rgba(255, 152, 0, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              textAlign: 'center',
              color: '#e67e22',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🤖</div>
            <strong>Sin animaciones detectadas</strong>
            <div style={{ fontSize: '14px', marginTop: '5px', opacity: 0.8 }}>
              Tu modelo no incluye animaciones o no están en formato compatible.
              <br />
              ¡Pero aún puedes personalizar los colores!
            </div>
          </div>
        )}

        {/* Información de animación actual */}
        {currentAnimation && (
          <div
            style={{
              marginTop: '15px',
              padding: '10px',
              background: 'rgba(52, 152, 219, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(52, 152, 219, 0.3)',
            }}
          >
            <strong>🎬 Animación actual:</strong> {currentAnimation}
          </div>
        )}
      </div>
    </div>
  )
}
