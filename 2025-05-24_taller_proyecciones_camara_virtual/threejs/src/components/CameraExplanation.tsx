import type { CameraType } from '../types';

interface CameraExplanationProps {
  cameraType: CameraType;
}

export function CameraExplanation({ cameraType }: CameraExplanationProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        maxWidth: '400px',
        fontSize: '14px',
        zIndex: 1000,
      }}
    >
      <h4 style={{ margin: '0 0 10px 0', color: '#fbbf24' }}>
        💡{' '}
        {cameraType === 'perspective'
          ? 'Cámara Perspectiva'
          : 'Cámara Ortográfica'}
      </h4>

      {cameraType === 'perspective' ? (
        <div>
          <p style={{ margin: '5px 0' }}>
            ✅ <strong>Perspectiva realista:</strong> Los objetos lejanos se ven
            más pequeños
          </p>
          <p style={{ margin: '5px 0' }}>
            ✅ <strong>Punto de fuga:</strong> Las líneas paralelas convergen
          </p>
          <p style={{ margin: '5px 0' }}>
            ✅ <strong>Campo de visión (FOV):</strong> Define el ángulo de
            visión
          </p>
          <p style={{ margin: '5px 0', color: '#a3a3a3' }}>
            📸 Ideal para: Juegos, visualizaciones realistas, simulaciones
          </p>
        </div>
      ) : (
        <div>
          <p style={{ margin: '5px 0' }}>
            ✅ <strong>Sin perspectiva:</strong> Los objetos mantienen su tamaño
            sin importar la distancia
          </p>
          <p style={{ margin: '5px 0' }}>
            ✅ <strong>Líneas paralelas:</strong> Se mantienen paralelas, no
            convergen
          </p>
          <p style={{ margin: '5px 0' }}>
            ✅ <strong>Vista isométrica:</strong> Perfecta para planos técnicos
          </p>
          <p style={{ margin: '5px 0', color: '#a3a3a3' }}>
            📐 Ideal para: CAD, arquitectura, diseño técnico, juegos isométricos
          </p>
        </div>
      )}
    </div>
  );
}
