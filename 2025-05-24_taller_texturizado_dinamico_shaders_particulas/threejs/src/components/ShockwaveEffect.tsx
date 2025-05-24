import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShockwaveEffectProps {
  position: [number, number, number];
  isActive: boolean;
  onComplete: () => void;
}

const ShockwaveEffect: React.FC<ShockwaveEffectProps> = ({
  position,
  isActive,
  onComplete,
}) => {
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const startTime = useRef<number>(0);

  useEffect(() => {
    if (isActive) {
      startTime.current = Date.now();
    }
  }, [isActive]);

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform float uRadius;
    uniform float uOpacity;
    uniform vec3 uColor;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vec2 center = vec2(0.5, 0.5);
      float dist = length(vUv - center);
      
      // Crear múltiples ondas
      float wave1 = abs(sin((dist - uTime * 2.0) * 20.0));
      float wave2 = abs(sin((dist - uTime * 1.5) * 15.0));
      float wave3 = abs(sin((dist - uTime * 1.0) * 10.0));
      
      float wave = max(wave1, max(wave2, wave3));
      
      // Fade hacia afuera
      float fade = 1.0 - smoothstep(0.3, 0.5, dist);
      
      // Intensidad basada en las ondas
      float intensity = wave * fade * uOpacity;
      
      gl_FragColor = vec4(uColor, intensity);
    }
  `;

  useFrame(() => {
    if (!isActive || !materialRef.current) return;

    const elapsedTime = (Date.now() - startTime.current) / 1000;
    const duration = 1.5;

    if (elapsedTime > duration) {
      onComplete();
      return;
    }

    const progress = elapsedTime / duration;
    const radius = progress * 5;
    const opacity = Math.max(0, 1 - progress);

    materialRef.current.uniforms.uTime.value = elapsedTime;
    materialRef.current.uniforms.uRadius.value = radius;
    materialRef.current.uniforms.uOpacity.value = opacity;

    if (shockwaveRef.current) {
      shockwaveRef.current.scale.setScalar(1 + progress * 3);
    }
  });

  if (!isActive) return null;

  return (
    <mesh
      ref={shockwaveRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[4, 4, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uRadius: { value: 0 },
          uOpacity: { value: 1 },
          uColor: { value: new THREE.Color('#ffffff') },
        }}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

export default ShockwaveEffect;
