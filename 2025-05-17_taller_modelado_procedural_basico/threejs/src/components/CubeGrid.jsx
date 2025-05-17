function Cube({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export default function CubeGrid() {
  const gridSize = 5
  const spacing = 2
  const cubes = []

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      cubes.push(<Cube key={`${x}-${y}`} position={[x * spacing, y * spacing, 0]} />)
    }
  }

  return <>{cubes}</>
}
