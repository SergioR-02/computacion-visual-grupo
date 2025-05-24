import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import {
  CameraInfo,
  CameraControls,
  ProjectionIndicator,
  Scene3D,
  UIHeader,
  CameraExplanation,
} from './components';
import { useProjection, useCameraConfig } from './hooks';
import type { CameraType } from './types';
import './App.css';

function App() {
  const [cameraType, setCameraType] = useState<CameraType>('perspective');
  const [cameraRef, setCameraRef] = useState<any>(null);

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
      <Canvas style={{ background: '#0f172a' }}>
        {cameraType === 'perspective' ? (
          <PerspectiveCamera
            makeDefault
            position={cameraConfig.perspective.position}
            fov={cameraConfig.perspective.fov}
            aspect={cameraConfig.perspective.aspect}
            near={cameraConfig.perspective.near}
            far={cameraConfig.perspective.far}
            ref={setCameraRef}
          />
        ) : (
          <OrthographicCamera
            makeDefault
            position={cameraConfig.orthographic.position}
            left={cameraConfig.orthographic.left}
            right={cameraConfig.orthographic.right}
            top={cameraConfig.orthographic.top}
            bottom={cameraConfig.orthographic.bottom}
            near={cameraConfig.orthographic.near}
            far={cameraConfig.orthographic.far}
            zoom={cameraConfig.orthographic.zoom}
            ref={setCameraRef}
          />
        )}

        <Scene3D cameraType={cameraType} />
      </Canvas>

      {/* Indicador del punto proyectado */}
      <ProjectionIndicator projectedPoint={projectedPoint} />

      {/* Explicación de la cámara actual */}
      <CameraExplanation cameraType={cameraType} />
    </div>
  );
}

export default App;

