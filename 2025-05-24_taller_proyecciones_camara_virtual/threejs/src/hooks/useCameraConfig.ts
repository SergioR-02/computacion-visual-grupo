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
        left: -5,
        right: 5,
        top: 5,
        bottom: -5,
        near: 0.1,
        far: 1000,
        position: [5, 3, 5] as [number, number, number],
        zoom: 1,
      },
    }),
    [],
  );
}
