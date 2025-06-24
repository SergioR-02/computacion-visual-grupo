import { useState, useEffect } from 'react'

function GameUI({ aiState, playerPosition, aiPosition, detectionRadius, onDetectionRadiusChange, aiSpeed, onAiSpeedChange }) {
  const [fps, setFps] = useState(0)

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()

    const updateFPS = () => {
      frameCount++
      const currentTime = performance.now()
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)))
        frameCount = 0
        lastTime = currentTime
      }
      requestAnimationFrame(updateFPS)
    }

    requestAnimationFrame(updateFPS)
  }, [])

  const getStateDescription = (state) => {
    switch (state) {
      case 'patrol': return '🚶 Patrullando'
      case 'chase': return '🏃 Persiguiendo'
      case 'search': return '🔍 Buscando'
      case 'idle': return '⏸️ Esperando'
      default: return '❓ Desconocido'
    }
  }

  const getStateColor = (state) => {
    switch (state) {
      case 'patrol': return '#32CD32'
      case 'chase': return '#FF4500'
      case 'search': return '#FFD700'
      case 'idle': return '#808080'
      default: return '#FFFFFF'
    }
  }

  return (
    <>
      {/* Panel de información principal */}
      <div className="info-panel">
        <h3>🎮 Taller de Animación AI - Three.js</h3>
        <p>• Navegación autónoma con patrullaje</p>
        <p>• Detección de jugador</p>
        <p>• Control de animaciones</p>
        <p>• IA de comportamientos</p>
      </div>

      {/* Panel de controles */}
      <div className="controls-panel">
        <h4>🎮 Controles</h4>
        <p><strong>WASD:</strong> Mover jugador</p>
        <p><strong>Mouse:</strong> Rotar cámara</p>
        <p><strong>Scroll:</strong> Zoom</p>
          {/* Slider para radio de detección */}
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#FFD700' }}>👁️ Radio de Detección</h5>
          <input 
            type="range" 
            min="1" 
            max="8" 
            step="0.5" 
            value={detectionRadius || 3}
            onChange={(e) => onDetectionRadiusChange && onDetectionRadiusChange(parseFloat(e.target.value))}
            style={{ 
              width: '100%', 
              height: '5px',
              background: '#ddd',
              borderRadius: '5px',
              outline: 'none'
            }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '12px', 
            marginTop: '5px',
            color: '#ccc'
          }}>
            <span>1.0</span>
            <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{detectionRadius?.toFixed(1)}</span>
            <span>8.0</span>
          </div>
        </div>

        {/* Slider para velocidad del AI */}
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#FF6B6B' }}>🏃 Velocidad del AI</h5>
          <input 
            type="range" 
            min="0.5" 
            max="6" 
            step="0.5" 
            value={aiSpeed || 2}
            onChange={(e) => onAiSpeedChange && onAiSpeedChange(parseFloat(e.target.value))}
            style={{ 
              width: '100%', 
              height: '5px',
              background: 'linear-gradient(to right, #32CD32 0%, #FFD700 50%, #FF4500 100%)',
              borderRadius: '5px',
              outline: 'none'
            }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '12px', 
            marginTop: '5px',
            color: '#ccc'
          }}>
            <span>0.5</span>
            <span style={{ color: '#FF6B6B', fontWeight: 'bold' }}>{aiSpeed?.toFixed(1)}</span>
            <span>6.0</span>
          </div>
        </div>
      </div>      {/* Panel de estado */}
      <div className="status-panel">
        <h4>📊 Estado del Sistema</h4>
        <p><strong>FPS:</strong> {fps}</p>
        <p>
          <strong>Estado IA:</strong> 
          <span style={{ color: getStateColor(aiState), marginLeft: '8px' }}>
            {getStateDescription(aiState)}
          </span>
        </p>
        <p><strong>Radio Detección:</strong> {detectionRadius?.toFixed(1)} unidades</p>
        <p><strong>Velocidad AI:</strong> {aiSpeed?.toFixed(1)} u/s</p>
        {aiPosition && (
          <p><strong>Posición IA:</strong> ({aiPosition.x.toFixed(1)}, {aiPosition.z.toFixed(1)})</p>
        )}
        {playerPosition && (
          <p><strong>Posición Jugador:</strong> ({playerPosition.x.toFixed(1)}, {playerPosition.z.toFixed(1)})</p>
        )}
      </div>
    </>
  )
}

export default GameUI
