import React, { useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, Loader } from 'lucide-react';

const ImageAnalysisModule = ({ onDetection }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      analyzeImage();
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);

    // Simulación de análisis (mock)
    setTimeout(() => {
      const mockResults = [
        { object: 'Botella de Vidrio', category: 'vidrio', confidence: 0.92 }
      ];
      onDetection(mockResults);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleImageUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  return (    <div className="h-full flex flex-col">
      <div className="text-center text-white mb-2 lg:mb-3">
        <div className="w-10 lg:w-12 h-10 lg:h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <Upload className="w-5 lg:w-6 h-5 lg:h-6" />
        </div>
        <h3 className="text-base lg:text-lg font-bold mb-1">Análisis de Imagen</h3>
        <p className="text-slate-300 text-xs lg:text-sm">Sube una foto para análisis</p>
      </div>

      <div
        className={`flex-1 border-2 border-dashed rounded-lg transition-all duration-300 min-h-[180px] lg:min-h-0 ${
          dragOver
            ? 'border-purple-400 bg-purple-500/10'
            : 'border-slate-600 hover:border-purple-400 hover:bg-purple-500/5'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >        {selectedImage ? (
          <div className="relative h-full">
            <img
              src={selectedImage}
              alt="Uploaded for analysis"
              className="w-full h-full object-cover rounded-lg"
            />

            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <Loader className="h-5 lg:h-6 w-5 lg:w-6 animate-spin mx-auto mb-2" />
                  <p className="font-medium text-xs lg:text-sm">Analizando...</p>
                </div>
              </div>
            )}

            {analysisComplete && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 left-2 bg-green-500/90 text-white px-2 py-1 rounded-md text-xs font-medium">
                  Botella de Vidrio (92%)
                </div>
                <div className="absolute top-1/4 left-1/4 w-16 lg:w-20 h-20 lg:h-24 border-2 border-green-400 rounded"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-2 lg:p-4 text-center">
            <Upload className="h-8 lg:h-10 w-8 lg:w-10 text-slate-500 mb-2" />
            <p className="text-xs lg:text-sm font-medium text-slate-300 mb-1">
              Arrastra imagen aquí
            </p>
            <p className="text-slate-400 mb-2 lg:mb-3 text-xs">
              O selecciona archivo
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg font-medium cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-1 text-xs lg:text-sm"
            >
              <ImageIcon className="h-3 lg:h-4 w-3 lg:w-4" />
              <span>Seleccionar</span>
            </label>
          </div>
        )}
      </div>

      {selectedImage && !isAnalyzing && (
        <div className="mt-2 lg:mt-3 flex flex-col sm:flex-row justify-between items-center space-y-1 sm:space-y-0">
          <button
            onClick={() => {
              setSelectedImage(null);
              setAnalysisComplete(false);
            }}
            className="text-slate-400 hover:text-white font-medium text-xs lg:text-sm"
          >
            Subir otra imagen
          </button>

          {analysisComplete && (
            <div className="flex items-center space-x-1 text-green-400">
              <CheckCircle className="h-3 lg:h-4 w-3 lg:w-4" />
              <span className="font-medium text-xs lg:text-sm">Completado</span>
            </div>
          )}
        </div>
      )}
    </div>  );
};

export default ImageAnalysisModule;
