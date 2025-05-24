import { PerspectiveCamera, OrthographicCamera } from 'three';

export type CameraType = 'perspective' | 'orthographic';

export interface ProjectedPoint {
  x: number;
  y: number;
}

export interface CameraInfoProps {
  camera: PerspectiveCamera | OrthographicCamera;
  cameraType: CameraType;
  projectedPoint: ProjectedPoint | null;
}

export interface CameraConfig {
  perspective: {
    fov: number;
    aspect: number;
    near: number;
    far: number;
    position: [number, number, number];
  };
  orthographic: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    near: number;
    far: number;
    position: [number, number, number];
  };
}
