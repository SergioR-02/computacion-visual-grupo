import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import type { VisualData } from '../../hooks/useWebSocket';

interface MetricsPanelProps {
  data: VisualData;
  position: [number, number, number];
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  data,
  position,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Html position={position}>
      <div className={`metrics-panel ${expanded ? 'expanded' : 'collapsed'}`}>
        <div className="panel-header" onClick={() => setExpanded(!expanded)}>
          <h3>📊 Métricas Live</h3>
          <button className="toggle-btn">{expanded ? '▼' : '▶'}</button>
        </div>

        {expanded && (
          <div className="panel-content">
            <div className="metric-grid">
              <div className="metric-card primary">
                <div className="metric-icon">👥</div>
                <div className="metric-data">
                  <span className="metric-value">{data.people_count}</span>
                  <span className="metric-label">Personas</span>
                </div>
              </div>

              <div className="metric-card secondary">
                <div className="metric-icon">📦</div>
                <div className="metric-data">
                  <span className="metric-value">{data.objects_count}</span>
                  <span className="metric-label">Objetos</span>
                </div>
              </div>

              <div className="metric-card accent">
                <div className="metric-icon">🏃</div>
                <div className="metric-data">
                  <span className="metric-value">
                    {(data.movement_intensity * 100).toFixed(1)}%
                  </span>
                  <span className="metric-label">Movimiento</span>
                </div>
              </div>

              <div className="metric-card info">
                <div className="metric-icon">✋</div>
                <div className="metric-data">
                  <span className="metric-value">{data.hands_count}</span>
                  <span className="metric-label">Manos</span>
                </div>
              </div>
            </div>

            <div className="gesture-display">
              <h4>Gestos Detectados:</h4>
              <div className="gesture-chips">
                {data.hand_gestures && data.hand_gestures.length > 0 ? (
                  data.hand_gestures.map((gesture, index) => (
                    <span key={index} className={`gesture-chip ${gesture}`}>
                      {gesture === 'fist'
                        ? '✊'
                        : gesture === 'open_hand'
                        ? '✋'
                        : gesture === 'peace'
                        ? '✌️'
                        : gesture === 'pointing'
                        ? '👉'
                        : '🤏'}
                      {gesture}
                    </span>
                  ))
                ) : (
                  <span className="no-gestures">Sin gestos</span>
                )}
              </div>
            </div>

            <div className="timestamp">
              <small>
                Última actualización:{' '}
                {new Date(data.timestamp * 1000).toLocaleTimeString()}
              </small>
            </div>
          </div>
        )}
      </div>
    </Html>
  );
};
