interface UIHeaderProps {
  title?: string;
  subtitle?: string;
  position?: 'top' | 'bottom';
}

export function UIHeader({
  title = '🎯 Taller: Proyecciones de Cámara',
  subtitle = 'Visualización de efectos de proyección perspectiva vs ortográfica',
  position = 'bottom',
}: UIHeaderProps) {
  const positionStyles =
    position === 'bottom'
      ? { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
      : { top: '20px', left: '50%', transform: 'translateX(-50%)' };

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyles,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px 25px',
        borderRadius: '8px',
        zIndex: 1000,
        textAlign: 'center',
      }}
    >
      <h2 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{title}</h2>
      <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>{subtitle}</p>
    </div>
  );
}
