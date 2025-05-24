import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import * as THREE from 'three';

interface ParticleSystemProps {
  centerPosition: [number, number, number];
  isExploded: boolean;
  explosionPosition: [number, number, number];
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({
  centerPosition,
  isExploded,
  explosionPosition,
}) => {
  const particlesRef = useRef<THREE.Points>(null);
  const explosionParticlesRef = useRef<THREE.Points>(null);
  const [explosionId, setExplosionId] = useState(0);
  const [explosionStartTime, setExplosionStartTime] = useState(0);

  // Controles GUI para partículas
  const {
    particleCount,
    particleSize,
    particleSpeed,
    particleColor,
    explosionParticleCount,
    explosionForce,
    particleLifetime,
    enableGlow,
    orbitalRadius,
    orbitalSpeed,
  } = useControls('Sistema de Partículas', {
    particleCount: { value: 500, min: 100, max: 2000, step: 50 },
    particleSize: { value: 0.02, min: 0.01, max: 0.1, step: 0.005 },
    particleSpeed: { value: 1.0, min: 0.1, max: 3.0, step: 0.1 },
    particleColor: '#ffffff',
    explosionParticleCount: { value: 300, min: 50, max: 800, step: 25 },
    explosionForce: { value: 8.0, min: 1.0, max: 15.0, step: 0.5 },
    particleLifetime: { value: 2.0, min: 1.0, max: 5.0, step: 0.1 },
    enableGlow: true,
    orbitalRadius: { value: 3.0, min: 1.0, max: 8.0, step: 0.2 },
    orbitalSpeed: { value: 0.5, min: 0.1, max: 2.0, step: 0.1 },
  });

  // Effect to handle explosion start
  useEffect(() => {
    if (isExploded) {
      setExplosionId(prev => prev + 1);
      setExplosionStartTime(Date.now());
    }
  }, [isExploded]);

  // Partículas orbitales principales
  const { positions, velocities, colors, sizes, lifetimes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const lifetimes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Posición inicial en esfera alrededor del centro
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = orbitalRadius + (Math.random() - 0.5) * 2;

      positions[i * 3] =
        centerPosition[0] + radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] =
        centerPosition[1] + radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = centerPosition[2] + radius * Math.cos(phi);

      // Velocidades orbitales
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      // Colores variados
      const hue = Math.random();
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Tamaños variables
      sizes[i] = particleSize * (0.5 + Math.random() * 0.5);

      // Tiempo de vida
      lifetimes[i] = Math.random() * particleLifetime;
    }

