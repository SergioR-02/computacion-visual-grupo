import type { CameraType } from '../types/index';

interface CameraControlsProps {
  cameraType: CameraType;
  onCameraTypeChange: (type: CameraType) => void;
}

export function CameraControls({
  cameraType,
  onCameraTypeChange,
}: CameraControlsProps) {
  const handleToggleCamera = () => {
    const newType =
      cameraType === 'perspective' ? 'orthographic' : 'perspective';
    onCameraTypeChange(newType);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <button
        onClick={handleToggleCamera}
        style={{
          padding: '12px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '8px',
          background: cameraType === 'perspective' ? '#3b82f6' : '#f59e0b',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {cameraType === 'perspective'
          ? '📐 Cambiar a Ortográfica'
          : '🔍 Cambiar a Perspectiva'}
      </button>

      <div
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '12px',
          textAlign: 'center',
        }}
      >
        💡 Usa el mouse para orbitar,
        <br />
        zoom y explorar la escena
      </div>
    </div>
  );
}
