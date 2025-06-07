import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Mesh,
  Vector3,
  Quaternion,
  CubicBezierCurve3,
  BufferGeometry,
} from 'three';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface InterpolationSceneProps {
  interpolationType: 'linear' | 'bezier' | 'slerp';
  isAnimating: boolean;
  t: number;
}

export default function InterpolationScene({
  interpolationType,
  isAnimating,
  t,
}: InterpolationSceneProps) {
  const meshRef = useRef<Mesh>(null);
  const lineRef = useRef<THREE.Line>(null);

  // Puntos de inicio y fin
  const startPoint = new Vector3(-4, 0, 0);
  const endPoint = new Vector3(4, 0, 0);

  // Puntos de control para Bézier
  const controlPoint1 = new Vector3(-2, 3, 2);
  const controlPoint2 = new Vector3(2, -3, -2);

  // Crear curva Bézier
  const bezierCurve = new CubicBezierCurve3(
    startPoint,
    controlPoint1,
    controlPoint2,
    endPoint,
  );

  // Aplicar interpolación en cada frame
  useFrame(() => {
    if (meshRef.current) {
      // Aplicar interpolación según el tipo seleccionado
      switch (interpolationType) {
        case 'linear':
          applyLinearInterpolation(meshRef.current, t);
          break;
        case 'bezier':
          applyBezierInterpolation(meshRef.current, t);
          break;
        case 'slerp':
          applySlerpInterpolation(meshRef.current, t);
          break;
      }
    }
  });

  // Interpolación lineal (LERP)
  const applyLinearInterpolation = (mesh: Mesh, t: number) => {
    const position = new Vector3().lerpVectors(startPoint, endPoint, t);
    mesh.position.copy(position);

    // Rotación simple
    mesh.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 2, t);
  };

  // Interpolación Bézier
  const applyBezierInterpolation = (mesh: Mesh, t: number) => {
    const position = bezierCurve.getPoint(t);
    mesh.position.copy(position);

    // Orientar el objeto en la dirección del movimiento
    if (t < 1) {
      const tangent = bezierCurve.getTangent(t);
      mesh.lookAt(mesh.position.clone().add(tangent));
    }
  };

  // Interpolación esférica (SLERP) para rotación
  const applySlerpInterpolation = (mesh: Mesh, t: number) => {
    // Posición lineal
    const position = new Vector3().lerpVectors(startPoint, endPoint, t);
    mesh.position.copy(position);

    // Rotación usando SLERP
    const startQuat = new Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
    const endQuat = new Quaternion().setFromEuler(
      new THREE.Euler(Math.PI, Math.PI * 2, Math.PI),
    );

    const currentQuat = new Quaternion().slerpQuaternions(
      startQuat,
      endQuat,
      t,
    );
    mesh.quaternion.copy(currentQuat);
  };

  // Generar puntos para la línea de la curva Bézier
  useEffect(() => {
    if (lineRef.current && interpolationType === 'bezier') {
      const points = bezierCurve.getPoints(100);
      const geometry = new BufferGeometry().setFromPoints(points);
      lineRef.current.geometry = geometry;
    }
  }, [interpolationType]);

  return (
    <>
      {/* Objeto principal que se mueve */}
      <mesh ref={meshRef}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial
          color={
            interpolationType === 'linear'
              ? '#ff6b6b'
              : interpolationType === 'bezier'
              ? '#4ecdc4'
              : '#45b7d1'
          }
        />
      </mesh>
      {/* Puntos de inicio y fin */}
      <mesh position={startPoint}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>
      <mesh position={endPoint}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      {/* Etiquetas */}
      <Text
        position={[startPoint.x, startPoint.y + 0.8, startPoint.z]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        INICIO
      </Text>
      <Text
        position={[endPoint.x, endPoint.y + 0.8, endPoint.z]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        FIN
      </Text>{' '}
      {/* Línea de trayectoria para interpolación lineal */}
      {interpolationType === 'linear' && (
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
          <lineBasicMaterial color="#666666" />
        </line>
      )}
      {/* Curva Bézier visible */}
      {interpolationType === 'bezier' && (
        <>
          <line ref={lineRef as any}>
            <bufferGeometry />
            <lineBasicMaterial color="#4ecdc4" linewidth={2} />
          </line>

          {/* Puntos de control */}
          <mesh position={controlPoint1}>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial color="#ffeb3b" />
          </mesh>

          <mesh position={controlPoint2}>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial color="#ffeb3b" />
          </mesh>
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
            <lineBasicMaterial color="#ffeb3b" opacity={0.5} transparent />
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
            <lineBasicMaterial color="#ffeb3b" opacity={0.5} transparent />
          </line>

          <Text
            position={[controlPoint1.x, controlPoint1.y + 0.5, controlPoint1.z]}
            fontSize={0.2}
            color="yellow"
            anchorX="center"
            anchorY="middle"
          >
            Control 1
          </Text>

          <Text
            position={[controlPoint2.x, controlPoint2.y + 0.5, controlPoint2.z]}
            fontSize={0.2}
            color="yellow"
            anchorX="center"
            anchorY="middle"
          >
            Control 2
          </Text>
        </>
      )}
      {/* Línea de trayectoria para SLERP */}
      {interpolationType === 'slerp' && (
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
          <lineBasicMaterial color="#45b7d1" />
        </line>
      )}
      {/* Información del tipo de interpolación */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {interpolationType === 'linear' && 'LERP - Interpolación Lineal'}
        {interpolationType === 'bezier' && 'Curva de Bézier Cúbica'}
        {interpolationType === 'slerp' && 'SLERP - Interpolación Esférica'}
      </Text>{' '}
      {/* Grid de referencia */}
      <gridHelper args={[20, 20, '#333333', '#333333']} />
    </>
  );
}
