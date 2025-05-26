// Importamos React para definir el componente
import React from 'react'

// Importamos el componente de luces personalizadas
import Lights from './Lights'

// Importamos el componente que maneja el LOD de los árboles (alta y baja calidad)
import TreeLOD from './TreeLOD'

// Importamos hook para cargar texturas fácilmente desde Drei
import { useTexture } from '@react-three/drei'

// Componente principal que representa la escena 3D
export default function Scene() {

  // Cargamos la textura optimizada en formato .webp para el suelo
  const bakedGround = useTexture('/textures/baked_ground.webp')

  return (
    <>
      {/* Añadimos luces globales a la escena */}
      <Lights />

      {/* Plano que actúa como terreno, rotado para estar plano en el eje XZ */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        {/* Geometría del plano, de 20x20 unidades */}
        <planeGeometry args={[20, 20]} />
        
        {/* Material estándar con textura optimizada aplicada */}
        <meshStandardMaterial map={bakedGround} />
      </mesh>

      {/* Instanciamos tres árboles en diferentes posiciones con su LOD */}
      <TreeLOD position={[0, 0, 0]} />
      <TreeLOD position={[5, 0, -3]} />
      <TreeLOD position={[-4, 0, 2]} />
    </>
  )
}
