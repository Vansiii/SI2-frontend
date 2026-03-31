import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Shield, ArrowLeft, Save } from 'lucide-react';
import { fetchRole, createRole, updateRole } from '../services/rolesApi';
import type { RoleFormData } from '../types';
import { LoadingState } from '../../../components/ui/LoadingState';

export function RoleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<RoleFormData>({
    institution: 1, // ID temporal
    name: '',
    description: '',
    is_active: true,
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && id) {
      loadRole(parseInt(id, 10));
    }
  }, [id, isEditing]);

  const loadRole = async (roleId: number) => {
    try {
      const data = await fetchRole(roleId);
      setFormData({
        institution: data.institution || 1,
        name: data.name,
        description: data.description,
        is_active: data.is_active,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al cargar el rol');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEditing && id) {
        await updateRole(parseInt(id, 10), formData);
      } else {
        await createRole(formData);
      }
      navigate('/roles');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Hubo un error al guardar el rol.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return <LoadingState message="Cargando rol..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/roles"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              {isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {isEditing ? 'Actualiza la información del rol seleccionado.' : 'Define un nuevo conjunto de accesos.'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Formulario Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
              Nombre del Rol
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              placeholder="Ej. Administrador, Gerente, Lector..."
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">
              Descripción Breve
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm resize-none"
              placeholder="Describe las responsabilidades que otorga este rol..."
            />
          </div>

          {isEditing && (
            <div className="flex items-center gap-3 pt-2">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-700 cursor-pointer">
                Rol Activo en el sistema
              </label>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              to="/roles"
              className="flex items-center justify-center px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white/50 hover:bg-slate-50 transition-all font-medium text-sm w-full sm:w-auto"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex justify-center items-center gap-2 px-6 py-2.5 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all font-medium text-sm w-full sm:w-auto"
            >
              <Save className="h-4 w-4" />
              {submitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Rol')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}