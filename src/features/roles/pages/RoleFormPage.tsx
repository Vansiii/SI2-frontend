// erick sprint 0
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { fetchRole, createRole, updateRole } from '../services/rolesApi';
import type { RoleFormData } from '../types';

export function RoleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<RoleFormData>({
    institution: 1, // ID temporal, asume que existe al menos una institución creada en tu BD
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
    } catch (err: any) {
      setError(err.message || 'Error al cargar el rol');
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
    } catch (err: any) {
      setError(err.message || 'Hubo un error al guardar el rol.');
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
    return <div className="text-center py-10">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 sm:px-6 lg:px-8 font-sans text-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/roles" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver a Roles
        </Link>
        <div className="flex justify-center">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-white" />
            </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
            Completar los datos del rol para el sistema
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
            {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Rol</label>
                  <div className="mt-1">
                      <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Ej. Administrador"
                      />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                  <div className="mt-1">
                      <textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleChange}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Descripción breve de las funciones de este rol"
                      />
                  </div>
                </div>

                {isEditing && (
                    <div className="flex items-center">
                        <input
                            id="is_active"
                            name="is_active"
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                            Rol Activo
                        </label>
                    </div>
                )}

                <div>
                  <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                      {submitting ? 'Guardando...' : (isEditing ? 'Actualizar Rol' : 'Crear Rol')}
                  </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}