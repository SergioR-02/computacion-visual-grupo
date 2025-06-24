function Lighting() {
  return (
    <>
      {/* Luz ambiente fuerte para que todo sea visible */}
      <ambientLight intensity={0.8} />
      
      {/* Luz direccional principal */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      
      {/* Luz adicional desde otro ángulo */}
      <directionalLight
        position={[-10, 10, -5]}
        intensity={0.5}
      />
      
      {/* Luz desde arriba */}
      <pointLight position={[0, 15, 0]} intensity={0.8} />
    </>
  )
}

export default Lighting
