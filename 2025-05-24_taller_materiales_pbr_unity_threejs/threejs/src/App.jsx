import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Text, useTexture } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'
import './App.css'

// Componente para el objeto con material PBR
function PBRObject({ position, geometry = "sphere" }) {
  // Panel de control con Leva
  const {
    roughness,
    metalness,
    color,
    normalScale,
    envMapIntensity,
    clearcoat,
    clearcoatRoughness
  } = useControls('Material PBR', {
    roughness: { value: 0.5, min: 0, max: 1, step: 0.01 },
    metalness: { value: 0.5, min: 0, max: 1, step: 0.01 },
    color: '#ffffff',
    normalScale: { value: 1, min: 0, max: 2, step: 0.1 },
    envMapIntensity: { value: 1, min: 0, max: 3, step: 0.1 },
    clearcoat: { value: 0, min: 0, max: 1, step: 0.01 },
    clearcoatRoughness: { value: 0, min: 0, max: 1, step: 0.01 }
  })

  // Cargar texturas PBR (usando texturas procedurales como ejemplo)
  // En un proyecto real, cargarías texturas desde archivos
  const colorTexture = useTexture('/textures/color1.jpg', (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 1)
  })

  const roughnessTexture = useTexture('/textures/roughness1.jpg', (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 1)
  })

  const metalnessTexture = useTexture('/textures/metalness.jpg', (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 1)
  })

  const normalTexture = useTexture('/textures/normal1.jpg', (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 1)
  })

  // Geometría dinámica
  const GeometryComponent = () => {
    switch (geometry) {
      case "box":
        return <boxGeometry args={[2, 2, 2]} />
      case "sphere":
        return <sphereGeometry args={[1, 32, 32]} />
      case "torus":
        return <torusGeometry args={[1, 0.4, 16, 100]} />
      default:
        return <sphereGeometry args={[1, 32, 32]} />
    }
  }

  return (
    <mesh position={position} castShadow receiveShadow>
      <GeometryComponent />
      <meshPhysicalMaterial
        // Texturas básicas
        map={colorTexture}
        roughnessMap={roughnessTexture}
        metalnessMap={metalnessTexture}
        normalMap={normalTexture}
        
        // Propiedades controlables
        roughness={roughness}
        metalness={metalness}
        color={color}
        normalScale={[normalScale, normalScale]}
        envMapIntensity={envMapIntensity}
        
        // Propiedades adicionales para MeshPhysicalMaterial
        clearcoat={clearcoat}
        clearcoatRoughness={clearcoatRoughness}
        
        // Configuraciones adicionales
        transparent={false}
        side={THREE.FrontSide}
      />
    </mesh>
  )
}

// Componente para objeto básico (comparación)
function BasicObject({ position }) {
  const { basicColor } = useControls('Material Básico', {
    basicColor: '#ff6b6b'
  })

  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color={basicColor} />
    </mesh>
  )
}

// Componente para el piso
function Floor() {
  const { floorColor, floorRoughness } = useControls('Piso', {
    floorColor: '#808080',
    floorRoughness: { value: 0.8, min: 0, max: 1, step: 0.01 }
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial 
        color={floorColor} 
        roughness={floorRoughness}
        metalness={0.1}
      />
    </mesh>
  )
}

// Componente para las luces
function Lighting() {
  const { 
    ambientIntensity, 
    directionalIntensity,
    directionalPosition 
  } = useControls('Iluminación', {
    ambientIntensity: { value: 0.3, min: 0, max: 1, step: 0.01 },
    directionalIntensity: { value: 1, min: 0, max: 3, step: 0.01 },
    directionalPosition: {
      value: { x: 5, y: 5, z: 5 },
      step: 0.1
    }
  })

  return (
    <>
      {/* Luz ambiental */}
      <ambientLight intensity={ambientIntensity} />
      
      {/* Luz direccional */}
      <directionalLight
        position={[directionalPosition.x, directionalPosition.y, directionalPosition.z]}
        intensity={directionalIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Luz puntual adicional */}
      <pointLight position={[-5, 5, 0]} intensity={0.5} color="#4fc3f7" />
    </>
  )
}

// Componente para etiquetas de texto
function Labels() {
  return (
    <>
      <Text
        position={[-3, 3, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Material PBR
      </Text>
      <Text
        position={[3, 3, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Material Básico
      </Text>
    </>
  )
}

// Componente principal de la escena
function Scene() {
  const { objectType } = useControls('Geometría', {
    objectType: {
      value: 'sphere',
      options: ['sphere', 'box', 'torus']
    }
  })

  return (
    <>
      <Lighting />
      <Floor />
      
      {/* Objeto con material PBR */}
      <PBRObject position={[-3, 0, 0]} geometry={objectType} />
      
      {/* Objeto con material básico para comparación */}
      <BasicObject position={[3, 0, 0]} />
      
      {/* Etiquetas */}
      <Labels />
      
      {/* Controles de cámara */}
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
      />
      
      {/* Entorno HDRI para reflexiones */}
      <Environment preset="sunset" />
    </>
  )
}

function App() {
  return (
    <div className="app-container">
      <h1>Taller de Materiales PBR - Three.js</h1>
      <div className="canvas-container">
        <Canvas
          shadows
          camera={{ position: [0, 5, 10], fov: 60 }}
          gl={{ antialias: true }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
      <div className="instructions">
        <h3>Instrucciones:</h3>
        <ul>
          <li>Usa el panel de control para modificar las propiedades del material PBR</li>
          <li>Compara con el material básico en el objeto de la derecha</li>
          <li>Experimenta con roughness, metalness y otros parámetros</li>
          <li>Usa el mouse para rotar, hacer zoom y mover la cámara</li>
        </ul>
      </div>
    </div>
  )
}

export default App