import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpaceDistortionProps {
  position: [number, number, number];
  isActive: boolean;
}

const SpaceDistortion: React.FC<SpaceDistortionProps> = ({
  position,
  isActive,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const startTime = useRef<number>(0);

  useEffect(() => {
    if (isActive) {
      startTime.current = Date.now();
    }
  }, [isActive]);

  const vertexShader = `
    uniform float uTime;
    uniform float uDistortion;
    uniform vec3 uExplosionPos;
    
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    void main() {
      vUv = uv;
      
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      // Distorsión basada en la distancia a la explosión
      float dist = distance(worldPosition.xyz, uExplosionPos);
      float wave = sin(dist * 3.0 - uTime * 5.0) * uDistortion;
      float falloff = 1.0 / (1.0 + dist * 0.5);
      
      vec3 distortedPosition = position;
      distortedPosition += normal * wave * falloff;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(distortedPosition, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform float uOpacity;
    uniform vec3 uExplosionPos;
    
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    void main() {
      float dist = distance(vWorldPosition, uExplosionPos);
      
      // Crear un patrón de ondas expansivas
      float wave = sin(dist * 2.0 - uTime * 8.0) * 0.5 + 0.5;
      float falloff = 1.0 / (1.0 + dist * 0.3);
      
      // Color que se propaga desde el centro
      vec3 color = vec3(0.2, 0.5, 1.0);
      float intensity = wave * falloff * uOpacity;
      
      // Crear efecto de refracción visual
      vec2 distortion = vec2(
        sin(vUv.x * 10.0 + uTime * 3.0),
        cos(vUv.y * 10.0 + uTime * 3.0)
      ) * intensity * 0.1;
      
      gl_FragColor = vec4(color, intensity * 0.3);
    }
  `;

  useFrame(() => {
    if (!isActive || !materialRef.current) return;

    const elapsedTime = (Date.now() - startTime.current) / 1000;
    const duration = 2.0;

    const progress = Math.min(elapsedTime / duration, 1);
    const distortion = Math.sin(progress * Math.PI) * 0.5;
    const opacity = Math.max(0, 1 - progress);

    materialRef.current.uniforms.uTime.value = elapsedTime;
    materialRef.current.uniforms.uDistortion.value = distortion;
    materialRef.current.uniforms.uOpacity.value = opacity;
    materialRef.current.uniforms.uExplosionPos.value = new THREE.Vector3(
      ...position,
    );
  });

  if (!isActive) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <sphereGeometry args={[15, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uDistortion: { value: 0 },
          uOpacity: { value: 1 },
          uExplosionPos: { value: new THREE.Vector3(...position) },
        }}
        transparent
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

export default SpaceDistortion;
