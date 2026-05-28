import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, UserSquare } from 'lucide-react';
import { LoadingState } from '../../../components/ui/LoadingState';
import {
  createGuarantor,
  getGuarantorById,
  updateGuarantor,
} from '../services/garantiasApi';
import type { GuarantorCreatePayload, GuarantorUpdatePayload } from '../types';

const emptyForm: GuarantorCreatePayload = {
  loan_application: 0,
  collateral: null,
  first_name: '',
  last_name: '',
  document_type: 'CI',
  document_number: '',
  document_extension: '',
  birth_date: '',
  gender: '',
  email: '',
  phone: '',
  mobile_phone: '',
  address: '',
  city: '',
  department: '',
  employment_type: 'EMPLOYED',
  employer_name: '',
  job_title: '',
  monthly_income: '',
  relationship_to_borrower: '',
};

export function GuarantorFormPage() {
  const navigate = useNavigate();
  const { guarantorId } = useParams<{ guarantorId: string }>();
  const isEditing = Boolean(guarantorId);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<GuarantorCreatePayload>(emptyForm);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isEditing && guarantorId) {
      loadGuarantor(Number(guarantorId));
    }
  }, [guarantorId, isEditing]);

  async function loadGuarantor(id: number) {
    try {
      setLoading(true);
      const guarantor = await getGuarantorById(id);
      setFormData({
        loan_application: guarantor.loan_application,
        collateral: guarantor.collateral || null,
        first_name: guarantor.first_name,
        last_name: guarantor.last_name,
        document_type: guarantor.document_type,
        document_number: guarantor.document_number,
        document_extension: guarantor.document_extension || '',
        birth_date: guarantor.birth_date,
        gender: guarantor.gender || '',
        email: guarantor.email,
        phone: guarantor.phone,
        mobile_phone: guarantor.mobile_phone || '',
        address: guarantor.address,
        city: guarantor.city,
        department: guarantor.department,
        employment_type: guarantor.employment_type,
        employer_name: guarantor.employer_name || '',
        job_title: guarantor.job_title || '',
        monthly_income: guarantor.monthly_income,
        relationship_to_borrower: guarantor.relationship_to_borrower,
      });
      setIsActive(guarantor.is_active ?? true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al cargar el garante');
      }
      navigate('/garantias/guarantors');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = event.target;
    if (type === 'checkbox') {
      const checked = (event.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'loan_application' || name === 'collateral') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? null : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[name];
        return nextErrors;
      });
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (isEditing && guarantorId) {
        const payload: GuarantorUpdatePayload = {
          ...formData,
          is_active: isActive,
        };
        await updateGuarantor(Number(guarantorId), payload);
      } else {
        await createGuarantor(formData);
      }
      navigate('/garantias/guarantors');
    } catch (err: unknown) {
      if (err instanceof Error && 'fieldErrors' in err) {
        setErrors((err as Record<string, unknown>).fieldErrors as Record<string, string> || {});
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al guardar el garante');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState message="Cargando garante..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/garantias/guarantors')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserSquare className="h-6 w-6 text-blue-600" />
            {isEditing ? 'Editar garante' : 'Nuevo garante'}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Registra la informacion del garante.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Datos principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Solicitud (ID) *</label>
              <input
                type="number"
                name="loan_application"
                value={formData.loan_application || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Garantia (ID)</label>
              <input
                type="number"
                name="collateral"
                value={formData.collateral || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombres *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de documento *</label>
              <select
                name="document_type"
                value={formData.document_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
              >
                <option value="CI">CI</option>
                <option value="NIT">NIT</option>
                <option value="PASSPORT">Pasaporte</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Numero documento *</label>
              <input
                type="text"
                name="document_number"
                value={formData.document_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha nacimiento *</label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Genero</label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
              >
                <option value="">N/D</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefono *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefono movil</label>
              <input
                type="text"
                name="mobile_phone"
                value={formData.mobile_phone || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Direccion *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Departamento *</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Informacion laboral</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo empleo *</label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
              >
                <option value="EMPLOYED">Empleado</option>
                <option value="SELF_EMPLOYED">Independiente</option>
                <option value="BUSINESS_OWNER">Negocio propio</option>
                <option value="RETIRED">Jubilado</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ingreso mensual *</label>
              <input
                type="text"
                name="monthly_income"
                value={formData.monthly_income}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Empleador</label>
              <input
                type="text"
                name="employer_name"
                value={formData.employer_name || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
              <input
                type="text"
                name="job_title"
                value={formData.job_title || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Relacion con el prestatario *</label>
              <input
                type="text"
                name="relationship_to_borrower"
                value={formData.relationship_to_borrower}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
                required
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4"
            />
            Garante activo
          </label>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/garantias/guarantors')}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
