import React, { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

function VideoSphere({ onVideoReady, isPlaying, showMessage }) {
  const meshRef = useRef()
  const videoRef = useRef()
  const [videoTexture, setVideoTexture] = useState(null)

  useEffect(() => {
    // Crear el elemento de video
    const video = document.createElement('video')
    video.src = '/video360.mp4' // Placeholder - el usuario necesitará añadir este archivo
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true // Necesario para autoplay en navegadores modernos
    video.playsInline = true

    videoRef.current = video

    // Crear la textura de video
    const texture = new THREE.VideoTexture(video)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.format = THREE.RGBFormat

    setVideoTexture(texture)

    // Event listeners para el video
    const handleCanPlay = () => {
      onVideoReady(true, () => {
        if (isPlaying) {
          video.play().catch(console.error)
        } else {
          video.pause()
        }
      })
    }

    const handleError = () => {
      console.log('Error cargando video - usando video de demostración')
      onVideoReady(false, null)
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.pause()
      video.src = ''
    }
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error)
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[10, 60, 40]} />
      <meshBasicMaterial
        map={videoTexture}
        side={THREE.BackSide}
        color={showMessage ? '#444' : 'white'}
      />
    </mesh>
  )
}

function VideoScene360() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showMessage, setShowMessage] = useState(true)
  const [togglePlayCallback, setTogglePlayCallback] = useState(null)

  const handleVideoReady = (ready, callback) => {
    setShowMessage(!ready)
    setTogglePlayCallback(() => callback)
  }

  const togglePlayPause = () => {
    if (togglePlayCallback) {
      setIsPlaying(!isPlaying)
    }
  }

  // Renderizar controles fuera del Canvas usando effects
  useEffect(() => {
    const controlsDiv = document.createElement('div')
    controlsDiv.id = 'video-controls-portal'
    document.body.appendChild(controlsDiv)

    return () => {
      const existingDiv = document.getElementById('video-controls-portal')
      if (existingDiv) {
        document.body.removeChild(existingDiv)
      }
    }
  }, [])

  useEffect(() => {
    const controlsDiv = document.getElementById('video-controls-portal')
    if (controlsDiv) {
      controlsDiv.innerHTML = ''

      const controls = document.createElement('div')
      controls.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 100;
        background: rgba(0, 0, 0, 0.8);
        padding: 15px 25px;
        border-radius: 25px;
        display: flex;
        align-items: center;
        gap: 15px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      `

      if (showMessage) {
        controls.innerHTML = `
          <div style="color: #ff6b6b; font-size: 0.9rem;">
            ⚠️ Añade video360.mp4 a la carpeta public
          </div>
        `
      } else {
        const button = document.createElement('button')
        button.style.cssText = `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          padding: 10px 15px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.3s ease;
        `
        button.innerHTML = isPlaying ? '⏸️ Pausar' : '▶️ Reproducir'
        button.onclick = togglePlayPause

        const span = document.createElement('span')
        span.style.cssText = 'color: #ccc; font-size: 0.9rem;'
        span.textContent = 'Video 360° - Navegación libre'

        controls.appendChild(button)
        controls.appendChild(span)
      }

      controlsDiv.appendChild(controls)
    }
  }, [isPlaying, togglePlayPause, showMessage])

  return (
    <>
      <VideoSphere
        onVideoReady={handleVideoReady}
        isPlaying={isPlaying}
        showMessage={showMessage}
      />
      <ambientLight intensity={1} />
    </>
  )
}

export default VideoScene360
