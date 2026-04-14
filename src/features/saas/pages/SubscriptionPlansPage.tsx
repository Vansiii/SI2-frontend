/**
 * Página de Planes de Suscripción - Diseño Consistente con el Sistema
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Check, 
  Users,
  Building2,
  Package,
  FileText,
  HardDrive,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  getSubscriptionPlans,
  getMySubscription,
  hasActiveSubscription,
  calculateMonthlyPrice,
  type SubscriptionPlan,
} from '../services/subscriptionsApi';

type BillingCycle = 'MONTHLY' | 'ANNUAL';

export default function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);

  useEffect(() => {
    loadPlans();
    loadCurrentSubscription();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptionPlans();
      const sortedPlans = data.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      setPlans(sortedPlans);
    } catch (err: any) {
      setError(err.message || 'Error al cargar planes');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentSubscription = async () => {
    try {
      const subscription = await getMySubscription();
      if (hasActiveSubscription(subscription)) {
        setCurrentPlanId(subscription.plan.id);
      } else {
        setCurrentPlanId(null);
      }
    } catch {
      setCurrentPlanId(null);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    if (billingCycle === 'MONTHLY') {
      return plan.billing_cycle === 'MONTHLY' 
        ? parseFloat(plan.price) 
        : calculateMonthlyPrice(plan);
    } else {
      return plan.billing_cycle === 'ANNUAL' 
        ? parseFloat(plan.price) 
        : parseFloat(plan.price) * 12;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando planes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={loadPlans}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Planes de Suscripción</h1>
        <p className="text-slate-600">
          Elige el plan perfecto para tu institución. Comienza con 30 días de prueba gratis.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              billingCycle === 'MONTHLY'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingCycle('ANNUAL')}
            className={`px-6 py-2 rounded-md font-medium transition-colors relative ${
              billingCycle === 'ANNUAL'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Anual
            <span className="absolute -top-2 -right-2 bg-green-500 text-xs font-bold px-2 py-0.5 rounded-full text-white">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {plans.map((plan, index) => {
          const isCurrentPlan = currentPlanId === plan.id;
          const isFeatured = plan.is_featured;
          const price = getPrice(plan);

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Featured Badge */}
              {isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    Más Popular
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4 z-10">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Plan Actual
                  </span>
                </div>
              )}

              <div
                className={`h-full bg-white/80 backdrop-blur-md rounded-2xl border shadow-sm hover:shadow-md transition-all ${
                  isFeatured ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
                }`}
              >
                <div className="p-6">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 min-h-[40px]">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-slate-900">
                        ${price.toFixed(2)}
                      </span>
                      <span className="text-slate-600">
                        /{billingCycle === 'MONTHLY' ? 'mes' : 'año'}
                      </span>
                    </div>
                    {billingCycle === 'ANNUAL' && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        Ahorra ${(price * 0.2).toFixed(2)} al año
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => navigate(`/subscription/checkout/${plan.id}`)}
                    disabled={isCurrentPlan}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      isCurrentPlan
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : isFeatured
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isCurrentPlan ? (
                      'Plan Actual'
                    ) : (
                      <>
                        Seleccionar Plan
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Trial Info */}
                  {plan.trial_days > 0 && !isCurrentPlan && (
                    <p className="text-center text-sm text-slate-500 mt-3">
                      {plan.trial_days} días gratis
                    </p>
                  )}

                  {/* Divider */}
                  <div className="my-6 border-t border-slate-200"></div>

                  {/* Features */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <Users className="w-4 h-4 text-blue-600 shrink-0" />
                      <span><strong>{plan.max_users}</strong> usuarios</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span><strong>{plan.max_branches}</strong> sucursales</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <Package className="w-4 h-4 text-blue-600 shrink-0" />
                      <span><strong>{plan.max_products}</strong> productos</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span><strong>{plan.max_loans_per_month}</strong> solicitudes/mes</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <HardDrive className="w-4 h-4 text-blue-600 shrink-0" />
                      <span><strong>{plan.max_storage_gb} GB</strong> almacenamiento</span>
                    </div>

                    {/* Premium Features */}
                    {(plan.has_ai_scoring || plan.has_workflows || plan.has_api_access) && (
                      <>
                        <div className="my-4 border-t border-slate-200"></div>
                        {plan.has_ai_scoring && (
                          <div className="flex items-center gap-3 text-sm text-slate-700">
                            <Check className="w-4 h-4 text-green-600 shrink-0" />
                            <span>Scoring con IA</span>
                          </div>
                        )}
                        {plan.has_workflows && (
                          <div className="flex items-center gap-3 text-sm text-slate-700">
                            <Check className="w-4 h-4 text-green-600 shrink-0" />
                            <span>Flujos personalizables</span>
                          </div>
                        )}
                        {plan.has_api_access && (
                          <div className="flex items-center gap-3 text-sm text-slate-700">
                            <Check className="w-4 h-4 text-green-600 shrink-0" />
                            <span>Acceso API</span>
                          </div>
                        )}
                        {plan.has_priority_support && (
                          <div className="flex items-center gap-3 text-sm text-slate-700">
                            <Check className="w-4 h-4 text-green-600 shrink-0" />
                            <span>Soporte prioritario</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          ¿Necesitas ayuda para elegir?
        </h3>
        <p className="text-slate-600 mb-4">
          Nuestro equipo está listo para ayudarte a encontrar el plan perfecto.
        </p>
        <button
          onClick={() => navigate('/subscription/current')}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Ver Mi Suscripción
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
