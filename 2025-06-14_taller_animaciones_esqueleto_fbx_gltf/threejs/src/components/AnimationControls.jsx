import { Html } from '@react-three/drei'

function AnimationControls({
  models,
  selectedModel,
  onModelChange,
  availableAnimations,
  currentAnimation,
  onAnimationChange,
  isPlaying,
  onPlayPause
}) {
  return (
    <Html
      position={[-8, -3, 0]}
      style={{
        transform: 'translate3d(0, 0, 0)',
        pointerEvents: 'auto'
      }}
    >
      <div className="controls">
        <h3>🎭 Control de Animaciones</h3>
        
        {/* Selector de modelo */}
        <div className="model-selector">
          <label htmlFor="model-select">
            <strong>Modelo:</strong>
          </label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
          >
            {Object.entries(models).map(([key, model]) => (
              <option key={key} value={key}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        {/* Controles de animación */}
        <div className="animation-controls">
          <label>
            <strong>Animaciones disponibles:</strong>
          </label>
          
          <div className="animation-buttons">
            {availableAnimations.length > 0 ? (
              availableAnimations.map((animName) => (
                <button
                  key={animName}
                  className={`btn ${currentAnimation === animName ? 'active' : ''}`}
                  onClick={() => onAnimationChange(animName)}
                >
                  {animName}
                </button>
              ))
            ) : (
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                Cargando animaciones...
              </p>
            )}
          </div>

          {/* Botón Play/Pause */}
          {currentAnimation && (
            <div style={{ marginTop: '1rem' }}>
              <button
                className="btn"
                onClick={onPlayPause}
                style={{
                  backgroundColor: isPlaying ? '#f44336' : '#4caf50',
                  width: '100%'
                }}
              >
                {isPlaying ? '⏸️ Pausar' : '▶️ Reproducir'}
              </button>
            </div>
          )}
        </div>

        {/* Información actual */}
        <div className="animation-info">
          <div>
            <strong>Modelo actual:</strong> {models[selectedModel]?.name}
          </div>
          {currentAnimation && (
            <div>
              <strong>Animación:</strong> {currentAnimation}
            </div>
          )}
          <div>
            <strong>Estado:</strong> {isPlaying ? '▶️ Reproduciendo' : '⏸️ Pausado'}
          </div>
          <div>
            <strong>Total animaciones:</strong> {availableAnimations.length}
          </div>
        </div>

        {/* Instrucciones */}
        <div style={{ 
          marginTop: '1rem', 
          fontSize: '0.8rem', 
          opacity: 0.8,
          borderTop: '1px solid rgba(255,255,255,0.2)',
          paddingTop: '1rem'
        }}>
          <strong>💡 Instrucciones:</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
            <li>Selecciona diferentes modelos</li>
            <li>Cambia entre animaciones</li>
            <li>Usa el ratón para rotar la cámara</li>
            <li>Scroll para hacer zoom</li>
          </ul>
        </div>
      </div>
    </Html>
  )
}

export default AnimationControls
