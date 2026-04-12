import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Edit2, Trash2, Eye, DollarSign, Users, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { getSubscriptionPlans, deleteSubscriptionPlan } from '../services/subscriptionsApi';
import type { SubscriptionPlan } from '../services/subscriptionsApi';
import { LoadingState } from '../../../components/ui/LoadingState';

export function PlanListPage() {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userType !== 'saas_admin') {
      navigate('/home');
      return;
    }
    loadPlans();
  }, [userType, navigate]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubscriptionPlans();
      setPlans(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar planes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Está seguro de desactivar el plan "${name}"? Las suscripciones existentes no se verán afectadas.`)) {
      return;
    }

    try {
      await deleteSubscriptionPlan(id);
      await loadPlans();
    } catch (err: any) {
      alert(err.message || 'Error al desactivar plan');
    }
  };

  const getBillingCycleLabel = (cycle: string) => {
    const labels: Record<string, string> = {
      MONTHLY: 'Mensual',
      QUARTERLY: 'Trimestral',
      ANNUAL: 'Anual',
    };
    return labels[cycle] || cycle;
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(parseFloat(price));
  };

  if (loading) {
    return <LoadingState message="Cargando planes..." fullScreen={true} />;
  }

  if (userType !== 'saas_admin') {
    return null;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            Planes de Suscripción
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Gestiona los planes disponibles para las instituciones financieras.
          </p>
        </div>
        <button
          onClick={() => navigate('/saas/plans/new')}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all font-medium text-sm w-full md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo Plan
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Grid de Planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-8 text-center">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No hay planes de suscripción registrados.</p>
            <button
              onClick={() => navigate('/saas/plans/new')}
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              Crear primer plan
            </button>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white/80 backdrop-blur-md shadow-sm border rounded-2xl overflow-hidden transition-all hover:shadow-md ${
                plan.is_active ? 'border-slate-200' : 'border-slate-300 opacity-60'
              }`}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">{plan.slug}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      plan.is_active
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {plan.is_active ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Activo
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactivo
                      </>
                    )}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{plan.description}</p>
              </div>

              {/* Precio */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-baseline gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="text-3xl font-bold text-slate-900">{formatPrice(plan.price)}</span>
                  <span className="text-sm text-slate-500">/ {getBillingCycleLabel(plan.billing_cycle)}</span>
                </div>
                {parseFloat(plan.setup_fee) > 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    + {formatPrice(plan.setup_fee)} de configuración inicial
                  </p>
                )}
                {plan.trial_days > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                    <Calendar className="h-3.5 w-3.5" />
                    {plan.trial_days} días de prueba gratis
                  </div>
                )}
              </div>

              {/* Límites */}
              <div className="p-6 border-b border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Límites
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      Usuarios
                    </span>
                    <span className="font-semibold text-slate-900">{plan.max_users}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Sucursales</span>
                    <span className="font-semibold text-slate-900">{plan.max_branches}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Productos</span>
                    <span className="font-semibold text-slate-900">{plan.max_products}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Préstamos/mes</span>
                    <span className="font-semibold text-slate-900">{plan.max_loans_per_month}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Almacenamiento</span>
                    <span className="font-semibold text-slate-900">{plan.max_storage_gb} GB</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="p-6 border-b border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Características
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'has_ai_scoring', label: 'AI Scoring' },
                    { key: 'has_workflows', label: 'Workflows' },
                    { key: 'has_reporting', label: 'Reportes' },
                    { key: 'has_mobile_app', label: 'App Móvil' },
                    { key: 'has_api_access', label: 'API' },
                    { key: 'has_white_label', label: 'White Label' },
                    { key: 'has_custom_integrations', label: 'Integraciones' },
                    { key: 'has_priority_support', label: 'Soporte' },
                  ].map((feature) => (
                    <div
                      key={feature.key}
                      className={`flex items-center gap-1.5 ${
                        plan[feature.key as keyof SubscriptionPlan]
                          ? 'text-emerald-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {plan[feature.key as keyof SubscriptionPlan] ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      <span>{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              <div className="p-4 bg-slate-50/50 flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate(`/saas/plans/${plan.id}`)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-sm font-medium"
                  title="Ver Detalles"
                >
                  <Eye className="h-4 w-4" />
                  Ver
                </button>
                <button
                  onClick={() => navigate(`/saas/plans/${plan.id}/edit`)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-sm font-medium"
                  title="Editar Plan"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(plan.id, plan.name)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-medium"
                  title="Desactivar Plan"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-slate-500 px-2">
        <p>Total de planes registrados</p>
        <p className="font-semibold px-3 py-1 bg-slate-100 rounded-lg">{plans.length}</p>
      </div>
    </div>
  );
}
