import * as THREE from 'three'

// Clase simple para pathfinding básico
export class PathFinder {
  constructor() {
    this.obstacles = [
      { position: [3, 2], size: [1, 1] },
      { position: [-4, -3], size: [1.5, 1.5] },
      { position: [6, -1], size: [1, 1.5] },
      { position: [-2, 4], size: [2, 1] },
      { position: [0, -6], size: [1, 2] },
    ]
  }
  // Verificar si un punto está libre de obstáculos
  isPointClear(x, z, radius = 0.5) {
    for (const obstacle of this.obstacles) {
      const dx = Math.abs(x - obstacle.position[0])
      const dz = Math.abs(z - obstacle.position[1])
      if (dx < (obstacle.size[0] / 2 + radius) && dz < (obstacle.size[1] / 2 + radius)) {
        return false
      }
    }
    // Actualizado para el mapa más amplio
    return x > -18 && x < 18 && z > -18 && z < 18
  }
  // Encontrar un camino evitando obstáculos con mejor algoritmo
  findPath(start, end) {
    const path = []
    const current = new THREE.Vector3(start.x, 0, start.z)
    const target = new THREE.Vector3(end.x, 0, end.z)
    
    path.push(current.clone())
    
    // Si el destino está libre, usar ruta directa
    if (this.isPointClear(target.x, target.z)) {
      path.push(target)
      return path
    }
    
    // Si hay obstáculos, intentar rodear
    const direction = target.clone().sub(current).normalize()
    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x)
    
    // Intentar rutas alternativas
    const alternatives = [
      target.clone().add(perpendicular.multiplyScalar(2)),
      target.clone().add(perpendicular.multiplyScalar(-2)),
      target.clone().add(perpendicular.multiplyScalar(3)),
      target.clone().add(perpendicular.multiplyScalar(-3))
    ]
    
    for (const alt of alternatives) {
      if (this.isPointClear(alt.x, alt.z)) {
        path.push(alt)
        path.push(target)
        return path
      }
    }
    
    // Si no encuentra ruta, mantener posición actual
    return [current.clone()]
  }

  // Método para encontrar una posición libre cerca de un punto
  findNearestClearPosition(x, z, radius = 1) {
    if (this.isPointClear(x, z)) return { x, z }
    
    // Buscar en círculo alrededor del punto
    for (let r = 0.5; r <= radius * 2; r += 0.5) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        const testX = x + Math.cos(angle) * r
        const testZ = z + Math.sin(angle) * r
        if (this.isPointClear(testX, testZ)) {
          return { x: testX, z: testZ }
        }
      }
    }
    
    return { x, z } // Si no encuentra, devolver original
  }
}

// Estados del AI
export const AIStates = {
  PATROL: 'patrol',
  CHASE: 'chase',
  SEARCH: 'search',
  IDLE: 'idle'
}

// Utilidades de animación
export const AnimationStates = {
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run'
}

export function getAnimationFromVelocity(velocity) {
  const speed = velocity
  if (speed < 0.1) return AnimationStates.IDLE
  if (speed < 3) return AnimationStates.WALK
  return AnimationStates.RUN
}
