import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import { useControls } from 'leva'
import UVMappingScene from './components/UVMappingScene'
import './App.css'

function App() {
  const { showStats } = useControls({
    showStats: false
  })

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <color attach="background" args={['#1a1a1a']} />
        
        {/* Iluminación */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />
        
        {/* Escena principal */}
        <UVMappingScene />
        
        {/* Controles */}
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          dampingFactor={0.05}
          enableDamping={true}
        />
        
        {showStats && <Stats />}
      </Canvas>
      
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        color: 'white', 
        backgroundColor: 'rgba(0,0,0,0.7)', 
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px'
      }}>
        <h3>Taller UV Mapping y Texturas</h3>
        <p>• Usa los controles de Leva para experimentar</p>
        <p>• Orbit Controls: Click + Drag para rotar</p>
        <p>• Scroll para zoom, Click derecho + Drag para pan</p>
      </div>
    </div>
  )
}

export default App