    return { positions, velocities, colors, sizes, lifetimes };
  }, [
    particleCount,
    centerPosition,
    orbitalRadius,
    particleSize,
    particleLifetime,
  ]);

  // Partículas de explosión - se regeneran cada vez
  const explosionData = useMemo(() => {
    const positions = new Float32Array(explosionParticleCount * 3);
    const velocities = new Float32Array(explosionParticleCount * 3);
    const colors = new Float32Array(explosionParticleCount * 3);
    const sizes = new Float32Array(explosionParticleCount);
    const lifetimes = new Float32Array(explosionParticleCount);
    const originalPositions = new Float32Array(explosionParticleCount * 3);

    for (let i = 0; i < explosionParticleCount; i++) {
      // Posición inicial en el punto de explosión con pequeña variación
      const offsetX = (Math.random() - 0.5) * 0.3;
      const offsetY = (Math.random() - 0.5) * 0.3;
      const offsetZ = (Math.random() - 0.5) * 0.3;

      positions[i * 3] = explosionPosition[0] + offsetX;
      positions[i * 3 + 1] = explosionPosition[1] + offsetY;
      positions[i * 3 + 2] = explosionPosition[2] + offsetZ;

      // Guardar posiciones originales
      originalPositions[i * 3] = positions[i * 3];
      originalPositions[i * 3 + 1] = positions[i * 3 + 1];
      originalPositions[i * 3 + 2] = positions[i * 3 + 2];

      // Velocidades radiales de explosión mejoradas
      const direction = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      ).normalize();

      // Añadir componente hacia arriba para hacer la explosión más dramática
      direction.y += 0.3;
      direction.normalize();

      const force = explosionForce * (0.3 + Math.random() * 0.7);
      velocities[i * 3] = direction.x * force;
      velocities[i * 3 + 1] = direction.y * force;
      velocities[i * 3 + 2] = direction.z * force;

      // Colores más variados y brillantes para la explosión
      const colorType = Math.random();
      if (colorType < 0.4) {
        // Rojo-naranja (fuego)
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.4;
        colors[i * 3 + 2] = 0.0;
      } else if (colorType < 0.7) {
        // Amarillo-blanco (chispa)
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 0.5 + Math.random() * 0.5;
      } else {
        // Azul-blanco (energía)
        colors[i * 3] = 0.5 + Math.random() * 0.5;
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i * 3 + 2] = 1.0;
      }

      // Tamaños más variados
      sizes[i] = particleSize * (0.5 + Math.random() * 2.5);

      // Tiempo de vida variable
      lifetimes[i] = 1.0;
    }

    return {
      positions,
      velocities,
      colors,
      sizes,
      lifetimes,
      originalPositions,
    };
  }, [
    explosionId, // Regenerate on new explosion
    explosionPosition,
    explosionParticleCount,
    explosionForce,
    particleSize,
  ]);

  // Geometría principal para partículas orbitales
  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    return geometry;
  }, [positions, colors, sizes, lifetimes]);

  // Geometría para partículas de explosión
  const explosionGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(explosionData.positions, 3),
    );
    geometry.setAttribute(
      'customColor',
      new THREE.BufferAttribute(explosionData.colors, 3),
    );
    geometry.setAttribute(
      'size',
      new THREE.BufferAttribute(explosionData.sizes, 1),
    );
    geometry.setAttribute(
      'lifetime',
      new THREE.BufferAttribute(explosionData.lifetimes, 1),
    );
    return geometry;
  }, [explosionData]);

  // Shader para partículas con glow mejorado
  const particleVertexShader = `
    attribute float size;
    attribute vec3 customColor;
    attribute float lifetime;
    
    varying vec3 vColor;
    varying float vLifetime;
    
    void main() {
      vColor = customColor;
      vLifetime = lifetime;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const particleFragmentShader = `
    uniform bool enableGlow;
    
    varying vec3 vColor;
    varying float vLifetime;
    
    void main() {
      // Forma circular de la partícula
      float dist = length(gl_PointCoord - vec2(0.5));
      
      if (dist > 0.5) discard;
      
      // Efecto de glow mejorado
      float alpha = 1.0;
      if (enableGlow) {
        alpha = 1.0 - (dist * 2.0);
        alpha = pow(alpha, 1.5);
        
        // Core brillante
        float core = 1.0 - smoothstep(0.0, 0.3, dist);
        alpha = max(alpha, core * 0.8);
      }
      
      // Fade basado en lifetime
      alpha *= vLifetime;
      
      // Intensificar el brillo
      vec3 finalColor = vColor * (1.0 + alpha * 0.5);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  // Animación de partículas orbitales
  useFrame(state => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position
        .array as Float32Array;
      const lifetimes = particlesRef.current.geometry.attributes.lifetime
        .array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Movimiento orbital más suave
        const time = state.clock.elapsedTime * orbitalSpeed;
        const theta = time + i * 0.01;
        const phi = Math.sin(time * 0.5 + i * 0.02) * 0.5;

        const radius = orbitalRadius + Math.sin(time * 2 + i * 0.05) * 0.5;

        positions[i3] =
          centerPosition[0] + radius * Math.cos(theta) * Math.cos(phi);
        positions[i3 + 1] =
          centerPosition[1] +
          radius * Math.sin(theta) * Math.cos(phi) +
          Math.sin(time + i * 0.1) * 0.3;
        positions[i3 + 2] = centerPosition[2] + radius * Math.sin(phi);

        // Animación de lifetime más suave
        lifetimes[i] =
          0.5 + 0.5 * Math.abs(Math.sin(time * particleSpeed + i * 0.1));
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.lifetime.needsUpdate = true;
    }

    // Animación de partículas de explosión mejorada
    if (explosionParticlesRef.current && isExploded) {
      const positions = explosionParticlesRef.current.geometry.attributes
        .position.array as Float32Array;
      const lifetimes = explosionParticlesRef.current.geometry.attributes
        .lifetime.array as Float32Array;

      const deltaTime = state.clock.getDelta();
      const elapsedTime = (Date.now() - explosionStartTime) / 1000;
      const explosionDuration = 2.0;

      for (let i = 0; i < explosionParticleCount; i++) {
        const i3 = i * 3;

        // Reset positions if explosion just started
        if (elapsedTime < deltaTime * 2) {
          positions[i3] = explosionData.originalPositions[i3];
          positions[i3 + 1] = explosionData.originalPositions[i3 + 1];
          positions[i3 + 2] = explosionData.originalPositions[i3 + 2];
        }

        // Movimiento con física mejorada
        positions[i3] += explosionData.velocities[i3] * deltaTime;
        positions[i3 + 1] += explosionData.velocities[i3 + 1] * deltaTime;
        positions[i3 + 2] += explosionData.velocities[i3 + 2] * deltaTime;

        // Aplicar gravedad
        explosionData.velocities[i3 + 1] -= 9.8 * deltaTime;

        // Fricción del aire
        const friction = 0.995;
        explosionData.velocities[i3] *= friction;
        explosionData.velocities[i3 + 1] *= friction;
        explosionData.velocities[i3 + 2] *= friction;

        // Calcular lifetime basado en tiempo transcurrido
        const normalizedTime = elapsedTime / explosionDuration;
        lifetimes[i] = Math.max(0, 1.0 - normalizedTime);

        // Efecto de parpadeo para algunas partículas
        if (i % 5 === 0) {
          lifetimes[i] *= 0.5 + 0.5 * Math.sin(elapsedTime * 20 + i);
        }
      }

      explosionParticlesRef.current.geometry.attributes.position.needsUpdate =
        true;
      explosionParticlesRef.current.geometry.attributes.lifetime.needsUpdate =
        true;
    }
  });

  return (
    <group>
      {/* Partículas orbitales principales */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <shaderMaterial
          vertexShader={particleVertexShader}
          fragmentShader={particleFragmentShader}
          uniforms={{
            enableGlow: { value: enableGlow },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Partículas de explosión */}
      {isExploded && (
        <points ref={explosionParticlesRef} geometry={explosionGeometry}>
          <shaderMaterial
            vertexShader={particleVertexShader}
            fragmentShader={particleFragmentShader}
            uniforms={{
              enableGlow: { value: true },
            }}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
};

export default ParticleSystem;
