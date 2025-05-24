import React, { useState } from 'react';
import DynamicMaterialSphere from './DynamicMaterialSphere';
import ParticleSystem from './ParticleSystem';
import ShockwaveEffect from './ShockwaveEffect';
import SpaceDistortion from './SpaceDistortion';

const InteractiveScene: React.FC = () => {
  const [isExploded, setIsExploded] = useState(false);
  const [explosionPosition, setExplosionPosition] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const [shockwaveActive, setShockwaveActive] = useState(false);
  const [spaceDistortionActive, setSpaceDistortionActive] = useState(false);
  const [explosionCount, setExplosionCount] = useState(0);

  const handleSphereClick = (position: [number, number, number]) => {
    // Simular feedback táctil (vibración en móviles)
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    setExplosionPosition(position);
    setIsExploded(true);
    setShockwaveActive(true);
    setSpaceDistortionActive(true);
    setExplosionCount(prev => prev + 1);

    // Reset explosion after animation
    setTimeout(() => {
      setIsExploded(false);
    }, 2500);

    // Reset space distortion
    setTimeout(() => {
      setSpaceDistortionActive(false);
    }, 3000);
  };

  const handleShockwaveComplete = () => {
    setShockwaveActive(false);
  };

  return (
    <group>
      {/* Esfera principal con material dinámico */}
      <DynamicMaterialSphere position={[0, 0, 0]} onClick={handleSphereClick} />

      {/* Sistema de partículas */}
      <ParticleSystem
        centerPosition={[0, 0, 0]}
        isExploded={isExploded}
        explosionPosition={explosionPosition}
      />

      {/* Efecto de onda de choque */}
      <ShockwaveEffect
        position={explosionPosition}
        isActive={shockwaveActive}
        onComplete={handleShockwaveComplete}
      />

      {/* Distorsión del espacio */}
      <SpaceDistortion
        position={explosionPosition}
        isActive={spaceDistortionActive}
      />

      {/* Luces dinámicas para resaltar los efectos */}
      <pointLight
        position={explosionPosition}
        intensity={isExploded ? 3.0 : 0}
        color={isExploded ? '#ffffff' : '#4a90e2'}
        distance={15}
        decay={2}
      />

      {/* Luz ambiente reactiva */}
      <ambientLight
        intensity={isExploded ? 0.8 : 0.3}
        color={isExploded ? '#ffeaa7' : '#74b9ff'}
      />

      {/* Múltiples esferas flotantes para ambiente */}
      {[...Array(5)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 2) * 6,
            Math.sin(i * 1.5) * 2,
            Math.cos(i * 2) * 6,
          ]}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#74b9ff" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Plano de referencia con efectos reactivos */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[25, 25, 32, 32]} />
        <meshStandardMaterial
          color={isExploded ? '#2d3436' : '#1a1a2e'}
          transparent
          opacity={0.4}
          roughness={0.8}
          metalness={0.2}
          emissive={isExploded ? '#0984e3' : '#000000'}
          emissiveIntensity={isExploded ? 0.1 : 0}
        />
      </mesh>

      {/* Plano de fondo con patrón */}
      <mesh position={[0, 0, -12]} rotation={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f0f1a" transparent opacity={0.3} />
      </mesh>

      {/* Contador de explosiones (invisible pero útil para debugging) */}
      {explosionCount > 0 && (
        <mesh position={[3, 2, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#e17055" />
        </mesh>
      )}
    </group>
  );
};

export default InteractiveScene;

