import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Text } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'

// Componente para un eslabón individual del brazo
function RobotJoint({
  children,
  rotation = 0,
  length = 1,
  color = '#4a90e2',
  name = 'Joint',
}) {
  const groupRef = useRef()

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z = rotation
    }
  })

  return (
    <group ref={groupRef}>
      {/* Articulación (esfera) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color='#ff6b6b' />
      </mesh>

      {/* Eslabón (cilindro horizontal) */}
      <mesh position={[length / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, length, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Etiqueta del eslabón */}
      <Text
        position={[length / 2, 0.3, 0]}
        fontSize={0.15}
        color='white'
        anchorX='center'
        anchorY='middle'
      >
        {name}
      </Text>

      {/* Grupo hijo posicionado al final del eslabón */}
      <group position={[length, 0, 0]}>{children}</group>
    </group>
  )
}

// Componente principal del brazo robótico
function RoboticArm() {
  const [trajectory, setTrajectory] = useState([])
  const endEffectorRef = useRef()

  // Controles simplificados sin agrupación para evitar errores de Leva
  const {
    autoAnimation,
    animationSpeed,
    recordTrajectory,
    clearTrajectory,
    showTrajectory,
    baseRotation,
    joint1Angle,
    joint2Angle,
    joint3Angle,
  } = useControls({
    autoAnimation: false,
    animationSpeed: { value: 1, min: 0.1, max: 3, step: 0.1 },
    recordTrajectory: false,
    showTrajectory: true,
    clearTrajectory: false,
    baseRotation: { value: 0, min: -Math.PI, max: Math.PI, step: 0.02 },
    joint1Angle: { value: 0, min: -Math.PI / 2, max: Math.PI / 2, step: 0.02 },
    joint2Angle: { value: 0, min: -Math.PI, max: Math.PI, step: 0.02 },
    joint3Angle: { value: 0, min: -Math.PI / 2, max: Math.PI / 2, step: 0.02 },
  })

  // Configuración de longitudes de eslabones
  const linkLengths = {
    base: 1.5,
    link1: 2,
    link2: 1.8,
    link3: 1.2,
  }

  // Variables para almacenar ángulos animados con valores por defecto
  const [animatedAngles, setAnimatedAngles] = useState({
    baseRotation: 0,
    joint1Angle: 0,
    joint2Angle: 0,
    joint3Angle: 0,
  })

  // Función para calcular posición del end-effector (Forward Kinematics)
  const calculateEndEffectorPosition = angles => {
    // Asegurar que todos los ángulos están definidos
    const safeAngles = {
      baseRotation: angles?.baseRotation || 0,
      joint1Angle: angles?.joint1Angle || 0,
      joint2Angle: angles?.joint2Angle || 0,
      joint3Angle: angles?.joint3Angle || 0,
    }

    const { baseRotation, joint1Angle, joint2Angle, joint3Angle } = safeAngles

    // Cálculo en 2D primero, luego aplicar rotación de base
    let x = 0
    let y = linkLengths.base
    let currentAngle = joint1Angle

    // Eslabón 1
    x += linkLengths.link1 * Math.cos(currentAngle)
    y += linkLengths.link1 * Math.sin(currentAngle)

    // Eslabón 2
    currentAngle += joint2Angle
    x += linkLengths.link2 * Math.cos(currentAngle)
    y += linkLengths.link2 * Math.sin(currentAngle)

    // Eslabón 3
    currentAngle += joint3Angle
    x += linkLengths.link3 * Math.cos(currentAngle)
    y += linkLengths.link3 * Math.sin(currentAngle)

    // Aplicar rotación de la base (Y)
    const cosBase = Math.cos(baseRotation)
    const sinBase = Math.sin(baseRotation)

    return new THREE.Vector3(x * cosBase, y, x * sinBase)
  }

  // Animación automática usando Math.sin(clock.elapsedTime)
  useFrame(state => {
    // Rotaciones progresivas desde useFrame()
    if (autoAnimation) {
      const time = state.clock.elapsedTime * animationSpeed

      const newAngles = {
        baseRotation: Math.sin(time * 0.3) * 0.8,
        joint1Angle: Math.sin(time * 0.5) * 0.4,
        joint2Angle: Math.sin(time * 0.7) * 0.9,
        joint3Angle: Math.sin(time * 1.1) * 0.5,
      }

      setAnimatedAngles(newAngles)
    }

    // Grabación de trayectoria del extremo
    if (recordTrajectory) {
      const currentAngles = autoAnimation
        ? animatedAngles
        : {
            baseRotation: baseRotation || 0,
            joint1Angle: joint1Angle || 0,
            joint2Angle: joint2Angle || 0,
            joint3Angle: joint3Angle || 0,
          }

      const endPos = calculateEndEffectorPosition(currentAngles)

      setTrajectory(prev => {
        const newTrajectory = [...prev, endPos.clone()]
        return newTrajectory.slice(-500) // Limitar a 500 puntos
      })
    }
  })

  // Limpiar trayectoria cuando se presiona el botón
  useEffect(() => {
    if (clearTrajectory) {
      setTrajectory([])
    }
  }, [clearTrajectory])

  // Determinar qué ángulos usar (manuales o animados) con valores seguros
  const currentAngles = autoAnimation
    ? animatedAngles
    : {
        baseRotation: baseRotation || 0,
        joint1Angle: joint1Angle || 0,
        joint2Angle: joint2Angle || 0,
        joint3Angle: joint3Angle || 0,
      }

  // Calcular posición actual del end-effector
  const endEffectorPosition = calculateEndEffectorPosition(currentAngles)

  return (
    <group>
      {/* Ejes de referencia del sistema de coordenadas */}
      <group>
        {/* Eje X - Rojo */}
        <mesh position={[1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshBasicMaterial color='#ff0000' />
        </mesh>
        <Text position={[2.2, 0, 0]} fontSize={0.15} color='#ff0000'>
          X
        </Text>

        {/* Eje Y - Verde */}
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshBasicMaterial color='#00ff00' />
        </mesh>
        <Text position={[0, 2.2, 0]} fontSize={0.15} color='#00ff00'>
          Y
        </Text>

        {/* Eje Z - Azul */}
        <mesh position={[0, 0, 1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
          <meshBasicMaterial color='#0000ff' />
        </mesh>
        <Text position={[0, 0, 2.2]} fontSize={0.15} color='#0000ff'>
          Z
        </Text>
      </group>

      {/* Base del robot con rotación en Y */}
      <group rotation={[0, currentAngles.baseRotation, 0]}>
        {/* Plataforma base */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.5, 16]} />
          <meshBasicMaterial color='#34495e' />
        </mesh>

        {/* Torre base */}
        <mesh position={[0, linkLengths.base / 2, 0]}>
          <cylinderGeometry args={[0.2, 0.2, linkLengths.base, 8]} />
          <meshBasicMaterial color='#7f8c8d' />
        </mesh>

        {/* Cadena articulada - Cada elemento se rota respecto a su padre */}
        <group position={[0, linkLengths.base, 0]}>
          <RobotJoint
            rotation={currentAngles.joint1Angle}
            length={linkLengths.link1}
            color='#3498db'
            name='Link 1'
          >
            <RobotJoint
              rotation={currentAngles.joint2Angle}
              length={linkLengths.link2}
              color='#e74c3c'
              name='Link 2'
            >
              <RobotJoint
                rotation={currentAngles.joint3Angle}
                length={linkLengths.link3}
                color='#f39c12'
                name='Link 3'
              >
                {/* End-effector */}
                <mesh ref={endEffectorRef} position={[0, 0, 0]}>
                  <coneGeometry args={[0.1, 0.3, 6]} />
                  <meshBasicMaterial color='#e67e22' />
                </mesh>
              </RobotJoint>
            </RobotJoint>
          </RobotJoint>
        </group>
      </group>

      {/* Visualización de la trayectoria con Line */}
      {showTrajectory && trajectory.length > 1 && (
        <Line
          points={trajectory}
          color='#00ff00'
          lineWidth={4}
          dashed={false}
        />
      )}

      {/* Indicador de posición actual del end-effector */}
      <mesh position={endEffectorPosition}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color='#00ff00' />
      </mesh>

      {/* Texto informativo de posición del end-effector */}
      <Text
        position={[
          endEffectorPosition.x,
          endEffectorPosition.y + 0.5,
          endEffectorPosition.z,
        ]}
        fontSize={0.12}
        color='#00ff00'
        anchorX='center'
        anchorY='middle'
      >
        {`End-Effector\nX: ${endEffectorPosition.x.toFixed(
          2
        )}\nY: ${endEffectorPosition.y.toFixed(
          2
        )}\nZ: ${endEffectorPosition.z.toFixed(2)}`}
      </Text>

      {/* Información de ángulos actuales */}
      <Text
        position={[-3, 4, 0]}
        fontSize={0.1}
        color='#ffffff'
        anchorX='left'
        anchorY='top'
      >
        {`Ángulos Actuales (rad):\nBase: ${(
          currentAngles.baseRotation || 0
        ).toFixed(2)}\nHombro: ${(currentAngles.joint1Angle || 0).toFixed(
          2
        )}\nCodo: ${(currentAngles.joint2Angle || 0).toFixed(2)}\nMuñeca: ${(
          currentAngles.joint3Angle || 0
        ).toFixed(2)}`}
      </Text>
    </group>
  )
}

export default RoboticArm
