import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { soundManager, animationSoundEvents } from '../utils/SoundManager'

function AnimatedModel({ 
  modelPath, 
  currentAnimation, 
  setCurrentAnimation, 
  setAvailableAnimations, 
  isPlaying, 
  animationSpeed,
  soundEnabled = true, // Nueva prop para controlar el sonido
  soundVolume = 0.8, // Nueva prop para el volumen
  onSoundEvent // Nueva prop para manejar eventos de sonido en la UI
}) {
  const group = useRef()
  const { scene, animations } = useGLTF(modelPath)
  const { actions, mixer } = useAnimations(animations, group)
  
  // Estados para manejo de eventos de sonido
  const [soundsLoaded, setSoundsLoaded] = useState(false)
  const [lastEventTimes, setLastEventTimes] = useState(new Map())
  const [currentAction, setCurrentAction] = useState(null)

  // Configurar animaciones disponibles cuando el modelo se carga
  useEffect(() => {
    if (animations && animations.length > 0) {
      const animNames = animations.map(clip => clip.name)
      setAvailableAnimations(animNames)
      
      // Si no hay animación seleccionada, usar la primera
      if (!currentAnimation && animNames.length > 0) {
        setCurrentAnimation(animNames[0])
      }
    }
  }, [animations, setAvailableAnimations, currentAnimation, setCurrentAnimation])
  // Controlar la reproducción de animaciones
  useEffect(() => {
    if (!actions || !currentAnimation) return

    // Detener todas las animaciones
    Object.values(actions).forEach(action => {
      if (action) {
        action.stop()
        action.reset()
      }
    })

    // Reproducir la animación seleccionada
    const action = actions[currentAnimation]
    if (action) {
      action.reset()
      action.play()
      action.setLoop(2) // Loop infinito
      setCurrentAction(action) // Guardar referencia para eventos de sonido
      
      // Resetear eventos de sonido para nueva animación
      setLastEventTimes(new Map())
    }
  }, [actions, currentAnimation])

  // Controlar pausa/reproducción
  useEffect(() => {
    if (!actions || !currentAnimation) return

    const action = actions[currentAnimation]
    if (action) {
      if (isPlaying) {
        action.paused = false
      } else {
        action.paused = true
      }
    }
  }, [actions, currentAnimation, isPlaying])

  // Controlar velocidad de animación
  useEffect(() => {
    if (!actions || !currentAnimation) return

    const action = actions[currentAnimation]
    if (action) {
      action.setEffectiveTimeScale(animationSpeed)
      setCurrentAction(action) // Actualizar referencia
    }
  }, [actions, currentAnimation, animationSpeed])

  // Actualizar el mixer en cada frame y disparar eventos de sonido
  useFrame((state, delta) => {
    if (mixer && isPlaying) {
      mixer.update(delta)
      
      // Disparar eventos de sonido si hay una animación activa
      if (currentAction && soundEnabled && soundsLoaded) {
        const animationType = getAnimationType(currentAnimation)
        triggerSoundEvents(currentAction, animationType)
      }
    }
  })

  // Configurar sombras para el modelo
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
  }, [scene])
  // Inicializar sistema de sonidos
  useEffect(() => {
    const initSounds = async () => {
      if (soundEnabled && !soundsLoaded) {
        await soundManager.preloadSounds()
        setSoundsLoaded(true)
      }
    }
    initSounds()
  }, [soundEnabled, soundsLoaded])

  // Actualizar volumen global cuando cambie
  useEffect(() => {
    soundManager.setGlobalVolume(soundVolume)
  }, [soundVolume])

  // Función para obtener el tipo de animación basado en el nombre
  const getAnimationType = (animationName) => {
    if (!animationName) return 'walk'
    
    const name = animationName.toLowerCase()
    if (name.includes('jump') || name.includes('salto')) return 'jump'
    if (name.includes('rumba') || name.includes('dance') || name.includes('baile')) return 'rumba'
    if (name.includes('stairs') || name.includes('escaleras') || name.includes('step')) return 'stairs'
    if (name.includes('run') || name.includes('correr')) return 'run'
    return 'walk'
  }

  // Función para disparar eventos de sonido
  const triggerSoundEvents = (action, animationType) => {
    if (!soundEnabled || !soundsLoaded || !action) return

    const currentTime = action.time
    const duration = action.getClip().duration
    const normalizedTime = (currentTime % duration) / duration

    const events = animationSoundEvents[animationType] || animationSoundEvents['walk']
    
    events.forEach((event, index) => {
      const eventKey = `${animationType}-${index}`
      const lastEventTime = lastEventTimes.get(eventKey) || -1
        // Verificar si es tiempo de disparar el evento
      if (normalizedTime >= event.time && currentTime > lastEventTime + (duration * 0.8)) {
        soundManager.playSound(
          event.sound, 
          (event.volume || 0.5) * soundVolume, 
          event.playbackRate || animationSpeed
        )
        
        // Disparar evento visual en la UI
        if (onSoundEvent) {
          onSoundEvent({
            type: event.sound,
            animation: animationType,
            time: Date.now()
          })
        }
        
        // Actualizar el tiempo del último evento
        setLastEventTimes(prev => new Map(prev.set(eventKey, currentTime)))
      }
    })
  }

  return (
    <group ref={group} dispose={null}>
      <primitive 
        object={scene} 
        scale={[1, 1, 1]} 
        position={[0, 0, 0]}
      />
    </group>
  )
}

// Precargar todos los modelos con las rutas correctas
useGLTF.preload('/Dorchester3D.com_Rumba+Dancing/Rumba Dancing.glb')
useGLTF.preload('/ImageToStl.com_Jump/Jump.glb')
useGLTF.preload('/ImageToStl.com_Running+Up+Stairs/Running Up Stairs.glb')

export default AnimatedModel
