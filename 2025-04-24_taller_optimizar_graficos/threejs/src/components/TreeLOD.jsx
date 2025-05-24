import { useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'

export default function TreeLOD({ position = [0, 0, 0] }) {
  const highModel = useLoader(GLTFLoader, '/models/tree_high.glb')
  const lowModel = useLoader(GLTFLoader, '/models/tree2.glb')
  const lodRef = useRef()
  const scene = useThree((state) => state.scene)

  useEffect(() => {
    const lod = new THREE.LOD()

    const high = highModel.scene.clone()
    high.scale.set(0.5, 0.5, 0.5)
    lod.addLevel(high, 0) // visible de cerca

    const low = lowModel.scene.clone()
    low.scale.set(0.5, 0.5, 0.5)
    lod.addLevel(low, 10) // cambia cuando la distancia > 10

    lod.position.set(...position)
    scene.add(lod)
    lodRef.current = lod
  }, [highModel, lowModel, scene, position])

  return null // El modelo se agrega directamente a la escena
}
