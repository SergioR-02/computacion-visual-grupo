import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function Player({ onPositionChange }) {
  const playerRef = useRef()
  const { camera } = useThree()
  
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false
  })

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if (keys.current.hasOwnProperty(key)) {
        keys.current[key] = true
      }
    }

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase()
      if (keys.current.hasOwnProperty(key)) {
        keys.current[key] = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    if (!playerRef.current) return

    const speed = 5 * delta
    const direction = new THREE.Vector3()

    if (keys.current.w) direction.z -= 1
    if (keys.current.s) direction.z += 1
    if (keys.current.a) direction.x -= 1
    if (keys.current.d) direction.x += 1

    direction.normalize().multiplyScalar(speed)
    
    if (direction.length() > 0) {
      playerRef.current.position.add(direction)
      
      // Rotar hacia la dirección del movimiento
      const angle = Math.atan2(direction.x, direction.z)
      playerRef.current.rotation.y = angle
    }    // Mantener el jugador dentro de los límites del mapa ampliado
    playerRef.current.position.x = Math.max(-18, Math.min(18, playerRef.current.position.x))
    playerRef.current.position.z = Math.max(-18, Math.min(18, playerRef.current.position.z))
    
    // Reportar posición al UI
    if (onPositionChange) {
      onPositionChange(playerRef.current.position)
    }
  })
  return (
    <group ref={playerRef} position={[0, 0.5, 5]} castShadow name="player">
      {/* Cuerpo */}
      <mesh position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.3, 1]} />
        <meshLambertMaterial color="#4169E1" />
      </mesh>
      
      {/* Cabeza */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.22]} />
        <meshLambertMaterial color="#4169E1" />
      </mesh>
      
      {/* Ojos */}
      <mesh position={[0.08, 0.85, 0.18]} castShadow>
        <sphereGeometry args={[0.04]} />
        <meshLambertMaterial color="white" />
      </mesh>
      <mesh position={[-0.08, 0.85, 0.18]} castShadow>
        <sphereGeometry args={[0.04]} />
        <meshLambertMaterial color="white" />
      </mesh>
      
      {/* Pupilas */}
      <mesh position={[0.08, 0.85, 0.2]} castShadow>
        <sphereGeometry args={[0.02]} />
        <meshLambertMaterial color="black" />
      </mesh>
      <mesh position={[-0.08, 0.85, 0.2]} castShadow>
        <sphereGeometry args={[0.02]} />
        <meshLambertMaterial color="black" />
      </mesh>
      
      {/* Boca */}
      <mesh position={[0, 0.75, 0.18]} castShadow>
        <sphereGeometry args={[0.02]} />
        <meshLambertMaterial color="#FF6B6B" />
      </mesh>
    </group>
  )
}

export default Player
