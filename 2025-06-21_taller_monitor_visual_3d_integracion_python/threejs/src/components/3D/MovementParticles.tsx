import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MovementParticlesProps {
  intensity: number;
  colors: number[][];
}

export const MovementParticles: React.FC<MovementParticlesProps> = ({
  intensity,
  colors,
}) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = Math.floor(intensity * 500) + 100;

  // Generar posiciones y colores
  const positions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

    const colorIndex = Math.floor(Math.random() * colors.length);
    const color = colors[colorIndex] || [255, 255, 255];
    particleColors[i * 3] = color[0] / 255;
    particleColors[i * 3 + 1] = color[1] / 255;
    particleColors[i * 3 + 2] = color[2] / 255;
  }

  useFrame(state => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += intensity * 0.005;
      particlesRef.current.rotation.x += intensity * 0.002;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particleColors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};
