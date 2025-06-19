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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Interactivo
          </h1>
          <p className="text-gray-600">
            Utiliza nuestras herramientas de IA para identificar y aprender sobre el reciclaje
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[600px]">
          {/* Panel Izquierdo - 3D Viewer */}
          <div className="col-span-3 space-y-6">
            <div className="flex-1">
              <ThreeDViewer category={selectedCategory} />
            </div>
          </div>

          {/* Panel Central - Módulos */}
          <div className="col-span-6">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-8 h-full flex flex-col">
              <div className="flex justify-center mb-6">
                <div className="bg-slate-600/50 rounded-xl p-1 flex">
                  <button
                    onClick={() => setActiveModule('camera')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      activeModule === 'camera'
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Cámara en Vivo
                  </button>
                  <button
                    onClick={() => setActiveModule('image')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      activeModule === 'image'
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Subir Imagen
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {activeModule === 'camera' ? (
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Iniciar Análisis</h3>
                    <p className="text-slate-300 mb-8 max-w-md mx-auto">
                      Activa tu cámara para comenzar la clasificación automática de residuos
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
          </div>

          {/* Panel Derecho - Información */}
          <div className="col-span-3">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white h-full">
              {detectionResults.length > 0 ? (
                <div className="space-y-6">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-400">
                      {Math.round(detectionResults[0].confidence * 100)}%
                    </div>
                    <div className="text-slate-400 text-sm">Confianza</div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-4">{detectionResults[0].object}</h3>
                    <div className="space-y-4">
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {detectionResults[0].category === 'plastico' && 
                            'Botella de plástico identificada. Este material es 100% reciclable y debe depositarse en el contenedor amarillo. El PET puede transformarse en fibras textiles, nuevas botellas o envases.'}
                          {detectionResults[0].category === 'vidrio' && 
                            'Envase de vidrio identificado. Este material puede reciclarse infinitas veces sin perder calidad. Deposítalo en el contenedor verde después de limpiarlo.'}
                          {detectionResults[0].category === 'papel' && 
                            'Material de papel identificado. Puede reciclarse hasta 7 veces. Asegúrate de que esté limpio y deposítalo en el contenedor azul.'}
                          {detectionResults[0].category === 'metal' && 
                            'Envase metálico identificado. El aluminio es altamente reciclable y su procesamiento ahorra 95% de energía comparado con producir aluminio nuevo.'}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-yellow-400">💡</span>
                          <span className="font-semibold text-sm">Consejo</span>
                        </div>
                        <p className="text-slate-300 text-sm">
                          {detectionResults[0].category === 'plastico' && 
                            'Retira la tapa y etiqueta antes de reciclar'}
                          {detectionResults[0].category === 'vidrio' && 
                            'Enjuaga el envase para eliminar residuos'}
                          {detectionResults[0].category === 'papel' && 
                            'Separa papeles limpios de los sucios'}
                          {detectionResults[0].category === 'metal' && 
                            'Vacía completamente antes de reciclar'}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-green-400">🌱</span>
                          <span className="font-semibold text-sm">Impacto</span>
                        </div>
                        <p className="text-slate-300 text-sm">
                          {detectionResults[0].category === 'plastico' && 
                            'Ahorra 2kg de CO₂ al reciclar'}
                          {detectionResults[0].category === 'vidrio' && 
                            'Reduce emisiones de CO₂ en un 20%'}
                          {detectionResults[0].category === 'papel' && 
                            'Salva 17 árboles por tonelada reciclada'}
                          {detectionResults[0].category === 'metal' && 
                            'Ahorra 95% de energía vs. producción nueva'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-slate-400">
                    <div className="w-16 h-16 border-2 border-dashed border-slate-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl">ℹ️</span>
                    </div>
                    <p className="text-sm">Información aparecerá aquí</p>
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
