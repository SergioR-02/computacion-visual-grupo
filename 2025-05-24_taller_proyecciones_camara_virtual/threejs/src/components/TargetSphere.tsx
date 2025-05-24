import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { Vector3 } from 'three';
import type { ProjectedPoint } from '../types';

interface TargetSphereProps {
  position?: [number, number, number];
  color?: string;
  size?: number;
  onProjectedPointUpdate?: (point: ProjectedPoint) => void;
}

export function TargetSphere({
  position = [2, 2, -3],
  color = '#ef4444',
  size = 0.3,
  onProjectedPointUpdate,
}: TargetSphereProps) {
  const sphereRef = useRef<any>(null);
  const { camera, size: canvasSize } = useThree();
  const [projectedPoint, setProjectedPoint] = useState<ProjectedPoint | null>(
    null,
  );

  useFrame(() => {
    if (sphereRef.current) {
      // Obtener la posición 3D de la esfera
      const worldPosition = new Vector3();
      sphereRef.current.getWorldPosition(worldPosition);

      // Proyectar al espacio 2D de la pantalla
      const projected = worldPosition.clone().project(camera);

      // Convertir a coordenadas de pantalla
      const screenX = (projected.x * 0.5 + 0.5) * canvasSize.width;
      const screenY = (-projected.y * 0.5 + 0.5) * canvasSize.height;

      const newPoint = { x: screenX, y: screenY };
      setProjectedPoint(newPoint);
    }
  });

  // Emitir evento cuando cambie el punto proyectado
  useEffect(() => {
    if (projectedPoint) {
      // Callback prop si se proporciona
      onProjectedPointUpdate?.(projectedPoint);

      // Evento global para compatibilidad con versión anterior
      window.dispatchEvent(
        new CustomEvent('projectedPointUpdate', {
          detail: projectedPoint,
        }),
      );
    }
  }, [projectedPoint, onProjectedPointUpdate]);

  return (
    <Sphere ref={sphereRef} position={position} args={[size, 32, 32]}>
      <meshStandardMaterial color={color} emissive="#660000" />
    </Sphere>
  );
}
