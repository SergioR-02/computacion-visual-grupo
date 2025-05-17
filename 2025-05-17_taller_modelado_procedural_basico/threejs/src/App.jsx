import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import CubeGrid from './components/CubeGrid'
import WavyPlane from './components/WavyPlane'
import FractalTree from './components/FractalTree'

export default function App() {
  return (
    <Canvas>
      <OrbitControls />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      {/* <CubeGrid /> */}
      {/* <WavyPlane /> */}
     
      <OrbitControls />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <FractalTree />
    </Canvas>
  )
}
