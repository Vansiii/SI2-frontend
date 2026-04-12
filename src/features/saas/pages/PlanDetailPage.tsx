import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Edit2, DollarSign, Users, Calendar, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { getSubscriptionPlan, deleteSubscriptionPlan } from '../services/subscriptionsApi';
import type { SubscriptionPlan } from '../services/subscriptionsApi';
import { LoadingState } from '../../../components/ui/LoadingState';

export function PlanDetailPage() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const { userType } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userType !== 'saas_admin') {
      navigate('/home');
      return;
    }

    if (planId) {
      loadPlan();
    }
  }, [userType, navigate, planId]);

  const loadPlan = async () => {
    if (!planId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getSubscriptionPlan(Number(planId));
      setPlan(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!plan) return;

    if (!confirm(`¿Está seguro de desactivar el plan "${plan.name}"?`)) {
      return;
    }

    try {
      await deleteSubscriptionPlan(plan.id);
      navigate('/saas/plans');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingState message="Cargando plan..." fullScreen={true} />;
  }

  if (error || !plan) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
          {error || 'Plan no encontrado'}
        </div>
        <button
          onClick={() => navigate('/saas/plans')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a planes
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/saas/plans')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors w-fit text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a planes
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Package className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                {plan.name}
              </h1>
              <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium">
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {plan.slug}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto flex-wrap items-stretch sm:items-center gap-3">
            <span
              className={`inline-flex justify-center items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border ${
                plan.is_active
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {plan.is_active ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Plan Activo
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Plan Inactivo
                </>
              )}
            </span>
            <button
              onClick={() => navigate(`/saas/plans/${plan.id}/edit`)}
              className="flex justify-center items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all font-medium text-sm"
            >
              <Edit2 className="h-4 w-4" />
              Editar Plan
            </button>
            <button
              onClick={handleDelete}
              className="flex justify-center items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium text-sm"
            >
              <Trash2 className="h-4 w-4" />
              Desactivar
            </button>
          </div>
        </div>
      </div>

      {/* Descripción */}
      {plan.description && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <p className="text-slate-700 leading-relaxed">{plan.description}</p>
        </div>
      )}

      {/* Precio y Facturación */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-slate-400" />
          Precio y Facturación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Precio
            </p>
            <p className="text-3xl font-bold text-slate-900">{formatPrice(plan.price)}</p>
            <p className="text-sm text-slate-500 mt-1">/ {getBillingCycleLabel(plan.billing_cycle)}</p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Tarifa de Configuración
            </p>
            <p className="text-3xl font-bold text-slate-900">{formatPrice(plan.setup_fee)}</p>
            <p className="text-sm text-slate-500 mt-1">Pago único</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Período de Prueba
            </p>
            <p className="text-3xl font-bold text-emerald-700">{plan.trial_days}</p>
            <p className="text-sm text-emerald-600 mt-1">días gratis</p>
          </div>
        </div>
      </div>

      {/* Límites */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          Límites del Plan
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Usuarios', value: plan.max_users },
            { label: 'Sucursales', value: plan.max_branches },
            { label: 'Productos', value: plan.max_products },
            { label: 'Préstamos/mes', value: plan.max_loans_per_month },
            { label: 'Almacenamiento', value: `${plan.max_storage_gb} GB` },
          ].map((item, index) => (
            <div key={index} className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Características */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
          Características Incluidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { key: 'has_ai_scoring', label: 'AI Scoring (Calificación con IA)' },
            { key: 'has_workflows', label: 'Workflows Automatizados' },
            { key: 'has_reporting', label: 'Reportes Avanzados' },
            { key: 'has_mobile_app', label: 'Aplicación Móvil' },
            { key: 'has_api_access', label: 'Acceso a API' },
            { key: 'has_white_label', label: 'White Label (Marca Propia)' },
            { key: 'has_custom_integrations', label: 'Integraciones Personalizadas' },
            { key: 'has_priority_support', label: 'Soporte Prioritario' },
          ].map((feature) => (
            <div
              key={feature.key}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                plan[feature.key as keyof SubscriptionPlan]
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              {plan[feature.key as keyof SubscriptionPlan] ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-slate-400 shrink-0" />
              )}
              <span
                className={`text-sm font-medium ${
                  plan[feature.key as keyof SubscriptionPlan]
                    ? 'text-emerald-700'
                    : 'text-slate-500'
                }`}
              >
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Metadatos */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
          Información del Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Orden de Visualización
            </p>
            <p className="text-sm font-medium text-slate-900">{plan.display_order}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Fecha de Creación
            </p>
            <p className="text-sm font-medium text-slate-900">{formatDate(plan.created_at)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Última Actualización
            </p>
            <p className="text-sm font-medium text-slate-900">{formatDate(plan.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
