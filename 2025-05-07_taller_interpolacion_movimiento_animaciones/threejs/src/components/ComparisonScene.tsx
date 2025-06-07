import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Quaternion, CubicBezierCurve3 } from 'three';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface ComparisonSceneProps {
  isAnimating: boolean;
  t: number;
}

export default function ComparisonScene({ t }: ComparisonSceneProps) {
  const linearMeshRef = useRef<Mesh>(null);
  const bezierMeshRef = useRef<Mesh>(null);
  const slerpMeshRef = useRef<Mesh>(null);

  // Posiciones para cada tipo de interpolación
  const linearOffset = new Vector3(0, 2, 0);
  const bezierOffset = new Vector3(0, 0, 0);
  const slerpOffset = new Vector3(0, -2, 0);

  // Puntos base
  const startPoint = new Vector3(-4, 0, 0);
  const endPoint = new Vector3(4, 0, 0);

  // Puntos de control para Bézier
  const controlPoint1 = new Vector3(-2, 2, 1);
  const controlPoint2 = new Vector3(2, -2, -1);

  const bezierCurve = new CubicBezierCurve3(
    startPoint.clone().add(bezierOffset),
    controlPoint1.clone().add(bezierOffset),
    controlPoint2.clone().add(bezierOffset),
    endPoint.clone().add(bezierOffset),
  );

  useFrame(() => {
    // Interpolación lineal
    if (linearMeshRef.current) {
      const position = new Vector3().lerpVectors(startPoint, endPoint, t);
      linearMeshRef.current.position.copy(position);
      linearMeshRef.current.rotation.y = THREE.MathUtils.lerp(
        0,
        Math.PI * 2,
        t,
      );
    }

    // Interpolación Bézier
    if (bezierMeshRef.current) {
      const position = bezierCurve.getPoint(t);
      // Remover el offset del grupo porque ya se aplica automáticamente
      position.sub(bezierOffset);
      bezierMeshRef.current.position.copy(position);

      if (t < 1 && t > 0) {
        const tangent = bezierCurve.getTangent(t);
        bezierMeshRef.current.lookAt(
          bezierMeshRef.current.position.clone().add(tangent),
        );
      }
    }

    // Interpolación SLERP
    if (slerpMeshRef.current) {
      const position = new Vector3().lerpVectors(startPoint, endPoint, t);
      slerpMeshRef.current.position.copy(position);

      const startQuat = new Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
      const endQuat = new Quaternion().setFromEuler(
        new THREE.Euler(Math.PI, Math.PI * 2, Math.PI),
      );
      const currentQuat = new Quaternion().slerpQuaternions(
        startQuat,
        endQuat,
        t,
      );
      slerpMeshRef.current.quaternion.copy(currentQuat);
    }
  });

  return (
    <>
      {/* Interpolación Lineal */}
      <group position={linearOffset}>
        <mesh ref={linearMeshRef} position={startPoint}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>

        <mesh position={startPoint}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="#00ff00" />
        </mesh>

        <mesh position={endPoint}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  startPoint.x,
                  startPoint.y,
                  startPoint.z,
                  endPoint.x,
                  endPoint.y,
                  endPoint.z,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ff6b6b" opacity={0.7} transparent />
        </line>

        <Text
          position={[-5, 0, 0]}
          fontSize={0.3}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
        >
          LERP
        </Text>
      </group>

      {/* Interpolación Bézier */}
      <group position={bezierOffset}>
        <mesh ref={bezierMeshRef} position={startPoint}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#4ecdc4" />
        </mesh>

        <mesh position={startPoint}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="#00ff00" />
        </mesh>

        <mesh position={endPoint}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>

        <mesh position={controlPoint1}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color="#ffeb3b" />
        </mesh>

        <mesh position={controlPoint2}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color="#ffeb3b" />
        </mesh>

        {/* Línea de la curva Bézier */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  bezierCurve.getPoints(50).flatMap(p => [p.x, p.y, p.z]),
                ),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#4ecdc4" opacity={0.7} transparent />
        </line>

        {/* Líneas de control */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  startPoint.x,
                  startPoint.y,
                  startPoint.z,
                  controlPoint1.x,
                  controlPoint1.y,
                  controlPoint1.z,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ffeb3b" opacity={0.3} transparent />
        </line>

        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  endPoint.x,
                  endPoint.y,
                  endPoint.z,
                  controlPoint2.x,
                  controlPoint2.y,
                  controlPoint2.z,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ffeb3b" opacity={0.3} transparent />
        </line>

        <Text
          position={[-5, 0, 0]}
          fontSize={0.3}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
        >
          BÉZIER
        </Text>
      </group>

      {/* Interpolación SLERP */}
      <group position={slerpOffset}>
        <mesh ref={slerpMeshRef} position={startPoint}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#45b7d1" />
        </mesh>

        <mesh position={startPoint}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="#00ff00" />
        </mesh>

        <mesh position={endPoint}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>

        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  startPoint.x,
                  startPoint.y,
                  startPoint.z,
                  endPoint.x,
                  endPoint.y,
                  endPoint.z,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#45b7d1" opacity={0.7} transparent />
        </line>

        <Text
          position={[-5, 0, 0]}
          fontSize={0.3}
          color="#45b7d1"
          anchorX="center"
          anchorY="middle"
        >
          SLERP
        </Text>
      </group>

      {/* Título de la comparación */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Comparación de Técnicas de Interpolación
      </Text>
    </>
  );
}
