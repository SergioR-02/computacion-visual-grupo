import { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, useAnimations, Html, Environment } from '@react-three/drei'
import { useAnimationController, useKeyboardControls } from './components/AnimationController'
import { AnimationControls, InfoPanel, LoadingScreen, HelpOverlay } from './components/UIComponents'
import './App.css'

// Componente para manejar el modelo 3D con animaciones
function AnimatedModel({ currentAnimation, onAnimationComplete, animationController }) {
  const group = useRef()
  const { scene, animations } = useGLTF('/Untitled.glb')
  const { actions } = useAnimations(animations, group)

  // Estados locales
  const [hovered, setHovered] = useState(false)
  const [clickEffect, setClickEffect] = useState(false)

  // Inicializar el controlador de animaciones con las acciones
  useEffect(() => {
    if (Object.keys(actions).length > 0) {
      console.log('🎭 Animaciones disponibles:', Object.keys(actions))
      // Inicializar la primera animación
      if (actions.ARM) {
        actions.ARM.play()
      }
    }
  }, [actions])

  // Manejar cambio de animación principal
  useEffect(() => {
    console.log(`🎬 Procesando cambio de animación: ${currentAnimation}`)
    
    // Caso especial: parar todas las animaciones
    if (currentAnimation === null) {
      console.log('⏹️ Parando todas las animaciones')
      Object.values(actions).forEach(action => {
        if (action) {
          action.fadeOut(0.5)
        }
      })
      return
    }

    // Verificar que la animación existe
    if (!actions[currentAnimation]) {
      console.warn(`⚠️ Animación '${currentAnimation}' no encontrada`)
      return
    }

    console.log(`🎬 Cambiando a animación: ${currentAnimation}`)

    // Parar todas las animaciones actuales con transición suave
    Object.entries(actions).forEach(([name, action]) => {
      if (name !== currentAnimation && action) {
        action.fadeOut(0.3)
      }
    })

    // Iniciar la nueva animación
    const action = actions[currentAnimation]
    if (action) {
      action.reset().fadeIn(0.5).play()
    }
  }, [currentAnimation, actions])

  // Efecto de hover - preview temporal con método simplificado
  useEffect(() => {
    if (!actions.ARM || !hovered) return

    console.log('🖱️ Hover activado - mostrando preview ARM')
    
    // Solo mostrar preview si no estamos ya en ARM
    if (currentAnimation !== 'ARM') {
      // Mostrar ARM como preview temporal
      const currentAction = actions[currentAnimation]
      const armAction = actions.ARM
      
      if (currentAction) {
        currentAction.setEffectiveWeight(0.3)
      }
      
      armAction.reset().setEffectiveWeight(0.7).play()
    }

    // Cleanup cuando se quita el hover
    return () => {
      if (currentAnimation !== 'ARM' && actions[currentAnimation]) {
        actions[currentAnimation].setEffectiveWeight(1.0)
        if (actions.ARM) {
          actions.ARM.fadeOut(0.3)
        }
      }
    }
  }, [hovered, currentAnimation, actions])

  // Manejar click para activar WALK
  const handleClick = (e) => {
    e.stopPropagation()
    console.log('🖱️ Click detectado - cambiando a WALK')
    
    // Efecto visual de click
    setClickEffect(true)
    setTimeout(() => setClickEffect(false), 300)
    
    // Cambiar a animación WALK
    onAnimationComplete('WALK')
  }

  // Manejar hover enter
  const handlePointerOver = (e) => {
    e.stopPropagation()
    console.log('🖱️ Pointer Over - hover activado')
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  // Manejar hover exit
  const handlePointerOut = (e) => {
    e.stopPropagation()
    console.log('🖱️ Pointer Out - hover desactivado')
    setHovered(false)
    document.body.style.cursor = 'auto'
  }

  return (
    <group 
      ref={group} 
      dispose={null}
      position={[0, -1, 0]}
      scale={clickEffect ? 1.6 : 1.5}
    >
      {/* Modelo 3D con eventos directos */}
      <primitive 
        object={scene} 
        castShadow 
        receiveShadow 
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      
      {/* Efectos visuales */}
      {hovered && (
        <>
          {/* Indicador de hover */}
          <Html position={[0, 2.5, 0]} center>
            <div style={{
              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              animation: 'fadeIn 0.3s ease-out',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              pointerEvents: 'none'
            }}>
              🖱️ Click para WALK
            </div>
          </Html>
          
          {/* Efecto de brillo alrededor del modelo */}
          <pointLight 
            position={[0, 1, 0]} 
            intensity={0.5} 
            color="#4CAF50"
            distance={3}
          />
        </>
      )}

      {/* Efecto de click */}
      {clickEffect && (
        <Html position={[0, 1, 0]} center>
          <div style={{
            width: '100px',
            height: '100px',
            border: '3px solid #4CAF50',
            borderRadius: '50%',
            animation: 'clickPulse 0.3s ease-out',
            pointerEvents: 'none'
          }}>
          </div>
        </Html>
      )}
    </group>
  )
}

// Componente principal de la escena 3D
function Scene() {
  const [isLoading, setIsLoading] = useState(true)
  const [showHelp, setShowHelp] = useState(false)

  // Simulación de carga del modelo
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Mostrar ayuda por primera vez
      setTimeout(() => setShowHelp(true), 1000)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Mock para el controlador de animaciones (se inicializará con las acciones reales)
  const mockController = {
    currentAnimation: 'ARM',
    isTransitioning: false,
    animationHistory: ['ARM'],
    changeAnimation: () => {},
    playTemporaryAnimation: () => {},
    getNextAnimation: () => 'CROUCHED'
  }

  // Usar el mock por ahora, se reemplazará cuando las acciones estén disponibles
  const [currentAnimation, setCurrentAnimation] = useState('ARM')
  const [animationHistory, setAnimationHistory] = useState(['ARM'])
  const [isTransitioning, setIsTransitioning] = useState(false)

  const changeAnimation = (animationName) => {
    console.log(`🎮 Comando de animación recibido: ${animationName}`)
    
    // Caso especial: parar todas las animaciones (ESC)
    if (animationName === null) {
      console.log('⏹️ Parando todas las animaciones (ESC)')
      setCurrentAnimation(null)
      setAnimationHistory(prev => [...prev.slice(-4), 'PAUSED'])
      return
    }
    
    // Cambio normal de animación
    if (animationName !== currentAnimation && !isTransitioning) {
      console.log(`🔄 Cambiando animación de ${currentAnimation} a ${animationName}`)
      setIsTransitioning(true)
      setCurrentAnimation(animationName)
      setAnimationHistory(prev => [...prev.slice(-4), animationName])
      
      // Simular tiempo de transición
      setTimeout(() => setIsTransitioning(false), 500)
    }
  }

  const getNextAnimation = () => {
    const animations = ['ARM', 'CROUCHED', 'WALK']
    const currentIndex = animations.indexOf(currentAnimation)
    return animations[(currentIndex + 1) % animations.length]
  }

  // Configurar controles de teclado
  useKeyboardControls(changeAnimation, getNextAnimation)

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <>
      {/* Controles de UI */}
      <AnimationControls
        currentAnimation={currentAnimation}
        animationHistory={animationHistory}
        onAnimationChange={changeAnimation}
        isTransitioning={isTransitioning}
      />

      {/* Panel de información */}
      <InfoPanel />

      {/* Botón de ayuda */}
      <button
        onClick={() => setShowHelp(true)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        title="Mostrar ayuda"
      >
        ❓
      </button>

      {/* Overlay de ayuda */}
      <HelpOverlay 
        isVisible={showHelp} 
        onClose={() => setShowHelp(false)} 
      />

      {/* Canvas de Three.js */}
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ width: '100vw', height: '100vh' }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        {/* Entorno y iluminación */}
        <Environment preset="studio" />
        <fog attach="fog" args={['#f0f0f0', 10, 50]} />
        
        {/* Iluminación principal */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        
        {/* Luces de acento */}
        <pointLight position={[-5, 5, -5]} intensity={0.3} color="#64b5f6" />
        <pointLight position={[5, 2, 5]} intensity={0.2} color="#ffb74d" />

        {/* Modelo 3D animado */}
        <AnimatedModel 
          currentAnimation={currentAnimation}
          onAnimationComplete={changeAnimation}
          animationController={mockController}
        />

        {/* Controles de cámara */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={12}
          minDistance={2}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0, 0]}
          enableDamping={true}
          dampingFactor={0.05}
          makeDefault={false}
        />

        {/* Piso con patrón */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial 
            color="#f8f8f8" 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Grid de referencia mejorado */}
        <gridHelper 
          args={[20, 20, '#bdbdbd', '#e0e0e0']} 
          position={[0, -0.99, 0]} 
        />

        {/* Elementos decorativos */}
        <group position={[0, 0, -8]}>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#e3f2fd" />
          </mesh>
        </group>
      </Canvas>

      {/* CSS adicional para animaciones */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes clickPulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </>
  )
}

function App() {
  return <Scene />
}

export default App
