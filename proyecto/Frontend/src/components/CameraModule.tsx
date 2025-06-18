import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Activity } from 'lucide-react';
import { DetectionResult } from './Dashboard';

interface CameraModuleProps {
  onDetection: (results: DetectionResult[]) => void;
}

const CameraModule: React.FC<CameraModuleProps> = ({ onDetection }) => {
  const [isActive, setIsActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Mock detection results for demo purposes
  const mockDetection = () => {
    const mockResults: DetectionResult[] = [
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
        
        // Simulate detection after 3 seconds
        setTimeout(() => {
          setIsDetecting(true);
          mockDetection();
        }, 3000);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
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
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 mx-auto"
      >
        <Camera className="h-6 w-6" />
        <span>Activar Cámara</span>
      </button>
    );
  }

  return (
    <div className="space-y-4">
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
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 bg-emerald-500/90 text-white px-3 py-1 rounded-lg text-sm font-medium">
              Plástico PET (94%)
            </div>
            
            {/* Detection box */}
            <div className="absolute top-1/4 left-1/4 w-32 h-40 border-2 border-emerald-400 rounded"></div>
          </div>
        )}

        {isDetecting && (
          <div className="absolute top-4 right-4 flex items-center space-x-2 text-emerald-400">
            <Activity className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Detectando...</span>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={stopCamera}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
        >
          <CameraOff className="h-5 w-5" />
          <span>Detener Cámara</span>
        </button>
      </div>
    </div>
  );
};

export default CameraModule;