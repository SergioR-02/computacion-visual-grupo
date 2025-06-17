import React, { useRef, useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { Line } from '@react-three/drei'

const RoboticArm = ({ 
  targetPosition, 
  enableIK, 
  maxIterations, 
  tolerance, 
  segmentLength,
  onStatsUpdate 
}) => {
  // Referencias para la jerarquía del brazo
  const baseRef = useRef()
  const segment1Ref = useRef()  // Hombro-Codo
  const segment2Ref = useRef()  // Codo-Muñeca  
  const segment3Ref = useRef()  // Muñeca-Extremo
  
  // 3 segmentos como se solicita
  const numSegments = 3
  const [jointAngles, setJointAngles] = useState([0, Math.PI/4, -Math.PI/6])
  
  const segmentConfig = useMemo(() => [
    { length: segmentLength, width: 0.3, height: 0.3, color: '#4CAF50' },
    { length: segmentLength * 0.8, width: 0.25, height: 0.25, color: '#2196F3' },
    { length: segmentLength * 0.6, width: 0.2, height: 0.2, color: '#FF9800' }
  ], [segmentLength])
  // Función para calcular forward kinematics
  const calculateForwardKinematics = (angles = jointAngles) => {
    const positions = []
    let currentPos = new Vector3(0, 0, 0)
    let currentAngle = 0
    
    positions.push(currentPos.clone()) // Base
    
    for (let i = 0; i < angles.length; i++) {
      currentAngle += angles[i]
      const deltaX = segmentConfig[i].length * Math.cos(currentAngle)
      const deltaY = segmentConfig[i].length * Math.sin(currentAngle)
      currentPos.x += deltaX
      currentPos.y += deltaY
      positions.push(currentPos.clone())
    }
    
    return positions
  }

  const getEndEffectorPosition = (angles = jointAngles) => {
    const positions = calculateForwardKinematics(angles)
    return positions[positions.length - 1]
  }
  // Algoritmo CCD simplificado
  const solveCCD = () => {
    if (!enableIK) {
      onStatsUpdate({ distance: 0, iterations: 0, converged: false })
      return
    }

    const target = new Vector3(...targetPosition)
    let currentAngles = [...jointAngles]
    let iterations = 0
    let converged = false
    let distance = Infinity

    for (let iter = 0; iter < maxIterations; iter++) {
      iterations = iter + 1
      let hasImproved = false

      // Iterar desde el último joint hacia la base
      for (let i = numSegments - 1; i >= 0; i--) {
        const jointPositions = calculateForwardKinematics(currentAngles)
        const jointPos = jointPositions[i]
        const endEffectorPos = jointPositions[jointPositions.length - 1]
        
        const toEndEffector = endEffectorPos.clone().sub(jointPos)
        const toTarget = target.clone().sub(jointPos)
        
        if (toEndEffector.length() < 0.001 || toTarget.length() < 0.001) continue
        
        const currentAngle = Math.atan2(toEndEffector.y, toEndEffector.x)
        const targetAngle = Math.atan2(toTarget.y, toTarget.x)
        
        let angleDiff = targetAngle - currentAngle
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI
        
        if (Math.abs(angleDiff) > 0.01) {
          const maxChange = Math.PI / 15
          angleDiff = Math.max(-maxChange, Math.min(maxChange, angleDiff))
          currentAngles[i] += angleDiff
          hasImproved = true
        }
      }
      
      const finalEndEffector = getEndEffectorPosition(currentAngles)
      distance = finalEndEffector.distanceTo(target)
      
      if (distance < tolerance) {
        converged = true
        break
      }
      
      if (!hasImproved) break
    }

    setJointAngles(currentAngles)
    onStatsUpdate({ distance, iterations, converged })
  }
  // Actualizar el brazo en cada frame
  useFrame(() => {
    if (enableIK) {
      solveCCD()
    }
    
    // Aplicar rotaciones jerárquicamente
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

  // Calcular trayectoria para visualización
  const trajectoryPoints = useMemo(() => {
    const positions = calculateForwardKinematics()
    return positions.map(pos => [pos.x, pos.y, pos.z])
  }, [jointAngles])
  return (
    <group ref={baseRef} position={[0, 0, 0]}>
      {/* Base del brazo - más visible */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 0.4, 12]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* JERARQUÍA DEL BRAZO SIMPLIFICADA */}
      {/* Segmento 1: Hombro-Codo */}
      <group ref={segment1Ref} position={[0, 0, 0]}>
        {/* Articulación del hombro */}
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.2} />
        </mesh>

        {/* Eslabón 1 - Verde */}
        <mesh position={[segmentConfig[0].length / 2, 0, 0]}>
          <boxGeometry args={[
            segmentConfig[0].length, 
            0.3, 
            0.3
          ]} />
          <meshStandardMaterial 
            color="#4CAF50" 
            metalness={0.3} 
            roughness={0.4} 
          />
        </mesh>

        {/* Segmento 2: Codo-Muñeca */}
        <group ref={segment2Ref} position={[segmentConfig[0].length, 0, 0]}>
          {/* Articulación del codo */}
          <mesh>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.2} />
          </mesh>

          {/* Eslabón 2 - Azul */}
          <mesh position={[segmentConfig[1].length / 2, 0, 0]}>
            <boxGeometry args={[
              segmentConfig[1].length, 
              0.25, 
              0.25
            ]} />
            <meshStandardMaterial 
              color="#2196F3" 
              metalness={0.3} 
              roughness={0.4} 
            />
          </mesh>

          {/* Segmento 3: Muñeca-Extremo */}
          <group ref={segment3Ref} position={[segmentConfig[1].length, 0, 0]}>
            {/* Articulación de la muñeca */}
            <mesh>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshStandardMaterial color="#777777" metalness={0.7} roughness={0.2} />
            </mesh>

            {/* Eslabón 3 - Naranja */}
            <mesh position={[segmentConfig[2].length / 2, 0, 0]}>
              <boxGeometry args={[
                segmentConfig[2].length, 
                0.2, 
                0.2
              ]} />
              <meshStandardMaterial 
                color="#FF9800" 
                metalness={0.3} 
                roughness={0.4} 
              />
            </mesh>

            {/* End Effector - Destacado */}
            <mesh position={[segmentConfig[2].length, 0, 0]}>
              <sphereGeometry args={[0.15, 12, 12]} />
              <meshStandardMaterial 
                color="#4ecdc4" 
                emissive="#1a5f5a" 
                emissiveIntensity={0.5}
                metalness={0.8}
                roughness={0.1}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* Línea de trayectoria del brazo */}
      <Line
        points={trajectoryPoints}
        color="#4ecdc4"
        lineWidth={4}
      />

      {/* Línea desde base hasta objetivo */}
      <Line
        points={[[0, 0, 0], targetPosition]}
        color="#ff0000"
        lineWidth={3}
        dashed={true}
        dashSize={0.3}
        gapSize={0.15}
      />
    </group>
  )
}

export default RoboticArm
