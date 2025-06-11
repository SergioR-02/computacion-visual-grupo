import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import * as THREE from 'three';
import InteractiveObject from './InteractiveObject';
import Lights from './Lights';

export default function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  // Controles generales de la escena
  const { backgroundColor, fogEnabled, fogDensity, globalRotation } =
    useControls('🌍 Escena Global', {
      backgroundColor: { value: '#1a1a2e', label: 'Color de Fondo' },
      fogEnabled: { value: true, label: 'Niebla Activada' },
      fogDensity: {
        value: 0.01,
        min: 0,
        max: 0.1,
        step: 0.001,
        label: 'Densidad de Niebla',
      },
      globalRotation: { value: false, label: 'Rotación Global Auto' },
    });

  // Animación de rotación global
  useFrame(state => {
    if (globalRotation && groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }

    // Actualizar color de fondo
    state.gl.setClearColor(backgroundColor);
  });

  return (
    <>
      {/* Niebla */}
      {fogEnabled && (
        <fog attach="fog" args={[backgroundColor, 1, 20 * fogDensity]} />
      )}

      {/* Grupo principal con todos los objetos */}
      <group ref={groupRef}>
        {/* Objetos 3D interactivos */}
        <InteractiveObject
          position={[-2.5, 0, 0]}
          objectType="box"
          name="📦 Cubo"
        />
        <InteractiveObject
          position={[0, 0, 0]}
          objectType="sphere"
          name="🌐 Esfera"
        />
        <InteractiveObject
          position={[2.5, 0, 0]}
          objectType="torus"
          name="🍩 Toro"
        />
      </group>

      {/* Sistema de luces */}
      <Lights />

      {/* Suelo con rejilla */}
      <gridHelper args={[20, 20, '#444444', '#222222']} position={[0, -2, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a0a" transparent opacity={0.5} />
      </mesh>
    </>
  );
}
