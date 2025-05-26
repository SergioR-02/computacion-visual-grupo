import React, { Suspense, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useGLTF, useTexture, Text, Box } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { TextureLoader, RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping } from 'three'
import { useControls } from 'leva'
import ModelViewer from './ModelViewer'
import TextureDemo from './TextureDemo'

function UVMappingScene() {
  const { 
    showModel,
    showTextureDemo,
    showGrid,
    modelType
  } = useControls('Escena', {
    modelType: { 
      value: 'obj', 
      options: ['obj', 'primitives'] 
    },
    showModel: true,
    showTextureDemo: true,
    showGrid: false
  })

  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <group>
        {/* Mostrar modelo principal */}
        {showModel && (
          <ModelViewer modelType={modelType} position={[0, 0, 0]} />
        )}
        
        {/* Demostración de texturas en primitivas */}
        {showTextureDemo && (
          <TextureDemo position={[6, 0, 0]} />
        )}
        
        {/* Cuadrícula de referencia */}
        {showGrid && (
          <gridHelper args={[20, 20, 0x444444, 0x444444]} />
        )}
        
        {/* Texto informativo */}
        <Text
          position={[0, 4, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          UV Mapping & Texturas - Three.js
        </Text>
      </group>
    </Suspense>
  )
}

function LoadingPlaceholder() {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.5
      meshRef.current.rotation.y = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" wireframe />
    </mesh>
  )
}

export default UVMappingScene
