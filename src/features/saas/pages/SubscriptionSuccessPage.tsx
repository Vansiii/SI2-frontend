/**
 * Página de Éxito de Suscripción - Diseño Consistente con el Sistema
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle,
  ArrowRight,
  Calendar,
  Gift,
  Zap,
  Users,
  TrendingUp,
  Shield
} from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { planName, trialDays } = location.state || {};

  useEffect(() => {
    // Si no hay datos, redirigir a planes
    if (!planName) {
      navigate('/subscription/plans');
    }
  }, [planName, navigate]);

  const features = [
    {
      icon: Users,
      title: 'Gestión de Usuarios',
      description: 'Administra tu equipo fácilmente'
    },
    {
      icon: TrendingUp,
      title: 'Reportes Avanzados',
      description: 'Analiza el rendimiento en tiempo real'
    },
    {
      icon: Shield,
      title: 'Seguridad Garantizada',
      description: 'Tus datos están protegidos'
    }
  ];

  const nextSteps = [
    {
      number: '1',
      title: 'Configura tu perfil',
      description: 'Personaliza la información de tu institución'
    },
    {
      number: '2',
      title: 'Invita a tu equipo',
      description: 'Agrega usuarios y asigna roles'
    },
    {
      number: '3',
      title: 'Explora las funciones',
      description: 'Descubre todas las herramientas disponibles'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-md">
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full mb-6 font-medium border border-green-200">
            <CheckCircle className="w-4 h-4" />
            ¡Suscripción Exitosa!
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            ¡Bienvenido a{' '}
            <span className="text-blue-600">
              {planName}!
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tu suscripción ha sido activada exitosamente. Estás listo para comenzar.
          </p>
        </div>

        {/* Trial Info Card */}
        {trialDays && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6 mb-12">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                <Gift className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  🎉 {trialDays} Días de Prueba Gratis
                </h3>
                <p className="text-slate-600">
                  Disfruta de todas las funciones premium sin costo. No se requiere tarjeta de crédito.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                <Calendar className="w-5 h-5 text-slate-600" />
                <span className="font-bold text-slate-900">
                  Hasta {new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Lo que puedes hacer ahora
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 group"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors border border-blue-100">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Próximos Pasos
          </h2>
          <div className="space-y-6">
            {nextSteps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 group"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0 text-white font-bold shadow-sm group-hover:bg-blue-700 transition-colors">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm hover:shadow-md transition-all"
          >
            <Zap className="w-5 h-5" />
            Comenzar Ahora
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/subscription/current')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Ver Mi Suscripción
          </button>
        </div>

        {/* Help Text */}
        <p className="text-center text-slate-500 mt-8">
          ¿Necesitas ayuda? Contáctanos en{' '}
          <a href="mailto:soporte@ejemplo.com" className="text-blue-600 hover:text-blue-700 font-medium">
            soporte@ejemplo.com
          </a>
        </p>
      </div>
    </div>
  );
}
