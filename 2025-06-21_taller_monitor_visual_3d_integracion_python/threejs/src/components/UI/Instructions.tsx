import React from 'react';

export const Instructions: React.FC = () => {
  return (
    <div className="instructions">
      <div className="instructions-header">
        <h3>📋 Guía Rápida</h3>
        <div className="instructions-toggle">
          <small>Usa los controles de la derecha para personalizar</small>
        </div>
      </div>

      <div className="instructions-grid">
        <div className="instruction-card">
          <div className="card-icon">🐍</div>
          <div className="card-content">
            <h4>Ejecutar Monitor</h4>
            <code>python python/main.py</code>
            <p>Inicia el sistema de detección visual</p>
          </div>
        </div>

        <div className="instruction-card">
          <div className="card-icon">📷</div>
          <div className="card-content">
            <h4>Configurar Cámara</h4>
            <p>Permite acceso cuando se solicite</p>
            <small>Asegúrate de tener buena iluminación</small>
          </div>
        </div>

        <div className="instruction-card">
          <div className="card-icon">🎮</div>
          <div className="card-content">
            <h4>Controles 3D</h4>
            <p>Click izq: rotar • Rueda: zoom • Click der: mover</p>
            <small>Arrastra para explorar la escena</small>
          </div>
        </div>

        <div className="instruction-card">
          <div className="card-icon">⚙️</div>
          <div className="card-content">
            <h4>Personalizar</h4>
            <p>Panel de controles a la derecha</p>
            <small>Ajusta colores, efectos y más</small>
          </div>
        </div>
      </div>
    </div>
  );
};
