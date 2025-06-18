import React, { useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, Loader } from 'lucide-react';
import { DetectionResult } from './Dashboard';

interface ImageAnalysisModuleProps {
  onDetection: (results: DetectionResult[]) => void;
}

const ImageAnalysisModule: React.FC<ImageAnalysisModuleProps> = ({ onDetection }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      analyzeImage();
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    
    // Simulate analysis
    setTimeout(() => {
      const mockResults: DetectionResult[] = [
        { object: 'Botella de Vidrio', category: 'vidrio', confidence: 0.92 }
      ];
      onDetection(mockResults);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleImageUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center text-white mb-6">
        <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Análisis de Imagen</h3>
        <p className="text-slate-300">
          Sube una foto para análisis detallado
        </p>
      </div>

      <div
        className={`flex-1 border-2 border-dashed rounded-xl transition-all duration-300 ${
          dragOver 
            ? 'border-purple-400 bg-purple-500/10' 
            : 'border-slate-600 hover:border-purple-400 hover:bg-purple-500/5'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        {selectedImage ? (
          <div className="relative h-full">
            <img
              src={selectedImage}
              alt="Uploaded for analysis"
              className="w-full h-full object-cover rounded-xl"
            />
            
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                <div className="text-center text-white">
                  <Loader className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="font-medium">Analizando imagen...</p>
                </div>
              </div>
            )}
            
            {analysisComplete && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 bg-green-500/90 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  Botella de Vidrio (92%)
                </div>
                
                {/* Detection box */}
                <div className="absolute top-1/4 left-1/4 w-24 h-32 border-2 border-green-400 rounded"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <Upload className="h-16 w-16 text-slate-500 mb-4" />
            <p className="text-lg font-medium text-slate-300 mb-2">
              Arrastra y suelta una imagen aquí
            </p>
            <p className="text-slate-400 mb-6">
              O haz clic para seleccionar un archivo
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
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <ImageIcon className="h-5 w-5" />
              <span>Seleccionar Imagen</span>
            </label>
          </div>
        )}
      </div>

      {selectedImage && !isAnalyzing && (
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => {
              setSelectedImage(null);
              setAnalysisComplete(false);
            }}
            className="text-slate-400 hover:text-white font-medium"
          >
            Subir otra imagen
          </button>
          
          {analysisComplete && (
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Análisis completado</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageAnalysisModule;