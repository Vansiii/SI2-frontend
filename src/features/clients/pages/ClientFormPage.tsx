import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getClientById, createClient, updateClient } from '../services/clientsApi';
import type { CreateClientData } from '../types';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ArrowLeft, Save, User, FileText, Mail, Briefcase } from 'lucide-react';

export function ClientFormPage() {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const isEditing = Boolean(clientId);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateClientData>({
    first_name: '',
    last_name: '',
    document_type: 'CI',
    document_number: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Bolivia',
    monthly_income: '',
    employment_status: 'EMPLOYED',
    employer_name: '',
  });

  useEffect(() => {
    if (isEditing && clientId) {
      loadClient(parseInt(clientId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, isEditing]);

  const loadClient = async (id: number) => {
    try {
      setLoading(true);
      const client = await getClientById(id);
      setFormData({
        first_name: client.first_name,
        last_name: client.last_name,
        document_type: client.document_type,
        document_number: client.document_number,
        email: client.email,
        phone: client.phone,
        address: client.address,
        city: client.city,
        country: client.country,
        monthly_income: client.monthly_income,
        employment_status: client.employment_status,
        employer_name: client.employer_name || '',
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al cargar cliente');
      }
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      if (isEditing && clientId) {
        await updateClient({ clientId: parseInt(clientId), updateData: formData });
      } else {
        await createClient(formData);
      }
      navigate('/clients');
    } catch (err: unknown) {
      if (err instanceof Error && 'fieldErrors' in err) {
        // Errores de validación del backend
        setErrors((err as Record<string, unknown>).fieldErrors as Record<string, string> || {});
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al guardar cliente');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Cargando datos del cliente..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {isEditing
              ? 'Actualiza la información del cliente'
              : 'Registra un nuevo cliente en el sistema'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Información Personal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombres *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.first_name ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.first_name && (
                <p className="text-red-600 text-xs mt-1">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.last_name ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.last_name && (
                <p className="text-red-600 text-xs mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Documento de Identidad */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Documento de Identidad
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tipo de Documento *
              </label>
              <select
                name="document_type"
                value={formData.document_type}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.document_type ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              >
                <option value="CI">Cédula de Identidad (CI)</option>
                <option value="NIT">NIT</option>
                <option value="PASSPORT">Pasaporte</option>
                <option value="OTHER">Otro</option>
              </select>
              {errors.document_type && (
                <p className="text-red-600 text-xs mt-1">{errors.document_type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Número de Documento *
              </label>
              <input
                type="text"
                name="document_number"
                value={formData.document_number}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.document_number ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.document_number && (
                <p className="text-red-600 text-xs mt-1">{errors.document_number}</p>
              )}
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Información de Contacto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.phone ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.address ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.city ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">País *</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.country ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.country && <p className="text-red-600 text-xs mt-1">{errors.country}</p>}
            </div>
          </div>
        </div>

        {/* Información Laboral y Financiera */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Información Laboral y Financiera
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Estado Laboral *
              </label>
              <select
                name="employment_status"
                value={formData.employment_status}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.employment_status ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              >
                <option value="EMPLOYED">Empleado</option>
                <option value="SELF_EMPLOYED">Independiente</option>
                <option value="UNEMPLOYED">Desempleado</option>
                <option value="RETIRED">Jubilado</option>
              </select>
              {errors.employment_status && (
                <p className="text-red-600 text-xs mt-1">{errors.employment_status}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ingreso Mensual (Bs) *
              </label>
              <input
                type="number"
                name="monthly_income"
                value={formData.monthly_income}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.monthly_income ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.monthly_income && (
                <p className="text-red-600 text-xs mt-1">{errors.monthly_income}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre del Empleador
              </label>
              <input
                type="text"
                name="employer_name"
                value={formData.employer_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.employer_name ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.employer_name && (
                <p className="text-red-600 text-xs mt-1">{errors.employer_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-[0_0_20px_rgba(37,99,235,0.2)]"
          >
            <Save className="h-4 w-4" />
            {submitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
