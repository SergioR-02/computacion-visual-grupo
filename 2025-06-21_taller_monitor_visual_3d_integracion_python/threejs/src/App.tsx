/**
 * 🧪 Taller - Monitor de Actividad Visual 3D MEJORADO
 * Parte 2: Visualización 3D Reactiva con Three.js - UI Moderna
 *
 * Esta aplicación crea una escena 3D que responde en tiempo real
 * a los datos de visión por computador enviados desde Python.
 */

// @ts-nocheck

import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
  useCallback,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Stats,
  Text,
  Html,
  Box,
  Sphere,
  Cone,
  Cylinder,
  Environment,
  ContactShadows,
  Float,
  PerspectiveCamera,
} from '@react-three/drei';
import { useControls, folder } from 'leva';
import * as THREE from 'three';
import './App.css';
import './types.d.ts';

// Tipos para los datos recibidos
interface VisualData {
  timestamp: number;
  people_count: number;
  objects_count: number;
  detections?: Array<{
    class: string;
    confidence: number;
    bbox: [number, number, number, number];
    center: [number, number];
    area: number;
  }>;
  pose_detected?: boolean;
  pose_landmarks?: number[];
  hands_count: number;
  hand_gestures?: string[];
  faces_count: number;
  face_positions?: Array<{
    center: [number, number];
    bbox: [number, number, number, number];
    confidence: number;
  }>;
  movement_intensity: number;
  dominant_colors?: number[][];
  frame_size: [number, number];
}

const initialVisualData: VisualData = {
  timestamp: Date.now() / 1000,
  people_count: 0,
  objects_count: 0,
  detections: [],
  pose_detected: false,
  pose_landmarks: [],
  hands_count: 0,
  hand_gestures: [],
  faces_count: 0,
  face_positions: [],
  movement_intensity: 0,
  dominant_colors: [[40, 40, 40]],
  frame_size: [320, 240],
};

// Hook de WebSocket robusto y simplificado (versión 5)
const useWebSocket = (url: string) => {
  const [data, setData] = useState<VisualData | null>(null);
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isMounted = true;
    let reconnectAttempts = 0;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      // No reconectar si el componente ya no está montado
      if (!isMounted) return;

      // Limpiar conexión anterior si existe
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        ws.current.close();
      }

      console.log(`🔄 Intentando conectar WebSocket...`);
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        if (!isMounted) return;
        console.log('🔌 Conexión WebSocket establecida exitosamente');
        setConnected(true);
        reconnectAttempts = 0; // Reiniciar en conexión exitosa
      };

      ws.current.onmessage = event => {
        if (!isMounted) return;
        try {
          const receivedData = JSON.parse(event.data);

          // Si es un mensaje de bienvenida, ignorarlo
          if (receivedData.type === 'connection') {
            console.log('✅ Mensaje de bienvenida recibido');
            return;
          }

          // Si tiene timestamp, es un mensaje de datos visuales
          if (receivedData.timestamp) {
            console.log('📊 Datos visuales actualizados:', {
              personas: receivedData.people_count,
              objetos: receivedData.objects_count,
              manos: receivedData.hands_count,
              movimiento: receivedData.movement_intensity,
            });
            setData(receivedData);
          }
        } catch (e) {
          console.error('❌ Error parseando datos WebSocket:', e);
        }
      };

      ws.current.onerror = err => {
        if (!isMounted) return;
        console.error('❌ Error WebSocket: ', err);
      };

      ws.current.onclose = () => {
        if (!isMounted) return;
        console.log(`❌ Conexión WebSocket cerrada.`);
        setConnected(false);
        setData(null); // Poner en estado de carga al desconectar

        reconnectAttempts++;
        // Backoff exponencial para no sobrecargar el servidor
        const timeout = 1000 * Math.pow(2, Math.min(reconnectAttempts, 4)); // max 16s
        console.log(`⏰ Reintentando conexión en ${timeout}ms...`);
        reconnectTimeout = setTimeout(connect, timeout);
      };
    };

    connect();

    // Función de limpieza al desmontar el componente
    return () => {
      isMounted = false;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws.current) {
        // Cerrar explícitamente la conexión
        ws.current.onclose = null;
        ws.current.close(1000, 'Componente desmontado');
      }
    };
  }, [url]); // Solo se vuelve a ejecutar si la URL cambia

  return { data, connected };
};

