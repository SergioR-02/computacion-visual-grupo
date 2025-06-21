import React from 'react';
import type { VisualData } from '../../hooks/useWebSocket';

interface InfoOverlayProps {
  data: VisualData;
}

export const InfoOverlay: React.FC<InfoOverlayProps> = ({ data }) => {
  return (
    <div className="info-overlay">
      <div className="overlay-header">
        <span className="overlay-title">🧪 MONITOR VISUAL 3D</span>
        <span className="overlay-status">ACTIVO</span>
      </div>
      <div className="overlay-content">
        <div className="data-row">
          <span className="data-icon">👥</span>
          <span className="data-text">{data.people_count} personas</span>
        </div>
        <div className="data-row">
          <span className="data-icon">📦</span>
          <span className="data-text">{data.objects_count} objetos</span>
        </div>
        <div className="data-row">
          <span className="data-icon">✋</span>
          <span className="data-text">{data.hands_count} manos</span>
        </div>
        <div className="data-row">
          <span className="data-icon">🏃</span>
          <span className="data-text">
            {(data.movement_intensity * 100).toFixed(1)}% movimiento
          </span>
        </div>
        {data.hand_gestures && data.hand_gestures.length > 0 && (
          <div className="data-row">
            <span className="data-icon">🤏</span>
            <span className="data-text">{data.hand_gestures.join(', ')}</span>
          </div>
        )}
      </div>
      <div className="overlay-footer">
        <small>
          Actualizado: {new Date(data.timestamp * 1000).toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
};
