// Hooks y funciones esenciales de React Three Fiber
import { useLoader, useThree } from '@react-three/fiber'

// Cargador de modelos GLTF
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// Importamos la librería Three.js directamente
import * as THREE from 'three'

// React hooks para referencias y efectos secundarios
import { useEffect, useRef } from 'react'

// Componente que representa un árbol con niveles de detalle (LOD)
export default function TreeLOD({ position = [0, 0, 0] }) {

  // Cargamos el modelo de alta calidad (más polígonos)
  const highModel = useLoader(GLTFLoader, '/models/tree_high.glb')

  // Cargamos el modelo de baja calidad (low poly)
  const lowModel = useLoader(GLTFLoader, '/models/tree2.glb')

  // Referencia para acceder y modificar el objeto LOD creado
  const lodRef = useRef()

  // Accedemos a la escena 3D global desde Three Fiber
  const scene = useThree((state) => state.scene)

  // Efecto que se ejecuta una vez que los modelos están cargados
  useEffect(() => {
    // Creamos una nueva instancia LOD (Level of Detail)
    const lod = new THREE.LOD()

    // Clonamos el modelo de alta calidad, lo escalamos y lo añadimos para distancia corta
    const high = highModel.scene.clone()
    high.scale.set(0.5, 0.5, 0.5)
    lod.addLevel(high, 0) // Se muestra desde cerca

    // Clonamos el modelo de baja calidad, lo escalamos y lo añadimos para distancia mayor
    const low = lowModel.scene.clone()
    low.scale.set(0.5, 0.5, 0.5)
    lod.addLevel(low, 10) // Se activa si la cámara está a más de 10 unidades

    // Posicionamos el LOD en el lugar deseado de la escena
    lod.position.set(...position)

    // Añadimos manualmente el LOD a la escena
    scene.add(lod)

    // Guardamos una referencia si necesitamos modificarlo luego
    lodRef.current = lod

  }, [highModel, lowModel, scene, position])

  // Este componente no devuelve ningún JSX visible directamente
  return null
}
