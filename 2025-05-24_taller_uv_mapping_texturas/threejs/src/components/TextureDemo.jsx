import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { 
  TextureLoader, 
  MeshStandardMaterial, 
  RepeatWrapping, 
  ClampToEdgeWrapping, 
  MirroredRepeatWrapping 
} from 'three'
import { useControls } from 'leva'

function TextureDemo({ position = [0, 0, 0] }) {
  const meshRefs = useRef([])

  const { 
    showLabels,
    demonstrationType 
  } = useControls('Demostración UV', {
    demonstrationType: { 
      value: 'wrapping', 
      options: ['wrapping', 'repeat', 'distortion'] 
    },
    showLabels: true
  })

  // Crear texturas de demostración
  const demoTextures = useMemo(() => {
    const createDemoTexture = (type) => {
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 128
      const ctx = canvas.getContext('2d')

      switch(type) {
        case 'arrows':
          // Textura con flechas para mostrar orientación
          ctx.fillStyle = '#4CAF50'
          ctx.fillRect(0, 0, 128, 128)
          ctx.fillStyle = '#2E7D32'
          ctx.beginPath()
          ctx.moveTo(64, 20)
          ctx.lineTo(90, 50)
          ctx.lineTo(74, 50)
          ctx.lineTo(74, 108)
          ctx.lineTo(54, 108)
          ctx.lineTo(54, 50)
          ctx.lineTo(38, 50)
          ctx.closePath()
          ctx.fill()
          break

        case 'numbers':
          // Textura numerada para identificar caras
          const colors = ['#FF5722', '#2196F3', '#4CAF50', '#FF9800']
          for (let i = 0; i < 4; i++) {
            ctx.fillStyle = colors[i]
            ctx.fillRect((i % 2) * 64, Math.floor(i / 2) * 64, 64, 64)
            ctx.fillStyle = 'white'
            ctx.font = 'bold 40px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(i + 1, (i % 2) * 64 + 32, Math.floor(i / 2) * 64 + 45)
          }
          break

        case 'grid':
          // Cuadrícula detallada
          ctx.fillStyle = '#333333'
          ctx.fillRect(0, 0, 128, 128)
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 1
          for (let i = 0; i <= 8; i++) {
            ctx.beginPath()
            ctx.moveTo(i * 16, 0)
            ctx.lineTo(i * 16, 128)
            ctx.moveTo(0, i * 16)
            ctx.lineTo(128, i * 16)
            ctx.stroke()
          }
          break
      }

      return new TextureLoader().load(canvas.toDataURL())
    }

    return {
      arrows: createDemoTexture('arrows'),
      numbers: createDemoTexture('numbers'),
      grid: createDemoTexture('grid')
    }
  }, [])

  // Configuraciones de demostración
  const demoConfigs = useMemo(() => {
    switch(demonstrationType) {
      case 'wrapping':
        return [
          { 
            name: 'Repeat', 
            texture: demoTextures.grid,
            material: { map: demoTextures.grid, roughness: 0.8 },
            transform: { repeat: [2, 2], offset: [0, 0] }
          },
          { 
            name: 'Clamp', 
            texture: demoTextures.arrows,
            material: { map: demoTextures.arrows, roughness: 0.8 },
            transform: { repeat: [2, 2], offset: [0, 0], wrapS: 'ClampToEdgeWrapping' }
          },
          { 
            name: 'Mirror', 
            texture: demoTextures.numbers,
            material: { map: demoTextures.numbers, roughness: 0.8 },
            transform: { repeat: [2, 2], offset: [0, 0], wrapS: 'MirroredRepeatWrapping' }
          }
        ]
      
      case 'repeat':
        return [
          { 
            name: '1x1', 
            texture: demoTextures.grid,
            material: { map: demoTextures.grid, roughness: 0.6 },
            transform: { repeat: [1, 1], offset: [0, 0] }
          },
          { 
            name: '2x2', 
            texture: demoTextures.grid,
            material: { map: demoTextures.grid, roughness: 0.6 },
            transform: { repeat: [2, 2], offset: [0, 0] }
          },
          { 
            name: '0.5x0.5', 
            texture: demoTextures.grid,
            material: { map: demoTextures.grid, roughness: 0.6 },
            transform: { repeat: [0.5, 0.5], offset: [0, 0] }
          }
        ]
      
      case 'distortion':
        return [
          { 
            name: 'Normal', 
            texture: demoTextures.arrows,
            material: { map: demoTextures.arrows, roughness: 0.4 },
            transform: { repeat: [1, 1], offset: [0, 0] }
          },
          { 
            name: 'Stretch X', 
            texture: demoTextures.arrows,
            material: { map: demoTextures.arrows, roughness: 0.4 },
            transform: { repeat: [0.5, 1], offset: [0, 0] }
          },
          { 
            name: 'Stretch Y', 
            texture: demoTextures.arrows,
            material: { map: demoTextures.arrows, roughness: 0.4 },
            transform: { repeat: [1, 0.5], offset: [0, 0] }
          }
        ]
      
      default:
        return []
    }
  }, [demonstrationType, demoTextures])

  // Animación sutil
  useFrame((state) => {
    meshRefs.current.forEach((mesh, index) => {
      if (mesh) {
        mesh.rotation.y = Math.sin(state.clock.elapsedTime + index) * 0.1
      }
    })
  })

  return (
    <group position={position}>
      {demoConfigs.map((config, index) => {
        const material = new MeshStandardMaterial(config.material)
        
        // Aplicar transformaciones UV
        if (config.transform) {
          if (config.transform.repeat) {
            material.map.repeat.set(...config.transform.repeat)
          }
          if (config.transform.offset) {
            material.map.offset.set(...config.transform.offset)
          }          if (config.transform.wrapS) {
            const wrapModes = {
              'RepeatWrapping': RepeatWrapping,
              'ClampToEdgeWrapping': ClampToEdgeWrapping,
              'MirroredRepeatWrapping': MirroredRepeatWrapping
            }
            material.map.wrapS = wrapModes[config.transform.wrapS]
            material.map.wrapT = wrapModes[config.transform.wrapS]
          }
        }

        return (
          <group key={index} position={[0, index * 3 - 3, 0]}>
            <mesh
              ref={(el) => meshRefs.current[index] = el}
              position={[0, 0, 0]}
            >
              <boxGeometry args={[2, 2, 2]} />
              <primitive object={material} attach="material" />
            </mesh>
            
            {showLabels && (
              <Text
                position={[0, -1.5, 0]}
                fontSize={0.3}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {config.name}
              </Text>
            )}
          </group>
        )
      })}
      
      {showLabels && (
        <Text
          position={[0, 4, 0]}
          fontSize={0.4}
          color="yellow"
          anchorX="center"
          anchorY="middle"
        >
          Demo: {demonstrationType.charAt(0).toUpperCase() + demonstrationType.slice(1)}
        </Text>
      )}
    </group>
  )
}

export default TextureDemo
