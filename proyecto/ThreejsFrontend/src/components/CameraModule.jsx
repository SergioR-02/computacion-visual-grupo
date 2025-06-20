import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Activity } from 'lucide-react';

const CameraModule = ({ onDetection }) => {
  const [isActive, setIsActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const mockDetection = () => {
    const mockResults = [
      { object: 'Plástico PET', category: 'plastico', confidence: 0.94 }
    ];
    onDetection(mockResults);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);

        // Simular detección luego de 3 segundos
        setTimeout(() => {
          setIsDetecting(true);
          mockDetection();
        }, 3000);
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setIsDetecting(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  if (!isActive) {
    return (
      <button
        onClick={startCamera}
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold text-base lg:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 lg:space-x-3 mx-auto"
      >
        <Camera className="h-5 lg:h-6 w-5 lg:w-6" />
        <span>Activar Cámara</span>
      </button>
    );
  }

  return (
    <div className="space-y-3 lg:space-y-4">
      <div className="relative">
        <div className="aspect-video bg-black rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {isDetecting && (
          <>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 lg:top-4 left-2 lg:left-4 bg-emerald-500/90 text-white px-2 lg:px-3 py-1 rounded-lg text-xs lg:text-sm font-medium">
                Plástico PET (94%)
              </div>
              <div className="absolute top-1/4 left-1/4 w-24 lg:w-32 h-32 lg:h-40 border-2 border-emerald-400 rounded"></div>
            </div>

            <div className="absolute top-2 lg:top-4 right-2 lg:right-4 flex items-center space-x-1 lg:space-x-2 text-emerald-400">
              <Activity className="h-3 lg:h-4 w-3 lg:w-4 animate-pulse" />
              <span className="text-xs lg:text-sm font-medium">Detectando...</span>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={stopCamera}
          className="bg-red-500 hover:bg-red-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-1 lg:space-x-2 text-sm lg:text-base"
        >
          <CameraOff className="h-4 lg:h-5 w-4 lg:w-5" />
          <span>Detener Cámara</span>
        </button>
      </div>
    </div>
  );
};

export default CameraModule;
