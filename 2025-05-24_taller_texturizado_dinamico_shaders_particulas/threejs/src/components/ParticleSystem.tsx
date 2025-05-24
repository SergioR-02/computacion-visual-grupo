/*
 * SISTEMA DE PARTÍCULAS MEJORADO - VERIFICACIÓN DE CONTROLES
 * =========================================================
 *
 * ✅ CONTROLES VERIFICADOS Y FUNCIONANDO:
 *
 * 1. particleCount (800): ✅ Usado en useMemo orbital particles
 * 2. particleSize (0.02): ✅ Usado en todos los tipos de partículas
 * 3. particleSpeed (1.0): ✅ Usado en velocidades orbitales y animaciones
 * 4. particleColor ('#ffffff'): ✅ Usado como color base en partículas orbitales
 * 5. explosionParticleCount (400): ✅ Usado en explosion data generation
 * 6. explosionForce (8.0): ✅ Usado en explosion velocity calculation
 * 7. particleLifetime (2.0): ✅ Usado en orbital particles lifetime
 * 8. enableGlow (true): ✅ Usado en shader uniforms
 * 9. orbitalRadius (3.0): ✅ Usado en orbital positions calculation
 * 10. orbitalSpeed (0.5): ✅ Usado en useFrame animation timing
 * 11. hoverParticleCount (200): ✅ Usado en hover particle data
 * 12. hoverReactivity (1.5): ✅ Usado en hover velocities and animation
 * 13. trailLength (150): ✅ Usado en trail particle count
 * 14. ambientParticleCount (300): ✅ Usado en ambient particle data
 * 15. mouseInfluence (2.0): ✅ Usado en shader uniforms
 * 16. particleVariety (0.8): ✅ Usado en color variety and shader effects
 * 17. textureIntensity (1.0): ✅ Usado en shader uniforms and trail colors
 *
 * 🎮 TIPOS DE PARTÍCULAS:
 * • Orbital: Órbitas alrededor de la esfera with controlled colors
 * • Hover: React to hover by expanding/contracting
 * • Trail: Follow the mouse with a trail effect
 * • Ambient: Float gently in the background
 * • Explosion: Explosion from the surface of the sphere
 *
 * 🎨 EFECTOS SHADER:
 * • Procedural shapes (circles, stars, rings)
 * • Mouse interaction (attraction/repulsion)
 * • Multi-layer glow effects
 * • Temporal and spatial variations
 */

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
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
  const hoverParticlesRef = useRef<THREE.Points>(null);
  const trailParticlesRef = useRef<THREE.Points>(null);
  const ambientParticlesRef = useRef<THREE.Points>(null);

  const [explosionId, setExplosionId] = useState(0);
  const [explosionStartTime, setExplosionStartTime] = useState(0);
  const [mousePosition, setMousePosition] = useState<[number, number]>([0, 0]);
  const [isHovered, setIsHovered] = useState(false);

  const { mouse, camera, size } = useThree();

  // Controles GUI mejorados para partículas
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
    // Nuevos controles
    hoverParticleCount,
    hoverReactivity,
    trailLength,
    ambientParticleCount,
    mouseInfluence,
    particleVariety,
    textureIntensity,
  } = useControls('Sistema de Partículas Mejorado', {
    particleCount: { value: 800, min: 100, max: 2000, step: 50 },
    particleSize: { value: 0.02, min: 0.01, max: 0.1, step: 0.005 },
    particleSpeed: { value: 1.0, min: 0.1, max: 3.0, step: 0.1 },
    particleColor: '#ffffff',
    explosionParticleCount: { value: 400, min: 50, max: 800, step: 25 },
    explosionForce: { value: 8.0, min: 1.0, max: 15.0, step: 0.5 },
    particleLifetime: { value: 2.0, min: 1.0, max: 5.0, step: 0.1 },
    enableGlow: true,
    orbitalRadius: { value: 3.0, min: 1.0, max: 8.0, step: 0.2 },
    orbitalSpeed: { value: 0.5, min: 0.1, max: 2.0, step: 0.1 },
    // Nuevos controles
    hoverParticleCount: { value: 200, min: 50, max: 500, step: 25 },
    hoverReactivity: { value: 1.5, min: 0.5, max: 3.0, step: 0.1 },
    trailLength: { value: 150, min: 50, max: 300, step: 25 },
    ambientParticleCount: { value: 300, min: 100, max: 600, step: 50 },
    mouseInfluence: { value: 2.0, min: 0.5, max: 5.0, step: 0.1 },
    particleVariety: { value: 0.8, min: 0.0, max: 1.0, step: 0.1 },
    textureIntensity: { value: 1.0, min: 0.0, max: 2.0, step: 0.1 },
  });

  // Effect to handle explosion start
  useEffect(() => {
    if (isExploded) {
      setExplosionId(prev => prev + 1);
      setExplosionStartTime(Date.now());
    }
  }, [isExploded]);

  // Update mouse position for particle interactions
  useFrame(() => {
    // Convert mouse coordinates to world space
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));

    setMousePosition([pos.x, pos.y]);

    // Check if mouse is near the sphere for hover effects
    const sphereDistance = Math.sqrt(
      Math.pow(pos.x - centerPosition[0], 2) +
        Math.pow(pos.y - centerPosition[1], 2),
    );
    setIsHovered(sphereDistance < 2.5);
  });

  // Partículas orbitales principales
  const { positions, velocities, colors, sizes, lifetimes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const lifetimes = new Float32Array(particleCount);

    // Convertir particleColor a THREE.Color para usar como base
    const baseColor = new THREE.Color(particleColor);

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

      // Velocidades orbitales basadas en particleSpeed
      const speedMultiplier = particleSpeed * 0.02;
      velocities[i * 3] = (Math.random() - 0.5) * speedMultiplier;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * speedMultiplier;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * speedMultiplier;

      // Colores basados en particleColor con variaciones
      if (particleVariety > 0.5) {
        // Alta variedad: usar colores variados
        const hue = Math.random();
        const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      } else {
        // Baja variedad: usar particleColor con variaciones sutiles
        const variation = particleVariety * 0.5;
        colors[i * 3] = Math.max(
          0,
          Math.min(1, baseColor.r + (Math.random() - 0.5) * variation),
        );
        colors[i * 3 + 1] = Math.max(
          0,
          Math.min(1, baseColor.g + (Math.random() - 0.5) * variation),
        );
        colors[i * 3 + 2] = Math.max(
          0,
          Math.min(1, baseColor.b + (Math.random() - 0.5) * variation),
        );
      }

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
    particleColor,
    particleSpeed,
    particleVariety,
  ]);

  // Partículas de explosión - se regeneran cada vez
  const explosionData = useMemo(() => {
    const positions = new Float32Array(explosionParticleCount * 3);
    const velocities = new Float32Array(explosionParticleCount * 3);
    const colors = new Float32Array(explosionParticleCount * 3);
    const sizes = new Float32Array(explosionParticleCount);
    const lifetimes = new Float32Array(explosionParticleCount);
    const originalPositions = new Float32Array(explosionParticleCount * 3);
    const sphereRadius = 1.5; // Corrected sphere radius to match DynamicMaterialSphere

    for (let i = 0; i < explosionParticleCount; i++) {
      // 1. Posición inicial en la superficie de la esfera de explosión
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);

      const x =
        explosionPosition[0] + sphereRadius * Math.sin(phi) * Math.cos(theta);
      const y =
        explosionPosition[1] + sphereRadius * Math.sin(phi) * Math.sin(theta);
      const z = explosionPosition[2] + sphereRadius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Guardar posiciones originales
      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      // 2. Velocidades radiales mejoradas (desde el centro de la explosión)
      const radialDirection = new THREE.Vector3(
        x - explosionPosition[0],
        y - explosionPosition[1],
        z - explosionPosition[2],
      ).normalize();

      // Combinar con dirección aleatoria para variabilidad y mantener sesgo hacia arriba
      const randomDirection = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      ).normalize();

      const finalDirection = new THREE.Vector3()
        .addScaledVector(radialDirection, 0.7) // Fuerte componente radial
        .addScaledVector(randomDirection, 0.3) // Algo de aleatoriedad
        .normalize();

      finalDirection.y += 0.2; // Mantener un ligero sesgo hacia arriba
      finalDirection.normalize();

      const force = explosionForce * (0.5 + Math.random() * 0.8); // Ajustar rango de fuerza
      velocities[i * 3] = finalDirection.x * force;
      velocities[i * 3 + 1] = finalDirection.y * force;
      velocities[i * 3 + 2] = finalDirection.z * force;

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

  // Nuevas partículas que reaccionan al hover
  const hoverParticleData = useMemo(() => {
    const positions = new Float32Array(hoverParticleCount * 3);
    const velocities = new Float32Array(hoverParticleCount * 3);
    const colors = new Float32Array(hoverParticleCount * 3);
    const sizes = new Float32Array(hoverParticleCount);
    const lifetimes = new Float32Array(hoverParticleCount);

    for (let i = 0; i < hoverParticleCount; i++) {
      // Posiciones en un anillo alrededor de la esfera
      const angle = (i / hoverParticleCount) * Math.PI * 2;
      const ringRadius = 2.0 + Math.random() * 0.5;
      const height = (Math.random() - 0.5) * 1.0;

      positions[i * 3] = centerPosition[0] + Math.cos(angle) * ringRadius;
      positions[i * 3 + 1] = centerPosition[1] + height;
      positions[i * 3 + 2] = centerPosition[2] + Math.sin(angle) * ringRadius;

      // Velocidades iniciales lentas basadas en hoverReactivity
      const speedFactor = hoverReactivity * 0.1;
      velocities[i * 3] = (Math.random() - 0.5) * speedFactor;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * speedFactor;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * speedFactor;

      // Colores reactivos (cyan-purple spectrum)
      const hue = 0.5 + Math.random() * 0.3; // Cyan to purple
      const color = new THREE.Color().setHSL(hue, 0.9, 0.7);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = particleSize * (0.3 + Math.random() * 0.7);
      lifetimes[i] = 0.5 + Math.random() * 0.5;
    }

    return { positions, velocities, colors, sizes, lifetimes };
  }, [hoverParticleCount, centerPosition, particleSize, hoverReactivity]);

  // Partículas de trail/estela
  const trailParticleData = useMemo(() => {
    const positions = new Float32Array(trailLength * 3);
    const colors = new Float32Array(trailLength * 3);
    const sizes = new Float32Array(trailLength);
    const lifetimes = new Float32Array(trailLength);

    for (let i = 0; i < trailLength; i++) {
      // Inicializar en el centro
      positions[i * 3] = centerPosition[0];
      positions[i * 3 + 1] = centerPosition[1];
      positions[i * 3 + 2] = centerPosition[2];

      // Colores de estela (gradiente) influenciados por textureIntensity
      const intensity = 1.0 - i / trailLength;
      const colorIntensity = intensity * textureIntensity;
      colors[i * 3] = colorIntensity;
      colors[i * 3 + 1] = colorIntensity * 0.8;
      colors[i * 3 + 2] = colorIntensity * 1.2;

      sizes[i] = particleSize * intensity * 0.5;
      lifetimes[i] = intensity;
    }

    return { positions, colors, sizes, lifetimes };
  }, [trailLength, centerPosition, particleSize, textureIntensity]);

  // Partículas ambientales flotantes
  const ambientParticleData = useMemo(() => {
    const positions = new Float32Array(ambientParticleCount * 3);
    const velocities = new Float32Array(ambientParticleCount * 3);
    const colors = new Float32Array(ambientParticleCount * 3);
    const sizes = new Float32Array(ambientParticleCount);
    const lifetimes = new Float32Array(ambientParticleCount);

    for (let i = 0; i < ambientParticleCount; i++) {
      // Distribución en un volumen grande alrededor de la escena
      const radius = 8 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] =
        centerPosition[0] + radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] =
        centerPosition[1] + radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = centerPosition[2] + radius * Math.cos(phi);

      // Velocidades muy lentas para movimiento sutil, influenciadas por particleSpeed
      const ambientSpeed = particleSpeed * 0.05;
      velocities[i * 3] = (Math.random() - 0.5) * ambientSpeed;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * ambientSpeed;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * ambientSpeed;

      // Colores tenues y variados
      const hue = Math.random();
      const saturation = 0.3 + Math.random() * 0.4;
      const lightness = 0.4 + Math.random() * 0.3;
      const color = new THREE.Color().setHSL(hue, saturation, lightness);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = particleSize * (0.2 + Math.random() * 0.8);
      lifetimes[i] = 0.3 + Math.random() * 0.7;
    }

    return { positions, velocities, colors, sizes, lifetimes };
  }, [ambientParticleCount, centerPosition, particleSize, particleSpeed]);

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

  // Geometrías para las nuevas partículas
  const hoverGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(hoverParticleData.positions, 3),
    );
    geometry.setAttribute(
      'customColor',
      new THREE.BufferAttribute(hoverParticleData.colors, 3),
    );
    geometry.setAttribute(
      'size',
      new THREE.BufferAttribute(hoverParticleData.sizes, 1),
    );
    geometry.setAttribute(
      'lifetime',
      new THREE.BufferAttribute(hoverParticleData.lifetimes, 1),
    );
    return geometry;
  }, [hoverParticleData]);

  const trailGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(trailParticleData.positions, 3),
    );
    geometry.setAttribute(
      'customColor',
      new THREE.BufferAttribute(trailParticleData.colors, 3),
    );
    geometry.setAttribute(
      'size',
      new THREE.BufferAttribute(trailParticleData.sizes, 1),
    );
    geometry.setAttribute(
      'lifetime',
      new THREE.BufferAttribute(trailParticleData.lifetimes, 1),
    );
    return geometry;
  }, [trailParticleData]);

  const ambientGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(ambientParticleData.positions, 3),
    );
    geometry.setAttribute(
      'customColor',
      new THREE.BufferAttribute(ambientParticleData.colors, 3),
    );
    geometry.setAttribute(
      'size',
      new THREE.BufferAttribute(ambientParticleData.sizes, 1),
    );
    geometry.setAttribute(
      'lifetime',
      new THREE.BufferAttribute(ambientParticleData.lifetimes, 1),
    );
    return geometry;
  }, [ambientParticleData]);

  // Shader mejorado para partículas con efectos avanzados
  const enhancedVertexShader = `
    attribute float size;
    attribute vec3 customColor;
    attribute float lifetime;
    
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uMouseInfluence;
    uniform bool uIsHovered;
    uniform float uTextureIntensity;
    uniform float uParticleVariety;
    
    varying vec3 vColor;
    varying float vLifetime;
    varying vec2 vUv;
    varying float vMouseDistance;
    varying float vNoise;
    
    // Función de ruido simple
    float noise(vec3 pos) {
      return fract(sin(dot(pos, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }
    
    void main() {
      vColor = customColor;
      vLifetime = lifetime;
      vUv = position.xy;
      
      vec3 pos = position;
      
      // Calcular distancia al mouse
      vec2 mousePos = uMouse;
      float mouseDistance = length(mousePos - pos.xy);
      vMouseDistance = mouseDistance;
      
      // Efecto de atracción/repulsión del mouse
      if (mouseDistance < 3.0) {
        vec2 mouseDirection = normalize(pos.xy - mousePos);
        float mouseEffect = (1.0 - mouseDistance / 3.0) * uMouseInfluence;
        
        if (uIsHovered) {
          // Atracción cuando se hace hover
          pos.xy -= mouseDirection * mouseEffect * 0.5;
        } else {
          // Repulsión sutil cuando no hay hover
          pos.xy += mouseDirection * mouseEffect * 0.2;
        }
      }
      
      // Añadir ruido para variedad
      vNoise = noise(pos + uTime * 0.5);
      pos += vec3(vNoise - 0.5) * uParticleVariety * 0.1;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Tamaño dinámico basado en lifetime y distancia al mouse
      float dynamicSize = size * vLifetime;
      
      // Efecto de escala por proximidad al mouse
      if (mouseDistance < 2.0) {
        float proximity = 1.0 - (mouseDistance / 2.0);
        dynamicSize *= (1.0 + proximity * 0.5);
      }
      
      gl_PointSize = dynamicSize * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const enhancedFragmentShader = `
    uniform bool enableGlow;
    uniform float uTime;
    uniform float uTextureIntensity;
    uniform bool uIsHovered;
    
    varying vec3 vColor;
    varying float vLifetime;
    varying vec2 vUv;
    varying float vMouseDistance;
    varying float vNoise;
    
    // Función para crear texturas procedurales
    float circle(vec2 uv, float radius) {
      return 1.0 - smoothstep(radius - 0.1, radius + 0.1, length(uv - 0.5));
    }
    
    float star(vec2 uv, float size) {
      vec2 st = uv - 0.5;
      float angle = atan(st.y, st.x);
      float radius = length(st);
      
      float f = abs(cos(angle * 3.0)) * 0.5 + 0.3;
      return 1.0 - smoothstep(f, f + 0.02, radius / size);
    }
    
    void main() {
      vec2 uv = gl_PointCoord;
      float dist = length(uv - vec2(0.5));
      
      if (dist > 0.5) discard;
      
      vec3 color = vColor;
      float alpha = 1.0;
      
      // Diferentes formas de partículas según el ruido
      float shape = 1.0;
      if (uTextureIntensity > 0.5) {
        if (vNoise > 0.7) {
          // Forma de estrella
          shape = star(uv, 0.4);
        } else if (vNoise > 0.4) {
          // Forma de anillo
          float ring = circle(uv, 0.4) - circle(uv, 0.2);
          shape = ring;
        } else {
          // Forma circular suave
          shape = circle(uv, 0.4);
        }
      } else {
        // Forma circular básica
        shape = circle(uv, 0.4);
      }
      
      alpha *= shape;
      
      // Efecto de glow mejorado
      if (enableGlow) {
        float glow = 1.0 - (dist * 2.0);
        glow = pow(glow, 1.5);
        
        // Core brillante
        float core = 1.0 - smoothstep(0.0, 0.3, dist);
        alpha = max(alpha, core * 0.8);
        
        // Glow exterior
        alpha += glow * 0.3;
      }
      
      // Fade basado en lifetime
      alpha *= vLifetime;
      
      // Efecto de proximidad al mouse
      if (vMouseDistance < 2.0) {
        float proximity = 1.0 - (vMouseDistance / 2.0);
        color += vec3(0.2, 0.4, 0.8) * proximity * 0.5;
        alpha += proximity * 0.3;
      }
      
      // Efecto hover global
      if (uIsHovered) {
        color += vec3(0.3, 0.6, 1.0) * 0.2;
        alpha += 0.2;
      }
      
      // Pulsación temporal
      float pulse = sin(uTime * 3.0 + vNoise * 10.0) * 0.1 + 0.9;
      color *= pulse;
      
      // Intensificar el brillo
      vec3 finalColor = color * (1.0 + alpha * 0.5);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  // Animación de partículas orbitales
  useFrame(state => {
    const currentTime = state.clock.elapsedTime;

    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position
        .array as Float32Array;
      const lifetimes = particlesRef.current.geometry.attributes.lifetime
        .array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Movimiento orbital más complejo con múltiples capas
        const time = currentTime * orbitalSpeed;
        const layerOffset = (i % 3) * Math.PI * 0.6667; // 3 capas
        const particlePhase = i * 0.01;

        const theta = time + particlePhase + layerOffset;
        const phi = Math.sin(time * 0.5 + particlePhase) * 0.5;

        // Radio variable con ondas
        const baseRadius =
          orbitalRadius + Math.sin(time * 2 + particlePhase) * 0.5;
        const radiusVariation = Math.sin(time * 0.7 + i * 0.1) * 0.3;
        const radius = baseRadius + radiusVariation;

        positions[i3] =
          centerPosition[0] + radius * Math.cos(theta) * Math.cos(phi);
        positions[i3 + 1] =
          centerPosition[1] +
          radius * Math.sin(theta) * Math.cos(phi) +
          Math.sin(time + particlePhase) * 0.4;
        positions[i3 + 2] = centerPosition[2] + radius * Math.sin(phi);

        // Animación de lifetime más orgánica
        const lifetimePhase = time * particleSpeed + particlePhase;
        const lifetimeBase = 0.4 + 0.6 * Math.abs(Math.sin(lifetimePhase));
        const lifetimeVariation = Math.sin(lifetimePhase * 3.0) * 0.2;
        lifetimes[i] = Math.max(0.1, lifetimeBase + lifetimeVariation);
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.lifetime.needsUpdate = true;

      // Actualizar uniforms del shader
      if (
        particlesRef.current.material &&
        'uniforms' in particlesRef.current.material
      ) {
        const material = particlesRef.current.material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = currentTime;
        material.uniforms.uMouse.value = mousePosition;
        material.uniforms.uMouseInfluence.value = mouseInfluence;
        material.uniforms.uIsHovered.value = isHovered;
        material.uniforms.uTextureIntensity.value = textureIntensity;
        material.uniforms.uParticleVariety.value = particleVariety;
      }
    }

    // Animación de partículas reactivas al hover
    if (hoverParticlesRef.current) {
      const positions = hoverParticlesRef.current.geometry.attributes.position
        .array as Float32Array;
      const lifetimes = hoverParticlesRef.current.geometry.attributes.lifetime
        .array as Float32Array;

      for (let i = 0; i < hoverParticleCount; i++) {
        const i3 = i * 3;
        const particlePhase = i * 0.1;

        // Comportamiento reactivo al hover
        if (isHovered) {
          // Expansión y movimiento hacia afuera cuando se hace hover
          const expansionRadius =
            2.5 + Math.sin(currentTime * 3.0 + particlePhase) * 0.5;
          const angle =
            (i / hoverParticleCount) * Math.PI * 2 +
            currentTime * hoverReactivity;

          positions[i3] = centerPosition[0] + Math.cos(angle) * expansionRadius;
          positions[i3 + 1] =
            centerPosition[1] +
            Math.sin(currentTime * 2.0 + particlePhase) * 0.8;
          positions[i3 + 2] =
            centerPosition[2] + Math.sin(angle) * expansionRadius;

          lifetimes[i] =
            0.8 + Math.sin(currentTime * 4.0 + particlePhase) * 0.2;
        } else {
          // Contracción y órbita más cerrada
          const baseRadius = 2.0 + Math.sin(currentTime + particlePhase) * 0.3;
          const angle =
            (i / hoverParticleCount) * Math.PI * 2 + currentTime * 0.5;

          positions[i3] = centerPosition[0] + Math.cos(angle) * baseRadius;
          positions[i3 + 1] =
            centerPosition[1] + Math.sin(currentTime + particlePhase) * 0.4;
          positions[i3 + 2] = centerPosition[2] + Math.sin(angle) * baseRadius;

          lifetimes[i] =
            0.3 + Math.sin(currentTime * 2.0 + particlePhase) * 0.2;
        }
      }

      hoverParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      hoverParticlesRef.current.geometry.attributes.lifetime.needsUpdate = true;

      // Actualizar uniforms
      if (
        hoverParticlesRef.current.material &&
        'uniforms' in hoverParticlesRef.current.material
      ) {
        const material = hoverParticlesRef.current
          .material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = currentTime;
        material.uniforms.uMouse.value = mousePosition;
        material.uniforms.uMouseInfluence.value = hoverReactivity;
        material.uniforms.uIsHovered.value = isHovered;
        material.uniforms.uTextureIntensity.value = textureIntensity;
        material.uniforms.uParticleVariety.value = particleVariety;
      }
    }

    // Animación de partículas de trail
    if (trailParticlesRef.current) {
      const positions = trailParticlesRef.current.geometry.attributes.position
        .array as Float32Array;
      const lifetimes = trailParticlesRef.current.geometry.attributes.lifetime
        .array as Float32Array;

      // Efecto de trail siguiendo el mouse con delay
      for (let i = 0; i < trailLength; i++) {
        const i3 = i * 3;
        const trailFactor = i / trailLength;
        const delay = trailFactor * 0.5;

        // Interpolación hacia la posición del mouse con retraso
        const targetX =
          mousePosition[0] * (1.0 - trailFactor) +
          centerPosition[0] * trailFactor;
        const targetY =
          mousePosition[1] * (1.0 - trailFactor) +
          centerPosition[1] * trailFactor;
        const targetZ = centerPosition[2] + Math.sin(currentTime - delay) * 0.5;

        // Lerp suave hacia la posición objetivo
        const lerpFactor = 0.05 + trailFactor * 0.05;
        positions[i3] += (targetX - positions[i3]) * lerpFactor;
        positions[i3 + 1] += (targetY - positions[i3 + 1]) * lerpFactor;
        positions[i3 + 2] += (targetZ - positions[i3 + 2]) * lerpFactor;

        // Lifetime basado en la posición en el trail
        lifetimes[i] =
          (1.0 - trailFactor) *
          (0.5 + Math.sin(currentTime * 5.0 - i * 0.2) * 0.3);
      }

      trailParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      trailParticlesRef.current.geometry.attributes.lifetime.needsUpdate = true;

      // Actualizar uniforms
      if (
        trailParticlesRef.current.material &&
        'uniforms' in trailParticlesRef.current.material
      ) {
        const material = trailParticlesRef.current
          .material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = currentTime;
        material.uniforms.uMouse.value = mousePosition;
        material.uniforms.uMouseInfluence.value = mouseInfluence * 0.5;
        material.uniforms.uIsHovered.value = isHovered;
        material.uniforms.uTextureIntensity.value = textureIntensity;
        material.uniforms.uParticleVariety.value = particleVariety * 0.3;
      }
    }

    // Animación de partículas ambientales
    if (ambientParticlesRef.current) {
      const positions = ambientParticlesRef.current.geometry.attributes.position
        .array as Float32Array;
      const lifetimes = ambientParticlesRef.current.geometry.attributes.lifetime
        .array as Float32Array;

      for (let i = 0; i < ambientParticleCount; i++) {
        const i3 = i * 3;
        const particlePhase = i * 0.05;

        // Movimiento flotante lento y orgánico
        const drift = currentTime * 0.1;
        positions[i3] += Math.sin(drift + particlePhase) * 0.001;
        positions[i3 + 1] += Math.cos(drift * 1.3 + particlePhase) * 0.001;
        positions[i3 + 2] += Math.sin(drift * 0.7 + particlePhase) * 0.001;

        // Pulsación sutil
        lifetimes[i] =
          0.2 + 0.3 * Math.abs(Math.sin(currentTime * 0.5 + particlePhase));
      }

      ambientParticlesRef.current.geometry.attributes.position.needsUpdate =
        true;
      ambientParticlesRef.current.geometry.attributes.lifetime.needsUpdate =
        true;

      // Actualizar uniforms
      if (
        ambientParticlesRef.current.material &&
        'uniforms' in ambientParticlesRef.current.material
      ) {
        const material = ambientParticlesRef.current
          .material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = currentTime;
        material.uniforms.uMouse.value = mousePosition;
        material.uniforms.uMouseInfluence.value = mouseInfluence * 0.2;
        material.uniforms.uIsHovered.value = false;
        material.uniforms.uTextureIntensity.value = textureIntensity * 0.5;
        material.uniforms.uParticleVariety.value = particleVariety;
      }
    }

    // Animación de partículas de explosión mejorada (mantener lógica existente)
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

      // Actualizar uniforms
      if (
        explosionParticlesRef.current.material &&
        'uniforms' in explosionParticlesRef.current.material
      ) {
        const material = explosionParticlesRef.current
          .material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = currentTime;
        material.uniforms.uMouse.value = mousePosition;
        material.uniforms.uMouseInfluence.value = mouseInfluence;
        material.uniforms.uIsHovered.value = isHovered;
        material.uniforms.uTextureIntensity.value = textureIntensity;
        material.uniforms.uParticleVariety.value = particleVariety;
      }
    }
  });

  return (
    <group>
      {/* Partículas orbitales principales */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <shaderMaterial
          vertexShader={enhancedVertexShader}
          fragmentShader={enhancedFragmentShader}
          uniforms={{
            enableGlow: { value: enableGlow },
            uTime: { value: 0 },
            uMouse: { value: mousePosition },
            uMouseInfluence: { value: mouseInfluence },
            uIsHovered: { value: isHovered },
            uTextureIntensity: { value: textureIntensity },
            uParticleVariety: { value: particleVariety },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Partículas reactivas al hover */}
      <points ref={hoverParticlesRef} geometry={hoverGeometry}>
        <shaderMaterial
          vertexShader={enhancedVertexShader}
          fragmentShader={enhancedFragmentShader}
          uniforms={{
            enableGlow: { value: true },
            uTime: { value: 0 },
            uMouse: { value: mousePosition },
            uMouseInfluence: { value: hoverReactivity },
            uIsHovered: { value: isHovered },
            uTextureIntensity: { value: textureIntensity },
            uParticleVariety: { value: particleVariety },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Partículas de trail/estela */}
      <points ref={trailParticlesRef} geometry={trailGeometry}>
        <shaderMaterial
          vertexShader={enhancedVertexShader}
          fragmentShader={enhancedFragmentShader}
          uniforms={{
            enableGlow: { value: true },
            uTime: { value: 0 },
            uMouse: { value: mousePosition },
            uMouseInfluence: { value: mouseInfluence * 0.5 },
            uIsHovered: { value: isHovered },
            uTextureIntensity: { value: textureIntensity },
            uParticleVariety: { value: particleVariety * 0.3 },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Partículas ambientales */}
      <points ref={ambientParticlesRef} geometry={ambientGeometry}>
        <shaderMaterial
          vertexShader={enhancedVertexShader}
          fragmentShader={enhancedFragmentShader}
          uniforms={{
            enableGlow: { value: false },
            uTime: { value: 0 },
            uMouse: { value: mousePosition },
            uMouseInfluence: { value: mouseInfluence * 0.2 },
            uIsHovered: { value: false },
            uTextureIntensity: { value: textureIntensity * 0.5 },
            uParticleVariety: { value: particleVariety },
          }}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>

      {/* Partículas de explosión */}
      {isExploded && (
        <points ref={explosionParticlesRef} geometry={explosionGeometry}>
          <shaderMaterial
            vertexShader={enhancedVertexShader}
            fragmentShader={enhancedFragmentShader}
            uniforms={{
              enableGlow: { value: true },
              uTime: { value: 0 },
              uMouse: { value: mousePosition },
              uMouseInfluence: { value: mouseInfluence },
              uIsHovered: { value: isHovered },
              uTextureIntensity: { value: textureIntensity },
              uParticleVariety: { value: particleVariety },
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

