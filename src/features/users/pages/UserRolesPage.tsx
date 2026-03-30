import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserById, assignRoles } from '../services/usersApi';
import { fetchRoles } from '../../roles/services/rolesApi';
import type { UserWithDetails, Role, AssignRolesData } from '../../../types';

export function UserRolesPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<UserWithDetails | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadData = async () => {
    if (!userId) return;

    try {
      setLoadingData(true);
      const [userData, rolesData] = await Promise.all([
        getUserById(Number(userId)),
        fetchRoles(),
      ]);
      setUser(userData);
      setRoles(rolesData);
      setSelectedRoleIds(userData.roles.map((r) => r.id));
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    if (selectedRoleIds.length === 0) {
      setError('Debe seleccionar al menos un rol');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data: AssignRolesData = {
        role_ids: selectedRoleIds,
      };

      await assignRoles(Number(userId), data);
      navigate('/users');
    } catch (err: any) {
      setError(err.message || 'Error al asignar roles');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Usuario no encontrado
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/users')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Volver a usuarios
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Asignar Roles</h1>
        <p className="text-gray-600 mt-2">
          {user.first_name} {user.last_name} ({user.email})
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Seleccionar Roles <span className="text-red-500">*</span>
          </h2>
          <div className="border border-gray-300 rounded-md p-4 space-y-3 max-h-96 overflow-y-auto">
            {roles.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay roles disponibles</p>
            ) : (
              roles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoleIds.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{role.name}</div>
                    {role.description && (
                      <div className="text-sm text-gray-500 mt-1">{role.description}</div>
                    )}
                    {role.permissions && role.permissions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {role.permissions.slice(0, 5).map((perm) => (
                          <span
                            key={perm.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {perm.name}
                          </span>
                        ))}
                        {role.permissions.length > 5 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            +{role.permissions.length - 5} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
          {selectedRoleIds.length === 0 && (
            <p className="text-amber-600 text-sm mt-2">
              Debe seleccionar al menos un rol
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || selectedRoleIds.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Guardando...' : 'Guardar Roles'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
