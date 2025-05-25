import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, useGLTF } from '@react-three/drei'
import { MeshStandardMaterial, CanvasTexture } from 'three'
import { useControls } from 'leva'

function AdvancedUVMapping({ position = [0, 0, 0] }) {
  const meshRef = useRef()

  const {
    useExternalTextures,
    modelFile,
    normalIntensity,
    roughnessValue,
    metalnessValue,
    envMapIntensity
  } = useControls('Texturas Avanzadas', {
    useExternalTextures: false,
    modelFile: { 
      value: 'none', 
      options: ['none', 'gltf-sample'] 
    },
    normalIntensity: { value: 1, min: 0, max: 3, step: 0.1 },
    roughnessValue: { value: 0.4, min: 0, max: 1, step: 0.01 },
    metalnessValue: { value: 0.1, min: 0, max: 1, step: 0.01 },
    envMapIntensity: { value: 1, min: 0, max: 3, step: 0.1 }
  })

  // Intentar cargar texturas externas (opcional)
  let externalTextures = null
  try {
    if (useExternalTextures) {
      externalTextures = useTexture({
        map: '/textures/diffuse.jpg',
        normalMap: '/textures/normal.jpg',
        roughnessMap: '/textures/roughness.jpg',
        metalnessMap: '/textures/metalness.jpg'
      })
    }
  } catch (error) {
    console.log('Texturas externas no disponibles, usando texturas procedurales')
  }

  // Material avanzado
  const advancedMaterial = useMemo(() => {
    const material = new MeshStandardMaterial({
      roughness: roughnessValue,
      metalness: metalnessValue,
      envMapIntensity: envMapIntensity
    })

    if (externalTextures) {
      material.map = externalTextures.map
      material.normalMap = externalTextures.normalMap
      material.roughnessMap = externalTextures.roughnessMap
      material.metalnessMap = externalTextures.metalnessMap
      material.normalScale.set(normalIntensity, normalIntensity)
    } else {
      // Crear texturas procedurales avanzadas
      material.map = createProceduralTexture('fabric')
      material.normalMap = createProceduralTexture('normal')
    }

    return material
  }, [externalTextures, normalIntensity, roughnessValue, metalnessValue, envMapIntensity])

  // Función para crear texturas procedurales más avanzadas
  function createProceduralTexture(type) {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    switch(type) {
      case 'fabric':
        // Textura de tela
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
        gradient.addColorStop(0, '#e0e0e0')
        gradient.addColorStop(0.5, '#c0c0c0')
        gradient.addColorStop(1, '#a0a0a0')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 512, 512)

        // Añadir patrón de tejido
        ctx.strokeStyle = '#909090'
        ctx.lineWidth = 1
        for (let i = 0; i < 512; i += 8) {
          ctx.beginPath()
          ctx.moveTo(i, 0)
          ctx.lineTo(i, 512)
          ctx.stroke()
          
          ctx.beginPath()
          ctx.moveTo(0, i)
          ctx.lineTo(512, i)
          ctx.stroke()
        }
        break

      case 'normal':
        // Mapa normal básico (azulado)
        ctx.fillStyle = '#8080ff'
        ctx.fillRect(0, 0, 512, 512)
        
        // Añadir variaciones sutiles
        for (let x = 0; x < 512; x += 16) {
          for (let y = 0; y < 512; y += 16) {
            const variation = Math.random() * 40 - 20
            ctx.fillStyle = `rgb(${128 + variation}, ${128 + variation}, ${255})`
            ctx.fillRect(x, y, 16, 16)
          }
        }
        break
    }    const texture = new CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }

  // Animación
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <primitive object={advancedMaterial} attach="material" />
      </mesh>
      
      {/* Esfera de referencia */}
      <mesh position={[3, 0, 0]}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={advancedMaterial} attach="material" />
      </mesh>
    </group>
  )
}

export default AdvancedUVMapping
