import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import InverseKinematicsScene from './components/InverseKinematicsScene'
import './App.css'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
      {/* Header Information */}
      <div className="info-panel">
        <h1>🧪 Cinemática Inversa (IK)</h1>
        <p>
          Implementación del algoritmo CCD (Cyclic Coordinate Descent) para que un brazo robótico 
          persiga un objetivo dinámico. Arrastra la esfera roja para mover el objetivo.
        </p>
      </div>
      
      {/* Controls Information */}
      <div className="controls-info">
        <h4>🎮 Controles</h4>
        <ul>
          <li>Arrastra la esfera roja para mover el objetivo</li>
          <li>Click derecho + arrastrar para rotar la cámara</li>
          <li>Scroll para hacer zoom</li>
          <li>Usa el panel Leva para ajustar parámetros</li>
          <li>Prueba las posiciones demo en el panel azul</li>
        </ul>
      </div>

      {/* Performance Indicator */}
      <div className="performance-indicator">
        <div className="fps">FPS: Monitoring</div>
        <div className="status">IK Algorithm: CCD</div>
        <div className="status">Segments: 4</div>
      </div>
      
      <Canvas
        camera={{ position: [8, 6, 8], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        shadows
      >
        <InverseKinematicsScene />
      </Canvas>
      
      <Leva 
        collapsed={false} 
        titleBar={{ position: { x: 10, y: 10 } }}
        theme={{
          colors: {
            elevation1: '#1a1a1a',
            elevation2: '#2a2a2a',
            accent1: '#4CAF50',
            accent2: '#2196F3',
            highlight1: '#FF9800',
            highlight2: '#f44336'
          }
        }}
      />
    </div>
  )
}

export default App
