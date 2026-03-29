// erick sprint 0
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Key, ArrowLeft, Save } from 'lucide-react';
import { fetchRole, fetchPermissions, assignPermissions } from '../services/rolesApi';
import type { Role, Permission } from '../types';

export function RolePermissionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData(parseInt(id, 10));
    }
  }, [id]);

  const loadData = async (roleId: number) => {
    try {
      setLoading(true);
      const [roleData, permissionsData] = await Promise.all([
        fetchRole(roleId),
        fetchPermissions()
      ]);
      setRole(roleData);
      setAllPermissions(permissionsData);
      setSelectedPermissions(new Set(roleData.permissions.map(p => p.id)));
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!role) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const arrayPerms = Array.from(selectedPermissions);
      await assignPermissions(role.id, { permission_ids: arrayPerms });
      setSuccess('Permisos actualizados correctamente');
      setTimeout(() => navigate('/roles'), 1500);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los permisos');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Cargando...</div>;
  }

  if (!role) {
    return <div className="text-center py-10 text-red-500">Rol no encontrado.</div>;
  }

  // Agrupación de permisos por módulo si es posible
  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    const mod = perm.module || 'General';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mb-6">
        <Link to="/roles" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver a Roles
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <Key className="h-8 w-8 text-blue-600" />
              Asignar Permisos: {role.name}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Selecciona los permisos que tendrá este rol
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200 p-6 space-y-8">
        {Object.entries(groupedPermissions).map(([module, perms]) => (
          <div key={module}>
            <h3 className="text-lg leading-6 font-medium text-gray-900 border-b pb-2 mb-4 capitalize">
              {module}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {perms.map(permission => (
                <div key={permission.id} className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={`permission-${permission.id}`}
                      name={`permission-${permission.id}`}
                      type="checkbox"
                      checked={selectedPermissions.has(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor={`permission-${permission.id}`} className="font-medium text-gray-700">
                      {permission.name}
                    </label>
                    <p className="text-gray-500 text-xs mt-0.5">{permission.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}