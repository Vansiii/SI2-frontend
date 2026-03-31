import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Building, CheckCircle2, XCircle, Users, Shield, PieChart, Activity, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { getTenantStats } from '../services/tenantsApi';
import type { TenantStats } from '../types';
import { LoadingState } from '../../../components/ui/LoadingState';

export function SaaSDashboardPage() {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userType !== 'saas_admin') {
      navigate('/home');
    }
  }, [userType, navigate]);

  useEffect(() => {
    if (userType === 'saas_admin') {
      loadStats();
    }
  }, [userType]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTenantStats();
      setStats(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al cargar estadísticas');
      }
    } finally {
      setLoading(false);
    }
  };

  const getInstitutionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      banking: 'Bancos',
      microfinance: 'Microfinanzas',
      cooperative: 'Cooperativas',
      fintech: 'Fintechs',
    };
    return labels[type] || type;
  };

  if (loading) {
    return <LoadingState message="Cargando estadísticas..." fullScreen={true} />;
  }

  if (error || !stats) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
          {error || 'Error al cargar estadísticas'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            Dashboard SaaS
          </h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base font-medium ml-1">
            Resumen y métricas de todas las instituciones operando en el sistema.
          </p>
        </div>
        <button
          onClick={() => navigate('/saas/tenants')}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-sm transition-all font-medium text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          <Building2 className="h-4 w-4" />
          Ver Instituciones
        </button>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Totales
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.total_institutions}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
               <Building className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Activas
              </p>
              <p className="text-3xl font-bold text-emerald-600">
                {stats.active_institutions}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Inactivas
              </p>
              <p className="text-3xl font-bold text-red-600">
                {stats.inactive_institutions}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
              <XCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Usuarios
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.total_users}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por Tipo & Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por tipo */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6 flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-slate-400" />
            Instituciones por Tipo
          </h2>
          <div className="space-y-5 flex-1">
            {Object.entries(stats.institutions_by_type).map(([type, count]) => {
              const percentage =
                stats.total_institutions > 0
                  ? (count / stats.total_institutions) * 100
                  : 0;

              return (
                <div key={type}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {getInstitutionTypeLabel(type)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {count}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumen de Roles */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6 flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-400" />
            Resumen de Roles Globales
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
              <div>
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                  Total de Roles en Sistema
                </p>
                <p className="text-3xl font-black text-indigo-700 mt-1">
                  {stats.total_roles}
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                <Shield className="h-8 w-8" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-slate-200/50 flex flex-col items-center justify-center text-slate-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-2xl font-bold text-slate-900">
                    {stats.total_institutions > 0
                      ? (stats.total_roles / stats.total_institutions).toFixed(1)
                      : 0}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Promedio / Inst.</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-slate-200/50 flex flex-col items-center justify-center text-slate-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.total_roles > 0
                      ? (stats.total_users / stats.total_roles).toFixed(1)
                      : 0}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Usuarios / Rol</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-400" />
          Acciones Rápidas y Navegación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/saas/tenants')}
            className="group flex flex-col items-start gap-4 p-5 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left"
          >
             <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors">
                <Building2 className="h-6 w-6" />
             </div>
             <div className="w-full flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Instituciones</h3>
                  <p className="text-xs text-slate-500 mt-1">Gestionar clientes y entidades</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
             </div>
          </button>

          <button
            onClick={() => navigate('/users')}
            className="group flex flex-col items-start gap-4 p-5 border border-slate-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left"
          >
              <div className="bg-purple-100 p-2.5 rounded-lg text-purple-600 group-hover:bg-purple-200 transition-colors">
                <Users className="h-6 w-6" />
             </div>
             <div className="w-full flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Usuarios</h3>
                  <p className="text-xs text-slate-500 mt-1">Ver todos los usuarios globales</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-purple-500 transition-colors" />
             </div>
          </button>

          <button
            onClick={() => navigate('/roles')}
            className="group flex flex-col items-start gap-4 p-5 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left"
          >
             <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-600 group-hover:bg-emerald-200 transition-colors">
                <Shield className="h-6 w-6" />
             </div>
             <div className="w-full flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Roles</h3>
                  <p className="text-xs text-slate-500 mt-1">Configurar permisos y accesos</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
             </div>
          </button>
        </div>
      </div>
    </div>
  );
}
