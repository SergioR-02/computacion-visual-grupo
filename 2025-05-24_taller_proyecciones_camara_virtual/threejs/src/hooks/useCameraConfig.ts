import { useMemo } from 'react';
import type { CameraConfig } from '../types';

export function useCameraConfig(): CameraConfig {
  return useMemo(
    () => ({
      perspective: {
        fov: 75,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 1000,
        position: [5, 3, 5] as [number, number, number],
      },
      orthographic: {
        left: -8,
        right: 8,
        top: 6,
        bottom: -6,
        near: 0.1,
        far: 1000,
        position: [5, 3, 5] as [number, number, number],
      },
    }),
    [],
  );
}
