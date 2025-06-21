import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cone, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

interface ReactiveObjectProps {
  position: [number, number, number];
  scale: number;
  color: string;
  type: 'box' | 'sphere' | 'cone' | 'cylinder';
  rotation?: [number, number, number];
  intensity?: number;
  label?: string;
  animated?: boolean;
}

export const ReactiveObject: React.FC<ReactiveObjectProps> = ({
  position,
  scale,
  color,
  type,
  rotation = [0, 0, 0],
  intensity = 1,
  label,
  animated = true,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animación suave basada en intensidad
  useFrame(state => {
    if (meshRef.current && animated) {
      const time = state.clock.getElapsedTime();
      const targetScale = scale * (1 + intensity * 0.3);

      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1,
      );

      // Rotación sutil basada en intensidad
      meshRef.current.rotation.y += intensity * 0.01;

      // Efecto de "respiración" suave
      const breathScale = 1 + Math.sin(time * 2) * 0.05 * intensity;
      meshRef.current.scale.multiplyScalar(breathScale);
    }
  });

  // Efectos de hover
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material.emissive.setHex(hovered ? 0x222222 : 0x000000);
    }
  }, [hovered]);

  const renderGeometry = () => {
    const commonProps = {
      ref: meshRef,
      position,
      rotation,
      scale: [scale, scale, scale] as [number, number, number],
      onPointerOver: () => setHovered(true),
      onPointerOut: () => setHovered(false),
    };

    const material = (
      <meshPhongMaterial
        color={color}
        transparent
        opacity={0.85}
        shininess={100}
        specular={hovered ? color : '#ffffff'}
      />
    );

    switch (type) {
      case 'box':
        return <Box {...commonProps}>{material}</Box>;
      case 'sphere':
        return (
          <Sphere {...commonProps} args={[0.5, 32, 32]}>
            {material}
          </Sphere>
        );
      case 'cone':
        return (
          <Cone {...commonProps} args={[0.5, 1, 8]}>
            {material}
          </Cone>
        );
      case 'cylinder':
        return (
          <Cone {...commonProps} args={[0.5, 0.5, 1, 8]}>
            {material}
          </Cone>
        );
      default:
        return <Box {...commonProps}>{material}</Box>;
    }
  };

  return (
    <Float
      speed={animated ? 1 + intensity : 0}
      rotationIntensity={animated ? intensity : 0}
    >
      {renderGeometry()}
      {label && hovered && (
        <Html position={[0, 1, 0]} center>
          <div className="object-tooltip">{label}</div>
        </Html>
      )}
    </Float>
  );
};
