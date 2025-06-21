import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Stats } from '@react-three/drei'
import * as THREE from 'three'
import ParticleSystem from './ParticleSystem'

// Componente para el objeto 3D que se actualiza con datos del WebSocket
function AnimatedCube({ data, isConnected }) {
  const meshRef = useRef()

  useFrame((state, delta) => {
    if (meshRef.current && isConnected) {
      // Rotación suave automática
      meshRef.current.rotation.x += delta * 0.2
      meshRef.current.rotation.y += delta * 0.1
    }
  })

  // Actualizar propiedades cuando llegan nuevos datos
  useEffect(() => {
    if (meshRef.current && data) {
      // Actualizar posición
      if (data.object?.position) {
        meshRef.current.position.set(
          data.object.position.x,
          data.object.position.y,
          data.object.position.z
        )
      }

      // Actualizar escala
      if (data.object?.scale) {
        const scale = data.object.scale
        meshRef.current.scale.set(scale, scale, scale)
      }

      // Actualizar color
      if (data.object?.color && meshRef.current.material) {
        meshRef.current.material.color.setRGB(
          data.object.color.r,
          data.object.color.g,
          data.object.color.b
        )
      }
    }
  }, [data])

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={isConnected ? '#00ff88' : '#ff4444'}
        wireframe={!isConnected}
      />
    </mesh>
  )
}

// Componente para mostrar datos de sensores
function SensorDisplay({ data, position }) {
  if (!data?.sensors) return null

  const { heartRate, temperature, motion } = data.sensors

  return (
    <group position={position}>
      <Text fontSize={0.3} color='#ffffff' anchorX='left' anchorY='top'>
        {`❤️ ${heartRate?.toFixed(0)} BPM\n🌡️ ${temperature?.toFixed(
          1
        )}°C\n🏃 ${motion?.toFixed(0)}%`}
      </Text>
    </group>
  )
}

// Componente principal de visualización WebSocket
export default function WebSocketVisualization() {
  const [websocketData, setWebsocketData] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('Disconnected')
  const [isConnected, setIsConnected] = useState(false)
  const websocketRef = useRef(null)

  // Función para conectar al WebSocket
  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:8765')
      websocketRef.current = ws

      ws.onopen = () => {
        console.log('✅ Conectado al servidor WebSocket')
        setConnectionStatus('Connected')
        setIsConnected(true)
      }

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data)
          setWebsocketData(data)
        } catch (error) {
          console.error('Error parseando datos JSON:', error)
        }
      }

      ws.onclose = () => {
        console.log('🔌 Conexión cerrada')
        setConnectionStatus('Disconnected')
        setIsConnected(false)

        // Intentar reconectar después de 3 segundos
        setTimeout(() => {
          if (websocketRef.current?.readyState === WebSocket.CLOSED) {
            connectWebSocket()
          }
        }, 3000)
      }

      ws.onerror = error => {
        console.error('❌ Error WebSocket:', error)
        setConnectionStatus('Error')
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Error creando WebSocket:', error)
      setConnectionStatus('Error')
    }
  }

  // Conectar automáticamente al montar el componente
  useEffect(() => {
    connectWebSocket()

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close()
      }
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      {/* Panel de información */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          color: 'white',
          fontFamily: 'monospace',
          background: 'rgba(0,0,0,0.7)',
          padding: '15px',
          borderRadius: '8px',
        }}
      >
        <h3>🌐 WebSocket Visualization</h3>
        <p>
          Estado:{' '}
          <span
            style={{
              color: isConnected ? '#00ff88' : '#ff4444',
            }}
          >
            {connectionStatus}
          </span>
        </p>
        {websocketData && (
          <>
            <p>Timestamp: {websocketData.timestamp}</p>
            <p>
              Posición: ({websocketData.object?.position?.x?.toFixed(2)},{' '}
              {websocketData.object?.position?.y?.toFixed(2)})
            </p>
          </>
        )}
      </div>

      {/* Botón de reconexión */}
      {!isConnected && (
        <button
          onClick={connectWebSocket}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '10px 20px',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          🔄 Reconectar
        </button>
      )}

      {/* Escena 3D */}
      <Canvas camera={{ position: [5, 5, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Controles de cámara */}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

        {/* Objeto principal animado */}
        <AnimatedCube data={websocketData} isConnected={isConnected} />

        {/* Sistema de partículas reactivo */}
        <ParticleSystem data={websocketData} isConnected={isConnected} />

        {/* Display de sensores */}
        <SensorDisplay data={websocketData} position={[3, 2, 0]} />

        {/* Grid de referencia */}
        <gridHelper args={[10, 10]} />

        {/* Ejes de coordenadas */}
        <axesHelper args={[2]} />

        {/* Estadísticas de rendimiento */}
        <Stats />
      </Canvas>
    </div>
  )
}
