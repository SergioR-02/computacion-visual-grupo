import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSphere } from '@react-three/cannon'
import * as THREE from 'three'

import { useCollisionStore } from '../hooks/useCollisionStore'

function PhysicsBall({
  position = [0, 5, 0],
  color = '#ff6b6b',
  initialVelocity,
}) {
  const [scale, setScale] = useState(1)
  const [lastCollisionTime, setLastCollisionTime] = useState(0)
  const velocityRef = useRef([0, 0, 0])

  const { incrementCollisions, addParticleEffect } = useCollisionStore()

  // Physics sphere - the ref from useSphere goes directly to the visual mesh
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position,
    material: {
      friction: 0.3,
      restitution: 0.8,
    },
    onCollide: e => {
      const now = Date.now()

      // Throttle collision events (prevent spam)
      if (now - lastCollisionTime < 200) return
      setLastCollisionTime(now)

      console.log('Collision event triggered!', e)

      // Get current velocity from our ref
      const currentVelocity = velocityRef.current
      const velocityVector = new THREE.Vector3(
        currentVelocity[0],
        currentVelocity[1],
        currentVelocity[2]
      )
      const impactStrength = velocityVector.length()

      console.log('Collision detected!', {
        impactStrength,
        velocity: currentVelocity,
        event: e,
      })

      // Only create particles for significant impacts
      if (impactStrength > 2) {
        // Get collision point from the event
        const collisionPoint = new THREE.Vector3()

        // Try to get collision position from contact point
        if (e.contact && e.contact.getContactPointA) {
          const contactA = e.contact.getContactPointA()
          collisionPoint.set(contactA.x, contactA.y, contactA.z)
        } else if (e.target && e.target.position) {
          // Fallback to object position
          collisionPoint.copy(e.target.position)
        } else {
          // Final fallback to current ball position
          collisionPoint.copy(ref.current.position)
        }

        console.log('Creating particles at:', collisionPoint)

        // Create multiple particles for stronger impacts
        const particleCount = Math.min(Math.floor(impactStrength / 2), 8)

        for (let i = 0; i < particleCount; i++) {
          const particleVelocity = new THREE.Vector3(
            (Math.random() - 0.5) * 6,
            Math.random() * 4 + 2,
            (Math.random() - 0.5) * 6
          )

          addParticleEffect(collisionPoint, particleVelocity)
        }

        // Visual feedback - scale animation
        setScale(1.3)
        setTimeout(() => setScale(1), 200)

        // Update collision counter
        incrementCollisions()
      }
    },
  }))

  // Subscribe to velocity changes
  useEffect(() => {
    if (api && api.velocity) {
      const unsubscribe = api.velocity.subscribe(velocity => {
        velocityRef.current = velocity
      })
      return unsubscribe
    }
  }, [api])

  // Set initial velocity if provided
  useEffect(() => {
    if (initialVelocity && api) {
      console.log('Setting initial velocity:', initialVelocity)
      api.velocity.set(initialVelocity.x, initialVelocity.y, initialVelocity.z)
    }
  }, [initialVelocity, api])

  // Animate scale changes
  useFrame((state, delta) => {
    if (ref.current) {
      const targetScale = scale
      const currentScale = ref.current.scale.x
      const newScale = THREE.MathUtils.lerp(
        currentScale,
        targetScale,
        delta * 8
      )
      ref.current.scale.setScalar(newScale)
    }
  })

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.1}
        emissive={color}
        emissiveIntensity={0.1}
      />
    </mesh>
  )
}

export default PhysicsBall
