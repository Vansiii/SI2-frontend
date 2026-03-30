import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getSaaSPermission,
  createSaaSPermission,
  updateSaaSPermission,
} from '../services/permissionsApi';
import type { PermissionFormData } from '../types';

export default function PermissionFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<PermissionFormData>({
    name: '',
    code: '',
    description: '',
    module: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      loadPermission(parseInt(id));
    }
  }, [id, isEdit]);

  const loadPermission = async (permissionId: number) => {
    try {
      setLoading(true);
      const data = await getSaaSPermission(permissionId);
      setFormData({
        name: data.name,
        code: data.code,
        description: data.description,
        module: data.module,
        is_active: data.is_active,
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar permiso');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      if (isEdit && id) {
        await updateSaaSPermission(parseInt(id), formData);
      } else {
        await createSaaSPermission(formData);
      }
      navigate('/saas/permissions');
    } catch (err: any) {
      setError(err.message || 'Error al guardar permiso');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (loading && isEdit) {
    return <div className="p-6">Cargando permiso...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Editar Permiso' : 'Nuevo Permiso'}
        </h1>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Código
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            placeholder="ej: users.create"
            className="w-full rounded border px-4 py-2"
          />
          <p className="mt-1 text-sm text-gray-500">
            Formato: modulo.accion (ej: users.create, roles.view)
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="ej: Crear Usuario"
            className="w-full rounded border px-4 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Módulo
          </label>
          <input
            type="text"
            name="module"
            value={formData.module}
            onChange={handleChange}
            required
            placeholder="ej: users, roles, reports"
            className="w-full rounded border px-4 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Descripción del permiso"
            className="w-full rounded border px-4 py-2"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <label className="ml-2 text-sm text-gray-700">Activo</label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/saas/permissions')}
            className="rounded border px-6 py-2 hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
