import { useRef } from 'react';
import { useControls, button } from 'leva';
import * as THREE from 'three';

export default function Lights() {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  // Controles para luz ambiental
  const { ambientIntensity, ambientColor } = useControls('💡 Luz Ambiental', {
    ambientIntensity: {
      value: 0.4,
      min: 0,
      max: 2,
      step: 0.1,
      label: '🔆 Intensidad Ambiental',
    },
    ambientColor: {
      value: '#ffffff',
      label: '🌈 Color Ambiental',
    },
  });

  // Controles para luz direccional (sol)
  const {
    directionalIntensity,
    directionalColor,
    directionalPosX,
    directionalPosY,
    directionalPosZ,
    castShadow,
  } = useControls('☀️ Luz Direccional (Sol)', {
    directionalIntensity: {
      value: 1,
      min: 0,
      max: 3,
      step: 0.1,
      label: '🔆 Intensidad',
    },
    directionalColor: {
      value: '#ffffff',
      label: '🌈 Color',
    },
    directionalPosX: {
      value: 5,
      min: -10,
      max: 10,
      step: 0.5,
      label: '↔️ Posición X',
    },
    directionalPosY: {
      value: 5,
      min: 0,
      max: 10,
      step: 0.5,
      label: '↕️ Posición Y',
    },
    directionalPosZ: {
      value: 5,
      min: -10,
      max: 10,
      step: 0.5,
      label: '⬆️ Posición Z',
    },
    castShadow: {
      value: true,
      label: '🌑 Proyectar Sombras',
    },
  });

  // Controles para luz puntual
  const {
    pointIntensity,
    pointColor,
    pointPosX,
    pointPosY,
    pointPosZ,
    pointDistance,
    pointDecay,
  } = useControls('💡 Luz Puntual', {
    pointIntensity: {
      value: 1,
      min: 0,
      max: 5,
      step: 0.1,
      label: '🔆 Intensidad',
    },
    pointColor: {
      value: '#ff4444',
      label: '🌈 Color',
    },
    pointPosX: {
      value: -3,
      min: -10,
      max: 10,
      step: 0.5,
      label: '↔️ Posición X',
    },
    pointPosY: {
      value: 3,
      min: 0,
      max: 10,
      step: 0.5,
      label: '↕️ Posición Y',
    },
    pointPosZ: {
      value: 3,
      min: -10,
      max: 10,
      step: 0.5,
      label: '⬆️ Posición Z',
    },
    pointDistance: {
      value: 10,
      min: 0,
      max: 50,
      step: 1,
      label: '📏 Distancia',
    },
    pointDecay: {
      value: 2,
      min: 0,
      max: 5,
      step: 0.1,
      label: '📉 Atenuación',
    },
  });

  // Controles para luz de foco
  const {
    spotIntensity,
    spotColor,
    spotPosX,
    spotPosY,
    spotPosZ,
    spotAngle,
    spotPenumbra,
  } = useControls('🔦 Luz de Foco', {
    spotIntensity: {
      value: 1,
      min: 0,
      max: 5,
      step: 0.1,
      label: '🔆 Intensidad',
    },
    spotColor: {
      value: '#4444ff',
      label: '🌈 Color',
    },
    spotPosX: {
      value: 3,
      min: -10,
      max: 10,
      step: 0.5,
      label: '↔️ Posición X',
    },
    spotPosY: {
      value: 5,
      min: 0,
      max: 10,
      step: 0.5,
      label: '↕️ Posición Y',
    },
    spotPosZ: {
      value: 3,
      min: -10,
      max: 10,
      step: 0.5,
      label: '⬆️ Posición Z',
    },
    spotAngle: {
      value: Math.PI / 6,
      min: 0,
      max: Math.PI / 2,
      step: 0.1,
      label: '📐 Ángulo',
    },
    spotPenumbra: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.1,
      label: '🌫️ Penumbra',
    },
  });

  // Controles de acción para luces
  useControls('🎬 Acciones de Luz', {
    'Preset Día': button(() => {
      console.log('Aplicando preset de día');
    }),
    'Preset Noche': button(() => {
      console.log('Aplicando preset de noche');
    }),
    'Preset Atardecer': button(() => {
      console.log('Aplicando preset de atardecer');
    }),
    'Animación Luces': button(() => {
      console.log('Activando animación de luces');
    }),
  });

  return (
    <>
      {/* Luz ambiental */}
      <ambientLight intensity={ambientIntensity} color={ambientColor} />

      {/* Luz direccional (sol) */}
      <directionalLight
        ref={directionalLightRef}
        position={[directionalPosX, directionalPosY, directionalPosZ]}
        intensity={directionalIntensity}
        color={directionalColor}
        castShadow={castShadow}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Luz puntual */}
      <pointLight
        ref={pointLightRef}
        position={[pointPosX, pointPosY, pointPosZ]}
        intensity={pointIntensity}
        color={pointColor}
        distance={pointDistance}
        decay={pointDecay}
      />

      {/* Luz de foco */}
      <spotLight
        ref={spotLightRef}
        position={[spotPosX, spotPosY, spotPosZ]}
        target-position={[0, 0, 0]}
        intensity={spotIntensity}
        color={spotColor}
        angle={spotAngle}
        penumbra={spotPenumbra}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </>
  );
}
