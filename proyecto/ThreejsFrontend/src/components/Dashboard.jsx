import { useState } from 'react';
import CameraModule from './CameraModule';
import ImageAnalysisModule from './ImageAnalysisModule';
import ThreeDViewer from './ThreeDViewer';

const Dashboard = () => {
  const [detectionResults, setDetectionResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeModule, setActiveModule] = useState('camera');

  const handleDetection = (results) => {
    console.log('🔍 Resultados de detección recibidos:', results);
    setDetectionResults(results);
    if (results.length > 0) {
      setSelectedCategory(results[0].category);
      console.log('📋 Información del backend:', {
        object: results[0].object,
        category: results[0].category,
        confidence: results[0].confidence,
        advice: results[0].advice,
        has_chatgpt_advice: results[0].has_chatgpt_advice
      });
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
          </p>
          
          {/* Botones de prueba para canecas de basura */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">Prueba modelos 3D de canecas:</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('trash_gray')}
                className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600 transition-colors"
              >
                Caneca Gris
              </button>
              <button
                onClick={() => setSelectedCategory('trash_white')}
                className="px-3 py-1 bg-gray-100 text-gray-800 border border-gray-300 rounded-md text-sm hover:bg-gray-200 transition-colors"
              >
                Caneca Blanca
              </button>
              <button
                onClick={() => setSelectedCategory('trash_green')}
                className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors"
              >
                Caneca Verde
              </button>
              <button
                onClick={() => setSelectedCategory('')}
                className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
              >
                Limpiar
              </button>
            </div>
            
            <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm font-medium text-orange-900 mb-2">Prueba datos del backend:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const mockResultWithAdvice = [{
                      object: 'Orgánico',
                      category: 'biological',
                      confidence: 0.89,
                      confidence_percentage: 89,
                      original_class: 'banana_peel',
                      inference_time_ms: 45.2,
                      has_chatgpt_advice: true,
                      advice: {
                        consejos: 'Separa los residuos orgánicos sin bolsas plásticas. Evita incluir carnes, huesos, aceites y productos lácteos. Deposita en contenedor marrón para compostaje.',
                        impacto: 'Compostar residuos orgánicos reduce las emisiones de metano en vertederos hasta en un 25%. Genera fertilizante natural que mejora la calidad del suelo.',
                        datos: 'Los residuos orgánicos representan el 40% de la basura doméstica. El compostaje puede reducir hasta 30% el volumen total de residuos.',
                        alternativas: 'Haz compost casero, usa un biodigestor, planifica las comidas para evitar desperdicio, cultiva tus propios alimentos orgánicos.'
                      }
                    }];
                    handleDetection(mockResultWithAdvice);
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                >
                  Orgánico con IA
                </button>
                
                <button
                  onClick={() => {
                    const mockResultWithoutAdvice = [{
                      object: 'Orgánico',
                      category: 'biological',
                      confidence: 0.11,
                      confidence_percentage: 11,
                      original_class: 'food_waste',
                      inference_time_ms: 23.8,
                      has_chatgpt_advice: false,
                      advice: null
                    }];
                    handleDetection(mockResultWithoutAdvice);
                  }}
                  className="px-3 py-1 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700 transition-colors"
                >
                  Orgánico sin IA
                </button>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-1">Categoría actual: {selectedCategory || 'Ninguna'}</p>
          </div>
        </div>        {/* Layout responsivo - stack en móvil, grid en desktop */}
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
                <div className="space-y-3 lg:space-y-4">
                  {/* Header con objeto detectado y confianza */}
                  <div className="border-b border-slate-700 pb-2">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm lg:text-base font-bold text-white">{detectionResults[0].object}</h3>
                      <div className="text-right">
                        <div className="text-lg lg:text-xl font-bold text-emerald-400">
                          {Math.round(detectionResults[0].confidence * 100)}%
                        </div>
                        <div className="text-slate-400 text-xs">Confianza</div>
                      </div>
                    </div>
                    <div className="text-slate-300 text-xs">
                      {detectionResults[0].original_class && `Detectado como: ${detectionResults[0].original_class}`}
                      {detectionResults[0].inference_time_ms && (
                        <span className="ml-2 text-slate-400">
                          • {detectionResults[0].inference_time_ms}ms
                        </span>
                      )}
                    </div>
                    {detectionResults[0].has_chatgpt_advice && (
                      <div className="mt-1 flex items-center space-x-1">
                        <span className="text-blue-400 text-xs">🤖</span>
                        <span className="text-blue-300 text-xs">Consejos generados por IA</span>
                      </div>
                    )}
                    {/* Debug info - remover en producción */}
                    <div className="mt-2 p-2 bg-slate-800/50 rounded border border-slate-600">
                      <div className="text-slate-400 text-xs">
                        <p>Debug Info:</p>
                        <p>• has_chatgpt_advice: {detectionResults[0].has_chatgpt_advice ? 'Sí' : 'No'}</p>
                        <p>• advice existe: {detectionResults[0].advice ? 'Sí' : 'No'}</p>
                        {detectionResults[0].advice && (
                          <>
                            <p>• consejos: {detectionResults[0].advice.consejos ? 'Sí' : 'No'}</p>
                            <p>• impacto: {detectionResults[0].advice.impacto ? 'Sí' : 'No'}</p>
                            <p>• datos: {detectionResults[0].advice.datos ? 'Sí' : 'No'}</p>
                            <p>• alternativas: {detectionResults[0].advice.alternativas ? 'Sí' : 'No'}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contenedor recomendado */}
                  <div className="bg-slate-700/50 rounded-lg p-2 border-l-4 border-emerald-400">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-emerald-400 text-sm">🗂️</span>
                      <span className="font-semibold text-xs text-emerald-300">Contenedor Correcto</span>
                    </div>
                    <p className="text-slate-200 text-xs font-medium">
                      {detectionResults[0].category === 'plastic' && 'Contenedor AMARILLO - Envases de plástico'}
                      {detectionResults[0].category === 'glass' && 'Contenedor VERDE - Envases de vidrio'}
                      {detectionResults[0].category === 'paper' && 'Contenedor AZUL - Papel y cartón'}
                      {detectionResults[0].category === 'cardboard' && 'Contenedor AZUL - Papel y cartón'}
                      {detectionResults[0].category === 'metal' && 'Contenedor AMARILLO - Envases metálicos'}
                      {detectionResults[0].category === 'biological' && 'Contenedor MARRÓN - Residuos orgánicos'}
                      {detectionResults[0].category === 'battery' && 'Punto SIGRE - Pilas y baterías'}
                      {detectionResults[0].category === 'clothes' && 'Contenedor TEXTIL - Ropa y calzado'}
                      {detectionResults[0].category === 'shoes' && 'Contenedor TEXTIL - Ropa y calzado'}
                      {detectionResults[0].category === 'trash' && 'Contenedor GRIS - Residuos generales'}
                      {detectionResults[0].category === 'unknown' && 'Consultar normativa local'}
                    </p>
                  </div>

                  {/* Instrucciones de preparación */}
                  <div className="bg-slate-700/30 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400 text-sm">💡</span>
                        <span className="font-semibold text-xs text-yellow-300">Cómo Preparar</span>
                      </div>
                      {detectionResults[0].advice && detectionResults[0].advice.consejos ? (
                        <span className="text-blue-400 text-xs">🤖 IA</span>
                      ) : (
                        <span className="text-slate-500 text-xs">📋 Básico</span>
                      )}
                    </div>
                    <div className="text-slate-300 text-xs">
                      {detectionResults[0].advice && detectionResults[0].advice.consejos ? (
                        <p className="leading-relaxed">{detectionResults[0].advice.consejos}</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="leading-relaxed text-slate-400">
                            {detectionResults[0].category === 'biological' && 'Separa residuos orgánicos limpios. Evita carnes, huesos y aceites. Deposita en contenedor marrón.'}
                            {detectionResults[0].category === 'plastic' && 'Limpia el envase, retira etiquetas y deposita en contenedor amarillo.'}
                            {detectionResults[0].category === 'glass' && 'Retira tapas, enjuaga y deposita en contenedor verde.'}
                            {detectionResults[0].category === 'paper' && 'Separa papeles limpios, retira grapas y deposita en contenedor azul.'}
                            {detectionResults[0].category === 'cardboard' && 'Dobla cajas, retira cintas y deposita en contenedor azul.'}
                            {detectionResults[0].category === 'metal' && 'Vacía completamente, enjuaga y deposita en contenedor amarillo.'}
                            {detectionResults[0].category === 'battery' && 'Lleva a punto SIGRE o punto limpio. NO deposites en contenedores comunes.'}
                            {detectionResults[0].category === 'clothes' && 'Dona si está en buen estado o deposita en contenedor textil.'}
                            {detectionResults[0].category === 'shoes' && 'Dona si están en buen estado o deposita en contenedor textil.'}
                            {detectionResults[0].category === 'trash' && 'Deposita en contenedor gris para residuos generales.'}
                            {!['biological', 'plastic', 'glass', 'paper', 'cardboard', 'metal', 'battery', 'clothes', 'shoes', 'trash'].includes(detectionResults[0].category) && 'Consulta las guías locales de reciclaje para este tipo de material.'}
                          </p>
                          {!detectionResults[0].has_chatgpt_advice && (
                            <p className="text-slate-500 text-xs italic">
                              💡 Consejos básicos - Conecta con ChatGPT para información personalizada
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Impacto ambiental */}
                  <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400 text-sm">🌱</span>
                        <span className="font-semibold text-xs text-green-300">Impacto Positivo</span>
                      </div>
                      {detectionResults[0].advice && detectionResults[0].advice.impacto ? (
                        <span className="text-blue-400 text-xs">🤖 IA</span>
                      ) : (
                        <span className="text-slate-500 text-xs">📋 Básico</span>
                      )}
                    </div>
                    <div className="text-slate-300 text-xs">
                      {detectionResults[0].advice && detectionResults[0].advice.impacto ? (
                        <p className="font-medium text-green-200 leading-relaxed">
                          {detectionResults[0].advice.impacto}
                        </p>
                      ) : (
                        <p className="font-medium text-green-200 leading-relaxed">
                          {detectionResults[0].category === 'biological' && 'Compostar residuos orgánicos reduce metano y crea fertilizante natural. Ahorra hasta 30% de residuos domésticos.'}
                          {detectionResults[0].category === 'plastic' && 'Reciclar plástico ahorra 2kg de CO₂ por botella. Reduce contaminación marina y conserva petróleo.'}
                          {detectionResults[0].category === 'glass' && 'El vidrio se recicla infinitas veces. Ahorra 30% de energía y reduce emisiones de CO₂.'}
                          {detectionResults[0].category === 'paper' && 'Reciclar papel salva 17 árboles por tonelada y reduce 50% el consumo de agua.'}
                          {detectionResults[0].category === 'cardboard' && 'Reciclar cartón ahorra 24% de energía y reduce tala de árboles.'}
                          {detectionResults[0].category === 'metal' && 'Reciclar metal ahorra 95% de energía. El aluminio es infinitamente reciclable.'}
                          {detectionResults[0].category === 'battery' && 'Reciclar baterías evita metales pesados en suelos y recupera materiales valiosos.'}
                          {detectionResults[0].category === 'clothes' && 'Reutilizar ropa reduce 2.6kg de CO₂ por prenda y ahorra 2,700 litros de agua.'}
                          {detectionResults[0].category === 'shoes' && 'Reutilizar calzado reduce residuos y ahorra materiales sintéticos.'}
                          {detectionResults[0].category === 'trash' && 'La gestión adecuada de residuos reduce contaminación y recupera recursos.'}
                          {!['biological', 'plastic', 'glass', 'paper', 'cardboard', 'metal', 'battery', 'clothes', 'shoes', 'trash'].includes(detectionResults[0].category) && 'El reciclaje adecuado contribuye a un planeta más sostenible.'}
                        </p>
                      )}
                      
                      {detectionResults[0].advice && detectionResults[0].advice.datos ? (
                        <p className="text-slate-400 mt-1 leading-relaxed">
                          {detectionResults[0].advice.datos}
                        </p>
                      ) : (
                        <p className="text-slate-400 mt-1 leading-relaxed">
                          {detectionResults[0].category === 'biological' && 'Los residuos orgánicos representan 40% de la basura doméstica. El compostaje reduce 30% el volumen de residuos.'}
                          {detectionResults[0].category === 'plastic' && 'Solo el 9% del plástico mundial se recicla. Una botella PET tarda 450 años en degradarse.'}
                          {detectionResults[0].category === 'glass' && 'El vidrio es 100% reciclable. Reciclar una botella ahorra energía para encender una bombilla 4 horas.'}
                          {detectionResults[0].category === 'paper' && 'Se necesitan 24 árboles para producir 1 tonelada de papel. El papel se puede reciclar hasta 7 veces.'}
                          {detectionResults[0].category === 'cardboard' && 'El cartón reciclado utiliza 75% menos energía que el cartón nuevo.'}
                          {detectionResults[0].category === 'metal' && 'Reciclar una lata de aluminio ahorra energía suficiente para ver TV 3 horas.'}
                          {detectionResults[0].category === 'battery' && 'Una pila contamina 3,000 litros de agua. Contienen metales como mercurio, plomo y cadmio.'}
                          {detectionResults[0].category === 'clothes' && 'La industria textil produce 10% de las emisiones globales de CO₂.'}
                          {detectionResults[0].category === 'shoes' && 'Se descartan 24 mil millones de zapatos al año globalmente.'}
                          {detectionResults[0].category === 'trash' && 'Cada persona genera 1.2kg de residuos al día en promedio.'}
                          {!['biological', 'plastic', 'glass', 'paper', 'cardboard', 'metal', 'battery', 'clothes', 'shoes', 'trash'].includes(detectionResults[0].category) && 'Cada acción de reciclaje cuenta para un futuro más sostenible.'}
                        </p>
                      )}

                      {detectionResults[0].advice && detectionResults[0].advice.alternativas ? (
                        <div className="mt-2 p-2 bg-green-900/20 rounded-lg border border-green-700/30">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1">
                              <span className="text-green-400 text-sm">💡</span>
                              <span className="font-semibold text-xs text-green-300">Alternativas Sostenibles</span>
                            </div>
                            <span className="text-blue-400 text-xs">🤖 IA</span>
                          </div>
                          <p className="text-slate-300 text-xs leading-relaxed">
                            {detectionResults[0].advice.alternativas}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 p-2 bg-green-900/20 rounded-lg border border-green-700/30">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1">
                              <span className="text-green-400 text-sm">💡</span>
                              <span className="font-semibold text-xs text-green-300">Alternativas Sostenibles</span>
                            </div>
                            <span className="text-slate-500 text-xs">📋 Básico</span>
                          </div>
                          <p className="text-slate-300 text-xs leading-relaxed">
                            {detectionResults[0].category === 'biological' && 'Haz compost casero, usa restos de cocina para fertilizar plantas, evita desperdicios planificando comidas.'}
                            {detectionResults[0].category === 'plastic' && 'Usa botellas reutilizables, bolsas de tela, productos con menos embalaje plástico.'}
                            {detectionResults[0].category === 'glass' && 'Reutiliza frascos para almacenamiento, elige productos en envases retornables.'}
                            {detectionResults[0].category === 'paper' && 'Usa papel digital, reutiliza hojas por ambos lados, elige productos con papel reciclado.'}
                            {detectionResults[0].category === 'cardboard' && 'Reutiliza cajas para almacenamiento, manualidades, o donación.'}
                            {detectionResults[0].category === 'metal' && 'Elige productos con menos embalaje, reutiliza latas para organización.'}
                            {detectionResults[0].category === 'battery' && 'Usa pilas recargables, dispositivos con batería integrada, energía solar.'}
                            {detectionResults[0].category === 'clothes' && 'Compra ropa de segunda mano, intercambia con amigos, elige marcas sostenibles.'}
                            {detectionResults[0].category === 'shoes' && 'Repara calzado, compra de segunda mano, elige marcas sostenibles.'}
                            {detectionResults[0].category === 'trash' && 'Reduce consumo, reutiliza productos, separa correctamente para reciclaje.'}
                            {!['biological', 'plastic', 'glass', 'paper', 'cardboard', 'metal', 'battery', 'clothes', 'shoes', 'trash'].includes(detectionResults[0].category) && 'Considera alternativas reutilizables y productos con menor impacto ambiental.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-slate-400">
                    <div className="w-12 lg:w-16 h-12 lg:h-16 border-2 border-dashed border-slate-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl lg:text-3xl">🔍</span>
                    </div>
                    <p className="text-sm font-medium">¡Analiza un residuo!</p>
                    <p className="text-xs mt-1 text-slate-500">Los consejos de reciclaje</p>
                    <p className="text-xs text-slate-500">aparecerán aquí</p>
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
