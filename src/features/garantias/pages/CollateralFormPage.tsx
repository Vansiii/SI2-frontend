import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react';
import { LoadingState } from '../../../components/ui/LoadingState';
import {
  createCollateral,
  getCollateralById,
  updateCollateral,
} from '../services/garantiasApi';
import type { CollateralCreatePayload, CollateralUpdatePayload } from '../types';
import loansApi from '../../loans/services/loansApi';
import type { LoanApplication } from '../../loans/services/loansApi';

const emptyForm: CollateralCreatePayload = {
  loan_application: 0,
  collateral_type: 'REAL_ESTATE',
  description: '',
  estimated_value: '',
  appraised_value: '',
  property_address: '',
  property_registry_number: '',
  property_area_m2: '',
  vehicle_plate: '',
  vehicle_vin: '',
  vehicle_year: null,
  vehicle_brand: '',
  vehicle_model: '',
  ownership_verified: false,
  has_liens: false,
  lien_details: '',
  insurance_policy_number: '',
  insurance_company: '',
  insurance_expiry_date: '',
  notes: '',
};

export function CollateralFormPage() {
  const navigate = useNavigate();
  const { collateralId } = useParams<{ collateralId: string }>();
  const isEditing = Boolean(collateralId);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CollateralCreatePayload>(emptyForm);
  const [isActive, setIsActive] = useState(true);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  useEffect(() => {
    if (isEditing && collateralId) {
      loadCollateral(Number(collateralId));
    }
  }, [collateralId, isEditing]);

  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoadingApplications(true);
        const response = await loansApi.listApplications({ page_size: 100, ordering: '-created_at' });
        setLoanApplications(response.results || []);
      } catch (err) {
        console.error('Error al cargar solicitudes de crédito:', err);
      } finally {
        setLoadingApplications(false);
      }
    }
    fetchApplications();
  }, []);

  async function loadCollateral(id: number) {
    try {
      setLoading(true);
      const collateral = await getCollateralById(id);
      setFormData({
        loan_application: collateral.loan_application,
        collateral_type: collateral.collateral_type,
        description: collateral.description || '',
        estimated_value: collateral.estimated_value || '',
        appraised_value: collateral.appraised_value || '',
        property_address: collateral.property_address || '',
        property_registry_number: collateral.property_registry_number || '',
        property_area_m2: collateral.property_area_m2 || '',
        vehicle_plate: collateral.vehicle_plate || '',
        vehicle_vin: collateral.vehicle_vin || '',
        vehicle_year: collateral.vehicle_year || null,
        vehicle_brand: collateral.vehicle_brand || '',
        vehicle_model: collateral.vehicle_model || '',
        ownership_verified: Boolean(collateral.ownership_verified),
        has_liens: Boolean(collateral.has_liens),
        lien_details: collateral.lien_details || '',
        insurance_policy_number: collateral.insurance_policy_number || '',
        insurance_company: collateral.insurance_company || '',
        insurance_expiry_date: collateral.insurance_expiry_date || '',
        notes: collateral.notes || '',
      });
      setIsActive(collateral.is_active ?? true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al cargar la garantia');
      }
      navigate('/garantias');
    } finally {
      setLoading(false);
    }
  }

  const showRealEstateFields = formData.collateral_type === 'REAL_ESTATE';
  const showVehicleFields = formData.collateral_type === 'VEHICLE';

  const requiredErrors = useMemo(() => {
    const nextErrors: Record<string, string> = {};
    if (!formData.loan_application) {
      nextErrors.loan_application = 'Requerido';
    }
    if (!formData.estimated_value) {
      nextErrors.estimated_value = 'Requerido';
    }
    if (showRealEstateFields) {
      if (!formData.property_address) nextErrors.property_address = 'Requerido';
      if (!formData.property_registry_number) nextErrors.property_registry_number = 'Requerido';
    }
    if (showVehicleFields) {
      if (!formData.vehicle_plate && !formData.vehicle_vin) {
        nextErrors.vehicle_plate = 'Placa o VIN requerido';
      }
    }
    return nextErrors;
  }, [formData, showRealEstateFields, showVehicleFields]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = event.target;
    if (type === 'checkbox') {
      const checked = (event.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'loan_application' || name === 'vehicle_year') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? (name === 'vehicle_year' ? null : 0) : Number(value),
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
    setErrors(requiredErrors);
    if (Object.keys(requiredErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && collateralId) {
        const payload: CollateralUpdatePayload = {
          ...formData,
          is_active: isActive,
        };
        await updateCollateral(Number(collateralId), payload);
      } else {
        await createCollateral(formData);
      }
      navigate('/garantias');
    } catch (err: unknown) {
      if (err instanceof Error && 'fieldErrors' in err) {
        setErrors((err as Record<string, unknown>).fieldErrors as Record<string, string> || {});
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al guardar la garantia');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState message="Cargando garantia..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/garantias')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            {isEditing ? 'Editar garantia' : 'Nueva garantia'}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Registra los datos principales de la garantia asociada a la solicitud.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Datos generales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Solicitud *
              </label>
              <select
                name="loan_application"
                value={formData.loan_application || ''}
                onChange={handleChange}
                disabled={loadingApplications}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.loan_application ? 'border-red-300' : 'border-slate-300'
                }`}
              >
                <option value="">Selecciona una solicitud...</option>
                {loanApplications.map((app) => (
                  <option key={app.id} value={app.id}>
                    Solicitud #{app.application_number} - {app.client?.full_name || 'Sin cliente'} ({app.product?.name || 'Sin producto'}) - {app.status_display}
                  </option>
                ))}
                {formData.loan_application !== 0 && !loanApplications.some((app) => app.id === formData.loan_application) && (
                  <option value={formData.loan_application}>
                    Solicitud #{formData.loan_application} (Cargada)
                  </option>
                )}
              </select>
              {errors.loan_application && (
                <p className="text-red-600 text-xs mt-1">{errors.loan_application}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tipo de garantia *
              </label>
              <select
                name="collateral_type"
                value={formData.collateral_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
              >
                <option value="REAL_ESTATE">Inmueble</option>
                <option value="VEHICLE">Vehiculo</option>
                <option value="MACHINERY">Maquinaria</option>
                <option value="SAVINGS">Ahorros</option>
                <option value="GUARANTOR">Garante</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valor estimado (Bs) *
              </label>
              <input
                type="text"
                name="estimated_value"
                value={formData.estimated_value}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.estimated_value ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.estimated_value && (
                <p className="text-red-600 text-xs mt-1">{errors.estimated_value}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valor tasado (Bs)
              </label>
              <input
                type="text"
                name="appraised_value"
                value={formData.appraised_value || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripcion</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
                rows={3}
              />
            </div>
          </div>
        </div>

        {showRealEstateFields && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Datos del inmueble</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Direccion *</label>
                <input
                  type="text"
                  name="property_address"
                  value={formData.property_address || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errors.property_address ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
                {errors.property_address && (
                  <p className="text-red-600 text-xs mt-1">{errors.property_address}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Matricula *</label>
                <input
                  type="text"
                  name="property_registry_number"
                  value={formData.property_registry_number || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errors.property_registry_number ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
                {errors.property_registry_number && (
                  <p className="text-red-600 text-xs mt-1">{errors.property_registry_number}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Superficie (m2)</label>
                <input
                  type="text"
                  name="property_area_m2"
                  value={formData.property_area_m2 || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg border-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        {showVehicleFields && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Datos del vehiculo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Placa</label>
                <input
                  type="text"
                  name="vehicle_plate"
                  value={formData.vehicle_plate || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errors.vehicle_plate ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
                {errors.vehicle_plate && (
                  <p className="text-red-600 text-xs mt-1">{errors.vehicle_plate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">VIN</label>
                <input
                  type="text"
                  name="vehicle_vin"
                  value={formData.vehicle_vin || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Anio</label>
                <input
                  type="number"
                  name="vehicle_year"
                  value={formData.vehicle_year || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                <input
                  type="text"
                  name="vehicle_brand"
                  value={formData.vehicle_brand || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
                <input
                  type="text"
                  name="vehicle_model"
                  value={formData.vehicle_model || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg border-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Informacion legal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="ownership_verified"
                checked={Boolean(formData.ownership_verified)}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Propiedad verificada
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="has_liens"
                checked={Boolean(formData.has_liens)}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Tiene gravamenes
            </label>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Detalle de gravamen</label>
              <textarea
                name="lien_details"
                value={formData.lien_details || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Seguro</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Poliza</label>
              <input
                type="text"
                name="insurance_policy_number"
                value={formData.insurance_policy_number || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Compania</label>
              <input
                type="text"
                name="insurance_company"
                value={formData.insurance_company || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vencimiento</label>
              <input
                type="date"
                name="insurance_expiry_date"
                value={formData.insurance_expiry_date || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg border-slate-300"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Notas</h2>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg border-slate-300"
            rows={3}
          />
        </div>

        {isEditing && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4"
            />
            Garantia activa
          </label>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/garantias')}
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
