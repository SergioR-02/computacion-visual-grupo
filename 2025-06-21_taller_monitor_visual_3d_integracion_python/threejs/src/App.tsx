/**
 * 🧪 Taller - Monitor de Actividad Visual 3D MEJORADO
 * Parte 2: Visualización 3D Reactiva con Three.js - UI Moderna
 *
 * Esta aplicación crea una escena 3D que responde en tiempo real
 * a los datos de visión por computador enviados desde Python.
 */

// @ts-nocheck

import React, { useRef, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';

// Hooks personalizados
import { useWebSocket } from './hooks/useWebSocket';
import { useFullscreen } from './hooks/useFullscreen';

// Componentes UI
import { Header } from './components/UI/Header';
import { FloatingToolbar } from './components/UI/FloatingToolbar';
import { InfoOverlay } from './components/UI/InfoOverlay';
import { Instructions } from './components/UI/Instructions';
import { LoadingSpinner } from './components/UI/LoadingSpinner';

// Componentes 3D
import { Scene3D } from './components/3D/Scene3D';

// Estilos
import './App.css';

const App: React.FC = () => {
  const { data, connected } = useWebSocket('ws://localhost:8765');
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleReset = useCallback(() => {
    console.log('🔄 Vista reiniciada');
  }, []);

  const handleScreenshot = useCallback(() => {
    console.log('📸 Captura de pantalla');
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    toggleFullscreen(canvasRef.current || undefined);
  }, [toggleFullscreen]);

  return (
    <div className="app">
      {/* Header */}
      <Header data={data} connected={connected} isFullscreen={isFullscreen} />

      {/* Canvas container */}
      <div
        ref={canvasRef}
        className={`canvas-container ${isFullscreen ? 'fullscreen' : ''}`}
      >
        <Canvas
          camera={{ position: [10, 5, 10], fov: 75 }}
          style={{
            background:
              'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
          }}
          shadows
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            {/* Controles de cámara */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={false}
              autoRotateSpeed={0.5}
              dampingFactor={0.05}
              screenSpacePanning={false}
              minDistance={3}
              maxDistance={50}
            />

            {/* Escena principal */}
            <Scene3D data={data} />

            {/* Estadísticas de rendimiento */}
            <Stats />
          </Suspense>
        </Canvas>

        {/* Barra de herramientas flotante */}
        <FloatingToolbar
          connected={connected}
          onReset={handleReset}
          onScreenshot={handleScreenshot}
          onToggleFullscreen={handleToggleFullscreen}
        />

        {/* Overlay de información */}
        {data && <InfoOverlay data={data} />}
      </div>

      {/* Instrucciones */}
      {!isFullscreen && <Instructions />}
    </div>
  );
};

export default App;

