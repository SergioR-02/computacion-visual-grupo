import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import Avatar from './Avatar'

export default function Scene3D({
  selectedColor,
  isAnimationPlaying,
  onAnimationChange,
  animationIndex,
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 60 }}
      style={{
        height: '70vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Iluminación */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Avatar principal */}
      <Avatar
        position={[0, 0, 0]}
        selectedColor={selectedColor}
        isAnimationPlaying={isAnimationPlaying}
        onAnimationChange={onAnimationChange}
        animationIndex={animationIndex}
      />

      {/* Controles de cámara */}
      <OrbitControls
        enablePan={true}
        maxPolarAngle={Math.PI}
        minPolarAngle={0}
        minDistance={1.5}
        maxDistance={8}
        target={[0, 0, 0]}
      />

      {/* Entorno y sombras */}
      <Environment preset='studio' />
      <ContactShadows
        position={[0, -0.8, 0]}
        opacity={0.4}
        scale={10}
        blur={1.5}
        far={0.8}
      />
    </Canvas>
  )
}
