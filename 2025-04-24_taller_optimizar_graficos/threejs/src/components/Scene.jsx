import React from 'react'
import Lights from './Lights'
import TreeLOD from './TreeLOD'
import { useTexture } from '@react-three/drei'

export default function Scene() {
  const bakedGround = useTexture('/textures/baked_ground.webp')

  return (
    <>
      <Lights />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial map={bakedGround} />
      </mesh>
      <TreeLOD position={[0, 0, 0]} />
      <TreeLOD position={[5, 0, -3]} />
      <TreeLOD position={[-4, 0, 2]} />
    </>
  )
}
