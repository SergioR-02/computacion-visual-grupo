import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, Loader, Zap, AlertCircle, Lightbulb, Leaf, BarChart3, Recycle, Target, Eye } from 'lucide-react';

const ImageAnalysisModule = ({ onDetection }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [detectionMode, setDetectionMode] = useState('classification'); // 'classification' o 'detection'
  const [yoloAvailable, setYoloAvailable] = useState(false);

  // Verificar disponibilidad de YOLO al montar componente
  useEffect(() => {
    checkYoloAvailability();
  }, []);

  const checkYoloAvailability = async () => {
    try {
      const response = await fetch('http://localhost:5000/detect/status');
      const result = await response.json();
      setYoloAvailable(result.yolo_available);
      console.log('🎯 YOLO disponible en ImageAnalysis:', result.yolo_available);
    } catch (error) {
      console.log('⚠️ No se pudo verificar YOLO en ImageAnalysis:', error);
      setYoloAvailable(false);
    }
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      // No analizar automáticamente, solo cargar la imagen
      setIsAnalyzing(false);
      setAnalysisComplete(false);
      setAnalysisResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setError(null);
    setAnalysisResult(null);

    try {
      // Convertir imagen a base64
      const base64Data = selectedImage;
      
      // Elegir endpoint según el modo
      const endpoint = detectionMode === 'detection' ? '/detect' : '/classify';
      const url = `http://localhost:5000${endpoint}`;
      
      // Enviar al backend
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysisResult(result.result);
        
        if (detectionMode === 'detection') {
          // Manejar resultado de YOLO con múltiples objetos
          const formattedResults = result.result.detections.map(detection => ({
            object: detection.category_name,
            category: detection.category,
            confidence: detection.confidence,
            confidence_percentage: detection.confidence_percentage,
            original_class: detection.class,
            bbox: detection.bbox,
            color: detection.color,
            detection_type: 'yolo',
            backend_result: result.result
          }));
          
          onDetection(formattedResults);
        } else {
          // Formatear resultado para clasificación tradicional
          const formattedResults = [{
            object: result.result.category_name,
            category: result.result.category,
            confidence: result.result.confidence,
            confidence_percentage: result.result.confidence_percentage,
            original_class: result.result.original_class,
            inference_time_ms: result.result.inference_time_ms,
            advice: result.result.advice,
            has_chatgpt_advice: result.result.has_chatgpt_advice,
            detection_type: 'classification',
            backend_result: result.result // Incluir resultado completo del backend
          }];
          
          onDetection(formattedResults);
        }
        
        setAnalysisComplete(true);
      } else {
        setError(result.error || 'Error al analizar la imagen');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      setError('Error de conexión. Asegúrate de que el servidor backend esté funcionando en http://localhost:5000');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Alternar modo de detección
  const toggleDetectionMode = () => {
    setDetectionMode(prev => prev === 'classification' ? 'detection' : 'classification');
    setAnalysisResult(null);
    setAnalysisComplete(false);
    setError(null);
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

  return (
    <div className="h-full flex flex-col">
      <div className="text-center text-white mb-2 lg:mb-3">
        <div className="w-10 lg:w-12 h-10 lg:h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <Upload className="w-5 lg:w-6 h-5 lg:h-6" />
        </div>
        <h3 className="text-base lg:text-lg font-bold mb-1">Análisis de Imagen</h3>
        <p className="text-slate-300 text-xs lg:text-sm">
          {detectionMode === 'detection' ? 'Sube una foto para detectar objetos' : 'Sube una foto para análisis'}
        </p>
      </div>

      {/* Selección de modo de detección */}
      <div className="flex justify-center space-x-2 mb-3">
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

      <div
        className={`flex-1 border-2 border-dashed rounded-lg transition-all duration-300 min-h-[200px] max-h-[400px] overflow-hidden ${
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
          <div className="relative h-full min-h-[200px] flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Uploaded for analysis"
              className="max-w-full max-h-full object-contain rounded-lg"
              style={{ 
                width: 'auto', 
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />

            {/* Botón de analizar superpuesto cuando la imagen está cargada pero no analizada */}
            {!isAnalyzing && !analysisComplete && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                <button
                  onClick={analyzeImage}
                  disabled={detectionMode === 'detection' && !yoloAvailable}
                  className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  {detectionMode === 'detection' ? <Target className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                  <span>{detectionMode === 'detection' ? 'Detectar Objetos' : 'Analizar Imagen'}</span>
                </button>
                
                {/* Mensaje de YOLO no disponible */}
                {detectionMode === 'detection' && !yoloAvailable && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-red-500/90 text-white px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>YOLO no disponible</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <Loader className="h-5 lg:h-6 w-5 lg:w-6 animate-spin mx-auto mb-2" />
                  <p className="font-medium text-xs lg:text-sm">Analizando...</p>
                </div>
              </div>
            )}

            {analysisComplete && analysisResult && (
              <div className="absolute inset-0 pointer-events-none">
                {detectionMode === 'detection' ? (
                  <>
                    {/* Header para YOLO con múltiples objetos */}
                    <div className="absolute top-2 left-2 bg-green-500/90 text-white px-2 py-1 rounded-md text-xs font-medium">
                      🎯 {analysisResult.detection_count} objetos detectados
                    </div>
                    
                    {/* Tiempo de inferencia */}
                    <div className="absolute top-2 right-2 bg-blue-500/90 text-white px-2 py-1 rounded-md text-xs">
                      {analysisResult.inference_time_ms}ms
                    </div>
                    
                    {/* Bounding boxes para cada objeto detectado */}
                    {analysisResult.detections && analysisResult.detections.map((detection, index) => {
                      const bbox = detection.bbox;
                      if (!bbox) return null;
                      
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
                            className="absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap"
                            style={{ backgroundColor: detection.color || '#10B981' }}
                          >
                            {detection.category_name} ({detection.confidence_percentage}%)
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {/* Visualización para clasificación tradicional */}
                    <div className="absolute top-2 left-2 bg-green-500/90 text-white px-2 py-1 rounded-md text-xs font-medium">
                      📊 {analysisResult.category_name} ({analysisResult.confidence_percentage}%)
                    </div>
                  </>
                )}
              </div>
            )}

            {error && (
              <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white p-4">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium text-sm mb-1">Error</p>
                  <p className="text-xs">{error}</p>
                </div>
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

      {selectedImage && (
        <div className="mt-2 lg:mt-3 flex flex-col sm:flex-row justify-between items-center space-y-1 sm:space-y-0">
          <button
            onClick={() => {
              setSelectedImage(null);
              setAnalysisComplete(false);
              setIsAnalyzing(false);
              setAnalysisResult(null);
              setError(null);
            }}
            className="text-slate-400 hover:text-white font-medium text-xs lg:text-sm"
          >
            Subir otra imagen
          </button>

          {/* Botón de analizar en la parte inferior cuando la imagen está cargada pero no analizada */}
          {!isAnalyzing && !analysisComplete && (
            <button
              onClick={analyzeImage}
              disabled={detectionMode === 'detection' && !yoloAvailable}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 text-xs lg:text-sm"
            >
              {detectionMode === 'detection' ? <Target className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
              <span>{detectionMode === 'detection' ? 'Detectar' : 'Analizar'}</span>
            </button>
          )}

          {analysisComplete && analysisResult && (
            <div className="flex items-center space-x-1 text-green-400">
              <CheckCircle className="h-3 lg:h-4 w-3 lg:w-4" />
              <span className="font-medium text-xs lg:text-sm">
                {detectionMode === 'detection' 
                  ? `${analysisResult.detection_count} objetos detectados`
                  : `${analysisResult.category_name} - ${analysisResult.confidence_percentage}%`
                }
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-1 text-red-400">
              <AlertCircle className="h-3 lg:h-4 w-3 lg:w-4" />
              <span className="font-medium text-xs lg:text-sm">Error</span>
            </div>
          )}
        </div>
      )}

      
    </div>  );
};

export default ImageAnalysisModule;
