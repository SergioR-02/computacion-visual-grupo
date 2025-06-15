import React, { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { Line } from '@react-three/drei'

const SimpleArm = ({ 
  targetPosition = [5, 3, 0], 
  enableIK = true,
  enableFK = false,
  maxIterations = 15, 
  tolerance = 0.15, 
  segmentLength = 2,
  onStatsUpdate = () => {},
  fkAngles = [0, Math.PI/4, -Math.PI/6],
  predefinedPose = null
}) => {
  // Referencias para cada segmento del brazo
  const segment1Ref = useRef()
  const segment2Ref = useRef()
  const segment3Ref = useRef()
  
  // Ángulos de las articulaciones [hombro, codo, muñeca]
  const [jointAngles, setJointAngles] = useState([0, Math.PI/4, -Math.PI/6])
  
  // Manejar poses predefinidas
  React.useEffect(() => {
    if (predefinedPose && enableFK) {
      setJointAngles([...predefinedPose])
    }
  }, [predefinedPose, enableFK])
  
  // Usar ángulos FK cuando esté en modo FK
  React.useEffect(() => {
    if (enableFK && fkAngles) {
      setJointAngles([...fkAngles])
    }
  }, [enableFK, fkAngles])
  
  // Configuración de los segmentos
  const segments = [
    { length: segmentLength, color: '#4CAF50' },        // Verde - Hombro-Codo
    { length: segmentLength * 0.8, color: '#2196F3' }, // Azul - Codo-Muñeca
    { length: segmentLength * 0.6, color: '#FF9800' }  // Naranja - Muñeca-Extremo
  ]

  // Calcular posiciones usando Forward Kinematics
  const calculatePositions = (angles = jointAngles) => {
    const positions = [[0, 0, 0]] // Base
    let currentPos = new Vector3(0, 0, 0)
    let accumulatedAngle = 0
    
    for (let i = 0; i < angles.length; i++) {
      accumulatedAngle += angles[i]
      const segmentLength = segments[i].length
      currentPos.x += segmentLength * Math.cos(accumulatedAngle)
      currentPos.y += segmentLength * Math.sin(accumulatedAngle)
      positions.push([currentPos.x, currentPos.y, currentPos.z])
    }
    
    return positions
  }

  // Algoritmo CCD (Cyclic Coordinate Descent)
  const solveCCD = () => {
    if (!enableIK) return

    const target = new Vector3(...targetPosition)
    let currentAngles = [...jointAngles]
    let iterations = 0
    let converged = false

    for (let iter = 0; iter < maxIterations; iter++) {
      iterations++
      let hasChanged = false

      // Iterar desde el último joint hacia la base
      for (let i = segments.length - 1; i >= 0; i--) {
        const positions = calculatePositions(currentAngles)
        const jointPos = new Vector3(...positions[i])
        const endEffectorPos = new Vector3(...positions[positions.length - 1])
        
        const toEndEffector = endEffectorPos.clone().sub(jointPos)
        const toTarget = target.clone().sub(jointPos)
        
        if (toEndEffector.length() < 0.001) continue
        
        const currentAngle = Math.atan2(toEndEffector.y, toEndEffector.x)
        const targetAngle = Math.atan2(toTarget.y, toTarget.x)
        
        let angleDiff = targetAngle - currentAngle
        // Normalizar ángulo
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI
        
        if (Math.abs(angleDiff) > 0.01) {
          currentAngles[i] += angleDiff * 0.5 // Suavizar el movimiento
          hasChanged = true
        }
      }
      
      const finalPositions = calculatePositions(currentAngles)
      const finalEndEffector = new Vector3(...finalPositions[finalPositions.length - 1])
      const distance = finalEndEffector.distanceTo(target)
      
      if (distance < tolerance) {
        converged = true
        break
      }
      
      if (!hasChanged) break
    }

    setJointAngles(currentAngles)
    
    const finalPositions = calculatePositions(currentAngles)
    const finalEndEffector = new Vector3(...finalPositions[finalPositions.length - 1])
    const distance = finalEndEffector.distanceTo(new Vector3(...targetPosition))
    
    onStatsUpdate({ distance, iterations, converged })
  }
  // Actualizar en cada frame
  useFrame(() => {
    // Solo ejecutar IK si está habilitado y no estamos en modo FK
    if (enableIK && !enableFK) {
      solveCCD()
    }
    
    // Aplicar rotaciones a los segmentos
    if (segment1Ref.current) {
      segment1Ref.current.rotation.z = jointAngles[0]
    }
    if (segment2Ref.current) {
      segment2Ref.current.rotation.z = jointAngles[1]
    }
    if (segment3Ref.current) {
      segment3Ref.current.rotation.z = jointAngles[2]
    }
  })

  // Calcular puntos para la línea de trayectoria
  const trajectoryPoints = useMemo(() => {
    return calculatePositions()
  }, [jointAngles])

  return (
    <group position={[0, 0, 0]}>
      {/* Base del brazo */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 0.4, 12]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* JERARQUÍA DEL BRAZO */}
      {/* Segmento 1: Hombro-Codo */}
      <group ref={segment1Ref} position={[0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
        
        <mesh position={[segments[0].length / 2, 0, 0]}>
          <boxGeometry args={[segments[0].length, 0.3, 0.3]} />
          <meshStandardMaterial color={segments[0].color} />
        </mesh>

        {/* Segmento 2: Codo-Muñeca */}
        <group ref={segment2Ref} position={[segments[0].length, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
          
          <mesh position={[segments[1].length / 2, 0, 0]}>
            <boxGeometry args={[segments[1].length, 0.25, 0.25]} />
            <meshStandardMaterial color={segments[1].color} />
          </mesh>

          {/* Segmento 3: Muñeca-Extremo */}
          <group ref={segment3Ref} position={[segments[1].length, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshStandardMaterial color="#777777" />
            </mesh>
            
            <mesh position={[segments[2].length / 2, 0, 0]}>
              <boxGeometry args={[segments[2].length, 0.2, 0.2]} />
              <meshStandardMaterial color={segments[2].color} />
            </mesh>

            {/* End Effector */}
            <mesh position={[segments[2].length, 0, 0]}>
              <sphereGeometry args={[0.15, 12, 12]} />
              <meshStandardMaterial 
                color="#00ffff" 
                emissive="#004444" 
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* Línea de trayectoria */}
      <Line
        points={trajectoryPoints}
        color="#00ffff"
        lineWidth={3}
      />

      {/* Línea al objetivo (solo en modo IK) */}
      {enableIK && !enableFK && (
        <Line
          points={[[0, 0, 0], targetPosition]}
          color="#ff0000"
          lineWidth={2}
          dashed={true}
          dashSize={0.3}
          gapSize={0.15}
        />
      )}

      {/* Indicadores de ángulos de las articulaciones */}
      {jointAngles.map((angle, index) => {
        const positions = calculatePositions()
        const jointPos = positions[index]
        const radius = 0.4 + index * 0.1
        
        return (
          <group key={`angle-indicator-${index}`} position={jointPos}>
            {/* Arco que muestra el ángulo */}
            <mesh position={[0, 0, 0.1]}>
              <ringGeometry args={[radius, radius + 0.03, 16, 1, 0, Math.abs(angle)]} />
              <meshBasicMaterial 
                color={angle > 0 ? "#4CAF50" : "#f44336"} 
                transparent 
                opacity={0.6}
                side={2}
              />
            </mesh>
            
            {/* Etiqueta del joint */}
            <mesh position={[0, 0, 0.15]}>
              <circleGeometry args={[0.08, 8]} />
              <meshBasicMaterial 
                color="#ffffff" 
                transparent 
                opacity={0.8} 
              />
            </mesh>
          </group>
        )
      })}

      {/* Visualización del alcance máximo */}
      <mesh position={[0, 0, -0.01]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[
          segments.reduce((sum, seg) => sum + seg.length, 0) - 0.1,
          segments.reduce((sum, seg) => sum + seg.length, 0),
          32
        ]} />
        <meshBasicMaterial 
          color="#666666" 
          transparent 
          opacity={0.15}
          side={2}
        />
      </mesh>
    </group>
  )
}

export default SimpleArm
