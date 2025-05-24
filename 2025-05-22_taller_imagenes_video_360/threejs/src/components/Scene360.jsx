import React, { Suspense } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

function PanoramaSphere({ imageSrc }) {
  // Cargar la textura de la imagen equirectangular
  const texture = useTexture(imageSrc)

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[10, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  )
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[10, 60, 40]} />
      <meshBasicMaterial color='#333' side={THREE.BackSide} />
    </mesh>
  )
}

function Scene360({ currentImage }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PanoramaSphere imageSrc={currentImage.src} />
      {/* Luz ambiental para asegurar que la imagen se vea bien */}
      <ambientLight intensity={1} />
    </Suspense>
  )
}

export default Scene360
