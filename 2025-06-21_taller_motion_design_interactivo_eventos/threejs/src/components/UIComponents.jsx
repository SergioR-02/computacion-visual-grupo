import { ANIMATION_CONFIG } from './AnimationController'

/**
 * Componente UI para controles de animación
 */
export const AnimationControls = ({ 
  currentAnimation, 
  animationHistory, 
  onAnimationChange, 
  isTransitioning 
}) => {
  return (
    <div className="ui-controls">
      <h3>🎮 Controles de Animación</h3>
      
      <div className="button-group">
        {Object.values(ANIMATION_CONFIG).map((config) => (
          <button 
            key={config.name}
            onClick={() => onAnimationChange(config.name)}
            className={`animation-button ${currentAnimation === config.name ? 'active' : ''}`}
            disabled={isTransitioning}
            style={{
              borderColor: currentAnimation === config.name ? config.color : 'transparent',
              boxShadow: currentAnimation === config.name ? `0 0 20px ${config.color}40` : 'none'
            }}
            title={config.description}
          >
            {config.displayName} ({config.key})
          </button>
        ))}
      </div>

      <div className="controls-info">
        <p><strong>Controles Interactivos:</strong></p>
        <p>• 🖱️ Click en modelo: Activar WALK</p>
        <p>• 👆 Hover en modelo: Preview ARM</p>
        <p>• ⌨️ Teclas 1,2,3 o A,C,W: Cambiar animación</p>
        <p>• ⏭️ Espacio: Siguiente animación</p>
        <p>• 🔄 R: Reset a ARM</p>
        <p>• ⏹️ ESC: Parar animaciones</p>
          <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}>
          <p><strong>Estado:</strong></p>
          <p>Animación: <span style={{
            color: currentAnimation === null ? '#ff5722' : '#4CAF50', 
            fontWeight: 'bold'
          }}>
            {currentAnimation === null ? '⏹️ PAUSADO' : currentAnimation || 'Ninguna'}
          </span></p>
          <p>Transición: <span style={{color: isTransitioning ? '#ff9800' : '#4CAF50'}}>{isTransitioning ? 'Sí' : 'No'}</span></p>
          <p>Historial: <span style={{color: '#81c784', fontSize: '11px'}}>{animationHistory.slice(-3).join(' → ')}</span></p>
        </div>
      </div>
    </div>
  )
}

/**
 * Panel de información del proyecto
 */
export const InfoPanel = () => {
  return (
    <div className="info-panel">
      <div style={{ marginBottom: '8px' }}>
        <strong>🎬 Motion Design Interactivo</strong>
      </div>
      <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
        <div>⚛️ Three.js + React Three Fiber</div>
        <div>🎭 Modelo: Untitled.glb</div>
        <div>🎨 Animaciones: ARM, CROUCHED, WALK</div>
        <div>🎮 Eventos: Click, Hover, Teclado</div>
      </div>
    </div>
  )
}

/**
 * Indicador de estado de carga
 */
export const LoadingScreen = () => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '20px', fontSize: '24px', fontWeight: '600' }}>
          🎬 Cargando Experiencia 3D
        </div>
        <div style={{ marginBottom: '30px', opacity: 0.8 }}>
          Preparando modelo y animaciones...
        </div>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7 }}>
          Three.js + React Three Fiber
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

/**
 * Overlay de ayuda/instrucciones
 */
export const HelpOverlay = ({ isVisible, onClose }) => {
  if (!isVisible) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.9)',
        padding: '40px',
        borderRadius: '15px',
        maxWidth: '600px',
        border: '2px solid #4CAF50'
      }}>
        <h2 style={{ color: '#4CAF50', marginBottom: '20px', textAlign: 'center' }}>
          🎮 Guía de Interacción
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3 style={{ color: '#81c784', marginBottom: '10px' }}>Controles de Teclado</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>• <strong>1 o A:</strong> Animación ARM</li>
              <li>• <strong>2 o C:</strong> Animación CROUCHED</li>
              <li>• <strong>3 o W:</strong> Animación WALK</li>
              <li>• <strong>Espacio:</strong> Siguiente animación</li>
              <li>• <strong>R:</strong> Reset a ARM</li>
              <li>• <strong>ESC:</strong> Parar animaciones</li>
            </ul>
          </div>
          
          <div>
            <h3 style={{ color: '#81c784', marginBottom: '10px' }}>Controles de Mouse</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>• <strong>Click modelo:</strong> Activar WALK</li>
              <li>• <strong>Hover modelo:</strong> Preview ARM</li>
              <li>• <strong>Arrastrar:</strong> Rotar cámara</li>
              <li>• <strong>Scroll:</strong> Zoom</li>
              <li>• <strong>Click derecho:</strong> Pan</li>
            </ul>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={onClose}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  )
}
