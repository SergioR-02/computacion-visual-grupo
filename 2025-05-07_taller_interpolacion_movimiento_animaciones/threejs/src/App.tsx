import { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import InterpolationScene from './components/InterpolationScene';
import ComparisonScene from './components/ComparisonScene';
import EasingScene from './components/EasingScene';
import './App.css';

// Componente para manejar la animación global
function AnimationController({
  isAnimating,
  t,
  setT,
  setIsAnimating,
}: {
  isAnimating: boolean;
  t: number;
  setT: (t: number) => void;
  setIsAnimating: (animating: boolean) => void;
}) {
  useFrame((_, delta) => {
    if (isAnimating) {
      const newT = Math.min(t + delta * 0.5, 1); // Velocidad de animación
      setT(newT);

      if (newT >= 1) {
        setIsAnimating(false);
      }
    }
  });

  return null; // Este componente no renderiza nada visible
}

function App() {
  const [interpolationType, setInterpolationType] = useState<
    'linear' | 'bezier' | 'slerp'
  >('linear');
  const [viewMode, setViewMode] = useState<
    'individual' | 'comparison' | 'easing'
  >('individual');
  const [isAnimating, setIsAnimating] = useState(false);
  const [t, setT] = useState(0);

  const handleStartAnimation = () => {
    setIsAnimating(true);
    setT(0);
  };

  const handleStopAnimation = () => {
    setIsAnimating(false);
  };

  const handleReset = () => {
    setIsAnimating(false);
    setT(0);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Panel de Control */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '10px',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '300px',
        }}
      >
        <h2>🔍 Taller de Interpolación</h2>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Modo de Vista:
          </label>
          <select
            value={viewMode}
            onChange={e => setViewMode(e.target.value as any)}
            style={{ padding: '5px', width: '100%' }}
          >
            <option value="individual">Vista Individual</option>
            <option value="comparison">Comparación Lado a Lado</option>
            <option value="easing">Funciones de Easing</option>
          </select>
        </div>

        {viewMode === 'individual' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Tipo de Interpolación:
            </label>
            <select
              value={interpolationType}
              onChange={e => setInterpolationType(e.target.value as any)}
              style={{ padding: '5px', width: '100%' }}
            >
              <option value="linear">LERP (Linear)</option>
              <option value="bezier">Bézier Curve</option>
              <option value="slerp">SLERP (Rotation)</option>
            </select>
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Progreso (t): {t.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={t}
            onChange={e => setT(parseFloat(e.target.value))}
            style={{ width: '100%' }}
            disabled={isAnimating}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleStartAnimation}
            disabled={isAnimating}
            style={{
              padding: '8px 16px',
              backgroundColor: isAnimating ? '#666' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isAnimating ? 'not-allowed' : 'pointer',
            }}
          >
            ▶️ Animar
          </button>

          <button
            onClick={handleStopAnimation}
            disabled={!isAnimating}
            style={{
              padding: '8px 16px',
              backgroundColor: !isAnimating ? '#666' : '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: !isAnimating ? 'not-allowed' : 'pointer',
            }}
          >
            ⏸️ Pausar
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            🔄 Reset
          </button>
        </div>

        <div style={{ marginTop: '15px', fontSize: '12px', opacity: 0.8 }}>
          <p>
            <strong>Controles:</strong>
          </p>
          <p>• Arrastra para rotar la cámara</p>
          <p>• Scroll para zoom</p>
          <p>• Click derecho para pan</p>

          {viewMode === 'individual' && (
            <div style={{ marginTop: '10px' }}>
              <p>
                <strong>Técnicas:</strong>
              </p>
              <p>
                🔴 <strong>LERP:</strong> Interpolación lineal simple
              </p>
              <p>
                🟡 <strong>Bézier:</strong> Curva suave con puntos de control
              </p>
              <p>
                🔵 <strong>SLERP:</strong> Interpolación esférica para
                rotaciones
              </p>
            </div>
          )}

          {viewMode === 'easing' && (
            <div style={{ marginTop: '10px' }}>
              <p>
                <strong>Easing Functions:</strong>
              </p>
              <p>Observa cómo diferentes funciones</p>
              <p>modifican la velocidad de animación</p>
            </div>
          )}
        </div>
      </div>

      {/* Escena 3D */}
      <Canvas
        camera={{
          position:
            viewMode === 'comparison'
              ? [8, 3, 8]
              : viewMode === 'easing'
              ? [7, 0, 7]
              : [5, 5, 5],
          fov: 75,
        }}
      >
        <color attach="background" args={['#1a1a2e']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Controlador de animación global */}
        <AnimationController
          isAnimating={isAnimating}
          t={t}
          setT={setT}
          setIsAnimating={setIsAnimating}
        />

        {viewMode === 'individual' && (
          <InterpolationScene
            interpolationType={interpolationType}
            isAnimating={isAnimating}
            t={t}
          />
        )}

        {viewMode === 'comparison' && (
          <ComparisonScene isAnimating={isAnimating} t={t} />
        )}

        {viewMode === 'easing' && (
          <EasingScene isAnimating={isAnimating} t={t} />
        )}

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}

export default App;

