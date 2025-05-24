import type { ProjectedPoint } from '../types';

interface ProjectionIndicatorProps {
  projectedPoint: ProjectedPoint | null;
  size?: number;
  color?: string;
  borderColor?: string;
}

export function ProjectionIndicator({
  projectedPoint,
  size = 16,
  color = 'rgba(251, 191, 36, 0.3)',
  borderColor = '#fbbf24',
}: ProjectionIndicatorProps) {
  if (!projectedPoint) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: projectedPoint.x - size / 2,
        top: projectedPoint.y - size / 2,
        width: `${size}px`,
        height: `${size}px`,
        border: `2px solid ${borderColor}`,
        borderRadius: '50%',
        background: color,
        pointerEvents: 'none',
        zIndex: 999,
      }}
    />
  );
}
