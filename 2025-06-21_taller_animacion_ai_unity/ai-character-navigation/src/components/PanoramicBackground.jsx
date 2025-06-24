import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

function PanoramicBackground() {
  // Usar una imagen panorámica 360 de una ciudad
  const texture = useLoader(TextureLoader, 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=2044&q=80')
  
  // Configurar la textura para repetición panorámica
  texture.mapping = THREE.EquirectangularReflectionMapping
  texture.flipY = false
  
  return (
    <mesh>
      <sphereGeometry args={[50, 32, 16]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.BackSide} // Renderizar el interior de la esfera
        fog={false} // No aplicar niebla al fondo
      />
    </mesh>
  )
}

export default PanoramicBackground
