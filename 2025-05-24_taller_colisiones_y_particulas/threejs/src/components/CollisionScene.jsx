import React, { useState, useCallback, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useBox, useCylinder } from '@react-three/cannon'
import * as THREE from 'three'

import PhysicsBall from './PhysicsBall'
import PhysicsGround from './PhysicsGround'
import ParticleSystem from './ParticleSystem'
import { useCollisionStore } from '../hooks/useCollisionStore'

function CollisionScene() {
  const [balls, setBalls] = useState([
    // Initial balls
    { id: 0, position: [0, 8, 0], color: '#ff6b6b' },
    { id: 1, position: [2, 12, 1], color: '#4ecdc4' },
    { id: 2, position: [-2, 10, -1], color: '#45b7d1' },
  ])
  const [nextId, setNextId] = useState(3)

  const { updateParticles } = useCollisionStore()

  // Update particles each frame
  useFrame((state, delta) => {
    updateParticles(delta)
  })

  return (
    <group>
      {/* Ground plane */}
      <PhysicsGround />

      {/* Physics balls */}
      {balls.map(ball => (
        <PhysicsBall
          key={ball.id}
          position={ball.position}
          color={ball.color}
          initialVelocity={ball.initialVelocity}
        />
      ))}

      {/* Particle effects */}
      <ParticleSystem />

      {/* Static obstacles for more interesting collisions */}
      <StaticObstacles />

      {/* Click handler component */}
      <ClickHandler
        balls={balls}
        setBalls={setBalls}
        nextId={nextId}
        setNextId={setNextId}
      />
    </group>
  )
}

// Separate component to handle clicks without interfering with OrbitControls
function ClickHandler({ balls, setBalls, nextId, setNextId }) {
  const { camera, size } = useThree()
  const clickTimeoutRef = useRef()

  const handleClick = useCallback(
    event => {
      // Clear any existing timeout
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }

      // Add a small delay to distinguish from drag events
      clickTimeoutRef.current = setTimeout(() => {
        console.log('Click detected!')

        // Get normalized device coordinates
        const x = (event.clientX / size.width) * 2 - 1
        const y = -(event.clientY / size.height) * 2 + 1

        console.log('Mouse coordinates:', { x, y })

        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

        // Create ball shooting towards the clicked direction
        const direction = raycaster.ray.direction.normalize()
        const startPosition = camera.position
          .clone()
          .add(direction.clone().multiplyScalar(3))

        const colors = [
          '#ff6b6b',
          '#4ecdc4',
          '#45b7d1',
          '#96ceb4',
          '#feca57',
          '#ff9ff3',
          '#54a0ff',
        ]
        const randomColor = colors[Math.floor(Math.random() * colors.length)]

        const newBall = {
          id: nextId,
          position: [startPosition.x, startPosition.y, startPosition.z],
          color: randomColor,
          initialVelocity: direction.clone().multiplyScalar(20),
        }

        console.log('Adding new ball:', newBall)

        setBalls(prev => [...prev, newBall])
        setNextId(prev => prev + 1)
      }, 150) // Small delay to avoid conflicts with camera drag
    },
    [camera, size, nextId, setBalls, setNextId]
  )

  // Add event listener to the canvas element
  React.useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('click', handleClick)
      return () => {
        canvas.removeEventListener('click', handleClick)
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current)
        }
      }
    }
  }, [handleClick])

  return null // This component doesn't render anything
}

// Static obstacles with physics for collision detection
function StaticObstacles() {
  // Physics boxes for platforms
  const [platformRef1] = useBox(() => ({
    position: [3, 4, 0],
    args: [2, 0.5, 2],
    type: 'Static',
    material: { friction: 0.4, restitution: 0.6 },
  }))

  const [platformRef2] = useBox(() => ({
    position: [-3, 6, 0],
    args: [2, 0.5, 2],
    type: 'Static',
    material: { friction: 0.4, restitution: 0.6 },
  }))

  const [cylinderRef] = useCylinder(() => ({
    position: [0, 3, 3],
    args: [1, 1, 0.5, 8],
    type: 'Static',
    material: { friction: 0.3, restitution: 0.8 },
  }))

  const [rampRef1] = useBox(() => ({
    position: [4, 2, -3],
    rotation: [0, 0, -Math.PI / 6],
    args: [3, 0.3, 1.5],
    type: 'Static',
    material: { friction: 0.2, restitution: 0.4 },
  }))

  const [rampRef2] = useBox(() => ({
    position: [-4, 2, 3],
    rotation: [0, 0, Math.PI / 6],
    args: [3, 0.3, 1.5],
    type: 'Static',
    material: { friction: 0.2, restitution: 0.4 },
  }))

  return (
    <group>
      {/* Floating platforms */}
      <mesh ref={platformRef1} position={[3, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial color='#8e44ad' />
      </mesh>

      <mesh ref={platformRef2} position={[-3, 6, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial color='#e74c3c' />
      </mesh>

      <mesh ref={cylinderRef} position={[0, 3, 3]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 0.5, 8]} />
        <meshStandardMaterial color='#f39c12' />
      </mesh>

      {/* Ramps */}
      <mesh
        ref={rampRef1}
        position={[4, 2, -3]}
        rotation={[0, 0, -Math.PI / 6]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[3, 0.3, 1.5]} />
        <meshStandardMaterial color='#27ae60' />
      </mesh>

      <mesh
        ref={rampRef2}
        position={[-4, 2, 3]}
        rotation={[0, 0, Math.PI / 6]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[3, 0.3, 1.5]} />
        <meshStandardMaterial color='#3498db' />
      </mesh>
    </group>
  )
}

export default CollisionScene
