function Terrain() {
  return (
    <>
      {/* Suelo principal - más amplio */}
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshLambertMaterial color="#8FBC8F" />
      </mesh>
      
      {/* Líneas para orientación - adaptadas al nuevo tamaño */}
      <mesh position={[0, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 38]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[0.3, 38]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
    </>
  )
}

export default Terrain
