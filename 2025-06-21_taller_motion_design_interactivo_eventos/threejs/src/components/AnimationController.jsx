import { useState, useEffect } from 'react'

/**
 * Hook personalizado para manejar las animaciones del modelo 3D
 * @param {Object} actions - Acciones de animación de useAnimations
 * @param {string} initialAnimation - Animación inicial
 */
export const useAnimationController = (actions, initialAnimation = 'ARM') => {
  const [currentAnimation, setCurrentAnimation] = useState(initialAnimation)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [animationHistory, setAnimationHistory] = useState([initialAnimation])

  // Función para cambiar animación con transiciones suaves
  const changeAnimation = (animationName, fadeTime = 0.5) => {
    if (animationName === currentAnimation || isTransitioning) return

    setIsTransitioning(true)

    // Fade out de la animación actual
    if (currentAnimation && actions[currentAnimation]) {
      actions[currentAnimation].fadeOut(fadeTime / 2)
    }

    // Fade in de la nueva animación
    if (actions[animationName]) {
      setTimeout(() => {
        actions[animationName]
          .reset()
          .fadeIn(fadeTime / 2)
          .play()
        
        setCurrentAnimation(animationName)
        setAnimationHistory(prev => [...prev.slice(-4), animationName])
        
        setTimeout(() => setIsTransitioning(false), fadeTime * 1000 / 2)
      }, fadeTime * 1000 / 2)
    }
  }

  // Función para reproducir animación temporal (hover effect)
  const playTemporaryAnimation = (animationName, duration = 2000) => {
    if (!actions[animationName] || isTransitioning) return

    const originalAnimation = currentAnimation
    
    // Cambiar temporalmente
    if (actions[currentAnimation]) {
      actions[currentAnimation].fadeOut(0.3)
    }
    
    actions[animationName].reset().fadeIn(0.3).play()

    // Volver a la animación original después del tiempo especificado
    setTimeout(() => {
      if (actions[animationName]) {
        actions[animationName].fadeOut(0.3)
      }
      if (actions[originalAnimation]) {
        actions[originalAnimation].reset().fadeIn(0.3).play()
      }
    }, duration)
  }

  // Función para parar todas las animaciones
  const stopAllAnimations = () => {
    Object.values(actions).forEach(action => {
      if (action) {
        action.fadeOut(0.5)
      }
    })
    setCurrentAnimation(null)
  }

  // Función para obtener la siguiente animación en la secuencia
  const getNextAnimation = () => {
    const animations = ['ARM', 'CROUCHED', 'WALK']
    const currentIndex = animations.indexOf(currentAnimation)
    return animations[(currentIndex + 1) % animations.length]
  }

  return {
    currentAnimation,
    isTransitioning,
    animationHistory,
    changeAnimation,
    playTemporaryAnimation,
    stopAllAnimations,
    getNextAnimation,
    availableAnimations: Object.keys(actions)
  }
}

/**
 * Mapeo de teclas a animaciones para controles de teclado
 */
export const ANIMATION_KEYS = {
  '1': 'ARM',
  '2': 'CROUCHED', 
  '3': 'WALK',
  'a': 'ARM',
  'c': 'CROUCHED',
  'w': 'WALK'
}

/**
 * Configuración de animaciones con metadatos
 */
export const ANIMATION_CONFIG = {
  ARM: {
    name: 'ARM',
    displayName: '💪 ARM',
    description: 'Animación de brazos',
    key: '1',
    color: '#ff6b6b'
  },
  CROUCHED: {
    name: 'CROUCHED',
    displayName: '🦆 CROUCHED',
    description: 'Posición agachado',
    key: '2',
    color: '#4ecdc4'
  },
  WALK: {
    name: 'WALK',
    displayName: '🚶 WALK',
    description: 'Animación de caminar',
    key: '3',
    color: '#45b7d1'
  }
}

/**
 * Hook para manejar eventos de teclado para animaciones
 * @param {Function} changeAnimation - Función para cambiar animación
 * @param {Function} getNextAnimation - Función para obtener siguiente animación
 */
export const useKeyboardControls = (changeAnimation, getNextAnimation) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key.toLowerCase()
      console.log(`⌨️ Tecla presionada: "${key}" (código: ${event.code})`)
      
      // Prevenir comportamiento por defecto para ciertas teclas
      if ([' ', 'r', 'escape'].includes(key)) {
        event.preventDefault()
        console.log(`🚫 Prevenido comportamiento por defecto para: ${key}`)
      }

      if (ANIMATION_KEYS[key]) {
        console.log(`🎯 Cambiando a animación: ${ANIMATION_KEYS[key]}`)
        changeAnimation(ANIMATION_KEYS[key])
      } else {
        switch(key) {
          case ' ':
            // Espacio para siguiente animación
            const nextAnim = getNextAnimation()
            console.log(`⏭️ Siguiente animación: ${nextAnim}`)
            changeAnimation(nextAnim)
            break
          case 'r':
            // Reset a animación inicial
            console.log(`🔄 Reset a ARM`)
            changeAnimation('ARM')
            break
          case 'escape':
            // Parar todas las animaciones
            console.log(`⏹️ Parando todas las animaciones (ESC)`)
            changeAnimation(null)
            break
          default:
            console.log(`❓ Tecla no reconocida: ${key}`)
        }
      }
    }

    console.log('🎮 Eventos de teclado configurados')
    window.addEventListener('keydown', handleKeyPress)
    
    return () => {
      console.log('🎮 Limpiando eventos de teclado')
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [changeAnimation, getNextAnimation])
}
