import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, Save } from 'lucide-react';
import {
  getSaaSPermission,
  createSaaSPermission,
  updateSaaSPermission,
} from '../services/permissionsApi';
import type { PermissionFormData } from '../types';
import { LoadingState } from '../../../components/ui/LoadingState';

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
    return <LoadingState message="Cargando..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/saas/permissions')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              {isEdit ? 'Editar Permiso' : 'Nuevo Permiso'}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {isEdit ? 'Modifica los detalles del permiso seleccionado.' : 'Crea un nuevo permiso para el sistema.'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Código
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="ej: users.create"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Formato sugerido: <span className="font-mono bg-slate-100 px-1 rounded">modulo.accion</span>
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Módulo
              </label>
              <input
                type="text"
                name="module"
                value={formData.module}
                onChange={handleChange}
                required
                placeholder="ej: users, roles, reports"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="ej: Crear Usuario"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Descripción detallada de la función de este permiso"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700 cursor-pointer">
              Permiso Activo
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/saas/permissions')}
              className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white/50 hover:bg-slate-50 transition-all font-medium text-sm w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center items-center gap-2 px-6 py-2.5 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all font-medium text-sm w-full sm:w-auto"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Permiso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}






