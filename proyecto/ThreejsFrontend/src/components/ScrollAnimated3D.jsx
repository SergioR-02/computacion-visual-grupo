import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls, Environment, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

const BonsaiModel = ({ scrollProgress }) => {
  const modelRef = useRef();
  const groupRef = useRef();
  
  // Cargar el modelo GLB
  const gltf = useLoader(GLTFLoader, '/bonsai_tree.glb');
  
  useFrame((state, delta) => {    if (modelRef.current) {
      // Rotación natural basada en el tiempo y scroll
      modelRef.current.rotation.y += delta * 0.4; // Velocidad moderada
      
      // Animaciones basadas en el scroll con transiciones suaves
      const progress = scrollProgress;        // Escala del modelo - comienza en tamaño más pequeño y crece ligeramente
      const scale = 0.25 + progress * 0.1; // Máximo 0.5 (0.15 + 0.35 = 0.5)
      modelRef.current.scale.setScalar(scale);        // Posición Y con movimiento ondulatorio natural
      const baseY = -1.5; // Posición base
      let waveY, finalDropY;
      
      if (progress > 0.8) {
        // Al final, alinear el modelo (sin ondulaciones)
        waveY = 0; // Sin movimiento ondulatorio
        finalDropY = (progress - 0.8) * 5; // Solo la caída
      } else {
        waveY = Math.sin(progress * Math.PI * 3) * 1.0; // Amplitud moderada
        finalDropY = 0;
      }
      
      modelRef.current.position.y = baseY + waveY - finalDropY;
      
      // Rotaciones suaves en X e Z para crear movimiento natural
      // Al final, las rotaciones se alinean gradualmente
      const rotationMultiplier = progress > 0.8 ? Math.max(0, 1 - (progress - 0.8) * 5) : 1;
      modelRef.current.rotation.x = Math.sin(progress * Math.PI * 2.5) * 0.5 * rotationMultiplier;
      modelRef.current.rotation.z = Math.cos(progress * Math.PI * 2) * 0.3 * rotationMultiplier;
      
      // Movimiento sutil en X basado en el scroll - se alinea al final
      modelRef.current.position.x = Math.sin(progress * Math.PI * 2) * 0.4 * rotationMultiplier;
      
      // Cambio de color basado en el scroll
      if (modelRef.current.children) {
        modelRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            const hue = progress * 0.3; // De verde a azul
            child.material.color.setHSL(0.3 - hue, 0.8, 0.6);
          }
        });
      }
    }
      if (groupRef.current) {
      // Movimiento flotante natural del grupo completo - se reduce al final
      const floatMultiplier = scrollProgress > 0.8 ? Math.max(0.2, 1 - (scrollProgress - 0.8) * 3) : 1;
      
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 1.0) * 0.002 * floatMultiplier;
      groupRef.current.position.x += Math.cos(state.clock.elapsedTime * 0.6) * 0.001 * floatMultiplier;
      
      // Movimiento en Z se alinea gradualmente al final
      const zMovement = scrollProgress > 0.8 ? 0 : Math.sin(scrollProgress * Math.PI * 1.5) * 0.2;
      groupRef.current.position.z = zMovement;
    }
  });

  return (    <group ref={groupRef}>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={1.0}>        <primitive 
          ref={modelRef}
          object={gltf.scene.clone()}
          scale={0.15}
          position={[0, -2, 0]}
        />
      </Float>
    </group>
  );
};

