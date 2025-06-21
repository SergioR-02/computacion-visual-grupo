import React from 'react';

interface FloatingToolbarProps {
  connected: boolean;
  onReset: () => void;
  onScreenshot: () => void;
  onToggleFullscreen: () => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  connected,
  onReset,
  onScreenshot,
  onToggleFullscreen,
}) => {
  return (
    <div className="floating-toolbar">
      <button className="tool-btn" onClick={onReset} title="Reiniciar vista">
        🔄
      </button>
      <button
        className="tool-btn"
        onClick={onScreenshot}
        title="Capturar pantalla"
      >
        📸
      </button>
      <button
        className="tool-btn"
        onClick={onToggleFullscreen}
        title="Pantalla completa"
      >
        🔳
      </button>
      <div
        className={`connection-dot ${connected ? 'connected' : 'disconnected'}`}
      ></div>
    </div>
  );
};
