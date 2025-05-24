import React, { useState } from 'react';
import DynamicMaterialSphere from './DynamicMaterialSphere';
import ParticleSystem from './ParticleSystem';

const InteractiveScene: React.FC = () => {
  const [isExploded, setIsExploded] = useState(false);
  const [explosionPosition, setExplosionPosition] = useState<
    [number, number, number]
  >([0, 0, 0]);

  const handleSphereClick = (position: [number, number, number]) => {
    setExplosionPosition(position);
    setIsExploded(true);

    // Reset explosion after animation
    setTimeout(() => {
      setIsExploded(false);
    }, 2000);
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

      {/* Plano de referencia opcional */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#1a1a2e"
          transparent
          opacity={0.3}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
};

export default InteractiveScene;
