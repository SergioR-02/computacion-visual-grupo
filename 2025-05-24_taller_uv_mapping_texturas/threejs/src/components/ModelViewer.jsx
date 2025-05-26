import React, { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { 
  TextureLoader, 
  RepeatWrapping, 
  ClampToEdgeWrapping, 
  MirroredRepeatWrapping,
  MeshStandardMaterial 
} from 'three'
import { useControls } from 'leva'

function ModelViewer({ modelType, position = [0, 0, 0] }) {
  const meshRef = useRef()

  // Controles para el material y UV mapping
  const {
    textureType,
    repeatU,
    repeatV,
    offsetU,
    offsetV,
    wrapS,
    wrapT,
    rotation,
    autoRotate,
    wireframe,
    roughness,
    metalness
  } = useControls('Material & UV', {
    textureType: { 
      value: 'checker', 
      options: ['checker', 'brick', 'wood', 'uv-test'] 
    },
    repeatU: { value: 1, min: 0.1, max: 10, step: 0.1 },
    repeatV: { value: 1, min: 0.1, max: 10, step: 0.1 },
    offsetU: { value: 0, min: -2, max: 2, step: 0.1 },
    offsetV: { value: 0, min: -2, max: 2, step: 0.1 },
    rotation: { value: 0, min: 0, max: Math.PI * 2, step: 0.1 },
    wrapS: { 
      value: 'RepeatWrapping', 
      options: ['RepeatWrapping', 'ClampToEdgeWrapping', 'MirroredRepeatWrapping'] 
    },
    wrapT: { 
      value: 'RepeatWrapping', 
      options: ['RepeatWrapping', 'ClampToEdgeWrapping', 'MirroredRepeatWrapping'] 
    },
    autoRotate: false,
    wireframe: false,
    roughness: { value: 0.4, min: 0, max: 1, step: 0.01 },
    metalness: { value: 0.1, min: 0, max: 1, step: 0.01 }
  })

  // Cargar modelo OBJ
  const obj = useLoader(OBJLoader, '/base.obj')

  // Crear texturas procedurales
  const textures = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')

    const createTexture = (type) => {
      ctx.clearRect(0, 0, 256, 256)
      
      switch(type) {
        case 'checker':
          // Patrón de tablero de ajedrez
          for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
              ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#000000'
              ctx.fillRect(x * 32, y * 32, 32, 32)
            }
          }
          break
          
        case 'brick':
          // Patrón de ladrillos
          ctx.fillStyle = '#8B4513'
          ctx.fillRect(0, 0, 256, 256)
          ctx.strokeStyle = '#654321'
          ctx.lineWidth = 2
          for (let y = 0; y < 256; y += 32) {
            for (let x = 0; x < 256; x += 64) {
              const offsetX = (y / 32) % 2 === 0 ? 0 : 32
              ctx.strokeRect(x + offsetX, y, 64, 32)
            }
          }
          break
          
        case 'wood':
          // Patrón de madera
          const gradient = ctx.createLinearGradient(0, 0, 0, 256)
          gradient.addColorStop(0, '#DEB887')
          gradient.addColorStop(0.5, '#CD853F')
          gradient.addColorStop(1, '#8B4513')
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, 256, 256)
          
          // Líneas de veta
          ctx.strokeStyle = '#654321'
          ctx.lineWidth = 1
          for (let i = 0; i < 10; i++) {
            ctx.beginPath()
            ctx.moveTo(0, i * 25.6 + Math.sin(i) * 10)
            ctx.lineTo(256, i * 25.6 + Math.sin(i + 1) * 10)
            ctx.stroke()
          }
          break
          
        case 'uv-test':
          // Textura de prueba UV con gradientes de colores
          const gradientH = ctx.createLinearGradient(0, 0, 256, 0)
          gradientH.addColorStop(0, '#ff0000')
          gradientH.addColorStop(0.5, '#00ff00')
          gradientH.addColorStop(1, '#0000ff')
          ctx.fillStyle = gradientH
          ctx.fillRect(0, 0, 256, 256)
          
          const gradientV = ctx.createLinearGradient(0, 0, 0, 256)
          gradientV.addColorStop(0, 'rgba(255,255,255,0)')
          gradientV.addColorStop(1, 'rgba(0,0,0,0.5)')
          ctx.fillStyle = gradientV
          ctx.fillRect(0, 0, 256, 256)
          
          // Cuadrícula de referencia
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 1
          for (let i = 0; i <= 8; i++) {
            ctx.beginPath()
            ctx.moveTo(i * 32, 0)
            ctx.lineTo(i * 32, 256)
            ctx.moveTo(0, i * 32)
            ctx.lineTo(256, i * 32)
            ctx.stroke()
          }
          break
      }
      
      const texture = new TextureLoader().load(canvas.toDataURL())
      return texture
    }

    return {
      checker: createTexture('checker'),
      brick: createTexture('brick'),
      wood: createTexture('wood'),
      'uv-test': createTexture('uv-test')
    }
  }, [])

  // Configurar textura
  const currentTexture = useMemo(() => {
    const texture = textures[textureType].clone()
    texture.needsUpdate = true
    
    // Configurar wrapping
    const wrapModes = {
      'RepeatWrapping': RepeatWrapping,
      'ClampToEdgeWrapping': ClampToEdgeWrapping,
      'MirroredRepeatWrapping': MirroredRepeatWrapping
    }
    
    texture.wrapS = wrapModes[wrapS]
    texture.wrapT = wrapModes[wrapT]
    
    // Configurar repeat y offset
    texture.repeat.set(repeatU, repeatV)
    texture.offset.set(offsetU, offsetV)
    texture.rotation = rotation
    texture.center.set(0.5, 0.5)
    
    return texture
  }, [textures, textureType, wrapS, wrapT, repeatU, repeatV, offsetU, offsetV, rotation])

  // Material
  const material = useMemo(() => {
    return new MeshStandardMaterial({
      map: currentTexture,
      roughness: roughness,
      metalness: metalness,
      wireframe: wireframe
    })
  }, [currentTexture, roughness, metalness, wireframe])

  // Animación
  useFrame((state) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  // Renderizar modelo o primitiva
  if (modelType === 'obj' && obj) {
    return (
      <group ref={meshRef} position={position}>
        <primitive object={obj.clone()}>
          <primitive object={material} attach="material" />
        </primitive>
      </group>
    )
  }

  // Primitivas geométricas para comparación
  return (
    <group position={position}>
      <mesh ref={meshRef} position={[-2, 0, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      <mesh position={[2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 2, 32]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  )
}

export default ModelViewer
