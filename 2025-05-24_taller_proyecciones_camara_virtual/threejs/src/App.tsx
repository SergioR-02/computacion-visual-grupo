import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrthographicCamera } from 'three';
import {
  CameraInfo,
  CameraControls,
  ProjectionIndicator,
  Scene3D,
  UIHeader,
} from './components';
import { useProjection, useCameraConfig } from './hooks';
import type { CameraType } from './types';
import './App.css';

function App() {
  const [cameraType, setCameraType] = useState<CameraType>('perspective');
  const [cameraRef, setCameraRef] = useState<
    PerspectiveCamera | OrthographicCamera | null
  >(null);

  const { projectedPoint } = useProjection();
  const cameraConfig = useCameraConfig();

  const handleCameraTypeChange = (newType: CameraType) => {
    setCameraType(newType);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Información de la cámara */}
      {cameraRef && (
        <CameraInfo
          camera={cameraRef}
          cameraType={cameraType}
          projectedPoint={projectedPoint}
        />
      )}

      {/* Controles de cámara */}
      <CameraControls
        cameraType={cameraType}
        onCameraTypeChange={handleCameraTypeChange}
      />

      {/* Título del taller */}
      <UIHeader />

      {/* Escena 3D */}
      <Canvas
        style={{ background: '#0f172a' }}
        onCreated={({ camera }) =>
          setCameraRef(camera as PerspectiveCamera | OrthographicCamera)
        }
      >
        {cameraType === 'perspective' ? (
          <perspectiveCamera
            {...cameraConfig.perspective}
            onUpdate={camera => setCameraRef(camera)}
          />
        ) : (
          <orthographicCamera
            {...cameraConfig.orthographic}
            onUpdate={camera => setCameraRef(camera)}
          />
        )}

        <Scene3D cameraType={cameraType} />
      </Canvas>

      {/* Indicador del punto proyectado */}
      <ProjectionIndicator projectedPoint={projectedPoint} />
    </div>
  );
}

export default App;

