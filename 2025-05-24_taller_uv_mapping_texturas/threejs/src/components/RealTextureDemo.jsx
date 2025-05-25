import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Text } from '@react-three/drei'
import { MeshStandardMaterial, RepeatWrapping } from 'three'
import { useControls } from 'leva'

function RealTextureDemo({ position = [0, 0, 0] }) {
  const meshRef = useRef()

  const {
    textureSet,
    showComparison,
    uvRepeat,
    rotateModel
  } = useControls('Texturas Reales', {
    textureSet: { value: 'set1', options: ['set1', 'set2'] },
    showComparison: true,
    uvRepeat: { value: 1, min: 0.1, max: 4, step: 0.1 },
    rotateModel: false
  })

  // Cargar texturas reales
  const textureFiles = textureSet === 'set1' 
    ? {
        map: '/textures/color.jpg',
        normalMap: '/textures/normal.jpg',
        roughnessMap: '/textures/roughness.jpg',
        metalnessMap: '/textures/metalness.jpg'
      }
    : {
        map: '/textures/color1.jpg',
        normalMap: '/textures/normal1.jpg',
        roughnessMap: '/textures/roughness1.jpg',
        metalnessMap: '/textures/metalness.jpg'
      }

  const textures = useTexture(textureFiles)

  // Materiales con diferentes configuraciones
  const materials = useMemo(() => {
    const createMaterial = (config) => {
      const material = new MeshStandardMaterial({
        map: textures.map,
        ...config
      })

      // Configurar UV repeat para todas las texturas
      const configureTexture = (texture) => {
        if (texture) {
          texture.wrapS = RepeatWrapping
          texture.wrapT = RepeatWrapping
          texture.repeat.set(uvRepeat, uvRepeat)
        }
      }

      configureTexture(material.map)
      
      if (config.useNormal && textures.normalMap) {
        material.normalMap = textures.normalMap
        material.normalScale.set(1, 1)
        configureTexture(material.normalMap)
      }
      
      if (config.useRoughness && textures.roughnessMap) {
        material.roughnessMap = textures.roughnessMap
        material.roughness = 1.0
        configureTexture(material.roughnessMap)
      }
      
      if (config.useMetalness && textures.metalnessMap) {
        material.metalnessMap = textures.metalnessMap
        material.metalness = 1.0
        configureTexture(material.metalnessMap)
      }

      return material
    }

    return {
      onlyDiffuse: createMaterial({ 
        roughness: 0.8, 
        metalness: 0.1 
      }),
      withNormal: createMaterial({ 
        useNormal: true, 
        roughness: 0.8, 
        metalness: 0.1 
      }),
      withRoughness: createMaterial({ 
        useNormal: true, 
        useRoughness: true, 
        metalness: 0.1 
      }),
      complete: createMaterial({ 
        useNormal: true, 
        useRoughness: true, 
        useMetalness: true 
      })
    }
  }, [textures, uvRepeat])

  // Animación
  useFrame((state) => {
    if (meshRef.current && rotateModel) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  if (!showComparison) {
    // Mostrar solo el modelo completo
    return (
      <group position={position}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[2, 64, 64]} />
          <primitive object={materials.complete} attach="material" />
        </mesh>
        
        <Text
          position={[0, -3, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Texturas PBR Completas - {textureSet.toUpperCase()}
        </Text>
      </group>
    )
  }

  // Mostrar comparación
  const spheres = [
    { material: materials.onlyDiffuse, label: 'Solo Diffuse', pos: [-6, 2, 0] },
    { material: materials.withNormal, label: '+ Normal Map', pos: [2, 2, 0] },
    { material: materials.withRoughness, label: '+ Roughness', pos: [-6, -2, 0] },
    { material: materials.complete, label: 'PBR Completo', pos: [2, -2, 0] }
  ]

  return (
    <group position={position}>
      {spheres.map((sphere, index) => (
        <group key={index} position={sphere.pos}>
          <mesh>
            <sphereGeometry args={[1.5, 32, 32]} />
            <primitive object={sphere.material} attach="material" />
          </mesh>
          
          <Text
            position={[0, -2.5, 0]}
            fontSize={0.25}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {sphere.label}
          </Text>
        </group>
      ))}
      
      <Text
        position={[-2, 4.5, 0]}
        fontSize={0.4}
        color="yellow"
        anchorX="center"
        anchorY="middle"
      >
        Comparación PBR - {textureSet.toUpperCase()}
      </Text>
    </group>
  )
}

export default RealTextureDemo
