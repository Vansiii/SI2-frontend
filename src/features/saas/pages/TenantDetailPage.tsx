import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { getTenantDetail, toggleTenantActive } from '../services/tenantsApi';
import type { TenantDetail } from '../types';

export function TenantDetailPage() {
  const navigate = useNavigate();
  const { tenantId } = useParams<{ tenantId: string }>();
  const { userType } = useAuth();
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar que sea SaaS admin
  if (userType !== 'saas_admin') {
    navigate('/home');
    return null;
  }

  useEffect(() => {
    if (tenantId) {
      loadTenantDetail();
    }
  }, [tenantId]);

  const loadTenantDetail = async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getTenantDetail(Number(tenantId));
      setTenant(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar detalles de la institución');
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
    } catch (err: any) {
      alert(err.message || `Error al ${action} institución`);
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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Cargando detalles...</div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Institución no encontrada'}
        </div>
        <button
          onClick={() => navigate('/saas/tenants')}
          className="mt-4 text-purple-600 hover:text-purple-900"
        >
          ← Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/saas/tenants')}
          className="text-purple-600 hover:text-purple-900 mb-4"
        >
          ← Volver a la lista
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {tenant.name}
            </h1>
            <p className="text-gray-600 mt-1">
              {getInstitutionTypeLabel(tenant.institution_type)} • {tenant.slug}
            </p>
          </div>

          <div className="flex gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                tenant.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {tenant.is_active ? 'Activo' : 'Inactivo'}
            </span>
            <button
              onClick={handleToggleActive}
              className={`px-4 py-2 rounded-lg transition-colors ${
                tenant.is_active
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {tenant.is_active ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>
      </div>

      {/* Información General */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Información General
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">ID</dt>
              <dd className="text-sm text-gray-900">{tenant.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Slug</dt>
              <dd className="text-sm text-gray-900">{tenant.slug}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Tipo</dt>
              <dd className="text-sm text-gray-900">
                {getInstitutionTypeLabel(tenant.institution_type)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Fecha de Creación
              </dt>
              <dd className="text-sm text-gray-900">
                {formatDate(tenant.created_at)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Última Actualización
              </dt>
              <dd className="text-sm text-gray-900">
                {formatDate(tenant.updated_at)}
              </dd>
            </div>
            {tenant.created_by && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Creado Por
                </dt>
                <dd className="text-sm text-gray-900">
                  {tenant.created_by.full_name} ({tenant.created_by.email})
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Estadísticas */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Estadísticas
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {tenant.stats.total_users}
              </div>
              <div className="text-sm text-blue-700">Total Usuarios</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {tenant.stats.users_with_roles}
              </div>
              <div className="text-sm text-green-700">Con Roles</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-900">
                {tenant.stats.users_without_roles}
              </div>
              <div className="text-sm text-yellow-700">Sin Roles</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">
                {tenant.stats.total_roles}
              </div>
              <div className="text-sm text-purple-700">Total Roles</div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-indigo-900">
                {tenant.stats.active_roles}
              </div>
              <div className="text-sm text-indigo-700">Roles Activos</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-900">
                {tenant.stats.inactive_roles}
              </div>
              <div className="text-sm text-red-700">Roles Inactivos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Usuarios Recientes */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Usuarios Recientes
        </h2>
        {tenant.recent_users.length === 0 ? (
          <p className="text-gray-500">No hay usuarios registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenant.recent_users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
