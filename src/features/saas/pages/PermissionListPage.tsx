import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Plus, RefreshCw, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import {
  getSaaSPermissions,
  deleteSaaSPermission,
  syncAdminPermissions,
} from '../services/permissionsApi';
import type { Permission } from '../types';
import { LoadingState } from '../../../components/ui/LoadingState';

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

  if (loading) return <LoadingState message="Cargando..." fullScreen={true} />;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Gestión de Permisos
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Administra los permisos y módulos disponibles en la plataforma.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto flex-wrap items-stretch sm:items-center gap-3 mt-2 md:mt-0">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 rounded-xl border border-blue-200 transition-all font-medium text-sm w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Admins'}
          </button>
          <Link
            to="/saas/permissions/new"
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all font-medium text-sm w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Nuevo Permiso
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar permisos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm appearance-none"
          >
            <option value="">Todos los módulos</option>
            {modules.map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Código
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Módulo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-transparent">
              {permissions.map((permission) => (
                <tr key={permission.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                    {permission.code}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {permission.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {permission.module}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        permission.is_active
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${permission.is_active ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                      {permission.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/saas/permissions/${permission.id}/edit`}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar Permiso"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(permission.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar Permiso"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {permissions.length === 0 && (
          <div className="p-8 text-center text-slate-500 bg-slate-50/30">
            No se encontraron permisos registrados.
          </div>
        )}
      </div>
    </div>
  );
}






