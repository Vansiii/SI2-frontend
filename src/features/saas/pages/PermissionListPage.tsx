import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getSaaSPermissions,
  deleteSaaSPermission,
  syncAdminPermissions,
} from '../services/permissionsApi';
import type { Permission } from '../types';

export default function PermissionListPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [syncing, setSyncing] = useState(false);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await getSaaSPermissions({
        search: searchTerm || undefined,
        module: moduleFilter || undefined,
      });
      setPermissions(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar permisos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [searchTerm, moduleFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este permiso?')) return;

    try {
      await deleteSaaSPermission(id);
      await loadPermissions();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar permiso');
    }
  };

  const handleSync = async () => {
    if (!confirm('¿Sincronizar permisos con roles de administrador?')) return;

    try {
      setSyncing(true);
      const result = await syncAdminPermissions();
      alert(
        `Sincronización exitosa:\n- Roles actualizados: ${result.roles_updated}\n- Permisos agregados: ${result.permissions_added}`
      );
      await loadPermissions();
    } catch (err: any) {
      alert(err.message || 'Error al sincronizar permisos');
    } finally {
      setSyncing(false);
    }
  };

  const modules = Array.from(new Set(permissions.map((p) => p.module)));

  if (loading) return <div className="p-6">Cargando permisos...</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Permisos</h1>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar con Admins'}
          </button>
          <Link
            to="/saas/permissions/new"
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Nuevo Permiso
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700">{error}</div>
      )}

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Buscar permisos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded border px-4 py-2"
        />
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="rounded border px-4 py-2"
        >
          <option value="">Todos los módulos</option>
          {modules.map((module) => (
            <option key={module} value={module}>
              {module}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Módulo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {permissions.map((permission) => (
              <tr key={permission.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {permission.code}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {permission.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {permission.module}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      permission.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {permission.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <Link
                    to={`/saas/permissions/${permission.id}/edit`}
                    className="mr-3 text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(permission.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {permissions.length === 0 && (
        <div className="mt-4 text-center text-gray-500">
          No se encontraron permisos
        </div>
      )}
    </div>
  );
}
