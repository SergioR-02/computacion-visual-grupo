import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, CameraOff, Activity, AlertCircle, RefreshCw } from 'lucide-react';

const CameraModule = ({ onDetection }) => {
  const [isActive, setIsActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' (frontal) o 'environment' (trasera)
  const [detectionResult, setDetectionResult] = useState(null);
  const webcamRef = useRef(null);

  const performDetection = async () => {
    try {
      // Capturar imagen desde la webcam
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (!imageSrc) {
        console.error('No se pudo capturar la imagen');
        return;
      }
      
      // Enviar al backend
      const response = await fetch('http://localhost:5000/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageSrc
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Formatear resultado para el callback onDetection con toda la información del backend
        const formattedResults = [{
          object: result.result.category_name,
          category: result.result.category,
          confidence: result.result.confidence,
          confidence_percentage: result.result.confidence_percentage,
          original_class: result.result.original_class,
          inference_time_ms: result.result.inference_time_ms,
          advice: result.result.advice,
          has_chatgpt_advice: result.result.has_chatgpt_advice,
          backend_result: result.result // Incluir resultado completo del backend
        }];
        
        setDetectionResult(formattedResults[0]);
        onDetection(formattedResults);
      } else {
        console.error('Error del backend:', result.error);
        // Fallback con datos mock si falla
        const mockResults = [
          { object: 'Error de conexión', category: 'unknown', confidence: 0.0 }
        ];
        onDetection(mockResults);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      // Fallback con datos mock si falla
      const mockResults = [
        { object: 'Error de conexión', category: 'unknown', confidence: 0.0 }
      ];
      onDetection(mockResults);
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
    
    // Realizar detección real después de 3 segundos
    setTimeout(() => {
      setIsDetecting(true);
      performDetection();
    }, 3000);
  }, []);

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
    // La webcam se reiniciará automáticamente
  };

  // Limpiar detección y permitir nueva
  const clearDetection = () => {
    setDetectionResult(null);
    setIsDetecting(false);
  };

  // Detener cámara
  const stopCamera = () => {
    setIsActive(false);
    setIsDetecting(false);
    setError(null);
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
            </div>
          </>
        )}

        {/* Resultado de la detección */}
        {detectionResult && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 lg:top-4 left-2 lg:left-4 bg-emerald-500/90 text-white px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm font-medium">
              {detectionResult.object} ({Math.round(detectionResult.confidence * 100)}%)
            </div>
            <div className="absolute top-1/4 left-1/4 w-24 lg:w-32 h-32 lg:h-40 border-2 border-emerald-400 rounded"></div>
            
            {detectionResult.has_chatgpt_advice && (
              <div className="absolute top-2 lg:top-4 right-2 lg:right-4 flex items-center space-x-1 bg-blue-500/90 text-white px-2 py-1 rounded-lg">
                <span className="text-xs">🤖</span>
                <span className="text-xs font-medium">IA</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controles de la cámara */}
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
