import { useRef, useEffect, useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Avatar({
  position,
  selectedColor,
  isAnimationPlaying,
  onAnimationChange,
  animationIndex,
  onModelLoad,
}) {
  const group = useRef()
  const [model, setModel] = useState(null)

  // Modelo local colocado en la carpeta public
  const modelUrl = '/modelo.glb'

  // Cargar modelo
  const { scene, animations } = useGLTF(modelUrl)
  const { actions, names } = useAnimations(animations, group)

  // Lista de animaciones disponibles - usar las reales del modelo
  const animationNames = names.length > 0 ? names : []

  // Debug: mostrar animaciones disponibles en consola
  useEffect(() => {
    if (names.length > 0) {
      console.log('🎭 Animaciones detectadas:', names)
    } else {
      console.log('⚠️ No se encontraron animaciones en el modelo')
    }
  }, [names])

  useEffect(() => {
    if (scene) {
      // Clonar la escena para evitar problemas con múltiples instancias
      const clonedScene = scene.clone()
      setModel(clonedScene)

      // Enviar información del modelo al componente padre
      onModelLoad?.(clonedScene, animations)
    }
  }, [scene, animations, onModelLoad])

  // Manejar cambios de color - más genérico para cualquier modelo
  useEffect(() => {
    if (model && selectedColor) {
      console.log('🎨 Aplicando color:', selectedColor.toString(16))

      model.traverse(child => {
        if (child.isMesh && child.material) {
          // Buscar materiales que podrían ser personalizables (más amplio)
          const childName = child.name?.toLowerCase() || ''
          const materialName = child.material.name?.toLowerCase() || ''

          // Condiciones más amplias para detectar ropa/accesorios
          const isCustomizable =
            childName.includes('shirt') ||
            childName.includes('cloth') ||
            childName.includes('top') ||
            childName.includes('body') ||
            childName.includes('torso') ||
            materialName.includes('cloth') ||
            materialName.includes('fabric') ||
            materialName.includes('shirt') ||
            // Si no encuentra nada específico, personalizar el primer material con color
            (!childName.includes('eye') &&
              !childName.includes('hair') &&
              !childName.includes('skin'))

          if (isCustomizable) {
            console.log('🎯 Personalizando:', childName, materialName)

            // Si el material es un array (múltiples materiales)
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat.color && mat.type !== 'MeshBasicMaterial') {
                  mat.color.setHex(selectedColor)
                  mat.needsUpdate = true
                }
              })
            } else {
              // Material único
              if (
                child.material.color &&
                child.material.type !== 'MeshBasicMaterial'
              ) {
                child.material.color.setHex(selectedColor)
                child.material.needsUpdate = true
              }
            }
          }
        }
      })
    }
  }, [model, selectedColor])

  // Manejar animaciones
  useEffect(() => {
    if (actions && animationNames.length > 0) {
      // Detener todas las animaciones
      Object.values(actions).forEach(action => action?.stop())

      if (isAnimationPlaying && animationIndex < animationNames.length) {
        const currentAnimation = animationNames[animationIndex]
        const action = actions[currentAnimation]

        if (action) {
          action.reset()
          action.play()

          // Notificar cambio de animación
          onAnimationChange?.(currentAnimation)
        }
      }
    }
  }, [
    actions,
    isAnimationPlaying,
    animationIndex,
    animationNames,
    onAnimationChange,
  ])

  // Rotación suave del avatar
  useFrame(state => {
    if (group.current && !isAnimationPlaying) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  if (!model) {
    return (
      <mesh position={position}>
        <boxGeometry args={[0.5, 1.8, 0.3]} />
        <meshStandardMaterial color='#cccccc' />
      </mesh>
    )
  }

  return (
    <group ref={group} position={position} scale={[1, 1, 1]}>
      <primitive object={model} position={[0, -2.5, 0]} />
    </group>
  )
}

// Precargar el modelo local
useGLTF.preload('/modelo.glb')
