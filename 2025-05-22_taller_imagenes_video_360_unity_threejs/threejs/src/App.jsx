import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Scene360 from './components/Scene360'
import VideoScene360 from './components/VideoScene360'
import './App.css'

// Lista de imágenes 360° disponibles
const IMAGES_360 = [
  { id: 1, src: '/img_equirectangulares.jpeg', name: 'Imagen 1' },
  // { id: 2, src: '/img_equirectangulares2.jpeg', name: 'Imagen 2' },
  // { id: 3, src: '/img_equirectangulares3.jpg', name: 'Imagen 3' },
  { id: 4, src: '/img_equirectangulares4.jpeg', name: 'Imagen 4' },
  { id: 5, src: '/img_equirectangulares5.jpg', name: 'Imagen 5' },
  { id: 6, src: '/img_equirectangulares6.jpg', name: 'Imagen 6' },
]

function App() {
  const [currentScene, setCurrentScene] = useState('image') // 'image' or 'video'
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isUIVisible, setIsUIVisible] = useState(true)

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % IMAGES_360.length)
  }

  const toggleUI = () => {
    setIsUIVisible(!isUIVisible)
  }

  return (
    <div className='app'>
      {/* Panel de controles principal */}
      <div className={`controls ${!isUIVisible ? 'hidden' : ''}`}>
        <h1>🌀 Taller - Visualización 360°</h1>

        {/* Botones de escena */}
        <div className='buttons'>
          <button
            className={currentScene === 'image' ? 'active' : ''}
            onClick={() => setCurrentScene('image')}
          >
            📷 Imagen 360°
          </button>
          <button
            className={currentScene === 'video' ? 'active' : ''}
            onClick={() => setCurrentScene('video')}
          >
            🎥 Video 360°
          </button>
        </div>

        {/* Controles específicos para imagen */}
        {currentScene === 'image' && (
          <div className='image-controls'>
            <button className='image-nav-btn' onClick={nextImage}>
              🔄 Siguiente Imagen ({currentImageIndex + 1}/{IMAGES_360.length})
            </button>
            <p className='current-image'>
              📸 {IMAGES_360[currentImageIndex].name}
            </p>
          </div>
        )}

        <div className='instructions'>
          <p>🖱️ Arrastra para mirar alrededor</p>
          <p>🔄 Usa la rueda del ratón para zoom</p>
          <p>⌨️ Presiona 1 para imagen, 2 para video</p>
        </div>
      </div>

      {/* Botón flotante para mostrar/ocultar UI */}
      <button
        className={`ui-toggle-btn ${!isUIVisible ? 'ui-hidden' : ''}`}
        onClick={toggleUI}
        title={
          isUIVisible ? 'Ocultar interfaz (ESC)' : 'Mostrar interfaz (ESC)'
        }
      >
        {isUIVisible ? '🙈' : '👁️'}
      </button>

      <Canvas
        camera={{ position: [0, 0, 0.1], fov: 75 }}
        style={{ height: '100vh', width: '100%' }}
      >
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={-0.5}
        />

        {currentScene === 'image' ? (
          <Scene360 currentImage={IMAGES_360[currentImageIndex]} />
        ) : (
          <VideoScene360 />
        )}
      </Canvas>

      {/* Event listeners para controles de teclado */}
      <KeyboardControls
        setCurrentScene={setCurrentScene}
        nextImage={nextImage}
        toggleUI={toggleUI}
      />
    </div>
  )
}

// Component for keyboard controls
function KeyboardControls({ setCurrentScene, nextImage, toggleUI }) {
  React.useEffect(() => {
    const handleKeyPress = event => {
      switch (event.key) {
        case '1':
          setCurrentScene('image')
          break
        case '2':
          setCurrentScene('video')
          break
        case 'n':
        case 'N':
          nextImage()
          break
        case 'Escape':
          toggleUI()
          break
        case 'h':
        case 'H':
          toggleUI()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [setCurrentScene, nextImage, toggleUI])

  return null
}

export default App
