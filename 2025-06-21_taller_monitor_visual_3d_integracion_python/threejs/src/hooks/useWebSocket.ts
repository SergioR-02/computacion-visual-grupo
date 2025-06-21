import { useState, useEffect, useRef } from 'react';

export interface VisualData {
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

export const useWebSocket = (url: string) => {
  const [data, setData] = useState<VisualData | null>(null);
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isMounted = true;
    let reconnectAttempts = 0;
    let reconnectTimeout: number | null = null;

    const connect = () => {
      if (!isMounted) return;

      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        ws.current.close();
      }

      console.log(`🔄 Intentando conectar WebSocket...`);
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        if (!isMounted) return;
        console.log('🔌 Conexión WebSocket establecida exitosamente');
        setConnected(true);
        reconnectAttempts = 0;
      };

      ws.current.onmessage = event => {
        if (!isMounted) return;
        try {
          const receivedData = JSON.parse(event.data);

          if (receivedData.type === 'connection') {
            console.log('✅ Mensaje de bienvenida recibido');
            return;
          }

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
        setData(null);

        reconnectAttempts++;
        const timeout = 1000 * Math.pow(2, Math.min(reconnectAttempts, 4));
        console.log(`⏰ Reintentando conexión en ${timeout}ms...`);
        reconnectTimeout = setTimeout(connect, timeout);
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close(1000, 'Componente desmontado');
      }
    };
  }, [url]);

  return { data, connected };
};
