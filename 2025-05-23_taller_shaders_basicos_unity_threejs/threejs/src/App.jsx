// Importamos React Three Fiber y componentes de drei
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, shaderMaterial } from '@react-three/drei'

// Utilidad para registrar materiales personalizados
import { extend } from '@react-three/fiber'

// Importamos los shaders GLSL personalizados (deben estar en la carpeta /shaders)
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'

// Hook para referencias a elementos del DOM/escena
import { useRef } from 'react'

/* 
1. Definición de un nuevo material personalizado basado en shaders GLSL

 - `shaderMaterial` permite crear materiales reactivos en R3F.
 - Aquí se define un uniforme llamado `uTime` para animación temporal.
 - `vertex` y `fragment` son archivos GLSL externos importados.
*/
const ColorShiftMaterial = shaderMaterial(
  { uTime: 0 },     // Uniformes iniciales
  vertex,           // Código del shader de vértices
  fragment          // Código del shader de fragmentos
)

// Registramos el nuevo material para poder usarlo como <colorShiftMaterial />
extend({ ColorShiftMaterial })

/*
2. Componente que muestra una caja animada usando el material con shader

 - Usa un `ref` para acceder al material y actualizar su uniform `uTime` en cada frame.
 - `useFrame` se ejecuta en cada renderizado del loop.
*/
function AnimatedBox() {
  const ref = useRef()

  // Animamos el uniforme uTime en cada frame
  useFrame(({ clock }) => {
    ref.current.uTime = clock.getElapsedTime()
  })

  return (
    <mesh>
      <boxGeometry />                     {/* Caja simple */}
      <colorShiftMaterial ref={ref} />   {/* Material con shader dinámico */}
    </mesh>
  )
}

/*
3. Escena principal con Canvas

 - Contiene una luz ambiente y una puntual para iluminar la caja.
 - `OrbitControls` permite al usuario mover la cámara con el mouse.
 - Se renderiza la caja animada con shader.
*/
export default function App() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />       {/* Luz ambiente tenue */}
      <pointLight position={[5, 5, 5]} />    {/* Luz puntual para sombras y brillos */}

      <AnimatedBox />                        {/* Objeto animado con shader */}

      <OrbitControls />                      {/* Control de cámara con mouse */}
    </Canvas>
  )
}
