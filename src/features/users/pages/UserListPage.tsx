import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { getUsers, deactivateUser } from '../services/usersApi';
import type { UserWithDetails } from '../../../types';

export function UserListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canCreate = hasPermission('users.create');
  const canEdit = hasPermission('users.edit');
  const canDeactivate = hasPermission('users.deactivate');
  const canAssignRoles = hasPermission('users.assign_roles');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar usuarios';
      
      // Si es error 403, mostrar mensaje específico sobre permisos
      if (err.status === 403 || errorMessage.includes('permiso')) {
        setError(
          'No tienes permiso para ver usuarios. Si acabas de recibir nuevos permisos, ' +
          'cierra sesión y vuelve a iniciar sesión para actualizar tus permisos.'
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId: number) => {
    if (!confirm('¿Está seguro de desactivar este usuario?')) {
      return;
    }

    try {
      await deactivateUser(userId);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Error al desactivar usuario');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        {canCreate && (
          <button
            onClick={() => navigate('/users/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Crear Usuario
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.profile.position || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length === 0 ? (
                        <span className="text-sm text-gray-500">Sin roles</span>
                      ) : (
                        user.roles.map((role) => (
                          <span
                            key={role.id}
                            className="inline-flex flex-col items-start px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                            title={role.institution ? `Institución: ${role.institution}` : undefined}
                          >
                            <span>{role.name}</span>
                            {role.institution && (
                              <span className="text-[10px] text-blue-600 mt-0.5">
                                {role.institution}
                              </span>
                            )}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {canEdit && (
                        <button
                          onClick={() => navigate(`/users/${user.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                      )}
                      {canAssignRoles && (
                        <button
                          onClick={() => navigate(`/users/${user.id}/roles`)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Roles
                        </button>
                      )}
                      {canDeactivate && user.is_active && (
                        <button
                          onClick={() => handleDeactivate(Number(user.id))}
                          className="text-red-600 hover:text-red-900"
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
