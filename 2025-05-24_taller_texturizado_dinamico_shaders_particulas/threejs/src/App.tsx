import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Leva } from 'leva';
import './App.css';

// Importar componentes del taller
import DynamicMaterialSphere from './components/DynamicMaterialSphere';
import ParticleSystem from './components/ParticleSystem';
import InteractiveScene from './components/InteractiveScene';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0f' }}>
      {/* Panel de controles GUI */}
      <Leva collapsed={false} />

      {/* Titulo del taller */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: 'white',
          zIndex: 1000,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
          🧪 Taller - Texturizado Dinámico
        </h1>
        <p style={{ margin: '5px 0', opacity: 0.8 }}>
          Materiales con Shaders y Partículas
        </p>
      </div>

      {/* Canvas 3D principal */}
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Configuración de la escena */}
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 10, 50]} />

        {/* Iluminación */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#4a90e2"
        />

        {/* Controles de cámara */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={20}
          minDistance={3}
        />

        {/* Estadísticas de rendimiento */}
        <Stats />

        {/* Componentes del taller */}
        <Suspense fallback={null}>
          <InteractiveScene />
        </Suspense>
      </Canvas>

      {/* Instrucciones */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          maxWidth: '300px',
        }}
      >
        <h3 style={{ margin: '0 0 10px 0' }}>🎮 Controles:</h3>
        <p style={{ margin: '5px 0' }}>• Click en la esfera para explosión</p>
        <p style={{ margin: '5px 0' }}>• Hover para cambiar material</p>
        <p style={{ margin: '5px 0' }}>• Usa el panel Leva para ajustes</p>
        <p style={{ margin: '5px 0' }}>• Arrastra para rotar la cámara</p>
      </div>
    </div>
  );
}

export default App;
