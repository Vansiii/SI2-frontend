import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, FileText, ToggleLeft, ToggleRight, Users, UserCog, ShieldAlert, BadgeCheck, ShieldOff, Activity } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { getTenantDetail, toggleTenantActive } from '../services/tenantsApi';
import type { TenantDetail } from '../types';
import { LoadingState } from '../../../components/ui/LoadingState';

export function TenantDetailPage() {
  const navigate = useNavigate();
  const { tenantId } = useParams<{ tenantId: string }>();
  const { userType } = useAuth();
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar que sea SaaS admin
  useEffect(() => {
    if (userType !== 'saas_admin') {
      navigate('/home');
    }
  }, [userType, navigate]);

  useEffect(() => {
    if (tenantId) {
      loadTenantDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const loadTenantDetail = async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getTenantDetail(Number(tenantId));
      setTenant(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al cargar detalles de la institución');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!tenant) return;

    const action = tenant.is_active ? 'desactivar' : 'activar';
    if (!confirm(`¿Está seguro de ${action} esta institución?`)) {
      return;
    }

    try {
      await toggleTenantActive(tenant.id, !tenant.is_active);
      await loadTenantDetail();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert(`Error al ${action} institución`);
      }
    }
  };

  const getInstitutionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      banking: 'Banco',
      microfinance: 'Microfinanzas',
      cooperative: 'Cooperativa',
      fintech: 'Fintech',
    };
    return labels[type] || type;
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
    return <LoadingState message="Cargando detalles..." fullScreen={true} />;
  }

  if (error || !tenant) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
          {error || 'Institución no encontrada'}
        </div>
        <button
          onClick={() => navigate('/saas/tenants')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-2">
        <button
          onClick={() => navigate('/saas/tenants')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors w-fit text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la lista
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
               <Building2 className="h-7 w-7" />
             </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                {tenant.name}
              </h1>
              <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium">
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">{getInstitutionTypeLabel(tenant.institution_type)}</span> 
                <span className="text-slate-300">•</span> 
                <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{tenant.slug}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto flex-wrap items-stretch sm:items-center gap-3">
            <span
              className={`inline-flex justify-center items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border ${
                tenant.is_active
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${tenant.is_active ? 'bg-green-500' : 'bg-slate-400'}`}></span>
              {tenant.is_active ? 'Institución Activa' : 'Institución Inactiva'}
            </span>
            <button
              onClick={handleToggleActive}
              className={`flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl shadow-sm transition-all font-medium text-sm w-full sm:w-auto ${
                tenant.is_active
                  ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]'
              }`}
            >
              {tenant.is_active ? (
                <><ToggleLeft className="h-4 w-4" /> Desactivar Acceso</>
              ) : (
                <><ToggleRight className="h-4 w-4" /> Activar Institución</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Información General y Estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Info General */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6 lg:col-span-1">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            Información General
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase">ID de Sistema</dt>
              <dd className="text-sm font-medium text-slate-900 mt-1 font-mono">{tenant.id}</dd>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <dt className="text-xs font-semibold text-slate-400 uppercase">Tipo</dt>
              <dd className="text-sm font-medium text-slate-900 mt-1 flex items-center gap-2">
                {getInstitutionTypeLabel(tenant.institution_type)}
              </dd>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <dt className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Creación
              </dt>
              <dd className="text-sm font-medium text-slate-900 mt-1">
                {formatDate(tenant.created_at)}
              </dd>
            </div>
            <div className="pt-3 border-t border-slate-100">
               <dt className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Última Modificación
              </dt>
              <dd className="text-sm font-medium text-slate-900 mt-1">
                {formatDate(tenant.updated_at)}
              </dd>
            </div>
            {tenant.created_by && (
              <div className="pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl mt-4">
                <dt className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                  <UserCog className="h-3.5 w-3.5" /> Creado Por
                </dt>
                <dd className="text-sm font-medium text-slate-900 mt-1">{tenant.created_by.full_name}</dd>
                <dd className="text-xs text-slate-500 mt-0.5">{tenant.created_by.email}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Estadísticas */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-6 lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-400" />
            Métricas y Estadísticas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-sm">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-100/50 flex flex-col items-center justify-center text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{tenant.stats.total_users}</div>
                <div className="text-xs font-medium text-slate-500 uppercase">Total Usuarios</div>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-sm">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-100/50 flex flex-col items-center justify-center text-emerald-600">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{tenant.stats.users_with_roles}</div>
                <div className="text-xs font-medium text-slate-500 uppercase">Con Roles</div>
              </div>
            </div>
             <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-sm">
               <div className="h-10 w-10 shrink-0 rounded-lg bg-orange-100/50 flex flex-col items-center justify-center text-orange-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{tenant.stats.users_without_roles}</div>
                <div className="text-xs font-medium text-slate-500 uppercase">Sin Roles</div>
              </div>
            </div>
             <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-sm">
               <div className="h-10 w-10 shrink-0 rounded-lg bg-purple-100/50 flex flex-col items-center justify-center text-purple-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{tenant.stats.total_roles}</div>
                <div className="text-xs font-medium text-slate-500 uppercase">Total Roles</div>
              </div>
            </div>
             <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-sm">
               <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-100/50 flex flex-col items-center justify-center text-indigo-600">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{tenant.stats.active_roles}</div>
                <div className="text-xs font-medium text-slate-500 uppercase">Roles Activos</div>
              </div>
            </div>
             <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-sm">
               <div className="h-10 w-10 shrink-0 rounded-lg bg-red-100/50 flex flex-col items-center justify-center text-red-600">
                <ShieldOff className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{tenant.stats.inactive_roles}</div>
                <div className="text-xs font-medium text-slate-500 uppercase">Roles Inactivos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usuarios Recientes */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-white/50">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            Usuarios Incorporados Recientemente
          </h2>
        </div>
        {tenant.recent_users.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm bg-slate-50/50">
            No se han registrado usuarios nuevos recientemente en esta institución.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Correo Electrónico
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-slate-100">
                {tenant.recent_users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-xs mr-3">
                           {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{user.full_name || 'Usuario'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(user.joined_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}






