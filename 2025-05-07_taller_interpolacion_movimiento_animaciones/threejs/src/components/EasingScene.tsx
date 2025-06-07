import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { Text } from '@react-three/drei';

interface EasingSceneProps {
  isAnimating: boolean;
  t: number;
}

// Funciones de easing
const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  bounceOut: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },
};

export default function EasingScene({ t }: EasingSceneProps) {
  const meshRefs = useRef<(Mesh | null)[]>([]);

  const startPoint = new Vector3(-4, 0, 0);
  const endPoint = new Vector3(4, 0, 0);

  const easingTypes = Object.keys(
    easingFunctions,
  ) as (keyof typeof easingFunctions)[];

  useFrame(() => {
    easingTypes.forEach((easingType, index) => {
      const mesh = meshRefs.current[index];
      if (mesh) {
        const easedT = easingFunctions[easingType](t);
        const position = new Vector3().lerpVectors(
          startPoint,
          endPoint,
          easedT,
        );
        position.y = index * 1.2 - (easingTypes.length - 1) * 0.6;
        mesh.position.copy(position);
      }
    });
  });

  const colors = [
    '#ff6b6b', // linear - rojo
    '#4ecdc4', // easeInQuad - turquesa
    '#45b7d1', // easeOutQuad - azul
    '#96ceb4', // easeInOutQuad - verde claro
    '#feca57', // easeInCubic - amarillo
    '#ff9ff3', // easeOutCubic - rosa
    '#ff6348', // bounceOut - naranja
  ];

  return (
    <>
      {easingTypes.map((easingType, index) => {
        const yPosition = index * 1.2 - (easingTypes.length - 1) * 0.6;

        return (
          <group key={easingType}>
            {/* Objeto que se mueve */}
            <mesh
              ref={el => (meshRefs.current[index] = el)}
              position={[startPoint.x, yPosition, 0]}
            >
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshStandardMaterial color={colors[index]} />
            </mesh>

            {/* Punto de inicio */}
            <mesh position={[startPoint.x, yPosition, 0]}>
              <sphereGeometry args={[0.08]} />
              <meshStandardMaterial color="#00ff00" />
            </mesh>

            {/* Punto de fin */}
            <mesh position={[endPoint.x, yPosition, 0]}>
              <sphereGeometry args={[0.08]} />
              <meshStandardMaterial color="#ff0000" />
            </mesh>
            {/* Línea de trayectoria */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[
                    new Float32Array([
                      startPoint.x,
                      yPosition,
                      0,
                      endPoint.x,
                      yPosition,
                      0,
                    ]),
                    3,
                  ]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color={colors[index]}
                opacity={0.5}
                transparent
              />
            </line>

            {/* Etiqueta del tipo de easing */}
            <Text
              position={[-5.5, yPosition, 0]}
              fontSize={0.25}
              color={colors[index]}
              anchorX="center"
              anchorY="middle"
            >
              {easingType}
            </Text>

            {/* Valor actual del easing */}
            <Text
              position={[5.5, yPosition, 0]}
              fontSize={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {easingFunctions[easingType](t).toFixed(2)}
            </Text>
          </group>
        );
      })}

      {/* Título */}
      <Text
        position={[0, 4.5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Funciones de Easing / Aceleración
      </Text>

      {/* Leyenda */}
      <Text
        position={[-5.5, 4, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Tipo
      </Text>

      <Text
        position={[5.5, 4, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Valor
      </Text>

      {/* Grid de referencia */}
      <gridHelper args={[16, 16, '#333333', '#333333']} />
    </>
  );
}
