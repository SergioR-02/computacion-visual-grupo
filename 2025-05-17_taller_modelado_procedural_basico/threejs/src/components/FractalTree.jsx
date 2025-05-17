import { useMemo } from 'react'

export default function FractalTree({ depth = 0, maxDepth = 4, scale = 1 }) {
  const branchHeight = scale

  // Detener si se alcanza profundidad máxima
  if (depth > maxDepth) return null

  const color = useMemo(() => {
    const hue = (depth * 50) % 360
    return `hsl(${hue}, 100%, 50%)`
  }, [depth])

  return (
    <group>
      {/* Tronco actual */}
      <mesh position={[0, branchHeight / 2, 0]}>
        <boxGeometry args={[0.1 * scale, branchHeight, 0.1 * scale]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Hacer que los hijos se ramifiquen desde la parte superior del tronco */}
      <group position={[0, branchHeight, 0]}>
        {/* Rama izquierda */}
        <group rotation={[0, 0, Math.PI / 4]}>
          <FractalTree depth={depth + 1} maxDepth={maxDepth} scale={scale * 0.7} />
        </group>

        {/* Rama derecha */}
        <group rotation={[0, 0, -Math.PI / 4]}>
          <FractalTree depth={depth + 1} maxDepth={maxDepth} scale={scale * 0.7} />
        </group>
      </group>
    </group>
  )
}
