import React from 'react';
import { Environment, ContactShadows } from '@react-three/drei';
import { useControls, folder } from 'leva';
import type { VisualData } from '../../hooks/useWebSocket';
import { ReactiveObject } from './ReactiveObject';
import { MovementParticles } from './MovementParticles';
import { MetricsPanel } from '../UI/MetricsPanel';
import { LoadingSpinner } from '../UI/LoadingSpinner';

interface Scene3DProps {
  data: VisualData | null;
}

export const Scene3D: React.FC<Scene3DProps> = ({ data }) => {
  const {
    scaleMultiplier,
    enableParticles,
    showMetrics,
    lightIntensity,
    autoRotate,
    cameraDistance,
    environmentPreset,
    colorScheme,
  } = useControls({
    'Configuración General': folder({
      scaleMultiplier: { value: 1, min: 0.1, max: 3, step: 0.1 },
      autoRotate: { value: true },
      cameraDistance: { value: 10, min: 5, max: 20, step: 1 },
    }),
    Visualización: folder({
      enableParticles: { value: true },
      showMetrics: { value: true },
      colorScheme: {
        value: 'neon',
        options: ['neon', 'pastel', 'vibrant', 'monochrome'],
      },
    }),
    Iluminación: folder({
      lightIntensity: { value: 1, min: 0.1, max: 3, step: 0.1 },
      environmentPreset: {
        value: 'night',
        options: [
          'sunset',
          'dawn',
          'night',
          'warehouse',
          'forest',
          'apartment',
        ],
      },
    }),
  });

  if (!data) {
    return <LoadingSpinner message="Esperando datos del monitor visual..." />;
  }

  console.log('🎬 Renderizando Scene3D con datos:', {
    personas: data.people_count,
    objetos: data.objects_count,
    manos: data.hands_count,
    movimiento: data.movement_intensity,
  });

  // Esquemas de colores
  const colorSchemes = {
    neon: {
      people: '#ff0080',
      objects: '#00ff80',
      movement: '#8000ff',
      hands: '#ffff00',
    },
    pastel: {
      people: '#ffb3d9',
      objects: '#b3ffcc',
      movement: '#ccb3ff',
      hands: '#ffffb3',
    },
    vibrant: {
      people: '#ff4444',
      objects: '#44ff44',
      movement: '#4444ff',
      hands: '#ffaa44',
    },
    monochrome: {
      people: '#ffffff',
      objects: '#cccccc',
      movement: '#888888',
      hands: '#666666',
    },
  };

  const colors = colorSchemes[colorScheme];

  // Escalas basadas en datos
  const peopleScale = Math.max(0.3, data.people_count * 0.3) * scaleMultiplier;
  const objectsScale =
    Math.max(0.3, data.objects_count * 0.2) * scaleMultiplier;
  const movementScale =
    Math.max(0.2, data.movement_intensity * 2) * scaleMultiplier;
  const handsScale = Math.max(0.2, data.hands_count * 0.4) * scaleMultiplier;

  return (
    <group>
      {/* Entorno y iluminación mejorada */}
      <Environment preset={environmentPreset} />
      <ContactShadows
        opacity={0.4}
        scale={20}
        blur={2}
        far={20}
        position={[0, -2, 0]}
      />

      {/* Iluminación dramática */}
      <ambientLight intensity={lightIntensity * 0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={lightIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight
        position={[-10, -10, -5]}
        intensity={lightIntensity * 0.6}
        color={colors.movement}
      />

      {/* Objetos reactivos principales mejorados */}
      <ReactiveObject
        position={[-3, 0, 0]}
        scale={peopleScale}
        color={colors.people}
        type="sphere"
        intensity={data.movement_intensity}
        label={`👥 Personas: ${data.people_count}`}
        animated={true}
      />

      <ReactiveObject
        position={[3, 0, 0]}
        scale={objectsScale}
        color={colors.objects}
        type="box"
        intensity={data.movement_intensity}
        label={`📦 Objetos: ${data.objects_count}`}
        animated={true}
      />

      <ReactiveObject
        position={[0, 2, 0]}
        scale={movementScale}
        color={colors.movement}
        type="cone"
        rotation={[0, 0, Math.PI]}
        intensity={data.movement_intensity}
        label={`🏃 Movimiento: ${(data.movement_intensity * 100).toFixed(1)}%`}
        animated={true}
      />

      <ReactiveObject
        position={[0, -2, 0]}
        scale={handsScale}
        color={colors.hands}
        type="cylinder"
        intensity={data.hands_count * 0.5}
        label={`✋ Manos: ${data.hands_count}`}
        animated={true}
      />

      {/* Objetos adicionales para gestos */}
      {data.hand_gestures &&
        data.hand_gestures.length > 0 &&
        data.hand_gestures.map((gesture, index) => (
          <ReactiveObject
            key={`gesture-${index}`}
            position={[
              Math.cos((index * Math.PI * 2) / data.hand_gestures.length) * 5,
              -1,
              Math.sin((index * Math.PI * 2) / data.hand_gestures.length) * 5,
            ]}
            scale={0.4 * scaleMultiplier}
            color={
              gesture === 'fist'
                ? '#ff4444'
                : gesture === 'open_hand'
                ? '#44ff44'
                : gesture === 'peace'
                ? '#4444ff'
                : gesture === 'pointing'
                ? '#ffaa44'
                : '#ff44ff'
            }
            type="sphere"
            intensity={data.movement_intensity}
            label={`${gesture}`}
            animated={true}
          />
        ))}

      {/* Partículas de movimiento */}
      {enableParticles &&
        data.dominant_colors &&
        data.dominant_colors.length > 0 && (
          <MovementParticles
            intensity={data.movement_intensity}
            colors={data.dominant_colors}
          />
        )}

      {/* Panel de métricas flotante */}
      {showMetrics && <MetricsPanel data={data} position={[-8, 4, 0]} />}

      {/* Grid de referencia sutil */}
      <gridHelper
        args={[20, 20, '#333333', '#222222']}
        position={[0, -2.1, 0]}
      />
    </group>
  );
};
