import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getAvailablePermissions,
  getRolePermissions,
  assignRolePermissions,
} from '../services/permissionsApi';
import type { Permission } from '../types';

export default function RolePermissionManagementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    if (id) {
      loadData(parseInt(id));
    }
  }, [id]);

  const loadData = async (roleId: number) => {
    try {
      setLoading(true);
      const [available, roleData] = await Promise.all([
        getAvailablePermissions(),
        getRolePermissions(roleId),
      ]);

      setAvailablePermissions(available);
      setRolePermissions(roleData.permissions);
      setRoleName(roleData.role.name);

      const currentIds = new Set(roleData.permissions.map((p) => p.id));
      setSelectedPermissions(currentIds);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const filtered = getFilteredPermissions();
    const allIds = new Set([...selectedPermissions, ...filtered.map((p) => p.id)]);
    setSelectedPermissions(allIds);
  };

  const handleDeselectAll = () => {
    const filtered = getFilteredPermissions();
    const filteredIds = new Set(filtered.map((p) => p.id));
    const newSet = new Set(
      [...selectedPermissions].filter((id) => !filteredIds.has(id))
    );
    setSelectedPermissions(newSet);
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      setSaving(true);
      const result = await assignRolePermissions(
        parseInt(id),
        Array.from(selectedPermissions)
      );
      alert(
        `Permisos actualizados:\n- Agregados: ${result.permissions_added}\n- Ya asignados: ${result.permissions_already_assigned}`
      );
      navigate('/roles');
    } catch (err: any) {
      setError(err.message || 'Error al guardar permisos');
    } finally {
      setSaving(false);
    }
  };

  const getFilteredPermissions = () => {
    return availablePermissions.filter(
      (p) => !moduleFilter || p.module === moduleFilter
    );
  };

  const modules = Array.from(new Set(availablePermissions.map((p) => p.module)));
  const filteredPermissions = getFilteredPermissions();

  if (loading) return <div className="p-6">Cargando permisos...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gestionar Permisos del Rol</h1>
        <p className="mt-2 text-gray-600">Rol: {roleName}</p>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700">{error}</div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-4">
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
          <button
            onClick={handleSelectAll}
            className="rounded border px-4 py-2 hover:bg-gray-50"
          >
            Seleccionar Todos
          </button>
          <button
            onClick={handleDeselectAll}
            className="rounded border px-4 py-2 hover:bg-gray-50"
          >
            Deseleccionar Todos
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {selectedPermissions.size} de {availablePermissions.length} seleccionados
        </div>
      </div>

      <div className="mb-6 rounded-lg border bg-white shadow">
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="w-12 px-6 py-3"></th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Módulo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredPermissions.map((permission) => (
                <tr
                  key={permission.id}
                  className={
                    selectedPermissions.has(permission.id) ? 'bg-blue-50' : ''
                  }
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.has(permission.id)}
                      onChange={() => handleTogglePermission(permission.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {permission.code}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {permission.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {permission.module}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
        <button
          onClick={() => navigate('/roles')}
          className="rounded border px-6 py-2 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
