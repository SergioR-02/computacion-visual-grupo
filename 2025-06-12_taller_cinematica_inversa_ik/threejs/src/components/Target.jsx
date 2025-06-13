import React, { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Raycaster } from 'three'

const Target = ({ position, onPositionChange, orbitControlsRef }) => {
  const meshRef = useRef()
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(new Vector3())
  const { camera, gl, scene } = useThree()

  const raycaster = new Raycaster()

  // Manejar inicio del arrastre
  const handlePointerDown = (event) => {
    event.stopPropagation()
    setIsDragging(true)
    
    // Deshabilitar OrbitControls mientras se arrastra
    if (orbitControlsRef?.current) {
      orbitControlsRef.current.enabled = false
    }
    
    // Calcular offset para un arrastre suave
    const mouse = {
      x: (event.clientX / gl.domElement.clientWidth) * 2 - 1,
      y: -(event.clientY / gl.domElement.clientHeight) * 2 + 1
    }
    
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects([meshRef.current])
    
    if (intersects.length > 0) {
      const intersectionPoint = intersects[0].point
      const currentPos = new Vector3(...position)
      setDragOffset(currentPos.clone().sub(intersectionPoint))
    }

    gl.domElement.style.cursor = 'grabbing'
  }

  // Manejar fin del arrastre
  const handlePointerUp = () => {
    setIsDragging(false)
    
    // Rehabilitar OrbitControls
    if (orbitControlsRef?.current) {
      orbitControlsRef.current.enabled = true
    }
    
    gl.domElement.style.cursor = 'default'
  }

  // Manejar movimiento durante el arrastre
  const handlePointerMove = (event) => {
    if (!isDragging) return

    const mouse = {
      x: (event.clientX / gl.domElement.clientWidth) * 2 - 1,
      y: -(event.clientY / gl.domElement.clientHeight) * 2 + 1
    }

    raycaster.setFromCamera(mouse, camera)
    
    // Crear un plano invisible para el arrastre
    const plane = new Vector3(0, 0, 1) // Plano XY
    const planePoint = new Vector3(0, 0, position[2])
    const intersectionPoint = new Vector3()
    
    // Calcular intersección con el plano
    const denominator = plane.dot(raycaster.ray.direction)
    if (Math.abs(denominator) > 0.0001) {
      const t = planePoint.clone().sub(raycaster.ray.origin).dot(plane) / denominator
      intersectionPoint.copy(raycaster.ray.origin).add(raycaster.ray.direction.multiplyScalar(t))
      
      // Aplicar offset y actualizar posición
      const newPosition = intersectionPoint.add(dragOffset)
      
      // Limitar el rango de movimiento
      newPosition.x = Math.max(-10, Math.min(10, newPosition.x))
      newPosition.y = Math.max(-2, Math.min(8, newPosition.y))
      newPosition.z = Math.max(-5, Math.min(5, newPosition.z))
      
      onPositionChange([newPosition.x, newPosition.y, newPosition.z])
    }
  }

  // Agregar listeners de eventos globales
  React.useEffect(() => {
    const canvas = gl.domElement
    
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerup', handlePointerUp)
    
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging, dragOffset])

  // Animación de pulsación
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime()
      const scale = 1 + Math.sin(time * 3) * 0.1
      meshRef.current.scale.setScalar(scale)
      
      // Rotación suave
      meshRef.current.rotation.y = time * 0.5
      meshRef.current.rotation.x = Math.sin(time) * 0.1
    }
  })

  return (
    <group position={position}>
      {/* Objetivo principal */}
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => {
          gl.domElement.style.cursor = 'grab'
        }}
        onPointerLeave={() => {
          if (!isDragging) {
            gl.domElement.style.cursor = 'default'
          }
        }}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color="#ff4757" 
          emissive="#ff1744"
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Anillo externo para mayor visibilidad */}
      <mesh>
        <torusGeometry args={[0.5, 0.05, 8, 16]} />
        <meshStandardMaterial 
          color="#ff6b7a" 
          transparent={true}
          opacity={0.7}
        />
      </mesh>

      {/* Indicador de arrastrabilidad */}
      <mesh position={[0, 0.6, 0]}>
        <coneGeometry args={[0.1, 0.2, 4]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent={true}
          opacity={0.8}
        />
      </mesh>

      {/* Sombra proyectada */}
      <mesh position={[0, -position[1] - 1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent={true}
          opacity={0.2}
        />
      </mesh>

      {/* Líneas de guía */}
      {isDragging && (
        <>
          {/* Línea vertical */}
          <mesh position={[0, -position[1] / 2 - 1, 0]}>
            <cylinderGeometry args={[0.01, 0.01, position[1] + 2, 8]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent={true}
              opacity={0.5}
            />
          </mesh>
          
          {/* Plano de referencia */}
          <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 1, 16]} />
            <meshBasicMaterial 
              color="#4CAF50" 
              transparent={true}
              opacity={0.3}
              side={2}
            />
          </mesh>
        </>
      )}
    </group>
  )
}

export default Target
