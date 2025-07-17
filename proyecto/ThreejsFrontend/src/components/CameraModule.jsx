import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, CameraOff, Activity, AlertCircle, RefreshCw, Zap, Wifi, WifiOff, Target, Eye, Settings } from 'lucide-react';
import { io } from 'socket.io-client';

const CameraModule = ({ onDetection }) => {
  const [isActive, setIsActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' (frontal) o 'environment' (trasera)
  const [detectionResult, setDetectionResult] = useState(null);
  const [realtimeMode, setRealtimeMode] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [detectionMode, setDetectionMode] = useState('classification'); // 'classification' o 'detection'
  const [yoloAvailable, setYoloAvailable] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [connectionQuality, setConnectionQuality] = useState('good'); // 'good', 'fair', 'poor'
  const [framesProcessed, setFramesProcessed] = useState(0);
  
  const webcamRef = useRef(null);
  const socketRef = useRef(null);
  const streamIntervalRef = useRef(null);
  const frameBufferRef = useRef([]);
  const lastFrameTimeRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);

  // Verificar disponibilidad de YOLO al montar componente
  useEffect(() => {
    checkYoloAvailability();
  }, []);

  const checkYoloAvailability = async () => {
    try {
      const response = await fetch('http://localhost:5000/detect/status');
      const result = await response.json();
      setYoloAvailable(result.yolo_available);
      console.log('🎯 YOLO disponible:', result.yolo_available);
    } catch (error) {
      console.log('⚠️ No se pudo verificar YOLO:', error);
      setYoloAvailable(false);
    }
  };

  // Inicializar WebSocket
  useEffect(() => {
    if (realtimeMode) {
      initWebSocket();
    } else {
      cleanupWebSocket();
    }

    return () => {
      cleanupWebSocket();
    };
  }, [realtimeMode]);

  const initWebSocket = () => {
    try {
      socketRef.current = io('http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      socketRef.current.on('connect', () => {
        console.log('🔌 Conectado al servidor WebSocket');
        setSocketConnected(true);
        setError(null);
      });



      socketRef.current.on('connection_response', (data) => {
        console.log('✅ Respuesta de conexión:', data.message);
        if (data.session_id) {
          setCurrentSessionId(data.session_id);
          console.log('🆔 Session ID recibido:', data.session_id);
        }
      });

      socketRef.current.on('detection_started', (data) => {
        console.log('🎥 Detección iniciada:', data.message);
        setIsStreaming(true);
        startFrameStreaming();
      });

      socketRef.current.on('detection_stopped', (data) => {
        console.log('🛑 Detección detenida:', data.message);
        setIsStreaming(false);
        stopFrameStreaming();
      });

      socketRef.current.on('detection_result', (result) => {
        if (result.success) {
          const resultData = result.result;
          
          // Actualizar métricas de rendimiento
          setFramesProcessed(prev => prev + 1);
          
          // Evaluar calidad de conexión basada en tiempo de inferencia
          if (resultData.inference_time_ms) {
            if (resultData.inference_time_ms < 200) {
              setConnectionQuality('good');
            } else if (resultData.inference_time_ms < 500) {
              setConnectionQuality('fair');
            } else {
              setConnectionQuality('poor');
            }
          }
          
          // Manejar resultado según el tipo (clasificación o detección)
          if (resultData.type === 'detection') {
            // Resultado de YOLO con múltiples objetos (tiempo real - sin ChatGPT)
            const formattedResults = resultData.detections.map(detection => ({
              object: detection.category_name,
              category: detection.category,
              confidence: detection.confidence,
              confidence_percentage: detection.confidence_percentage,
              original_class: detection.class,
              bbox: detection.bbox,
              color: detection.color,
              detection_type: 'yolo',
              realtime: detection.realtime || resultData.realtime || true,
              chatgpt_skipped: resultData.chatgpt_skipped || false,
              timestamp: result.timestamp
            }));
            
            setDetectionResult({
              type: 'detection',
              detections: formattedResults,
              detection_count: resultData.detection_count,
              inference_time_ms: resultData.inference_time_ms
            });
            
            onDetection(formattedResults);
          } else {
            // Resultado de clasificación tradicional
            const formattedResults = [{
              object: resultData.category_name,
              category: resultData.category,
              confidence: resultData.confidence,
              confidence_percentage: resultData.confidence_percentage,
              original_class: resultData.original_class,
              inference_time_ms: resultData.inference_time_ms,
              advice: resultData.advice,
              has_chatgpt_advice: resultData.has_chatgpt_advice,
              backend_result: resultData,
              detection_type: 'classification',
              realtime: true,
              timestamp: result.timestamp
            }];
            
            setDetectionResult({
              type: 'classification',
              result: formattedResults[0]
            });
            
            onDetection(formattedResults);
          }
        }
      });

      socketRef.current.on('error', (error) => {
        console.error('❌ Error del servidor:', error.message);
        setError(`Error del servidor: ${error.message}`);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Error de conexión WebSocket:', error);
        setError('No se pudo conectar al servidor. ¿Está el backend funcionando?');
        setSocketConnected(false);
        
        // Intentar reconectar automáticamente después de 3 segundos
        if (realtimeMode) {
          reconnectTimeoutRef.current = setTimeout(attemptReconnection, 3000);
        }
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('🔌 Desconectado del servidor WebSocket. Razón:', reason);
        setSocketConnected(false);
        setIsStreaming(false);
        
        // Solo intentar reconectar si no fue una desconexión intencional
        if (reason !== 'io client disconnect' && realtimeMode) {
          attemptReconnection();
        }
      });

    } catch (error) {
      console.error('❌ Error inicializando WebSocket:', error);
      setError(`Error de WebSocket: ${error.message}`);
      setSocketConnected(false);
    }
  };

  const cleanupWebSocket = () => {
    if (streamIntervalRef.current) {
      clearTimeout(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocketConnected(false);
    setIsStreaming(false);
    setCurrentSessionId(null);
    setFramesProcessed(0);
    frameBufferRef.current = [];
  };

  // Función de reconexión automática
  const attemptReconnection = useCallback(() => {
    if (realtimeMode && !socketConnected) {
      console.log('🔄 Intentando reconectar WebSocket...');
      initWebSocket();
      
      // Si falla, intentar de nuevo después de 5 segundos
      reconnectTimeoutRef.current = setTimeout(() => {
        if (!socketConnected && realtimeMode) {
          attemptReconnection();
        }
      }, 5000);
    }
  }, [realtimeMode, socketConnected]);

  const startFrameStreaming = () => {
    if (streamIntervalRef.current) return;

    // Función para capturar y enviar frame optimizada
    const captureAndSendFrame = () => {
      if (webcamRef.current && socketRef.current?.connected) {
        const currentTime = Date.now();
        
        // Control de FPS adaptativo basado en calidad de conexión
        let fpsInterval;
        switch (connectionQuality) {
          case 'good':
            fpsInterval = 400; // 2.5 FPS
            break;
          case 'fair':
            fpsInterval = 600; // 1.67 FPS
            break;
          case 'poor':
            fpsInterval = 1000; // 1 FPS
            break;
          default:
            fpsInterval = 500; // 2 FPS
        }
        
        // Control de tiempo entre frames
        if (currentTime - lastFrameTimeRef.current < fpsInterval) {
          return;
        }
        
        // Capturar frame con compresión optimizada
        const imageSrc = webcamRef.current.getScreenshot({
          width: 640,
          height: 480,
          quality: connectionQuality === 'good' ? 0.8 : connectionQuality === 'fair' ? 0.6 : 0.4
        });
        
        if (imageSrc) {
          // Enviar con datos de sesión
          const frameData = {
            frame: imageSrc,
            session_id: currentSessionId,
            timestamp: currentTime,
            quality: connectionQuality
          };
          
          socketRef.current.emit('frame_data', frameData);
          lastFrameTimeRef.current = currentTime;
        }
      }
    };

    // Usar requestAnimationFrame para mejor rendimiento
    const streamLoop = () => {
      captureAndSendFrame();
      if (streamIntervalRef.current) {
        streamIntervalRef.current = setTimeout(() => {
          requestAnimationFrame(streamLoop);
        }, 100); // Verificar cada 100ms pero enviar según calidad
      }
    };

    requestAnimationFrame(streamLoop);
  };

  const stopFrameStreaming = () => {
    if (streamIntervalRef.current) {
      clearTimeout(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
  };

  const startRealtimeDetection = () => {
    if (socketRef.current) {
      setIsDetecting(true);
      socketRef.current.emit('start_detection', { 
        use_detection: detectionMode === 'detection',
        session_id: currentSessionId
      });
    }
  };

  const stopRealtimeDetection = () => {
    if (socketRef.current) {
      setIsDetecting(false);
      socketRef.current.emit('stop_detection', {
        session_id: currentSessionId
      });
    }
  };

  const performDetection = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setError('No se pudo capturar imagen');
      return;
    }

    try {
      // Elegir endpoint según el modo
      const endpoint = detectionMode === 'detection' ? '/detect' : '/classify';
      const url = `http://localhost:5000${endpoint}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageSrc })
      });

      const result = await response.json();
      
      if (result.success) {
        if (detectionMode === 'detection') {
          // Manejar resultado de YOLO
          const formattedResults = result.result.detections.map(detection => ({
            object: detection.category_name,
            category: detection.category,
            confidence: detection.confidence,
            confidence_percentage: detection.confidence_percentage,
            original_class: detection.class,
            bbox: detection.bbox,
            color: detection.color,
            detection_type: 'yolo'
          }));
          
          setDetectionResult({
            type: 'detection',
            detections: formattedResults,
            detection_count: result.result.detection_count,
            inference_time_ms: result.result.inference_time_ms
          });
          
          onDetection(formattedResults);
        } else {
          // Manejar resultado de clasificación
          const formattedResults = [{
            object: result.result.category_name,
            category: result.result.category,
            confidence: result.result.confidence,
            confidence_percentage: result.result.confidence_percentage,
            original_class: result.result.original_class,
            inference_time_ms: result.result.inference_time_ms,
            advice: result.result.advice,
            has_chatgpt_advice: result.result.has_chatgpt_advice,
            backend_result: result.result,
            detection_type: 'classification'
          }];
          
          setDetectionResult({
            type: 'classification',
            result: formattedResults[0]
          });
          
          onDetection(formattedResults);
        }
      } else {
        setError(result.error || 'Error en el análisis');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      setError('Error de conexión con el servidor');
    }
  };

  // Configuración de la webcam
  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: facingMode
  };

  // Manejar cuando la webcam esté lista
  const onUserMedia = useCallback(() => {
    console.log('Webcam iniciada correctamente');
    setIsActive(true);
    setError(null);
    
    // Si NO está en modo tiempo real, hacer detección una sola vez después de 3 segundos
    if (!realtimeMode) {
      setTimeout(() => {
        setIsDetecting(true);
        performDetection();
      }, 3000);
    }
  }, [realtimeMode]);

  // Manejar errores de la webcam
  const onUserMediaError = useCallback((error) => {
    console.error('Error de webcam:', error);
    setError('No se pudo acceder a la cámara. Verifica los permisos.');
    setIsActive(false);
  }, []);

  // Cambiar entre cámara frontal y trasera
  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Reiniciar cámara
  const restartCamera = () => {
    setError(null);
    setIsActive(false);
    setIsDetecting(false);
    setDetectionResult(null);
    setRealtimeMode(false);
    cleanupWebSocket();
  };

  // Limpiar detección y permitir nueva
  const clearDetection = () => {
    setDetectionResult(null);
    setIsDetecting(false);
    if (realtimeMode && isStreaming) {
      stopRealtimeDetection();
    }
  };

  // Detener cámara
  const stopCamera = () => {
    setIsActive(false);
    setIsDetecting(false);
    setError(null);
    if (realtimeMode) {
      stopRealtimeDetection();
    }
    cleanupWebSocket();
  };

  // Alternar modo tiempo real
  const toggleRealtimeMode = () => {
    setRealtimeMode(prev => !prev);
    setDetectionResult(null);
    setIsDetecting(false);
  };

  // Alternar modo de detección (clasificación/detección)
  const toggleDetectionMode = () => {
    setDetectionMode(prev => prev === 'classification' ? 'detection' : 'classification');
    setDetectionResult(null);
    setIsDetecting(false);
  };

  // Mostrar error si existe
  if (error) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center justify-center space-x-2 text-red-400 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error de Cámara</span>
          </div>
          <p className="text-sm text-red-300 mb-3">{error}</p>
          <button
            onClick={restartCamera}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Intentar de nuevo</span>
          </button>
        </div>
      </div>
    );
  }

  // Mostrar botón de activar si no está activa la cámara
  if (!isActive) {
    return (
      <div className="text-center space-y-4">
        <button
          onClick={() => setIsActive(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold text-base lg:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 lg:space-x-3 mx-auto"
        >
          <Camera className="h-5 lg:h-6 w-5 lg:w-6" />
          <span>Activar Cámara</span>
        </button>
        
        <p className="text-sm text-gray-400">
          Usa la cámara para detectar materiales reciclables
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 lg:space-y-4">
      <div className="relative">
        <div className="aspect-video bg-black rounded-xl overflow-hidden border-2 border-gray-700">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={onUserMedia}
            onUserMediaError={onUserMediaError}
            mirrored={facingMode === 'user'} // Efecto espejo solo para cámara frontal
            className="w-full h-full object-cover"
            style={{
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
            }}
          />
        </div>

        {/* Overlays de detección */}
        {isDetecting && !detectionResult && (
          <>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 lg:top-4 left-2 lg:left-4 bg-blue-500/90 text-white px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm font-medium">
                Analizando...
              </div>
              <div className="absolute top-1/4 left-1/4 w-24 lg:w-32 h-32 lg:h-40 border-2 border-blue-400 rounded animate-pulse"></div>
            </div>

            <div className="absolute top-2 lg:top-4 right-2 lg:right-4 flex items-center space-x-1 lg:space-x-2 text-blue-400">
              <Activity className="h-3 lg:h-4 w-3 lg:w-4 animate-pulse" />
              <span className="text-xs lg:text-sm font-medium">Detectando...</span>
              
              {/* Indicador de calidad de conexión en tiempo real */}
              {realtimeMode && (
                <div className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  connectionQuality === 'good' ? 'bg-green-500/90 text-white' :
                  connectionQuality === 'fair' ? 'bg-yellow-500/90 text-white' :
                  'bg-red-500/90 text-white'
                }`}>
                  {connectionQuality === 'good' ? '🟢' : connectionQuality === 'fair' ? '🟡' : '🔴'}
                  {connectionQuality === 'good' ? 'Buena' : connectionQuality === 'fair' ? 'Regular' : 'Lenta'}
                </div>
              )}
              
              {/* Contador de frames */}
              {realtimeMode && framesProcessed > 0 && (
                <div className="bg-black/50 text-white px-2 py-1 rounded text-xs ml-1">
                  {framesProcessed}f
                </div>
              )}
            </div>
          </>
        )}

        {/* Resultado de la detección */}
        {detectionResult && (
          <div className="absolute inset-0 pointer-events-none">
            {detectionResult.type === 'detection' ? (
              <>
                {/* Header para YOLO con múltiples objetos */}
                <div className="absolute top-2 lg:top-4 left-2 lg:left-4 bg-emerald-500/90 text-white px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm font-medium">
                  {realtimeMode ? '⚡' : '🎯'} {detectionResult.detection_count} objetos detectados
                  {realtimeMode && (
                    <span className="text-emerald-200 text-xs ml-1">(Modo Rápido)</span>
                  )}
                </div>
                
                {/* Tiempo de inferencia */}
                <div className="absolute top-2 lg:top-4 right-2 lg:right-4 bg-blue-500/90 text-white px-2 py-1 rounded-lg text-xs">
                  {detectionResult.inference_time_ms}ms
                </div>
                
                {/* Bounding boxes para cada objeto detectado */}
                {detectionResult.detections.map((detection, index) => {
                  const bbox = detection.bbox;
                  if (!bbox) return null;
                  
                  // Convertir coordenadas normalizadas a pixeles
                  const containerRect = webcamRef.current?.video;
                  if (!containerRect) return null;
                  
                  const videoWidth = containerRect.videoWidth || 640;
                  const videoHeight = containerRect.videoHeight || 480;
                  
                  const x = bbox.x1 * 100; // Porcentaje
                  const y = bbox.y1 * 100; // Porcentaje
                  const width = bbox.width * 100; // Porcentaje
                  const height = bbox.height * 100; // Porcentaje
                  
                  return (
                    <div
                      key={index}
                      className="absolute border-2 rounded"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                        borderColor: detection.color || '#10B981',
                        boxShadow: `0 0 10px ${detection.color || '#10B981'}40`
                      }}
                    >
                      {/* Etiqueta del objeto */}
                      <div 
                        className="absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: detection.color || '#10B981' }}
                      >
                        {detection.object} ({detection.confidence_percentage}%)
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                {/* Visualización para clasificación tradicional */}
                <div className="absolute top-2 lg:top-4 left-2 lg:left-4 bg-emerald-500/90 text-white px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm font-medium">
                  📊 {detectionResult.result.object} ({Math.round(detectionResult.result.confidence * 100)}%)
                </div>
                <div className="absolute top-1/4 left-1/4 w-24 lg:w-32 h-32 lg:h-40 border-2 border-emerald-400 rounded"></div>
                
                {detectionResult.result.has_chatgpt_advice && (
                  <div className="absolute top-2 lg:top-4 right-2 lg:right-4 flex items-center space-x-1 bg-blue-500/90 text-white px-2 py-1 rounded-lg">
                    <span className="text-xs">🤖</span>
                    <span className="text-xs font-medium">IA</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Selección de modo */}
      <div className="flex justify-center space-x-2 mb-2">
        <button
          onClick={toggleRealtimeMode}
          className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-300 flex items-center space-x-1 ${
            realtimeMode 
              ? 'bg-purple-500 text-white shadow-lg'
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
        >
          {realtimeMode ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{realtimeMode ? 'Tiempo Real' : 'Una sola vez'}</span>
        </button>
        
        {realtimeMode && (
          <div className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 ${
            socketConnected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            <div className={`h-2 w-2 rounded-full ${socketConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span>{socketConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
        )}
      </div>

      {/* Selección de modo de detección */}
      <div className="flex justify-center space-x-2 mb-2">
        <button
          onClick={toggleDetectionMode}
          className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-300 flex items-center space-x-1 ${
            detectionMode === 'detection' 
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
        >
          {detectionMode === 'detection' ? <Target className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          <span>{detectionMode === 'detection' ? 'Detección YOLO' : 'Clasificación'}</span>
        </button>
        
        {yoloAvailable && (
          <div className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 ${
            yoloAvailable ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            <div className={`h-2 w-2 rounded-full ${yoloAvailable ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span>{yoloAvailable ? 'YOLO Disponible' : 'YOLO No Disponible'}</span>
          </div>
        )}
      </div>

      {/* Controles de detección según el modo */}
      {realtimeMode ? (
                  <div className="flex justify-center space-x-2 mb-3">
          {!isStreaming ? (
            <button
              onClick={startRealtimeDetection}
              disabled={!socketConnected || (detectionMode === 'detection' && !yoloAvailable)}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 text-sm"
            >
              {detectionMode === 'detection' ? <Target className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
              <span>
                {detectionMode === 'detection' ? 'Iniciar Detección YOLO' : 'Iniciar Clasificación Continua'}
              </span>
            </button>
          ) : (
            <button
              onClick={stopRealtimeDetection}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 text-sm"
            >
              <Activity className="h-4 w-4 animate-pulse" />
              <span>Detener Detección</span>
            </button>
          )}
        </div>
      ) : (
        !detectionResult && !isDetecting && (
          <>
            <div className="flex justify-center mb-3">
              <button
                onClick={performDetection}
                disabled={detectionMode === 'detection' && !yoloAvailable}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 text-sm"
              >
                {detectionMode === 'detection' ? <Target className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                <span>
                  {detectionMode === 'detection' ? 'Detectar Objetos' : 'Capturar y Clasificar'}
                </span>
              </button>
            </div>
            
            {/* Mensaje de YOLO no disponible */}
            {detectionMode === 'detection' && !yoloAvailable && (
              <div className="text-center mb-3">
                <div className="inline-flex items-center space-x-2 bg-red-500/20 text-red-300 px-3 py-1.5 rounded-lg text-xs">
                  <AlertCircle className="h-3 w-3" />
                  <span>YOLO no disponible - Revisa el servidor</span>
                </div>
              </div>
            )}
          </>
        )
      )}

      {/* Información de streaming en tiempo real */}
      {realtimeMode && isStreaming && (
        <div className="text-center mb-3">
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg text-xs">
            <Activity className="h-3 w-3 animate-pulse" />
            <span>⚡ Detección rápida - Sin consultas IA</span>
          </div>
        </div>
      )}

      {/* Información del modo tiempo real */}
      {realtimeMode && !isStreaming && (
        <div className="text-center mb-3">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg text-xs">
            <Zap className="h-3 w-3" />
            <span>Modo rápido: Solo detección YOLO (sin ChatGPT)</span>
          </div>
        </div>
      )}

      {/* Controles generales de la cámara */}
      <div className="flex justify-center space-x-3">
        <button
          onClick={switchCamera}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Cambiar cámara</span>
        </button>

        {detectionResult && (
          <button
            onClick={clearDetection}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Nueva detección</span>
          </button>
        )}

        <button
          onClick={stopCamera}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 text-sm"
        >
          <CameraOff className="h-4 w-4" />
          <span>Detener</span>
        </button>
      </div>
    </div>
  );
};

export default CameraModule;
