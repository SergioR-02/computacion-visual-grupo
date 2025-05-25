import { create } from 'zustand'
import * as THREE from 'three'

export const useCollisionStore = create((set, get) => ({
  // Collision tracking
  collisionCount: 0,
  activeParticles: [],

  // Increment collision counter
  incrementCollisions: () =>
    set((state) => ({
      collisionCount: state.collisionCount + 1
    })),

  // Add particle effect at collision point
  addParticleEffect: (position, velocity = new THREE.Vector3()) => {
    const id = Date.now() + Math.random()
    const particleEffect = {
      id,
      position: position.clone(),
      velocity: velocity.clone(),
      life: 1.0,
      maxLife: 1.0,
      size: Math.random() * 0.5 + 0.2,
      color: new THREE.Color().setHSL(
        Math.random() * 0.3 + 0.1, // Orange to yellow hues
        0.8,
        0.6
      )
    }

    set((state) => ({
      activeParticles: [...state.activeParticles, particleEffect]
    }))

    // Auto-remove particle after duration
    setTimeout(() => {
      set((state) => ({
        activeParticles: state.activeParticles.filter(p => p.id !== id)
      }))
    }, 2000)
  },

  // Update particles (called each frame)
  updateParticles: (deltaTime) => {
    set((state) => ({
      activeParticles: state.activeParticles.map(particle => ({
        ...particle,
        position: particle.position.clone().add(
          particle.velocity.clone().multiplyScalar(deltaTime)
        ),
        velocity: particle.velocity.clone().add(
          new THREE.Vector3(0, -9.81 * deltaTime, 0) // Apply gravity
        ),
        life: Math.max(0, particle.life - deltaTime),
        size: particle.size * (particle.life / particle.maxLife)
      })).filter(particle => particle.life > 0)
    }))
  },

  // Reset all state
  reset: () =>
    set({
      collisionCount: 0,
      activeParticles: []
    })
})) 