import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserById, createUser, updateUser } from '../services/usersApi';
import { fetchRoles } from '../../roles/services/rolesApi';
import type { CreateUserData, UpdateUserData, Role } from '../../../types';

export function UserFormPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const isEditMode = !!userId;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    role_ids: [] as number[],
    phone: '',
    position: '',
    department: '',
  });

  useEffect(() => {
    loadRoles();
    if (isEditMode) {
      loadUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadRoles = async () => {
    try {
      const data = await fetchRoles();
      setRoles(data);
    } catch (err: any) {
      console.error('Error al cargar roles:', err);
    }
  };

  const loadUser = async () => {
    if (!userId) return;

    try {
      setLoadingData(true);
      const user = await getUserById(Number(userId));
      setFormData({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        password: '',
        confirm_password: '',
        role_ids: user.roles.map((r) => r.id),
        phone: user.profile.phone || '',
        position: user.profile.position || '',
        department: user.profile.department || '',
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuario');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validaciones
    const errors: Record<string, string> = {};

    if (!isEditMode) {
      if (!formData.password) {
        errors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (formData.password !== formData.confirm_password) {
        errors.confirm_password = 'Las contraseñas no coinciden';
      }
    }

    if (formData.role_ids.length === 0) {
      errors.role_ids = 'Debe seleccionar al menos un rol';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        const updateData: UpdateUserData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
        };
        await updateUser(Number(userId), updateData);
      } else {
        const createData: CreateUserData = {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          password: formData.password,
          role_ids: formData.role_ids,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
        };
        await createUser(createData);
      }

      navigate('/users');
    } catch (err: any) {
      setError(err.message || 'Error al guardar usuario');
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setFormData((prev) => ({
      ...prev,
      role_ids: prev.role_ids.includes(roleId)
        ? prev.role_ids.filter((id) => id !== roleId)
        : [...prev.role_ids, roleId],
    }));
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Cargando...</div>
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
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Editar Usuario' : 'Crear Usuario'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {fieldErrors.first_name && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.first_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {fieldErrors.last_name && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.last_name}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isEditMode}
          />
          {fieldErrors.email && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {!isEditMode && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={8}
              />
              {fieldErrors.password && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {fieldErrors.confirm_password && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.confirm_password}</p>
              )}
            </div>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roles <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 rounded-md p-4 space-y-2 max-h-60 overflow-y-auto">
            {roles.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay roles disponibles</p>
            ) : (
              roles.map((role) => (
                <label key={role.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.role_ids.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{role.name}</div>
                    {role.description && (
                      <div className="text-sm text-gray-500">{role.description}</div>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
          {fieldErrors.role_ids && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.role_ids}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear Usuario'}
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
