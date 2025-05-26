import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useCollisionStore } from '../hooks/useCollisionStore'

function ParticleSystem() {
  const { activeParticles } = useCollisionStore()
  const groupRef = useRef()

  // Create particle geometries and materials
  const particleGeometry = useMemo(
    () => new THREE.SphereGeometry(0.05, 8, 8),
    []
  )

  const particleMaterials = useMemo(
    () => ({
      spark: new THREE.MeshBasicMaterial({
        color: '#ffaa00',
        transparent: true,
        opacity: 0.8,
      }),
      ember: new THREE.MeshBasicMaterial({
        color: '#ff6600',
        transparent: true,
        opacity: 0.6,
      }),
      smoke: new THREE.MeshBasicMaterial({
        color: '#666666',
        transparent: true,
        opacity: 0.3,
      }),
    }),
    []
  )

  // Animate particles
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, index) => {
        const particle = activeParticles[index]
        if (particle) {
          // Update position
          child.position.copy(particle.position)

          // Update scale based on life
          const scale = particle.size * (particle.life / particle.maxLife)
          child.scale.setScalar(scale)

          // Update opacity
          child.material.opacity = (particle.life / particle.maxLife) * 0.8

          // Update color based on life (fade from bright to dim)
          const lifeFactor = particle.life / particle.maxLife
          child.material.color.copy(particle.color).multiplyScalar(lifeFactor)
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      {activeParticles.map((particle, index) => (
        <ParticleElement
          key={particle.id}
          particle={particle}
          geometry={particleGeometry}
          material={particleMaterials.spark}
        />
      ))}
    </group>
  )
}

function ParticleElement({ particle, geometry, material }) {
  const meshRef = useRef()

  return (
    <mesh
      ref={meshRef}
      position={[particle.position.x, particle.position.y, particle.position.z]}
      geometry={geometry}
      material={material.clone()}
    />
  )
}

// Advanced particle system with instanced rendering for better performance
export function InstancedParticleSystem() {
  const { activeParticles } = useCollisionStore()
  const meshRef = useRef()
  const instancedMeshRef = useRef()

  const maxParticles = 1000
  const particleGeometry = useMemo(
    () => new THREE.SphereGeometry(0.05, 6, 6),
    []
  )

  const particleMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffaa00',
        transparent: true,
        opacity: 0.8,
      }),
    []
  )

  // Matrix for each instance
  const tempMatrix = useMemo(() => new THREE.Matrix4(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  useFrame(() => {
    if (instancedMeshRef.current) {
      const mesh = instancedMeshRef.current

      // Update each particle instance
      activeParticles.forEach((particle, index) => {
        if (index >= maxParticles) return

        // Update matrix (position and scale)
        const scale = particle.size * (particle.life / particle.maxLife)
        tempMatrix.makeScale(scale, scale, scale)
        tempMatrix.setPosition(
          particle.position.x,
          particle.position.y,
          particle.position.z
        )
        mesh.setMatrixAt(index, tempMatrix)

        // Update color
        const lifeFactor = particle.life / particle.maxLife
        tempColor.copy(particle.color).multiplyScalar(lifeFactor)
        mesh.setColorAt(index, tempColor)
      })

      // Hide unused instances
      for (let i = activeParticles.length; i < maxParticles; i++) {
        tempMatrix.makeScale(0, 0, 0)
        mesh.setMatrixAt(i, tempMatrix)
      }

      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true
      }
    }
  })

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[particleGeometry, particleMaterial, maxParticles]}
    />
  )
}

export default ParticleSystem
