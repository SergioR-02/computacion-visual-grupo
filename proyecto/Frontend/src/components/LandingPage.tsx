import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Camera, Brain, Cuboid as Cube, Upload } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Camera,
      title: 'Detección en Tiempo Real',
      description: 'Usa tu cámara para identificar residuos instantáneamente'
    },
    {
      icon: Upload,
      title: 'Análisis de Imágenes',
      description: 'Sube fotos y obtén análisis detallado de los materiales'
    },
    {
      icon: Brain,
      title: 'Asistente Inteligente',
      description: 'Recibe consejos personalizados sobre cómo reciclar'
    },
    {
      icon: Cube,
      title: 'Visualización 3D',
      description: 'Explora modelos 3D interactivos de materiales'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-emerald-200">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-700">
                Powered by AI & 3D Technology
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Usa la{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                inteligencia artificial
              </span>
              <br />
              para aprender a reciclar de forma{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                interactiva
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              EcoScan 3D combina visión artificial, procesamiento inteligente y visualización 3D 
              para revolucionar la manera en que entendemos y practicamos el reciclaje responsable.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Empezar a Reciclar</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <button className="text-gray-600 hover:text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-300">
                Ver Demo
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-emerald-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-teal-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-2000"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre todas las herramientas que te ayudarán a convertirte en un experto del reciclaje
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl w-fit mb-4 group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-12 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              ¿Listo para comenzar tu viaje ecológico?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Únete a miles de usuarios que ya están aprendiendo a reciclar de manera inteligente y sostenible.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white text-emerald-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <span>Probar la App</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;