// Componente de carga mejorado
const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = 'Cargando...',
}) => (
  <Html center>
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  </Html>
);

// Componente para objetos reactivos mejorados
const ReactiveObject: React.FC<{
  position: [number, number, number];
  scale: number;
  color: string;
  type: 'box' | 'sphere' | 'cone' | 'cylinder';
  rotation?: [number, number, number];
  intensity?: number;
  label?: string;
  animated?: boolean;
}> = ({
  position,
  scale,
  color,
  type,
  rotation = [0, 0, 0],
  intensity = 1,
  label,
  animated = true,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animación suave basada en intensidad
  useFrame(state => {
    if (meshRef.current && animated) {
      const time = state.clock.getElapsedTime();
      const targetScale = scale * (1 + intensity * 0.3);

      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1,
      );

      // Rotación sutil basada en intensidad
      meshRef.current.rotation.y += intensity * 0.01;

      // Efecto de "respiración" suave
      const breathScale = 1 + Math.sin(time * 2) * 0.05 * intensity;
      meshRef.current.scale.multiplyScalar(breathScale);
    }
  });

  // Efectos de hover
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material.emissive.setHex(hovered ? 0x222222 : 0x000000);
    }
  }, [hovered]);

  const renderGeometry = () => {
    const commonProps = {
      ref: meshRef,
      position,
      rotation,
      scale: [scale, scale, scale] as [number, number, number],
      onPointerOver: () => setHovered(true),
      onPointerOut: () => setHovered(false),
    };

    const material = (
      <meshPhongMaterial
        color={color}
        transparent
        opacity={0.85}
        shininess={100}
        specular={hovered ? color : '#ffffff'}
      />
    );

    switch (type) {
      case 'box':
        return <Box {...commonProps}>{material}</Box>;
      case 'sphere':
        return (
          <Sphere {...commonProps} args={[0.5, 32, 32]}>
            {material}
          </Sphere>
        );
      case 'cone':
        return (
          <Cone {...commonProps} args={[0.5, 1, 8]}>
            {material}
          </Cone>
        );
      case 'cylinder':
        return (
          <Cone {...commonProps} args={[0.5, 0.5, 1, 8]}>
            {material}
          </Cone>
        );
      default:
        return <Box {...commonProps}>{material}</Box>;
    }
  };

  return (
    <Float
      speed={animated ? 1 + intensity : 0}
      rotationIntensity={animated ? intensity : 0}
    >
      {renderGeometry()}
      {label && hovered && (
        <Html position={[0, 1, 0]} center>
          <div className="object-tooltip">{label}</div>
        </Html>
      )}
    </Float>
  );
};

// Componente de partículas mejorado
const MovementParticles: React.FC<{
  intensity: number;
  colors: number[][];
}> = ({ intensity, colors }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = Math.floor(intensity * 500) + 100;

  // Generar posiciones y colores
  const positions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

    const colorIndex = Math.floor(Math.random() * colors.length);
    const color = colors[colorIndex] || [255, 255, 255];
    particleColors[i * 3] = color[0] / 255;
    particleColors[i * 3 + 1] = color[1] / 255;
    particleColors[i * 3 + 2] = color[2] / 255;
  }

  useFrame(state => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += intensity * 0.005;
      particlesRef.current.rotation.x += intensity * 0.002;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particleColors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Panel de métricas en tiempo real mejorado
const MetricsPanel: React.FC<{
  data: VisualData;
  position: [number, number, number];
}> = ({ data, position }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Html position={position}>
      <div className={`metrics-panel ${expanded ? 'expanded' : 'collapsed'}`}>
        <div className="panel-header" onClick={() => setExpanded(!expanded)}>
          <h3>📊 Métricas Live</h3>
          <button className="toggle-btn">{expanded ? '▼' : '▶'}</button>
        </div>

        {expanded && (
          <div className="panel-content">
            <div className="metric-grid">
              <div className="metric-card primary">
                <div className="metric-icon">👥</div>
                <div className="metric-data">
                  <span className="metric-value">{data.people_count}</span>
                  <span className="metric-label">Personas</span>
                </div>
              </div>

              <div className="metric-card secondary">
                <div className="metric-icon">📦</div>
                <div className="metric-data">
                  <span className="metric-value">{data.objects_count}</span>
                  <span className="metric-label">Objetos</span>
                </div>
              </div>

              <div className="metric-card accent">
                <div className="metric-icon">🏃</div>
                <div className="metric-data">
                  <span className="metric-value">
                    {(data.movement_intensity * 100).toFixed(1)}%
                  </span>
                  <span className="metric-label">Movimiento</span>
                </div>
              </div>

              <div className="metric-card info">
                <div className="metric-icon">✋</div>
                <div className="metric-data">
                  <span className="metric-value">{data.hands_count}</span>
                  <span className="metric-label">Manos</span>
                </div>
              </div>
            </div>

            <div className="gesture-display">
              <h4>Gestos Detectados:</h4>
              <div className="gesture-chips">
                {data.hand_gestures && data.hand_gestures.length > 0 ? (
                  data.hand_gestures.map((gesture, index) => (
                    <span key={index} className={`gesture-chip ${gesture}`}>
                      {gesture === 'fist'
                        ? '✊'
                        : gesture === 'open_hand'
                        ? '✋'
                        : gesture === 'peace'
                        ? '✌️'
                        : gesture === 'pointing'
                        ? '👉'
                        : '🤏'}
                      {gesture}
                    </span>
                  ))
                ) : (
                  <span className="no-gestures">Sin gestos</span>
                )}
              </div>
            </div>

            <div className="timestamp">
              <small>
                Última actualización:{' '}
                {new Date(data.timestamp * 1000).toLocaleTimeString()}
              </small>
            </div>
          </div>
        )}
      </div>
    </Html>
  );
};

