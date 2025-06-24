function Obstacles() {
  const obstacles = [
    { position: [3, 0.5, 2], scale: [1, 1, 1], color: '#FF6B6B', type: 'box' },
    { position: [-4, 0.5, -3], scale: [1.5, 1, 1.5], color: '#4ECDC4', type: 'box' },
    { position: [6, 0.5, -1], scale: [1, 1.5, 1], color: '#45B7D1', type: 'cylinder' },
    { position: [-2, 0.5, 4], scale: [2, 0.5, 1], color: '#F9CA24', type: 'box' },
    { position: [0, 0.5, -6], scale: [1, 1, 2], color: '#6C5CE7', type: 'box' },
  ]

  return (
    <>
      {obstacles.map((obstacle, index) => (
        <mesh
          key={index}
          position={obstacle.position}
          castShadow
          receiveShadow
        >
          {obstacle.type === 'cylinder' ? (
            <cylinderGeometry args={[obstacle.scale[0]/2, obstacle.scale[0]/2, obstacle.scale[1]]} />
          ) : (
            <boxGeometry args={obstacle.scale} />
          )}
          <meshLambertMaterial color={obstacle.color} />
        </mesh>
      ))}
    </>
  )
}

export default Obstacles
