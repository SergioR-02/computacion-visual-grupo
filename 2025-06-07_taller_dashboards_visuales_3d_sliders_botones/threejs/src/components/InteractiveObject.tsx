import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls, button } from 'leva';
import * as THREE from 'three';

interface InteractiveObjectProps {
  objectType: 'box' | 'sphere' | 'torus';
  name: string;
  position?: [number, number, number];
}

export default function InteractiveObject({
  objectType,
  name,
  position = [0, 0, 0],
}: InteractiveObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [materialType, setMaterialType] = useState<
    'standard' | 'phong' | 'lambert'
  >('standard');
  const [autoRotate, setAutoRotate] = useState(false);

  // Controles específicos para cada objeto
  const {
    scale,
    color,
    roughness,
    metalness,
    emissive,
    wireframe,
    rotationSpeed,
    positionY,
    visible,
  } = useControls(name, {
    // Transformaciones
    scale: {
      value: 1,
      min: 0.1,
      max: 3,
      step: 0.1,
      label: '📏 Escala',
    },
    positionY: {
      value: 0,
      min: -3,
      max: 3,
      step: 0.1,
      label: '↕️ Altura Y',
    },

    // Material y color
    color: {
      value: '#ff6b6b',
      label: '🎨 Color Principal',
    },
    emissive: {
      value: '#000000',
      label: '✨ Color Emisivo',
    },
    roughness: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      label: '🏔️ Rugosidad',
    },
    metalness: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      label: '⚡ Metalicidad',
    },
    wireframe: {
      value: false,
      label: '🔲 Vista Wireframe',
    },

    // Animación
    rotationSpeed: {
      value: 1,
      min: 0,
      max: 5,
      step: 0.1,
      label: '🔄 Vel. Rotación',
    },

    // Controles de acción
    'Alternar Rotación': button(() => setAutoRotate(!autoRotate)),
    'Cambiar Material': button(() => {
      const materials: Array<'standard' | 'phong' | 'lambert'> = [
        'standard',
        'phong',
        'lambert',
      ];
      const currentIndex = materials.indexOf(materialType);
      const nextIndex = (currentIndex + 1) % materials.length;
      setMaterialType(materials[nextIndex]);
    }),
    'Reset Posición': button(() => {
      if (meshRef.current) {
        meshRef.current.position.set(position[0], 0, position[2]);
        meshRef.current.rotation.set(0, 0, 0);
        meshRef.current.scale.set(1, 1, 1);
      }
    }),

    // Visibilidad
    visible: {
      value: true,
      label: '👁️ Visible',
    },
  });

  // Animación del objeto
  useFrame(state => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.x += 0.01 * rotationSpeed;
      meshRef.current.rotation.y += 0.015 * rotationSpeed;

      // Movimiento ondulatorio sutil
      meshRef.current.position.y =
        positionY + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    } else if (meshRef.current) {
      meshRef.current.position.y = positionY;
    }
  });

  // Función para renderizar la geometría según el tipo
  const renderGeometry = () => {
    switch (objectType) {
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.7, 32, 32]} />;
      case 'torus':
        return <torusGeometry args={[0.6, 0.3, 16, 100]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  // Función para renderizar el material según el tipo
  const renderMaterial = () => {
    const commonProps = {
      color,
      emissive,
      wireframe,
      transparent: true,
      opacity: visible ? 1 : 0.3,
    };

    switch (materialType) {
      case 'standard':
        return (
          <meshStandardMaterial
            {...commonProps}
            roughness={roughness}
            metalness={metalness}
          />
        );
      case 'phong':
        return (
          <meshPhongMaterial
            {...commonProps}
            shininess={100 * (1 - roughness)}
          />
        );
      case 'lambert':
        return <meshLambertMaterial {...commonProps} />;
      default:
        return <meshStandardMaterial {...commonProps} />;
    }
  };
  return (
    <mesh
      ref={meshRef}
      position={[position[0], positionY, position[2]]}
      scale={[scale, scale, scale]}
      visible={visible}
    >
      {renderGeometry()}
      {renderMaterial()}
    </mesh>
  );
}
