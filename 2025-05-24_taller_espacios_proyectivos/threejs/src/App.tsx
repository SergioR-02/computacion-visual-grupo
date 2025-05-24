import { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  OrthographicCamera,
  Text,
  Box,
} from '@react-three/drei';
import './App.css';

// Componente para un objeto 3D con texto identificativo
function Object3D({
  position,
  color,
  label,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  label: string;
  scale?: number;
}) {
  return (
    <group position={position}>
      <Box scale={[scale, scale, scale]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Text
        position={[0, scale + 0.8, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

// Componente de la escena 3D
function Scene({ cameraType }: { cameraType: 'perspective' | 'orthographic' }) {
  return (
    <>
      {/* Cámara Perspectiva */}
      {cameraType === 'perspective' && (
        <PerspectiveCamera
          makeDefault
          position={[5, 5, 8]}
          fov={75}
          near={0.1}
          far={1000}
        />
      )}

      {/* Cámara Ortográfica */}
      {cameraType === 'orthographic' && (
        <OrthographicCamera
          makeDefault
          position={[5, 5, 8]}
          left={-10}
          right={10}
          top={10}
          bottom={-10}
          near={0.1}
          far={1000}
        />
      )}

      {/* Controles de órbita */}
      <OrbitControls enablePan enableZoom enableRotate />

      {/* Iluminación */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} />

      {/* Tres objetos a diferentes profundidades */}
      <Object3D
        position={[0, 0, 0]}
        color="#ff6b6b"
        label="Objeto Cerca (z=0)"
        scale={1}
      />

      <Object3D
        position={[0, 0, -4]}
        color="#4ecdc4"
        label="Objeto Medio (z=-4)"
        scale={1.2}
      />

      <Object3D
        position={[0, 0, -8]}
        color="#45b7d1"
        label="Objeto Lejos (z=-8)"
        scale={1.5}
      />

      {/* Plano de referencia */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -4]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#333333" transparent opacity={0.3} />
      </mesh>

      {/* Líneas de referencia para mostrar profundidad */}
      <group>
        {/* Línea horizontal de referencia */}
        <mesh position={[0, -1.5, -4]}>
          <boxGeometry args={[15, 0.1, 0.1]} />
          <meshBasicMaterial color="#666666" />
        </mesh>

        {/* Marcadores de profundidad */}
        {[0, -4, -8].map((z, index) => (
          <mesh key={index} position={[6, -1.5, z]}>
            <boxGeometry args={[0.1, 0.5, 0.1]} />
            <meshBasicMaterial color="#999999" />
          </mesh>
        ))}
      </group>
    </>
  );
}

function App() {
  const [cameraType, setCameraType] = useState<'perspective' | 'orthographic'>(
    'perspective',
  );

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      {/* Panel de controles */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '10px',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <h2 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
          🎯 Taller: Espacios Proyectivos
        </h2>

        <div style={{ marginBottom: '15px' }}>
          <strong>Tipo de Cámara Actual:</strong>
          <br />
          <span
            style={{
              color: cameraType === 'perspective' ? '#ff6b6b' : '#4ecdc4',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {cameraType === 'perspective' ? '📐 Perspectiva' : '📏 Ortográfica'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            onClick={() => setCameraType('perspective')}
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '5px',
              background: cameraType === 'perspective' ? '#ff6b6b' : '#555',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            📐 Perspectiva
          </button>

          <button
            onClick={() => setCameraType('orthographic')}
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '5px',
              background: cameraType === 'orthographic' ? '#4ecdc4' : '#555',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            📏 Ortográfica
          </button>
        </div>

        <div style={{ fontSize: '12px', lineHeight: '1.4', color: '#ccc' }}>
          <strong>Controles:</strong>
          <br />
          • Clic + Arrastrar: Rotar
          <br />
          • Rueda del mouse: Zoom
          <br />
          • Clic derecho + Arrastrar: Pan
          <br />
          <br />
          <strong>Observa:</strong>
          <br />
          • Cómo cambia la percepción de profundidad
          <br />
          • El tamaño relativo de los objetos
          <br />• Las líneas de perspectiva
        </div>
      </div>

      {/* Información sobre el tipo de proyección */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '10px',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '300px',
        }}
      >
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
          {cameraType === 'perspective'
            ? '📐 Proyección Perspectiva'
            : '📏 Proyección Ortográfica'}
        </h3>

        {cameraType === 'perspective' ? (
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            <strong>Características:</strong>
            <br />
            • Los objetos más lejanos se ven más pequeños
            <br />
            • Las líneas paralelas convergen en el horizonte
            <br />
            • Simula la visión humana natural
            <br />
            • Preserva la sensación de profundidad
            <br />
            <br />
            <strong>Matriz de Proyección:</strong>
            <br />
            Divide por la coordenada Z (perspectiva)
          </div>
        ) : (
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            <strong>Características:</strong>
            <br />
            • Todos los objetos mantienen su tamaño
            <br />
            • Las líneas paralelas permanecen paralelas
            <br />
            • No hay distorsión por distancia
            <br />
            • Útil para diseño técnico/arquitectónico
            <br />
            <br />
            <strong>Matriz de Proyección:</strong>
            <br />
            Proyección paralela (sin división por Z)
          </div>
        )}
      </div>

      {/* Canvas de Three.js */}
      <Canvas style={{ width: '100%', height: '100%' }}>
        <Scene cameraType={cameraType} />
      </Canvas>
    </div>
  );
}

export default App;

