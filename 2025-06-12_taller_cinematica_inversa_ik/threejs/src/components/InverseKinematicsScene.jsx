import React, { useRef, useState } from 'react'
import { OrbitControls, Grid, Line, Html, Stats } from '@react-three/drei'
import { useControls } from 'leva'
import RoboticArm from './RoboticArm'
import SimpleArm from './SimpleArm'
import Target from './Target'

function InverseKinematicsScene() {
  const orbitControlsRef = useRef()
  const [targetPosition, setTargetPosition] = useState([5, 3, 0])
  const [armStats, setArmStats] = useState({
    distance: 0,
    iterations: 0,
    converged: false
  })
  const [currentMode, setCurrentMode] = useState('IK') // 'IK' o 'FK'

  const {
    enableIK,
    enableFK,
    maxIterations,
    tolerance,
    segmentLength,
    showDebug,
    showTrajectory,
    resetPosition,
    predefinedPose,
    joint1Angle,
    joint2Angle,
    joint3Angle
  } = useControls({
    'Algorithm Mode': {
      enableIK: { 
        value: true, 
        label: 'Inverse Kinematics (IK)',
        onChange: (value) => {
          if (value) {
            setCurrentMode('IK')
          }
        }
      },
      enableFK: { 
        value: false, 
        label: 'Forward Kinematics (FK)',
        onChange: (value) => {
          if (value) {
            setCurrentMode('FK')
          }
        }
      }
    },
    'IK Parameters': {
      maxIterations: { value: 15, min: 1, max: 50, step: 1, label: 'Max Iterations' },
      tolerance: { value: 0.15, min: 0.01, max: 1, step: 0.01, label: 'Tolerance' },
      segmentLength: { value: 2, min: 1, max: 3, step: 0.1, label: 'Segment Length' }
    },
    'FK Controls': {
      joint1Angle: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1, label: 'Joint 1 (Shoulder)' },
      joint2Angle: { value: Math.PI/4, min: -Math.PI*0.8, max: Math.PI*0.1, step: 0.1, label: 'Joint 2 (Elbow)' },
      joint3Angle: { value: -Math.PI/6, min: -Math.PI*0.6, max: Math.PI*0.6, step: 0.1, label: 'Joint 3 (Wrist)' }
    },
    'Predefined Poses': {
      predefinedPose: {
        options: {
          'Home': [0, Math.PI/4, -Math.PI/6],
          'Extended': [Math.PI/6, -Math.PI/8, Math.PI/4],
          'Folded': [-Math.PI/4, Math.PI/2, -Math.PI/3],
          'Reach Up': [Math.PI/3, -Math.PI/6, Math.PI/6],
          'Reach Down': [-Math.PI/6, Math.PI/3, -Math.PI/4]
        },
        label: 'Quick Poses'
      }
    },
    'Visualization': {
      showDebug: { value: true, label: 'Show Debug Info' },
      showTrajectory: { value: true, label: 'Show Trajectory' }
    },
    'Controls': {
      resetPosition: {
        value: () => setTargetPosition([5, 3, 0]),
        label: 'Reset Target'
      }
    }
  })

  // Predefined target positions for demo
  const demoPositions = [
    [5, 3, 0],
    [3, 5, 1],
    [-2, 4, -1],
    [6, 1, 2],
    [2, 6, 0]
  ]

  return (
    <>
      {/* Performance Statistics */}
      <Stats />

      {/* Lighting Setup */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.4} />
      <hemisphereLight skyColor="#87CEEB" groundColor="#8B4513" intensity={0.2} />

      {/* Environment */}
      <Grid 
        args={[20, 20]} 
        position={[0, -2, 0]} 
        cellSize={1} 
        cellThickness={1} 
        cellColor={'#444444'} 
        sectionSize={5} 
        sectionThickness={1.5} 
        sectionColor={'#666666'} 
        fadeDistance={30} 
        fadeStrength={1} 
      />

      {/* Ground plane for shadows */}
      <mesh position={[0, -2.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>      {/* Robotic Arm - Using SimpleArm (functional version) */}
      <SimpleArm 
        targetPosition={targetPosition}
        enableIK={currentMode === 'IK'}
        enableFK={currentMode === 'FK'}
        maxIterations={maxIterations}
        tolerance={tolerance}
        segmentLength={segmentLength}
        onStatsUpdate={setArmStats}
        fkAngles={[joint1Angle, joint2Angle, joint3Angle]}
        predefinedPose={predefinedPose}
      />
      
      {/* Original RoboticArm (commented out for debugging) */}
      {/*
      <RoboticArm
        targetPosition={targetPosition}
        enableIK={enableIK}
        maxIterations={maxIterations}
        tolerance={tolerance}
        segmentLength={segmentLength}
        onStatsUpdate={setArmStats}
      />
      */}      {/* Target */}
      <Target
        position={targetPosition}
        onPositionChange={setTargetPosition}
        orbitControlsRef={orbitControlsRef}
      />

      {/* Reference markers */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>

      {/* Debug Information Panel */}
      {showDebug && (
        <Html position={[8, 6, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            fontFamily: 'monospace',
            fontSize: '13px',
            minWidth: '280px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <h4 style={{ 
              margin: '0 0 15px 0', 
              color: '#4CAF50',
              fontSize: '16px',
              borderBottom: '1px solid rgba(76, 175, 80, 0.3)',
              paddingBottom: '8px'
            }}>
              🎯 IK Debug Panel
            </h4>
              <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Algorithm Mode:</span>
                <span style={{ color: '#9C27B0' }}>
                  {currentMode === 'IK' ? '🎯 Inverse Kinematics' : '🔧 Forward Kinematics'}
                </span>
              </div>
              
              {currentMode === 'IK' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Distance to Target:</span>
                    <span style={{ color: armStats.distance < tolerance ? '#4CAF50' : '#FF9800' }}>
                      {armStats.distance.toFixed(3)}m
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Iterations:</span>
                    <span style={{ color: '#2196F3' }}>{armStats.iterations}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Status:</span>
                    <span style={{ color: armStats.converged ? '#4CAF50' : '#FF9800' }}>
                      {armStats.converged ? '✅ Converged' : '⚠️ Working'}
                    </span>
                  </div>
                </>
              )}
              
              {currentMode === 'FK' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Joint 1 Angle:</span>
                    <span style={{ color: '#4CAF50' }}>
                      {(joint1Angle * 180 / Math.PI).toFixed(1)}°
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Joint 2 Angle:</span>
                    <span style={{ color: '#2196F3' }}>
                      {(joint2Angle * 180 / Math.PI).toFixed(1)}°
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Joint 3 Angle:</span>
                    <span style={{ color: '#FF9800' }}>
                      {(joint3Angle * 180 / Math.PI).toFixed(1)}°
                    </span>
                  </div>
                </>
              )}
              
              <hr style={{ border: '1px solid rgba(255, 255, 255, 0.1)', margin: '10px 0' }} />
              
              <div>
                <div style={{ marginBottom: '5px', fontSize: '12px', opacity: 0.8 }}>
                  Target Position:
                </div>
                <div style={{ color: '#FF5722', fontSize: '11px' }}>
                  X: {targetPosition[0].toFixed(2)}, 
                  Y: {targetPosition[1].toFixed(2)}, 
                  Z: {targetPosition[2].toFixed(2)}
                </div>
              </div>
            </div>
              <div style={{ 
              marginTop: '15px', 
              fontSize: '10px', 
              opacity: 0.6,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '10px'
            }}>
              {currentMode === 'IK' 
                ? 'Cyclic Coordinate Descent (CCD) Algorithm'
                : 'Manual Joint Control Mode'
              }
            </div>
          </div>
        </Html>
      )}

      {/* Quick Demo Positions */}
      <Html position={[-8, 6, 0]} style={{ pointerEvents: 'auto' }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>          <h4 style={{ margin: '0 0 10px 0', color: '#2196F3' }}>
            {currentMode === 'IK' ? '🎮 Quick Demo Positions' : '🎛️ Predefined Poses'}
          </h4>
          {currentMode === 'IK' ? (
            // Mostrar posiciones de demostración para IK
            demoPositions.map((pos, index) => (
              <button
                key={index}
                onClick={() => setTargetPosition([...pos])}
                style={{
                  background: 'rgba(33, 150, 243, 0.2)',
                  border: '1px solid rgba(33, 150, 243, 0.5)',
                  color: 'white',
                  padding: '5px 10px',
                  margin: '2px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(33, 150, 243, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(33, 150, 243, 0.2)'
                }}
              >
                Pos {index + 1}
              </button>
            ))
          ) : (
            // Mostrar poses predefinidas para FK
            <div style={{ fontSize: '11px', color: '#cccccc' }}>
              <div style={{ marginBottom: '8px', color: '#2196F3' }}>
                Use los controles Leva para:
              </div>
              <div>• Seleccionar poses predefinidas</div>
              <div>• Ajustar ángulos manualmente</div>
              <div>• Explorar diferentes configuraciones</div>
            </div>
          )}
        </div>
      </Html>

      {/* Trajectory line from base to target */}
      {showTrajectory && (
        <Line
          points={[[0, 0, 0], targetPosition]}
          color="#888888"
          lineWidth={2}
          dashed={true}
          dashSize={0.2}
          gapSize={0.1}
        />
      )}

      {/* Coordinate system indicator */}
      <group position={[0, 0, 0]}>
        {/* X axis - Red */}
        <Line points={[[0, 0, 0], [2, 0, 0]]} color="#ff0000" lineWidth={3} />
        <mesh position={[2, 0, 0]}>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
        
        {/* Y axis - Green */}
        <Line points={[[0, 0, 0], [0, 2, 0]]} color="#00ff00" lineWidth={3} />
        <mesh position={[0, 2, 0]} rotation={[0, 0, Math.PI/2]}>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
        
        {/* Z axis - Blue */}
        <Line points={[[0, 0, 0], [0, 0, 2]]} color="#0000ff" lineWidth={3} />
        <mesh position={[0, 0, 2]} rotation={[-Math.PI/2, 0, 0]}>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshBasicMaterial color="#0000ff" />
        </mesh>
      </group>      {/* Controls */}
      <OrbitControls 
        ref={orbitControlsRef}
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={3}
        maxDistance={25}
        maxPolarAngle={Math.PI * 0.8}
        minPolarAngle={Math.PI * 0.1}
        target={[2, 2, 0]}
      />
    </>
  )
}

export default InverseKinematicsScene
