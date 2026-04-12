/**
 * Página de Checkout - Diseño Consistente con el Sistema
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Shield,
  Lock,
  CreditCard,
  Calendar,
  Users,
  Building2,
  Package,
  FileText,
  HardDrive,
  Zap,
  AlertCircle,
  Gift
} from 'lucide-react';
import {
  getSubscriptionPlan,
  createSubscription,
  changeMySubscriptionPlan,
  getMySubscription,
  calculateMonthlyPrice,
  type SubscriptionPlan,
} from '../services/subscriptionsApi';

type BillingCycle = 'MONTHLY' | 'ANNUAL';

export default function CheckoutPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [hasExistingSubscription, setHasExistingSubscription] = useState(false);

  useEffect(() => {
    if (planId) {
      loadPlan();
    }
  }, [planId]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptionPlan(parseInt(planId!));
      setPlan(data);
      setBillingCycle('MONTHLY');
      
      // Verificar si ya tiene una suscripción
      try {
        const subscription = await getMySubscription();
        if ('has_subscription' in subscription && !subscription.has_subscription) {
          setHasExistingSubscription(false);
        } else {
          setHasExistingSubscription(true);
        }
      } catch {
        setHasExistingSubscription(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el plan');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubscription = async () => {
    if (!plan || !acceptTerms) return;

    try {
      setProcessing(true);
      setError(null);

      if (hasExistingSubscription) {
        await changeMySubscriptionPlan(plan.id);
        navigate('/subscription/current', {
          state: { message: `Plan actualizado exitosamente a ${plan.name}` }
        });
      } else {
        await createSubscription({
          plan_id: plan.id,
          billing_cycle: billingCycle,
          start_trial: true,
        });
        navigate('/subscription/success', { 
          state: { 
            planName: plan.name,
            trialDays: plan.trial_days 
          } 
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al procesar la suscripción');
    } finally {
      setProcessing(false);
    }
  };

  const getPrice = () => {
    if (!plan) return '0.00';
    const basePrice = parseFloat(plan.price);
    
    if (billingCycle === 'MONTHLY') {
      return plan.billing_cycle === 'MONTHLY' ? basePrice.toFixed(2) : calculateMonthlyPrice(plan).toFixed(2);
    } else {
      return plan.billing_cycle === 'ANNUAL' ? basePrice.toFixed(2) : (basePrice * 12).toFixed(2);
    }
  };

  const getTotalPrice = () => {
    if (!plan) return '0.00';
    const price = parseFloat(getPrice());
    if (billingCycle === 'ANNUAL') {
      return (price * 0.8).toFixed(2); // 20% discount
    }
    return price.toFixed(2);
  };

  const getSavings = () => {
    if (!plan || billingCycle !== 'ANNUAL') return '0.00';
    const monthlyTotal = parseFloat(plan.price) * 12;
    const annualPrice = parseFloat(getTotalPrice());
    return (monthlyTotal - annualPrice).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Cargando información del plan...</p>
        </div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Error</h2>
          <p className="text-slate-600 text-center mb-6">{error}</p>
          <button
            onClick={() => navigate('/subscription/plans')}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Volver a Planes
          </button>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/subscription/plans')}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Planes
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {hasExistingSubscription ? 'Cambiar Plan' : 'Confirmar Suscripción'}
          </h1>
          <p className="text-slate-600">
            Revisa los detalles antes de confirmar
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-blue-600 p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Plan Seleccionado</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{plan.name}</h2>
                    <p className="text-blue-100 text-sm">{plan.description}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-3xl md:text-4xl font-bold text-white">${getPrice()}</p>
                    <p className="text-blue-100 text-sm">
                      /{billingCycle === 'MONTHLY' ? 'mes' : 'año'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Billing Cycle Toggle */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Ciclo de Facturación
                  </label>
                  <div className="inline-flex bg-slate-100 rounded-xl p-1 w-full sm:w-auto">
                    <button
                      onClick={() => setBillingCycle('MONTHLY')}
                      className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition-colors ${
                        billingCycle === 'MONTHLY'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Mensual
                    </button>
                    <button
                      onClick={() => setBillingCycle('ANNUAL')}
                      className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition-colors relative ${
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

                {/* Features Grid */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Características Incluidas:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <Users className="w-5 h-5 text-blue-600 shrink-0" />
                      <span><strong>{plan.max_users}</strong> usuarios</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
                      <span><strong>{plan.max_branches}</strong> sucursales</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <Package className="w-5 h-5 text-blue-600 shrink-0" />
                      <span><strong>{plan.max_products}</strong> productos</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                      <span><strong>{plan.max_loans_per_month}</strong> solicitudes/mes</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <HardDrive className="w-5 h-5 text-blue-600 shrink-0" />
                      <span><strong>{plan.max_storage_gb} GB</strong> almacenamiento</span>
                    </div>
                    {plan.has_ai_scoring && (
                      <div className="flex items-center gap-3 text-sm text-slate-700 bg-green-50 rounded-lg p-3 border border-green-100">
                        <Check className="w-5 h-5 text-green-600 shrink-0" />
                        <span>Scoring con IA</span>
                      </div>
                    )}
                    {plan.has_workflows && (
                      <div className="flex items-center gap-3 text-sm text-slate-700 bg-green-50 rounded-lg p-3 border border-green-100">
                        <Check className="w-5 h-5 text-green-600 shrink-0" />
                        <span>Flujos personalizables</span>
                      </div>
                    )}
                    {plan.has_api_access && (
                      <div className="flex items-center gap-3 text-sm text-slate-700 bg-green-50 rounded-lg p-3 border border-green-100">
                        <Check className="w-5 h-5 text-green-600 shrink-0" />
                        <span>Acceso API</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Términos y Condiciones
              </h3>
              <div className="space-y-3 text-sm text-slate-600 mb-6">
                {!hasExistingSubscription && (
                  <>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <p>Período de prueba de <strong>{plan.trial_days} días gratis</strong></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <p>No se requiere tarjeta de crédito para el período de prueba</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <p>Puedes cancelar en cualquier momento durante el período de prueba</p>
                    </div>
                  </>
                )}
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <p>Puedes actualizar o cancelar tu plan en cualquier momento</p>
                </div>
              </div>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                  Acepto los{' '}
                  <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                    términos y condiciones
                  </a>{' '}
                  y la{' '}
                  <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                    política de privacidad
                  </a>
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Resumen del Pedido
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Plan</span>
                  <span className="font-medium text-slate-900">{plan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Ciclo</span>
                  <span className="font-medium text-slate-900">
                    {billingCycle === 'MONTHLY' ? 'Mensual' : 'Anual'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Precio</span>
                  <span className="font-medium text-slate-900">${getPrice()}</span>
                </div>
                {billingCycle === 'ANNUAL' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Descuento (20%)</span>
                    <span className="font-medium text-green-600">-${getSavings()}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-4 flex justify-between">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-slate-900 text-xl">${getTotalPrice()}</span>
                </div>
              </div>

              {/* Trial Banner */}
              {plan.trial_days > 0 && !hasExistingSubscription && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-blue-600" />
                    <p className="font-bold text-blue-900">🎉 {plan.trial_days} días gratis</p>
                  </div>
                  <p className="text-sm text-blue-700">
                    No se cobrará nada hasta que termine tu período de prueba
                  </p>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleConfirmSubscription}
                disabled={!acceptTerms || processing}
                className={`w-full py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  acceptTerms && !processing
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Procesando...
                  </>
                ) : hasExistingSubscription ? (
                  <>
                    <Zap className="w-5 h-5" />
                    Cambiar a Este Plan
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirmar Suscripción
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
                <Lock className="w-4 h-4" />
                <span>Transacción segura y encriptada</span>
              </div>

              {/* Next Billing */}
              {!hasExistingSubscription && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Próxima facturación</span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(Date.now() + plan.trial_days * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
