import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { getTenants } from '../services/tenantsApi';
import type { Institution } from '../types';

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

  // Verificar que sea SaaS admin
  if (userType !== 'saas_admin') {
    navigate('/home');
    return null;
  }

  useEffect(() => {
    loadTenants();
  }, [filters]);

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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Cargando instituciones...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Instituciones Financieras
        </h1>
        <button
          onClick={() => navigate('/saas/dashboard')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Ver Dashboard
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="Nombre o slug..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={filters.institution_type}
              onChange={(e) =>
                setFilters({ ...filters, institution_type: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="banking">Banco</option>
              <option value="microfinance">Microfinanzas</option>
              <option value="cooperative">Cooperativa</option>
              <option value="fintech">Fintech</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={
                filters.is_active === undefined
                  ? ''
                  : filters.is_active
                  ? 'true'
                  : 'false'
              }
              onChange={(e) =>
                setFilters({
                  ...filters,
                  is_active:
                    e.target.value === ''
                      ? undefined
                      : e.target.value === 'true',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabla de instituciones */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Institución
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuarios
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No se encontraron instituciones
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {tenant.name}
                    </div>
                    <div className="text-sm text-gray-500">{tenant.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getInstitutionTypeLabel(tenant.institution_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant.users_count || 0} usuarios
                    {tenant.active_users_count !== undefined && (
                      <span className="text-gray-500">
                        {' '}
                        ({tenant.active_users_count} activos)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant.roles_count || 0} roles
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tenant.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tenant.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/saas/tenants/${tenant.id}`)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      <div className="mt-6 text-sm text-gray-600">
        Total: {tenants.length} instituciones
      </div>
    </div>
  );
}
