import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

function CityBackground() {
  // URL de imagen de ciudad desde Unsplash (gratuita y sin restricciones)
  const cityImageUrl = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=2044&q=80'
  
  try {
    const texture = useLoader(TextureLoader, cityImageUrl)
    
    return (
      <group>
        {/* Fondo de ciudad lejano */}
        <mesh position={[0, 8, -40]} scale={[80, 40, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={texture} transparent opacity={0.8} />
        </mesh>
        
        {/* Fondo de cielo */}
        <mesh position={[0, 20, -50]} scale={[100, 50, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#87CEEB" />
        </mesh>
      </group>
    )
  } catch (error) {
    console.log('Error cargando imagen de ciudad, usando fondo de respaldo')
    // Si falla cargar la imagen, usar un gradiente de respaldo
    return (
      <group>
        <mesh position={[0, 8, -40]} scale={[80, 40, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#4A5568" />
        </mesh>
        
        <mesh position={[0, 20, -50]} scale={[100, 50, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#87CEEB" />
        </mesh>
      </group>
    )
  }
}

export default CityBackground
