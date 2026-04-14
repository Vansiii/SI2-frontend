import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  getSubscriptionPlan,
  createSubscriptionPlan,
  updateSubscriptionPlan,
} from '../services/subscriptionsApi';
import { LoadingState } from '../../../components/ui/LoadingState';

export function PlanFormPage() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const { userType } = useAuth();
  const isEditing = !!planId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '0',
    billing_cycle: 'MONTHLY' as 'MONTHLY' | 'QUARTERLY' | 'ANNUAL',
    trial_days: 0,
    setup_fee: '0',
    
    max_users: 10,
    max_branches: 1,
    max_products: 10,
    max_loans_per_month: 100,
    max_storage_gb: 5,
    
    has_ai_scoring: false,
    has_workflows: false,
    has_reporting: false,
    has_mobile_app: false,
    has_api_access: false,
    has_white_label: false,
    has_custom_integrations: false,
    has_priority_support: false,
    
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    if (userType !== 'saas_admin') {
      navigate('/home');
      return;
    }

    if (isEditing && planId) {
      loadPlan();
    }
  }, [userType, navigate, isEditing, planId]);

  const loadPlan = async () => {
    if (!planId) return;

    try {
      setLoading(true);
      const plan = await getSubscriptionPlan(Number(planId));
      setFormData({
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        price: plan.price,
        billing_cycle: plan.billing_cycle,
        trial_days: plan.trial_days,
        setup_fee: plan.setup_fee,
        max_users: plan.max_users,
        max_branches: plan.max_branches,
        max_products: plan.max_products,
        max_loans_per_month: plan.max_loans_per_month,
        max_storage_gb: plan.max_storage_gb,
        has_ai_scoring: plan.has_ai_scoring,
        has_workflows: plan.has_workflows,
        has_reporting: plan.has_reporting,
        has_mobile_app: plan.has_mobile_app,
        has_api_access: plan.has_api_access,
        has_white_label: plan.has_white_label,
        has_custom_integrations: plan.has_custom_integrations,
        has_priority_support: plan.has_priority_support,
        is_active: plan.is_active,
        display_order: plan.display_order,
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      setError('El nombre y slug son requeridos');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isEditing && planId) {
        await updateSubscriptionPlan(Number(planId), formData);
      } else {
        await createSubscriptionPlan(formData);
      }

      navigate('/saas/plans');
    } catch (err: any) {
      setError(err.message || 'Error al guardar plan');
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: isEditing ? formData.slug : generateSlug(name),
    });
  };

  if (loading) {
    return <LoadingState message="Cargando plan..." fullScreen={true} />;
  }

  if (userType !== 'saas_admin') {
    return null;
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/saas/plans')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors w-fit text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a planes
        </button>

        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditing ? 'Editar Plan' : 'Nuevo Plan de Suscripción'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isEditing
                ? 'Modifica los detalles del plan de suscripción'
                : 'Crea un nuevo plan para las instituciones financieras'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
            Información Básica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nombre del Plan *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="Ej: Plan Básico"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Slug (URL) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm"
                placeholder="plan-basico"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Orden de Visualización
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                rows={3}
                placeholder="Descripción del plan..."
              />
            </div>
          </div>
        </div>

        {/* Precios */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
            Precios y Facturación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Precio (BOB) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ciclo de Facturación *
              </label>
              <select
                value={formData.billing_cycle}
                onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value as any })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              >
                <option value="MONTHLY">Mensual</option>
                <option value="QUARTERLY">Trimestral</option>
                <option value="ANNUAL">Anual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tarifa de Configuración (BOB)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.setup_fee}
                onChange={(e) => setFormData({ ...formData, setup_fee: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Días de Prueba Gratis
              </label>
              <input
                type="number"
                value={formData.trial_days}
                onChange={(e) => setFormData({ ...formData, trial_days: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Límites */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
            Límites del Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Máximo de Usuarios
              </label>
              <input
                type="number"
                value={formData.max_users}
                onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Máximo de Sucursales
              </label>
              <input
                type="number"
                value={formData.max_branches}
                onChange={(e) => setFormData({ ...formData, max_branches: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Máximo de Productos
              </label>
              <input
                type="number"
                value={formData.max_products}
                onChange={(e) => setFormData({ ...formData, max_products: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Préstamos por Mes
              </label>
              <input
                type="number"
                value={formData.max_loans_per_month}
                onChange={(e) => setFormData({ ...formData, max_loans_per_month: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Almacenamiento (GB)
              </label>
              <input
                type="number"
                value={formData.max_storage_gb}
                onChange={(e) => setFormData({ ...formData, max_storage_gb: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Características */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
            Características Incluidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label
                key={feature.key}
                className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData[feature.key as keyof typeof formData] as boolean}
                  onChange={(e) => setFormData({ ...formData, [feature.key]: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500/50"
                />
                <span className="text-sm font-medium text-slate-700">{feature.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Estado */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
            Estado del Plan
          </h2>
          <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500/50"
            />
            <span className="text-sm font-medium text-slate-700">
              Plan activo y visible para instituciones
            </span>
          </label>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate('/saas/plans')}
            className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl transition-all font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all font-medium text-sm"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}
