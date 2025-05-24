import { PerspectiveCamera, OrthographicCamera } from 'three';
import type { CameraInfoProps } from '../types';

export function CameraInfo({
  camera,
  cameraType,
  projectedPoint,
}: CameraInfoProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px',
        zIndex: 1000,
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', color: '#4ade80' }}>
        📷 Cámara:{' '}
        {cameraType === 'perspective' ? 'Perspectiva' : 'Ortográfica'}
      </h3>

      {cameraType === 'perspective' && camera instanceof PerspectiveCamera && (
        <div>
          <div>🔍 FOV: {camera.fov.toFixed(1)}°</div>
          <div>📐 Aspect: {camera.aspect.toFixed(3)}</div>
          <div>📏 Near: {camera.near.toFixed(2)}</div>
          <div>🔭 Far: {camera.far.toFixed(0)}</div>
        </div>
      )}

      {cameraType === 'orthographic' &&
        camera instanceof OrthographicCamera && (
          <div>
            <div>⬅️ Left: {camera.left.toFixed(2)}</div>
            <div>➡️ Right: {camera.right.toFixed(2)}</div>
            <div>⬆️ Top: {camera.top.toFixed(2)}</div>
            <div>⬇️ Bottom: {camera.bottom.toFixed(2)}</div>
            <div>📏 Near: {camera.near.toFixed(2)}</div>
            <div>🔭 Far: {camera.far.toFixed(0)}</div>
          </div>
        )}

      {projectedPoint && (
        <div
          style={{
            marginTop: '10px',
            borderTop: '1px solid #444',
            paddingTop: '10px',
          }}
        >
          <div style={{ color: '#fbbf24' }}>🎯 Proyección 3D→2D:</div>
          <div>Screen X: {projectedPoint.x.toFixed(2)}</div>
          <div>Screen Y: {projectedPoint.y.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}
