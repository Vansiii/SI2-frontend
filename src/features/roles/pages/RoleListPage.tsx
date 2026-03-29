// erick sprint 0
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Plus, Edit, Trash2, Key } from 'lucide-react';
import { fetchRoles, deactivateRole } from '../services/rolesApi';
import type { Role } from '../types';

export function RoleListPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await fetchRoles(true);
      setRoles(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error al cargar los roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas desactivar este rol?')) return;
    try {
      await deactivateRole(id);
      loadRoles();
    } catch (err: any) {
      alert(err.message || 'Error al desactivar el rol');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Gestión de Roles
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Administra los roles y permisos de los usuarios en el sistema.
          </p>
        </div>
        <Link
          to="/roles/create"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Rol
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Cargando roles...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {roles.length === 0 ? (
              <li className="p-6 text-center text-gray-500">No hay roles registrados.</li>
            ) : (
              roles.map((role) => (
                <li key={role.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flexflex-col">
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {role.name}
                      {!role.is_active && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactivo
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{role.description || 'Sin descripción'}</p>
                    <div className="mt-1 flex gap-1 flex-wrap">
                      {role.permissions.slice(0, 3).map(p => (
                        <span key={p.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {p.name}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          +{role.permissions.length - 3} más
                        </span>
                      )}
                      {role.permissions.length === 0 && (
                        <span className="text-xs text-gray-400 italic">Sin permisos asignados</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/roles/${role.id}/permissions`}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                      title="Asignar Permisos"
                    >
                      <Key className="h-5 w-5" />
                    </Link>
                    <Link
                      to={`/roles/${role.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Editar Rol"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    {role.is_active && (
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        title="Desactivar Rol"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}