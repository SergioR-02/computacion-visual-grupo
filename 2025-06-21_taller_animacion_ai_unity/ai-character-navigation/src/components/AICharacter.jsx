import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PathFinder, AIStates, getAnimationFromVelocity } from '../utils/navigation'

function AICharacter({ onStateChange, onPositionChange, detectionRadius = 3, baseSpeed = 2 }) {
  const aiRef = useRef()
  const pathFinder = useRef(new PathFinder())
  const [aiState, setAiState] = useState(AIStates.PATROL)
  const [currentTarget, setCurrentTarget] = useState(null)
  const [animationState, setAnimationState] = useState('idle')
  const [searchTime, setSearchTime] = useState(0)
  
  // Puntos de patrullaje - ampliados para el mapa más grande
  const patrolPoints = [
    new THREE.Vector3(-15, 0, -15),  // Esquina inferior izquierda
    new THREE.Vector3(15, 0, -15),   // Esquina inferior derecha 
    new THREE.Vector3(15, 0, 15),    // Esquina superior derecha
    new THREE.Vector3(-15, 0, 15)    // Esquina superior izquierda
  ]
  
  const [currentPatrolIndex, setCurrentPatrolIndex] = useState(0)
  const velocity = useRef(new THREE.Vector3())
  const lastPlayerPosition = useRef(null)
  const stuckTimer = useRef(0)
  const lastPosition = useRef(new THREE.Vector3())
  
  useEffect(() => {
    // Inicializar posición y primer target - ajustado para el mapa más amplio
    if (aiRef.current) {
      aiRef.current.position.set(-15, 0.5, -15)
      setCurrentTarget(patrolPoints[0])
    }
  }, [])

  // Reportar cambios de estado al UI
  useEffect(() => {
    if (onStateChange) {
      onStateChange(aiState)
    }
  }, [aiState, onStateChange])

  const findPlayer = (scene) => {
    // En una implementación real, buscaríamos el objeto jugador en la escena
    // Por simplicidad, usaremos una referencia fija
    return scene.getObjectByName?.('player') || null
  }
  
  // Función helper para encontrar una posición libre cerca
  const findFreePosition = () => {
    // Intentar posiciones alrededor del AI
    const currentPos = aiRef.current.position
    const attempts = 20
    
    for (let i = 0; i < attempts; i++) {
      const angle = (Math.PI * 2 * i) / attempts
      const distance = 2 + Math.random() * 3 // Entre 2 y 5 unidades de distancia
      const testX = currentPos.x + Math.cos(angle) * distance
      const testZ = currentPos.z + Math.sin(angle) * distance
      
      if (pathFinder.current.isPointClear(testX, testZ)) {
        return new THREE.Vector3(testX, currentPos.y, testZ)
      }
    }
    
    // Si no encuentra nada, usar un punto de patrullaje
    return patrolPoints[(currentPatrolIndex + 2) % patrolPoints.length]
  }

  const getDistanceToPlayer = (playerPosition) => {
    if (!aiRef.current || !playerPosition) return Infinity
    return aiRef.current.position.distanceTo(playerPosition)
  }
  const moveTowards = (target, speed, delta) => {
    if (!aiRef.current || !target) return false

    const direction = target.clone().sub(aiRef.current.position)
    direction.y = 0 // Mantener en el plano horizontal
    
    if (direction.length() < 0.8) {
      velocity.current.set(0, 0, 0)
      return true // Llegó al destino
    }

    direction.normalize()
    const movement = direction.multiplyScalar(speed * delta)
    
    // Verificar si el próximo movimiento es válido
    const nextPosition = aiRef.current.position.clone().add(movement)
    
    if (pathFinder.current.isPointClear(nextPosition.x, nextPosition.z)) {
      // Movimiento normal
      aiRef.current.position.add(movement)
      velocity.current.copy(direction.multiplyScalar(speed))
      
      // Rotar hacia la dirección del movimiento
      const angle = Math.atan2(direction.x, direction.z)
      aiRef.current.rotation.y = angle
      
      // Resetear el timer de atascado cuando se mueve
      stuckTimer.current = 0
      
      return false
    } else {
      // Obstáculo detectado - usar una estrategia más agresiva de evasión
      const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x)
      const alternativeSpeed = speed * delta * 1.2 // Ligeramente más rápido para evadir
      
      // Probar direcciones de evasión en orden de prioridad
      const evasionDirections = [
        perpendicular.clone().multiplyScalar(1.5),   // Derecha
        perpendicular.clone().multiplyScalar(-1.5),  // Izquierda
        perpendicular.clone().multiplyScalar(2),     // Más a la derecha
        perpendicular.clone().multiplyScalar(-2),    // Más a la izquierda
        direction.clone().add(perpendicular.clone().multiplyScalar(1)), // Diagonal derecha
        direction.clone().add(perpendicular.clone().multiplyScalar(-1)), // Diagonal izquierda
        // Direcciones más amplias si está muy atascado
        perpendicular.clone().multiplyScalar(3),
        perpendicular.clone().multiplyScalar(-3)
      ]
      
      for (const evasionDir of evasionDirections) {
        evasionDir.normalize()
        const evasionMovement = evasionDir.multiplyScalar(alternativeSpeed)
        const evasionPos = aiRef.current.position.clone().add(evasionMovement)
        
        if (pathFinder.current.isPointClear(evasionPos.x, evasionPos.z)) {
          aiRef.current.position.add(evasionMovement)
          velocity.current.copy(evasionDir.multiplyScalar(speed))
          
          // Rotar hacia la dirección de evasión
          const angle = Math.atan2(evasionDir.x, evasionDir.z)
          aiRef.current.rotation.y = angle
          
          return false
        }
      }
      
      // Si aún no puede evadir, forzar un movimiento aleatorio para desbloquearse
      const randomAngle = Math.random() * Math.PI * 2
      const randomDir = new THREE.Vector3(Math.sin(randomAngle), 0, Math.cos(randomAngle))
      const randomMovement = randomDir.multiplyScalar(alternativeSpeed)
      const randomPos = aiRef.current.position.clone().add(randomMovement)
      
      if (pathFinder.current.isPointClear(randomPos.x, randomPos.z)) {
        aiRef.current.position.add(randomMovement)
        velocity.current.copy(randomDir.multiplyScalar(speed * 0.7))
        
        const angle = Math.atan2(randomDir.x, randomDir.z)
        aiRef.current.rotation.y = angle
      } else {
        // Como último recurso, incrementar el timer de atascado
        velocity.current.set(0, 0, 0)
      }
      
      return false
    }
  }
  useFrame((state, delta) => {
    if (!aiRef.current) return

    // Reportar posición al UI
    if (onPositionChange) {
      onPositionChange(aiRef.current.position)
    }    // Detectar si el AI está atascado - más sensible
    if (lastPosition.current.distanceTo(aiRef.current.position) < 0.2) {
      stuckTimer.current += delta
    } else {
      stuckTimer.current = 0
      lastPosition.current.copy(aiRef.current.position)
    }

    // Si está atascado por más de 1.5 segundos, cambiar objetivo
    if (stuckTimer.current > 1.5 && aiState === AIStates.PATROL) {
      // Saltar al siguiente punto de patrullaje
      const nextIndex = (currentPatrolIndex + 1) % patrolPoints.length
      setCurrentPatrolIndex(nextIndex)
      setCurrentTarget(patrolPoints[nextIndex])
      stuckTimer.current = 0
      
      // Si sigue atascado, teletransportar a una posición libre
      if (stuckTimer.current > 3) {
        const freePosition = findFreePosition()
        if (freePosition) {
          aiRef.current.position.copy(freePosition)
        }
        stuckTimer.current = 0
      }
    }

    // Buscar el jugador en la escena
    const scene = state.scene
    const playerObject = scene.getObjectByName('player')
    
    let playerPosition = new THREE.Vector3(0, 0.5, 5) // Posición por defecto
    if (playerObject) {
      playerPosition.copy(playerObject.position)
    }

    const distanceToPlayer = getDistanceToPlayer(playerPosition)
    const currentVelocity = velocity.current.length()

    // Máquina de estados de IA
    switch (aiState) {      case AIStates.PATROL:
        // Patrullar entre puntos
        if (currentTarget) {
          const reached = moveTowards(currentTarget, baseSpeed, delta)
          if (reached) {
            setCurrentPatrolIndex((prev) => (prev + 1) % patrolPoints.length)
            setCurrentTarget(patrolPoints[(currentPatrolIndex + 1) % patrolPoints.length])
          }
        }

        // Detectar jugador
        if (distanceToPlayer < detectionRadius) {
          setAiState(AIStates.CHASE)
          setCurrentTarget(playerPosition.clone())
          lastPlayerPosition.current = playerPosition.clone()
        }
        break

      case AIStates.CHASE:
        // Perseguir al jugador
        if (distanceToPlayer < detectionRadius) {
          setCurrentTarget(playerPosition.clone())
          lastPlayerPosition.current = playerPosition.clone()
          moveTowards(currentTarget, baseSpeed * 1.8, delta) // Más rápido al perseguir
        } else {
          // Perdió al jugador, cambiar a búsqueda
          setAiState(AIStates.SEARCH)
          setSearchTime(3) // 3 segundos de búsqueda
          setCurrentTarget(lastPlayerPosition.current)
        }
        break

      case AIStates.SEARCH:
        // Buscar al jugador en la última posición conocida
        if (currentTarget) {
          const reached = moveTowards(currentTarget, baseSpeed * 1.2, delta)
          if (reached) {
            setSearchTime(prev => prev - delta)
            if (searchTime <= 0) {
              // Volver a patrullar
              setAiState(AIStates.PATROL)
              setCurrentTarget(patrolPoints[currentPatrolIndex])
            }
          }
        }

        // Si detecta al jugador durante la búsqueda
        if (distanceToPlayer < detectionRadius) {
          setAiState(AIStates.CHASE)
          setCurrentTarget(playerPosition.clone())
        }
        break

      case AIStates.IDLE:
        velocity.current.set(0, 0, 0)
        break
    }

    // Actualizar animación basada en velocidad
    const newAnimationState = getAnimationFromVelocity(currentVelocity)
    if (newAnimationState !== animationState) {
      setAnimationState(newAnimationState)
    }
  })

  // Color basado en el estado
  const getColorByState = () => {
    switch (aiState) {
      case AIStates.PATROL: return '#32CD32' // Verde
      case AIStates.CHASE: return '#FF4500' // Rojo
      case AIStates.SEARCH: return '#FFD700' // Amarillo
      default: return '#808080' // Gris
    }
  }
  return (
    <group>
      {/* Personaje AI con cabeza */}
      <group ref={aiRef} castShadow name="ai-character">
        {/* Cuerpo */}
        <mesh position={[0, 0, 0]} castShadow>
          <capsuleGeometry args={[0.3, 1.2]} />
          <meshLambertMaterial color={getColorByState()} />
        </mesh>
        
        {/* Cabeza */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <sphereGeometry args={[0.25]} />
          <meshLambertMaterial color={getColorByState()} />
        </mesh>
        
        {/* Ojos */}
        <mesh position={[0.1, 0.95, 0.2]} castShadow>
          <sphereGeometry args={[0.05]} />
          <meshLambertMaterial color="white" />
        </mesh>
        <mesh position={[-0.1, 0.95, 0.2]} castShadow>
          <sphereGeometry args={[0.05]} />
          <meshLambertMaterial color="white" />
        </mesh>
        
        {/* Pupilas */}
        <mesh position={[0.1, 0.95, 0.22]} castShadow>
          <sphereGeometry args={[0.02]} />
          <meshLambertMaterial color="black" />
        </mesh>
        <mesh position={[-0.1, 0.95, 0.22]} castShadow>
          <sphereGeometry args={[0.02]} />
          <meshLambertMaterial color="black" />
        </mesh>
      </group>

      {/* Visualización del radio de detección - más visible */}
      <mesh position={[aiRef.current?.position.x || 0, 0.05, aiRef.current?.position.z || 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[detectionRadius - 0.1, detectionRadius + 0.1, 32]} />
        <meshBasicMaterial 
          color={aiState === AIStates.CHASE ? '#FF0000' : aiState === AIStates.SEARCH ? '#FFD700' : '#00FF00'} 
          transparent 
          opacity={0.4}
          side={2}
        />
      </mesh>
      
      {/* Círculo sólido del radio - más sutil */}
      <mesh position={[aiRef.current?.position.x || 0, 0.02, aiRef.current?.position.z || 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[detectionRadius, 32]} />
        <meshBasicMaterial 
          color={aiState === AIStates.CHASE ? '#FF4444' : aiState === AIStates.SEARCH ? '#FFDD44' : '#44FF44'} 
          transparent 
          opacity={0.15}
        />
      </mesh>

      {/* Puntos de patrullaje */}
      {patrolPoints.map((point, index) => (
        <mesh key={index} position={[point.x, 0.1, point.z]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1]} />
          <meshBasicMaterial 
            color={index === currentPatrolIndex ? '#FF0000' : '#00FF00'} 
            transparent 
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  )
}

export default AICharacter