const ParticleSystem = ({ scrollProgress }) => {
  const particlesRef = useRef();
  const particleCount = 8000; // Aumentamos a 1000 partículas para máxima densidad
  
  // Crear geometría y material para las partículas
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;     // Área máxima para distribuir mejor las partículas
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    
    // Colores variados en tonos verdes y azules que cambian con el scroll
    const color = new THREE.Color();
    const hue = 0.3 + Math.random() * 0.3; // Verde a azul
    color.setHSL(hue, 0.7, 0.5 + Math.random() * 0.3);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  useFrame((state, delta) => {
    if (particlesRef.current) {
      // Rotación constante más pronunciada
      particlesRef.current.rotation.y += delta * 0.2;
      particlesRef.current.rotation.x += delta * 0.1;
        // Opacidad siempre visible, variando levemente con el scroll
      const material = particlesRef.current.material;
      material.opacity = 0.4 + scrollProgress * 0.4; // Visible desde el inicio
      material.size = 0.08;  // Tamaño fijo en el máximo (antes era 0.04 + scrollProgress * 0.04)
      
      // Movimiento más dinámico de las partículas
      const positions = particlesRef.current.geometry.attributes.position.array;
      const colors = particlesRef.current.geometry.attributes.color.array;
      
      for (let i = 0; i < particleCount; i++) {
        // Movimiento ondulatorio más pronunciado
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i * 0.1) * 0.003;
        positions[i * 3] += Math.cos(state.clock.elapsedTime * 0.3 + i * 0.15) * 0.002;
        positions[i * 3 + 2] += Math.sin(state.clock.elapsedTime * 0.4 + i * 0.2) * 0.002;        // Cambio de color dinámico basado en scroll, tiempo y sección actual
        const colorShift = scrollProgress * 0.3 + Math.sin(state.clock.elapsedTime * 0.2 + i * 0.1) * 0.1;
        const color = new THREE.Color();
        
        // Determinar color basado en la sección actual (usando scrollProgress como referencia)
        if (scrollProgress >= 0.3 && scrollProgress < 0.8) {
          // Sección "Features" - colores verdosos mucho más oscuros para máximo contraste con fondo blanco
          const greenHue = 0.35 + Math.sin(state.clock.elapsedTime * 0.3 + i * 0.05) * 0.05; // Verde intenso
          color.setHSL(greenHue, 0.95, 0.2); // Saturación muy alta, luminosidad muy baja (más oscuro)
        } else {
          // Otras secciones - colores originales
          color.setHSL(0.3 - colorShift, 0.8, 0.6);
        }
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.color.needsUpdate = true;
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
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>      <pointsMaterial
        size={0.08}
        transparent={true}
        opacity={0.7}
        sizeAttenuation={true}
        vertexColors={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};



const Scene = ({ scrollProgress }) => {
  const { camera } = useThree();
  
  useFrame(() => {
    // Movimiento sutil de la cámara basado en el scroll
    camera.position.z = 5 + scrollProgress * 2;
    camera.position.y = scrollProgress * 1;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      {/* Iluminación dinámica */}
      <ambientLight intensity={0.3 + scrollProgress * 0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.6 + scrollProgress * 0.4} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        color={`hsl(${120 + scrollProgress * 60}, 70%, 80%)`}
      />
      <pointLight 
        position={[-10, -10, -10]} 
        intensity={0.3 + scrollProgress * 0.3} 
        color="#06b6d4" 
      />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={0.5}
        intensity={0.5 + scrollProgress * 0.5}
        color="#10b981"
      />
      
      {/* Modelo principal */}
      <Suspense fallback={null}>
        <BonsaiModel scrollProgress={scrollProgress} />
      </Suspense>
        {/* Sistema de partículas */}
      <ParticleSystem scrollProgress={scrollProgress} />
      
      {/* Entorno */}
      <Environment preset="forest" background={false} />
      
      {/* Fog para crear profundidad */}
      <fog attach="fog" args={['#f0fdf4', 5, 20]} />
    </>
  );
};

const ScrollAnimated3D = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState('hero'); // 'hero', 'features', 'cta'
  const [screenSize, setScreenSize] = useState('large'); // 'large', 'medium', 'small'
  const containerRef = useRef();

  useEffect(() => {
    // Detectar tamaño de pantalla
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1440) {
        setScreenSize('large'); // Pantallas grandes (>= 1440px)
      } else if (width >= 1024) {
        setScreenSize('medium'); // Portátiles 14" (1024px - 1439px)
      } else {
        setScreenSize('small'); // Móviles y tablets (< 1024px)
      }
    };

    // Ejecutar al montar y en resize
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / docHeight, 1);
      setScrollProgress(progress);
      
      // Determinar la sección actual basada en el progreso de scroll
      if (progress < 0.3) {
        setCurrentSection('hero'); // Inicio - modelo a la derecha
      } else if (progress >= 0.3 && progress < 0.8) {
        setCurrentSection('features'); // Funcionalidades - modelo a la izquierda
      } else {
        setCurrentSection('cta'); // CTA final - modelo a la derecha
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);  // Determinar el transform según la sección y tamaño de pantalla
  const getTransform = () => {
    // Para pantallas pequeñas (< 1024px) - Sin movimiento lateral
    if (screenSize === 'small') {
      switch(currentSection) {
        case 'cta':
          return 'translateX(0%) translateY(50px)'; // Solo baja un poco
        default:
          return 'translateX(0%) translateY(0px)'; // Se mantiene fijo
      }
    }
    
    // Para portátiles 14" (1024px - 1439px) - Movimiento moderado
    if (screenSize === 'medium') {
      switch(currentSection) {
        case 'features':
          return 'translateX(-100%) translateY(-10px)'; // Movimiento reducido
        case 'cta':
          return 'translateX(0%) translateY(0px)'; // Baja menos
        default:
          return 'translateX(0%) translateY(0px)';
      }
    }
    
    // Para pantallas grandes (>= 1440px) - Movimiento completo
    switch(currentSection) {
      case 'features':
        return 'translateX(-100%) translateY(-20px)'; // Movimiento completo
      case 'cta':
        return 'translateX(0%) translateY(90px)'; // Baja completamente
      default:
        return 'translateX(0%) translateY(0px)';
    }
  };return (
    <div 
      ref={containerRef}
      className="fixed top-0 right-0 w-full lg:w-1/2 h-full pointer-events-none z-10"
      style={{ 
        background: 'transparent',
        transform: getTransform(),
        transition: 'transform 0.8s ease-in-out',
      }}
    >
      <Canvas
        camera={{ 
          position: [0, 0, 5], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        shadows
        className="lg:opacity-100 opacity-30"
      >
        <Suspense fallback={null}>
          <Scene scrollProgress={scrollProgress} />        </Suspense>
      </Canvas>
    </div>
  );
};

export default ScrollAnimated3D;
