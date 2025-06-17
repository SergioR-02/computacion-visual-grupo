import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { Leva } from 'leva'
import RoboticArm from './components/RoboticArm'
import './styles/App.css'

function App() {
  return (
    <div className='app-container'>
      <header className='header'>
        <h1>🤖 Cinemática Directa - Brazo Robótico</h1>
        <p>Taller de Forward Kinematics con React Three Fiber</p>
      </header>

      <div className='canvas-container'>
        <Canvas camera={{ position: [10, 8, 10], fov: 50 }}>
          {/* Iluminación mejorada */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <directionalLight position={[-5, 5, -5]} intensity={0.8} />
          <pointLight position={[0, 5, 0]} intensity={1} />

          {/* Grid de referencia */}
          <Grid
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor={'#6f6f6f'}
            sectionSize={5}
            sectionThickness={1}
            sectionColor={'#9d4b4b'}
            fadeDistance={25}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid={true}
          />

          {/* Brazo robótico */}
          <RoboticArm />

          {/* Controles de cámara */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={[0, 2, 0]}
          />
        </Canvas>
      </div>

      {/* Panel de controles */}
      <Leva
        collapsed={false}
        oneLineLabels={false}
        hideCopyButton={true}
        theme={{
          sizes: {
            titleBarHeight: '28px',
          },
          fontSizes: {
            root: '11px',
          },
        }}
      />
    </div>
  )
}

export default App
