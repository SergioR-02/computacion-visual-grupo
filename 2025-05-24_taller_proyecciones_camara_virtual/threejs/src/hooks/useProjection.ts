import { useState, useEffect } from 'react';
import type { ProjectedPoint } from '../types';

export function useProjection() {
  const [projectedPoint, setProjectedPoint] = useState<ProjectedPoint | null>(
    null,
  );

  useEffect(() => {
    const handleProjectedPointUpdate = (event: CustomEvent<ProjectedPoint>) => {
      setProjectedPoint(event.detail);
    };

    window.addEventListener(
      'projectedPointUpdate',
      handleProjectedPointUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        'projectedPointUpdate',
        handleProjectedPointUpdate as EventListener,
      );
    };
  }, []);

  const updateProjectedPoint = (point: ProjectedPoint) => {
    window.dispatchEvent(
      new CustomEvent('projectedPointUpdate', { detail: point }),
    );
  };

  return { projectedPoint, updateProjectedPoint };
}
