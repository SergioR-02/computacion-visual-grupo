import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';

interface DynamicMaterialSphereProps {
  position: [number, number, number];
  onClick: (position: [number, number, number]) => void;
}

const DynamicMaterialSphere: React.FC<DynamicMaterialSphereProps> = ({
  position,
  onClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const { mouse } = useThree();

  // Controles GUI con Leva
  const {
    materialType,
    baseColor,
    intensity,
    speed,
    scale,
    noiseStrength,
    waveAmplitude,
    enablePulse,
    enableNoise,
  } = useControls('Material Dinámico', {
    materialType: {
      value: 'energy',
      options: ['energy', 'liquid', 'fire', 'electric', 'portal'],
    },
    baseColor: '#4a90e2',
    intensity: { value: 1.0, min: 0, max: 3, step: 0.1 },
    speed: { value: 1.0, min: 0, max: 5, step: 0.1 },
    scale: { value: 1.0, min: 0.5, max: 3, step: 0.1 },
    noiseStrength: { value: 0.3, min: 0, max: 1, step: 0.05 },
    waveAmplitude: { value: 0.1, min: 0, max: 0.5, step: 0.02 },
    enablePulse: true,
    enableNoise: true,
  });

  // Vertex Shader - maneja deformaciones y animaciones
  const vertexShader = `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uWaveAmplitude;
    uniform float uNoiseStrength;
    uniform bool uEnableNoise;
    uniform vec2 uMouse;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vDisplacement;
    
    // Función de ruido 3D
    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 mod289(vec4 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 permute(vec4 x) {
      return mod289(((x*34.0)+1.0)*x);
    }
    
    vec4 taylorInvSqrt(vec4 r) {
      return 1.79284291400159 - 0.85373472095314 * r;
    }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    void main() {
      vUv = uv;
      vNormal = normal;
      
      vec3 pos = position;
      
      // Efectos de animación
      float time = uTime * uSpeed;
      
      // Ondas sinusoidales
      float wave = sin(pos.y * 3.0 + time * 2.0) * uWaveAmplitude;
      
      // Ruido para deformación orgánica
      float noise = 0.0;
      if (uEnableNoise) {
        noise = snoise(pos * 3.0 + time * 0.5) * uNoiseStrength;
      }
      
      // Interacción con mouse
      vec2 mouseInfluence = uMouse * 0.1;
      float mouseDistance = length(uMouse);
      float mouseEffect = (1.0 - mouseDistance) * 0.2;
      
      // Displacement total
      vDisplacement = wave + noise + mouseEffect;
      pos += normal * vDisplacement;
      
      vPosition = pos;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  // Fragment Shader - maneja colores y efectos visuales
  const fragmentShader = `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uIntensity;
    uniform vec3 uBaseColor;
    uniform float uScale;
    uniform bool uEnablePulse;
    uniform vec2 uMouse;
    uniform int uMaterialType;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vDisplacement;
    
    // Función de ruido 2D simplificada
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    void main() {
      float time = uTime * uSpeed;
      vec2 uv = vUv * uScale;
      
      vec3 color = uBaseColor;
      float alpha = 1.0;
      
      // Material tipo ENERGY
      if (uMaterialType == 0) {
        float pattern = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time * 1.5);
        float energy = pattern * 0.5 + 0.5;
        color = mix(uBaseColor, vec3(0.0, 1.0, 1.0), energy * uIntensity);
        
        if (uEnablePulse) {
          float pulse = sin(time * 3.0) * 0.3 + 0.7;
          color *= pulse;
        }
      }
      
      // Material tipo LIQUID
      else if (uMaterialType == 1) {
        float wave1 = sin(uv.x * 8.0 + time * 2.0) * 0.5 + 0.5;
        float wave2 = sin(uv.y * 6.0 + time * 1.5) * 0.5 + 0.5;
        float liquid = wave1 * wave2;
        color = mix(uBaseColor, vec3(0.0, 0.5, 1.0), liquid * uIntensity);
      }
      
      // Material tipo FIRE
      else if (uMaterialType == 2) {
        float fireNoise = noise(uv * 5.0 + time * 2.0);
        float fire = pow(1.0 - vUv.y, 2.0) * fireNoise;
        color = mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 0.0), fire);
        color = mix(uBaseColor, color, uIntensity);
      }
      
      // Material tipo ELECTRIC
      else if (uMaterialType == 3) {
        float electric = random(uv + time * 10.0);
        electric = step(0.95, electric);
        color = mix(uBaseColor, vec3(1.0, 1.0, 1.0), electric * uIntensity);
        
        float spark = sin(time * 20.0) > 0.8 ? 1.0 : 0.0;
        color += vec3(0.5, 0.8, 1.0) * spark * electric;
      }
      
      // Material tipo PORTAL
      else if (uMaterialType == 4) {
        float radius = length(vUv - 0.5);
        float portal = sin(radius * 20.0 - time * 8.0) * 0.5 + 0.5;
        float ring = 1.0 - smoothstep(0.3, 0.5, radius);
        color = mix(uBaseColor, vec3(1.0, 0.0, 1.0), portal * ring * uIntensity);
        alpha = ring + 0.3;
      }
      
      // Efecto de interacción con mouse
      float mouseDistance = length(uMouse);
      float mouseInfluence = (1.0 - mouseDistance) * 0.5;
      color += vec3(mouseInfluence);
      
      // Efecto de desplazamiento
      color += abs(vDisplacement) * 2.0;
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  // Uniforms para los shaders
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uIntensity: { value: intensity },
      uBaseColor: { value: new THREE.Color(baseColor) },
      uScale: { value: scale },
      uNoiseStrength: { value: noiseStrength },
      uWaveAmplitude: { value: waveAmplitude },
      uEnablePulse: { value: enablePulse },
      uEnableNoise: { value: enableNoise },
      uMouse: { value: [0, 0] },
      uMaterialType: {
        value: ['energy', 'liquid', 'fire', 'electric', 'portal'].indexOf(
          materialType,
        ),
      },
    }),
    [
      materialType,
      baseColor,
      intensity,
      speed,
      scale,
      noiseStrength,
      waveAmplitude,
      enablePulse,
      enableNoise,
    ],
  );

  // Animación frame por frame
  useFrame(state => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uSpeed.value = speed;
      materialRef.current.uniforms.uIntensity.value = hovered
        ? intensity * 1.5
        : intensity;
      materialRef.current.uniforms.uBaseColor.value.set(baseColor);
      materialRef.current.uniforms.uScale.value = scale;
      materialRef.current.uniforms.uNoiseStrength.value = noiseStrength;
      materialRef.current.uniforms.uWaveAmplitude.value = waveAmplitude;
      materialRef.current.uniforms.uEnablePulse.value = enablePulse;
      materialRef.current.uniforms.uEnableNoise.value = enableNoise;
      materialRef.current.uniforms.uMouse.value = [mouse.x, mouse.y];
      materialRef.current.uniforms.uMaterialType.value = [
        'energy',
        'liquid',
        'fire',
        'electric',
        'portal',
      ].indexOf(materialType);
    }

    // Rotación automática sutil
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.002;
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    onClick(position);
  };

  return (
    <Sphere
      ref={meshRef}
      args={[1.5, 64, 64]}
      position={position}
      onClick={handleClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </Sphere>
  );
};

export default DynamicMaterialSphere;
