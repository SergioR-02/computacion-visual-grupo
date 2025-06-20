import React, { useState } from 'react';
import CameraModule from './CameraModule';
import ImageAnalysisModule from './ImageAnalysisModule';
import ThreeDViewer from './ThreeDViewer';

const Dashboard = () => {
  const [detectionResults, setDetectionResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeModule, setActiveModule] = useState('camera');

  const handleDetection = (results) => {
    setDetectionResults(results);
    if (results.length > 0) {
      setSelectedCategory(results[0].category);
    }
  };
  return (
    <div className="min-h-screen py-4 lg:py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Dashboard Interactivo
          </h1>
          <p className="text-gray-600 text-sm lg:text-base">
            Utiliza nuestras herramientas de IA para identificar y aprender sobre el reciclaje
          </p>        </div>        {/* Layout responsivo - stack en móvil, grid en desktop */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 min-h-[300px] h-auto max-h-[650px] lg:h-auto lg:max-h-[650px]">{/* Panel Izquierdo - 3D Viewer - Se muestra debajo en móvil */}          <div className="order-3 lg:order-1 lg:col-span-3">
            <div className="h-40 lg:h-full max-h-[650px]">
              <ThreeDViewer category={selectedCategory} />
            </div>
          </div>

          {/* Panel Central - Módulos - Se muestra primero en móvil */}
          <div className="order-1 lg:order-2 lg:col-span-6">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-3 lg:p-4 h-full flex flex-col min-h-[280px] max-h-[650px]">
              <div className="flex justify-center mb-2 lg:mb-3">
                <div className="bg-slate-600/50 rounded-lg p-1 flex w-full lg:w-auto">
                  <button
                    onClick={() => setActiveModule('camera')}
                    className={`flex-1 lg:flex-none px-2 lg:px-3 py-1.5 rounded-md font-medium transition-all duration-300 text-sm ${
                      activeModule === 'camera'
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Cámara
                  </button>
                  <button
                    onClick={() => setActiveModule('image')}
                    className={`flex-1 lg:flex-none px-2 lg:px-3 py-1.5 rounded-md font-medium transition-all duration-300 text-sm ${
                      activeModule === 'image'
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Imagen
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {activeModule === 'camera' ? (
                  <div className="text-center text-white">
                    <div className="w-10 lg:w-12 h-10 lg:h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
                      <svg className="w-5 lg:w-6 h-5 lg:h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-base lg:text-lg font-bold mb-1 lg:mb-2">Iniciar Análisis</h3>
                    <p className="text-slate-300 mb-3 lg:mb-4 max-w-md mx-auto text-xs lg:text-sm px-4">
                      Activa tu cámara para clasificar residuos
                    </p>
                    <CameraModule onDetection={handleDetection} />
                  </div>
                ) : (
                  <div className="h-full">
                    <ImageAnalysisModule onDetection={handleDetection} />
                  </div>
                )}
              </div>
            </div>
          </div>          {/* Panel Derecho - Información - Se muestra segundo en móvil */}
          <div className="order-2 lg:order-3 lg:col-span-3">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-3 lg:p-4 text-white h-full min-h-[200px] max-h-[650px] lg:min-h-0 overflow-y-auto">
              {detectionResults.length > 0 ? (
                <div className="space-y-2 lg:space-y-3">
                  <div className="text-right">
                    <div className="text-lg lg:text-xl font-bold text-emerald-400">
                      {Math.round(detectionResults[0].confidence * 100)}%
                    </div>
                    <div className="text-slate-400 text-xs">Confianza</div>
                  </div>

                  <div>
                    <h3 className="text-sm lg:text-base font-bold mb-2">{detectionResults[0].object}</h3>
                    <div className="space-y-2">
                      <div className="bg-slate-700/50 rounded-lg p-2">
                        <p className="text-slate-300 text-xs leading-relaxed">
                          {detectionResults[0].category === 'plastico' && 
                            'Botella de plástico identificada. Material 100% reciclable para contenedor amarillo.'}
                          {detectionResults[0].category === 'vidrio' && 
                            'Envase de vidrio identificado. Reciclable infinitas veces.'}
                          {detectionResults[0].category === 'papel' && 
                            'Material de papel identificado. Reciclable hasta 7 veces.'}
                          {detectionResults[0].category === 'metal' && 
                            'Envase metálico identificado. Altamente reciclable.'}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="text-yellow-400 text-sm">💡</span>
                          <span className="font-semibold text-xs">Consejo</span>
                        </div>
                        <p className="text-slate-300 text-xs">
                          {detectionResults[0].category === 'plastico' && 
                            'Retira tapa y etiqueta'}
                          {detectionResults[0].category === 'vidrio' && 
                            'Enjuaga antes de reciclar'}
                          {detectionResults[0].category === 'papel' && 
                            'Separa papeles limpios'}
                          {detectionResults[0].category === 'metal' && 
                            'Vacía completamente'}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="text-green-400 text-sm">🌱</span>
                          <span className="font-semibold text-xs">Impacto</span>
                        </div>
                        <p className="text-slate-300 text-xs">
                          {detectionResults[0].category === 'plastico' && 
                            'Ahorra 2kg de CO₂'}
                          {detectionResults[0].category === 'vidrio' && 
                            'Reduce 20% emisiones'}
                          {detectionResults[0].category === 'papel' && 
                            'Salva 17 árboles/tonelada'}
                          {detectionResults[0].category === 'metal' && 
                            'Ahorra 95% energía'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-slate-400">
                    <div className="w-8 lg:w-10 h-8 lg:h-10 border-2 border-dashed border-slate-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-sm lg:text-base">ℹ️</span>
                    </div>
                    <p className="text-xs">Información aparecerá aquí</p>
                    <p className="text-xs mt-1">después de la detección</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
