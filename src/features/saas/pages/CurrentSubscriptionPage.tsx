/**
 * Página de Suscripción Actual - Diseño Consistente con el Sistema
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  CreditCard,
  Users,
  Building2,
  Package,
  FileText,
  HardDrive,
  Check,
  AlertTriangle,
  Zap,
  Shield
} from 'lucide-react';
import {
  getMySubscription,
  hasActiveSubscription,
  type Subscription,
} from '../services/subscriptionsApi';

function CurrentSubscriptionPage() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMySubscription();
      
      if (!hasActiveSubscription(data)) {
        setError('No tienes una suscripción activa');
        setSubscription(null);
        return;
      }
      
      setSubscription(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al cargar suscripción');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'TRIAL':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-blue-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando suscripción...</p>
        </div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-yellow-900 mb-2">
                {error ? 'Error al cargar suscripción' : 'No tienes una suscripción activa'}
              </h2>
              <p className="text-yellow-800 mb-4">
                {error || 'Para comenzar a usar el sistema, necesitas seleccionar un plan de suscripción.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/subscription/plans')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ver Planes Disponibles
                </button>
                {error && (
                  <button
                    onClick={loadSubscription}
                    className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Reintentar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Mi Suscripción</h1>
            <p className="text-slate-600">Gestiona tu plan y revisa el uso de recursos</p>
          </div>
          <div className={`px-4 py-2 rounded-full border ${getStatusColor(subscription.status)}`}>
            <span className="font-medium">{subscription.status}</span>
          </div>
        </div>
      </div>

      {/* Trial Banner */}
      {subscription.is_trial && subscription.trial_end_date && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Período de Prueba Activo</p>
              <p className="text-sm text-blue-700">
                Tu prueba gratuita termina el {new Date(subscription.trial_end_date).toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Plan Actual</p>
                  <h2 className="text-2xl font-bold text-slate-900">{subscription.plan.name}</h2>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-900">
                    ${subscription.plan.price}
                  </p>
                  <p className="text-sm text-slate-600">
                    /{subscription.plan.billing_cycle === 'MONTHLY' ? 'mes' : subscription.plan.billing_cycle === 'QUARTERLY' ? 'trimestre' : 'año'}
                  </p>
                </div>
              </div>

              <p className="text-slate-600 mb-6">{subscription.plan.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Próxima Facturación</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {subscription.next_billing_date 
                      ? new Date(subscription.next_billing_date).toLocaleDateString('es-ES')
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">Días hasta Renovación</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {subscription.days_until_renewal !== null ? `${subscription.days_until_renewal} días` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/subscription/plans')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Actualizar Plan
                </button>
                <button
                  onClick={() => {/* TODO: Implementar cancelación */}}
                  className="px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar Suscripción
                </button>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Uso de Recursos</h3>

            <div className="space-y-6">
              {/* Users */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-600" />
                    <span className="font-medium text-slate-700">Usuarios</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {subscription.current_users} / {subscription.plan.max_users}
                  </span>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(subscription.usage_percentage.users, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${getUsageColor(subscription.usage_percentage.users)} rounded-full`}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {subscription.usage_percentage.users.toFixed(0)}% utilizado
                </p>
              </div>

              {/* Branches */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-600" />
                    <span className="font-medium text-slate-700">Sucursales</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {subscription.current_branches} / {subscription.plan.max_branches}
                  </span>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(subscription.usage_percentage.branches, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                    className={`h-full ${getUsageColor(subscription.usage_percentage.branches)} rounded-full`}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {subscription.usage_percentage.branches.toFixed(0)}% utilizado
                </p>
              </div>

              {/* Products */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-600" />
                    <span className="font-medium text-slate-700">Productos Crediticios</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {subscription.current_products} / {subscription.plan.max_products}
                  </span>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(subscription.usage_percentage.products, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className={`h-full ${getUsageColor(subscription.usage_percentage.products)} rounded-full`}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {subscription.usage_percentage.products.toFixed(0)}% utilizado
                </p>
              </div>

              {/* Loans This Month */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span className="font-medium text-slate-700">Solicitudes Este Mes</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {subscription.current_loans_this_month} / {subscription.plan.max_loans_per_month}
                  </span>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(subscription.usage_percentage.loans, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    className={`h-full ${getUsageColor(subscription.usage_percentage.loans)} rounded-full`}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {subscription.usage_percentage.loans.toFixed(0)}% utilizado
                </p>
              </div>

              {/* Storage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-slate-600" />
                    <span className="font-medium text-slate-700">Almacenamiento</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {typeof subscription.current_storage_gb === 'number' 
                      ? subscription.current_storage_gb.toFixed(2) 
                      : parseFloat(subscription.current_storage_gb).toFixed(2)} GB / {subscription.plan.max_storage_gb} GB
                  </span>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(subscription.usage_percentage.storage, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                    className={`h-full ${getUsageColor(subscription.usage_percentage.storage)} rounded-full`}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {subscription.usage_percentage.storage.toFixed(0)}% utilizado
                </p>
              </div>
            </div>

            {!subscription.is_within_limits && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900 mb-1">Límites Excedidos</p>
                  <p className="text-sm text-red-700">
                    Has excedido los límites de tu plan. Considera actualizar a un plan superior.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Features Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Características Incluidas</h3>
            <ul className="space-y-3">
              {subscription.plan.has_ai_scoring && (
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  Scoring con IA
                </li>
              )}
              {subscription.plan.has_workflows && (
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  Flujos personalizables
                </li>
              )}
              {subscription.plan.has_reporting && (
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  Reportes avanzados
                </li>
              )}
              {subscription.plan.has_mobile_app && (
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  App móvil
                </li>
              )}
              {subscription.plan.has_api_access && (
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  Acceso API
                </li>
              )}
              {subscription.plan.has_white_label && (
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  White Label
                </li>
              )}
              {subscription.plan.has_priority_support && (
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  Soporte prioritario
                </li>
              )}
            </ul>
          </div>

          {/* Billing Info */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Información de Facturación
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Fecha de Inicio</p>
                <p className="font-medium text-slate-900">
                  {new Date(subscription.start_date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              {subscription.trial_end_date && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Fin de Prueba</p>
                  <p className="font-medium text-slate-900">
                    {new Date(subscription.trial_end_date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {subscription.days_until_renewal !== null && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Días hasta Renovación</p>
                  <p className="font-medium text-slate-900">
                    {subscription.days_until_renewal} días
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <Shield className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">¿Necesitas ayuda?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Nuestro equipo está disponible para ayudarte con cualquier pregunta.
            </p>
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Contactar Soporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrentSubscriptionPage;
