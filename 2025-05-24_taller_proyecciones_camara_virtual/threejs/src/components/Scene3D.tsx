import { OrbitControls, Box, Sphere } from '@react-three/drei';
import { TargetSphere } from './TargetSphere';
import type { CameraType, ProjectedPoint } from '../types';

interface Scene3DProps {
  cameraType: CameraType;
  onProjectedPointUpdate?: (point: ProjectedPoint) => void;
}

export function Scene3D({ cameraType, onProjectedPointUpdate }: Scene3DProps) {
  return (
    <>
      {/* Iluminación */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      {/* Objetos distribuidos en diferentes distancias */}
      {/* Fila cercana */}
      <Box position={[-2, 0, -2]} args={[0.8, 0.8, 0.8]}>
        <meshStandardMaterial color="#3b82f6" />
      </Box>
      <Box position={[0, 0, -2]} args={[0.8, 0.8, 0.8]}>
        <meshStandardMaterial color="#8b5cf6" />
      </Box>
      <Box position={[2, 0, -2]} args={[0.8, 0.8, 0.8]}>
        <meshStandardMaterial color="#06d6a0" />
      </Box>

      {/* Fila media */}
      <Sphere position={[-3, 1, -5]} args={[0.5, 32, 32]}>
        <meshStandardMaterial color="#f59e0b" />
      </Sphere>
      <Sphere position={[0, 1, -5]} args={[0.5, 32, 32]}>
        <meshStandardMaterial color="#ec4899" />
      </Sphere>
      <Sphere position={[3, 1, -5]} args={[0.5, 32, 32]}>
        <meshStandardMaterial color="#84cc16" />
      </Sphere>

      {/* Fila lejana */}
      <Box position={[-4, -1, -8]} args={[1.2, 1.2, 1.2]}>
        <meshStandardMaterial color="#6366f1" />
      </Box>
      <Box position={[0, -1, -8]} args={[1.2, 1.2, 1.2]}>
        <meshStandardMaterial color="#14b8a6" />
      </Box>
      <Box position={[4, -1, -8]} args={[1.2, 1.2, 1.2]}>
        <meshStandardMaterial color="#f97316" />
      </Box>

      {/* Esfera objetivo para proyección */}
      <TargetSphere onProjectedPointUpdate={onProjectedPointUpdate} />

      {/* Plano de referencia */}
      <mesh position={[0, -2, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#374151" transparent opacity={0.3} />
      </mesh>

      {/* Controles orbitales */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={20}
        minDistance={2}
      />
    </>
  );
}
