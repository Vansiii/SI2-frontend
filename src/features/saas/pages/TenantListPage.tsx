import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Filter, Activity, Eye, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { getTenants } from '../services/tenantsApi';
import type { Institution } from '../types';
import { LoadingState } from '../../../components/ui/LoadingState';

export function TenantListPage() {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const [tenants, setTenants] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    is_active: undefined as boolean | undefined,
    institution_type: '',
    search: '',
  });

  useEffect(() => {
    // Verificar que sea SaaS admin
    if (userType !== 'saas_admin') {
      navigate('/home');
      return;
    }
    loadTenants();
  }, [filters, userType, navigate]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTenants(filters);
      setTenants(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar instituciones');
    } finally {
      setLoading(false);
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

  if (loading) {
    return <LoadingState message="Cargando instituciones..." fullScreen={true} />;
  }

  // No renderizar si no es SaaS admin
  if (userType !== 'saas_admin') {
    return null;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Instituciones Financieras
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Administra los bancos, cooperativas y entidades financieras registradas.
          </p>
        </div>
        <button
          onClick={() => navigate('/saas/dashboard')}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all font-medium text-sm w-full md:w-auto"
        >
          <LayoutDashboard className="h-4 w-4" />
          Ver Dashboard
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl p-5 md:p-6 transition-all hover:shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Nombre o slug..."
                className="w-full pl-9 pr-4 py-2.5 bg-white/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Tipo
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={filters.institution_type}
                onChange={(e) => setFilters({ ...filters, institution_type: e.target.value })}
                className="w-full pl-9 pr-8 py-2.5 bg-white/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="">Todos los tipos</option>
                <option value="banking">Banco</option>
                <option value="microfinance">Microfinanzas</option>
                <option value="cooperative">Cooperativa</option>
                <option value="fintech">Fintech</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Estado
            </label>
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={filters.is_active === undefined ? '' : filters.is_active ? 'true' : 'false'}
                onChange={(e) => setFilters({
                  ...filters,
                  is_active: e.target.value === '' ? undefined : e.target.value === 'true',
                })}
                className="w-full pl-9 pr-8 py-2.5 bg-white/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="">Todos los estados</option>
                <option value="true">Instituciones Activas</option>
                <option value="false">Instituciones Inactivas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Tabla de instituciones */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Institución
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Usuarios
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-slate-100">
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No se encontraron instituciones con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900 line-clamp-1">{tenant.name}</div>
                      <div className="text-xs text-slate-500 bg-slate-100 inline-block px-1.5 py-0.5 rounded mt-1 font-mono">
                        {tenant.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg">
                        {getInstitutionTypeLabel(tenant.institution_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{tenant.users_count || 0}</div>
                      {tenant.active_users_count !== undefined && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {tenant.active_users_count} activos
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                      {tenant.roles_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          tenant.is_active
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${tenant.is_active ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                        {tenant.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <button
                        onClick={() => navigate(`/saas/tenants/${tenant.id}`)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-lg transition-all"
                        title="Ver Detalles"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Detalles</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-slate-500 px-2">
        <p>Total de instituciones registradas</p>
        <p className="font-semibold px-3 py-1 bg-slate-100 rounded-lg">{tenants.length}</p>
      </div>
    </div>
  );
}






