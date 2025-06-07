import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Leva } from 'leva';
import Scene from './components/Scene';
import './App.css';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Panel de controles Leva */}
      <Leva
        collapsed={false}
        oneLineLabels={false}
        titleBar={{
          title: '🎛️ Controles 3D Interactivos',
          drag: true,
          filter: false,
        }}
      />

      {/* Escena 3D */}
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        style={{
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        }}
      >
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Suspense>
      </Canvas>

      {/* Información del taller */}
      <div className="info-panel">
        <h3>🔍 Taller: Dashboards Visuales 3D</h3>
        <p>Controla objetos 3D, materiales y luces en tiempo real</p>
        <p>📦 Cubo • 🌐 Esfera • 🍩 Toro</p>
        <p>💡 Luces dinámicas con controles completos</p>
      </div>
    </div>
  );
}

export default App;

