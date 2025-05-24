import { OrbitControls, Box, Sphere, Text } from '@react-three/drei';
import { TargetSphere } from './TargetSphere';
import { GridHelper } from './GridHelper';
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

      {/* Grid y ejes de referencia */}
      <GridHelper />

      {/* Objetos distribuidos en diferentes distancias */}
      {/* Fila cercana - z=-3 */}
      <Box position={[-3, 0, -3]} args={[1, 1, 1]}>
        <meshStandardMaterial color="#3b82f6" />
      </Box>
      <Text position={[-3, 1.2, -3]} fontSize={0.3} color="white">
        Cerca
      </Text>

      <Box position={[0, 0, -3]} args={[1, 1, 1]}>
        <meshStandardMaterial color="#8b5cf6" />
      </Box>

      <Box position={[3, 0, -3]} args={[1, 1, 1]}>
        <meshStandardMaterial color="#06d6a0" />
      </Box>
      <Text position={[3, 1.2, -3]} fontSize={0.3} color="white">
        Cerca
      </Text>

      {/* Fila media - z=-6 */}
      <Sphere position={[-4, 1, -6]} args={[0.7, 32, 32]}>
        <meshStandardMaterial color="#f59e0b" />
      </Sphere>
      <Text position={[-4, 2, -6]} fontSize={0.3} color="white">
        Medio
      </Text>

      <Sphere position={[0, 1, -6]} args={[0.7, 32, 32]}>
        <meshStandardMaterial color="#ec4899" />
      </Sphere>

      <Sphere position={[4, 1, -6]} args={[0.7, 32, 32]}>
        <meshStandardMaterial color="#84cc16" />
      </Sphere>
      <Text position={[4, 2, -6]} fontSize={0.3} color="white">
        Medio
      </Text>

      {/* Fila lejana - z=-10 */}
      <Box position={[-5, -1, -10]} args={[1.5, 1.5, 1.5]}>
        <meshStandardMaterial color="#6366f1" />
      </Box>
      <Text position={[-5, 0.8, -10]} fontSize={0.4} color="white">
        Lejos
      </Text>

      <Box position={[0, -1, -10]} args={[1.5, 1.5, 1.5]}>
        <meshStandardMaterial color="#14b8a6" />
      </Box>

      <Box position={[5, -1, -10]} args={[1.5, 1.5, 1.5]}>
        <meshStandardMaterial color="#f97316" />
      </Box>
      <Text position={[5, 0.8, -10]} fontSize={0.4} color="white">
        Lejos
      </Text>

      {/* Esfera objetivo para proyección */}
      <TargetSphere onProjectedPointUpdate={onProjectedPointUpdate} />

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
