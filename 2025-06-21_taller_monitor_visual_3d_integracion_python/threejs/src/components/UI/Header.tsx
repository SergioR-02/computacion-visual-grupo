import React from 'react';
import type { VisualData } from '../../hooks/useWebSocket';

interface HeaderProps {
  data: VisualData | null;
  connected: boolean;
  isFullscreen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  data,
  connected,
  isFullscreen,
}) => {
  return (
    <div className={`header ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="header-left">
        <h1>🧪 Monitor Visual 3D</h1>
        <span className="version">v2.0</span>
      </div>

      <div className="header-center">
        <div className="data-indicators">
          {data && (
            <>
              <div className="indicator">
                <span className="indicator-value">{data.people_count}</span>
                <span className="indicator-label">👥</span>
              </div>
              <div className="indicator">
                <span className="indicator-value">{data.objects_count}</span>
                <span className="indicator-label">📦</span>
              </div>
              <div className="indicator">
                <span className="indicator-value">
                  {(data.movement_intensity * 100).toFixed(0)}%
                </span>
                <span className="indicator-label">🏃</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="connection-status">
          <span
            className={`status-indicator ${
              connected ? 'connected' : 'disconnected'
            }`}
          >
            {connected ? '🟢 Conectado' : '🔴 Desconectado'}
          </span>
        </div>
      </div>
    </div>
  );
};