// Escena 3D principal mejorada
const Scene3D: React.FC<{ data: VisualData | null }> = ({ data }) => {
  const {
    scaleMultiplier,
    enableParticles,
    showMetrics,
    lightIntensity,
    autoRotate,
    cameraDistance,
    environmentPreset,
    colorScheme,
  } = useControls({
    'Configuración General': folder({
      scaleMultiplier: { value: 1, min: 0.1, max: 3, step: 0.1 },
      autoRotate: { value: true },
      cameraDistance: { value: 10, min: 5, max: 20, step: 1 },
    }),
    Visualización: folder({
      enableParticles: { value: true },
      showMetrics: { value: true },
      colorScheme: {
        value: 'neon',
        options: ['neon', 'pastel', 'vibrant', 'monochrome'],
      },
    }),
    Iluminación: folder({
      lightIntensity: { value: 1, min: 0.1, max: 3, step: 0.1 },
      environmentPreset: {
        value: 'night',
        options: [
          'sunset',
          'dawn',
          'night',
          'warehouse',
          'forest',
          'apartment',
        ],
      },
    }),
  });

  if (!data) {
    return <LoadingSpinner message="Esperando datos del monitor visual..." />;
  }

  console.log('🎬 Renderizando Scene3D con datos:', {
    personas: data.people_count,
    objetos: data.objects_count,
    manos: data.hands_count,
    movimiento: data.movement_intensity,
  });

  // Esquemas de colores
  const colorSchemes = {
    neon: {
      people: '#ff0080',
      objects: '#00ff80',
      movement: '#8000ff',
      hands: '#ffff00',
    },
    pastel: {
      people: '#ffb3d9',
      objects: '#b3ffcc',
      movement: '#ccb3ff',
      hands: '#ffffb3',
    },
    vibrant: {
      people: '#ff4444',
      objects: '#44ff44',
      movement: '#4444ff',
      hands: '#ffaa44',
    },
    monochrome: {
      people: '#ffffff',
      objects: '#cccccc',
      movement: '#888888',
      hands: '#666666',
    },
  };

  const colors = colorSchemes[colorScheme];

  // Escalas basadas en datos
  const peopleScale = Math.max(0.3, data.people_count * 0.3) * scaleMultiplier;
  const objectsScale =
    Math.max(0.3, data.objects_count * 0.2) * scaleMultiplier;
  const movementScale =
    Math.max(0.2, data.movement_intensity * 2) * scaleMultiplier;
  const handsScale = Math.max(0.2, data.hands_count * 0.4) * scaleMultiplier;

  return (
    <group>
      {/* Entorno y iluminación mejorada */}
      <Environment preset={environmentPreset} />
      <ContactShadows
        opacity={0.4}
        scale={20}
        blur={2}
        far={20}
        position={[0, -2, 0]}
      />

      {/* Iluminación dramática */}
      <ambientLight intensity={lightIntensity * 0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={lightIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight
        position={[-10, -10, -5]}
        intensity={lightIntensity * 0.6}
        color={colors.movement}
      />

      {/* Objetos reactivos principales mejorados */}
      <ReactiveObject
        position={[-3, 0, 0]}
        scale={peopleScale}
        color={colors.people}
        type="sphere"
        intensity={data.movement_intensity}
        label={`👥 Personas: ${data.people_count}`}
        animated={true}
      />

      <ReactiveObject
        position={[3, 0, 0]}
        scale={objectsScale}
        color={colors.objects}
        type="box"
        intensity={data.movement_intensity}
        label={`📦 Objetos: ${data.objects_count}`}
        animated={true}
      />

      <ReactiveObject
        position={[0, 2, 0]}
        scale={movementScale}
        color={colors.movement}
        type="cone"
        rotation={[0, 0, Math.PI]}
        intensity={data.movement_intensity}
        label={`🏃 Movimiento: ${(data.movement_intensity * 100).toFixed(1)}%`}
        animated={true}
      />

      <ReactiveObject
        position={[0, -2, 0]}
        scale={handsScale}
        color={colors.hands}
        type="cylinder"
        intensity={data.hands_count * 0.5}
        label={`✋ Manos: ${data.hands_count}`}
        animated={true}
      />

      {/* Objetos adicionales para gestos */}
      {data.hand_gestures &&
        data.hand_gestures.length > 0 &&
        data.hand_gestures.map((gesture, index) => (
          <ReactiveObject
            key={`gesture-${index}`}
            position={[
              Math.cos((index * Math.PI * 2) / data.hand_gestures.length) * 5,
              -1,
              Math.sin((index * Math.PI * 2) / data.hand_gestures.length) * 5,
            ]}
            scale={0.4 * scaleMultiplier}
            color={
              gesture === 'fist'
                ? '#ff4444'
                : gesture === 'open_hand'
                ? '#44ff44'
                : gesture === 'peace'
                ? '#4444ff'
                : gesture === 'pointing'
                ? '#ffaa44'
                : '#ff44ff'
            }
            type="sphere"
            intensity={data.movement_intensity}
            label={`${gesture}`}
            animated={true}
          />
        ))}

      {/* Partículas de movimiento */}
      {enableParticles &&
        data.dominant_colors &&
        data.dominant_colors.length > 0 && (
          <MovementParticles
            intensity={data.movement_intensity}
            colors={data.dominant_colors}
          />
        )}

      {/* Panel de métricas flotante */}
      {showMetrics && <MetricsPanel data={data} position={[-8, 4, 0]} />}

      {/* Grid de referencia sutil */}
      <gridHelper
        args={[20, 20, '#333333', '#222222']}
        position={[0, -2.1, 0]}
      />
    </group>
  );
};

// Barra de herramientas flotante
const FloatingToolbar: React.FC<{
  connected: boolean;
  onReset: () => void;
  onScreenshot: () => void;
  onToggleFullscreen: () => void;
}> = ({ connected, onReset, onScreenshot, onToggleFullscreen }) => {
  return (
    <div className="floating-toolbar">
      <button className="tool-btn" onClick={onReset} title="Reiniciar vista">
        🔄
      </button>
      <button
        className="tool-btn"
        onClick={onScreenshot}
        title="Capturar pantalla"
      >
        📸
      </button>
      <button
        className="tool-btn"
        onClick={onToggleFullscreen}
        title="Pantalla completa"
      >
        🔳
      </button>
      <div
        className={`connection-dot ${connected ? 'connected' : 'disconnected'}`}
      ></div>
    </div>
  );
};

// Componente principal de la aplicación mejorado
const App: React.FC = () => {
  const { data, connected } = useWebSocket('ws://localhost:8765');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleReset = useCallback(() => {
    // Lógica para reiniciar la vista
    console.log('🔄 Vista reiniciada');
  }, []);

  const handleScreenshot = useCallback(() => {
    // Lógica para capturar pantalla
    console.log('📸 Captura de pantalla');
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="app">
      {/* Header mejorado */}
      <div className={`header ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="header-left">
          <h1>🧪 Monitor Visual 3D</h1>
          <span className="version">v2.0</span>
        </div>

        <div className="header-center">
          <div className="data-indicators">
            {data && (
              <>
                <div className="indicator">
                  <span className="indicator-value">{data.people_count}</span>
                  <span className="indicator-label">👥</span>
                </div>
                <div className="indicator">
                  <span className="indicator-value">{data.objects_count}</span>
                  <span className="indicator-label">📦</span>
                </div>
                <div className="indicator">
                  <span className="indicator-value">
                    {(data.movement_intensity * 100).toFixed(0)}%
                  </span>
                  <span className="indicator-label">🏃</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="header-right">
          <div className="connection-status">
            <span
              className={`status-indicator ${
                connected ? 'connected' : 'disconnected'
              }`}
            >
              {connected ? '🟢 Conectado' : '🔴 Desconectado'}
            </span>
          </div>
        </div>
      </div>

      {/* Canvas container */}
      <div
        ref={canvasRef}
        className={`canvas-container ${isFullscreen ? 'fullscreen' : ''}`}
      >
        <Canvas
          camera={{ position: [10, 5, 10], fov: 75 }}
          style={{
            background:
              'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
          }}
          shadows
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            {/* Controles de cámara mejorados */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={false}
              autoRotateSpeed={0.5}
              dampingFactor={0.05}
              screenSpacePanning={false}
              minDistance={3}
              maxDistance={50}
            />

            {/* Escena principal */}
            <Scene3D data={data} />

            {/* Estadísticas de rendimiento */}
            <Stats />
          </Suspense>
        </Canvas>

        {/* Barra de herramientas flotante */}
        <FloatingToolbar
          connected={connected}
          onReset={handleReset}
          onScreenshot={handleScreenshot}
          onToggleFullscreen={handleToggleFullscreen}
        />

        {/* Overlay de información en esquina */}
        {data && (
          <div className="info-overlay">
            <div className="overlay-header">
              <span className="overlay-title">🧪 MONITOR VISUAL 3D</span>
              <span className="overlay-status">ACTIVO</span>
            </div>
            <div className="overlay-content">
              <div className="data-row">
                <span className="data-icon">👥</span>
                <span className="data-text">{data.people_count} personas</span>
              </div>
              <div className="data-row">
                <span className="data-icon">📦</span>
                <span className="data-text">{data.objects_count} objetos</span>
              </div>
              <div className="data-row">
                <span className="data-icon">✋</span>
                <span className="data-text">{data.hands_count} manos</span>
              </div>
              <div className="data-row">
                <span className="data-icon">🏃</span>
                <span className="data-text">
                  {(data.movement_intensity * 100).toFixed(1)}% movimiento
                </span>
              </div>
              {data.hand_gestures && data.hand_gestures.length > 0 && (
                <div className="data-row">
                  <span className="data-icon">🤏</span>
                  <span className="data-text">
                    {data.hand_gestures.join(', ')}
                  </span>
                </div>
              )}
            </div>
            <div className="overlay-footer">
              <small>
                Actualizado:{' '}
                {new Date(data.timestamp * 1000).toLocaleTimeString()}
              </small>
            </div>
          </div>
        )}
      </div>

      {/* Instrucciones mejoradas */}
      {!isFullscreen && (
        <div className="instructions">
          <div className="instructions-header">
            <h3>📋 Guía Rápida</h3>
            <div className="instructions-toggle">
              <small>Usa los controles de la derecha para personalizar</small>
            </div>
          </div>

          <div className="instructions-grid">
            <div className="instruction-card">
              <div className="card-icon">🐍</div>
              <div className="card-content">
                <h4>Ejecutar Monitor</h4>
                <code>python python/main.py</code>
                <p>Inicia el sistema de detección visual</p>
              </div>
            </div>

            <div className="instruction-card">
              <div className="card-icon">📷</div>
              <div className="card-content">
                <h4>Configurar Cámara</h4>
                <p>Permite acceso cuando se solicite</p>
                <small>Asegúrate de tener buena iluminación</small>
              </div>
            </div>

            <div className="instruction-card">
              <div className="card-icon">🎮</div>
              <div className="card-content">
                <h4>Controles 3D</h4>
                <p>Click izq: rotar • Rueda: zoom • Click der: mover</p>
                <small>Arrastra para explorar la escena</small>
              </div>
            </div>

            <div className="instruction-card">
              <div className="card-icon">⚙️</div>
              <div className="card-content">
                <h4>Personalizar</h4>
                <p>Panel de controles a la derecha</p>
                <small>Ajusta colores, efectos y más</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

