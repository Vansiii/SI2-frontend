import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import { getProducts } from '@/features/products/services/productsApi';
import type { CreditProduct } from '@/features/products/types';
import {
  createLoanApplication,
  getLoanApplication,
  updateLoanApplication,
  type CreateLoanApplicationData,
  type LoanApplication,
  type UpdateLoanApplicationData,
} from '../services/loansApi';
import {
  ApplicationDetailsGrid,
  ApplicationHeader,
  CreditApplicationStatusBadge,
  SectionCard,
  formatCurrency,
} from '../components/CreditApplicationComponents';

type LoanApplicationFormValues = {
  product_id: number | '';
  requested_amount: string;
  term_months: number | '';
  purpose: string;
  monthly_income: string;
  employment_type: string;
  employment_description: string;
  branch_id: number | '';
};

const defaultValues: LoanApplicationFormValues = {
  product_id: '',
  requested_amount: '',
  term_months: '',
  purpose: '',
  monthly_income: '',
  employment_type: '',
  employment_description: '',
  branch_id: '',
};

export default function LoanApplicationFormPage() {
  const navigate = useNavigate();
  const params = useParams();
  const applicationId = params.id ? Number(params.id) : null;
  const isEditMode = Number.isFinite(applicationId ?? NaN);

  const [products, setProducts] = useState<CreditProduct[]>([]);
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(isEditMode);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<LoanApplicationFormValues>({ defaultValues });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (isEditMode && applicationId) {
      loadApplication(applicationId);
    }
  }, [applicationId, isEditMode]);

  async function loadProducts() {
    setLoadingProducts(true);

    try {
      const response = await getProducts({ page_size: 100, is_active: true });
      setProducts(response.results || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar los productos');
    } finally {
      setLoadingProducts(false);
    }
  }

  async function loadApplication(id: number) {
    setLoadingApplication(true);
    setError(null);

    try {
      const detail = await getLoanApplication(id);
      setApplication(detail);
      reset({
        product_id: detail.product?.id || '',
        requested_amount: detail.requested_amount || '',
        term_months: detail.term_months || '',
        purpose: detail.purpose || '',
        monthly_income: detail.monthly_income || '',
        employment_type: detail.employment_type || '',
        employment_description: detail.employment_description || '',
        branch_id: detail.branch?.id || '',
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar la solicitud');
    } finally {
      setLoadingApplication(false);
    }
  }

  const selectedProductId = watch('product_id');
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === Number(selectedProductId)),
    [products, selectedProductId]
  );

  const canEdit = !application || application.status === 'DRAFT';

  async function onSubmit(values: LoanApplicationFormValues) {
    setSaving(true);
    setError(null);

    const payload: CreateLoanApplicationData | UpdateLoanApplicationData = {
      product_id: Number(values.product_id),
      requested_amount: values.requested_amount,
      term_months: Number(values.term_months),
      purpose: values.purpose,
      monthly_income: values.monthly_income ? values.monthly_income : null,
      employment_type: values.employment_type || null,
      employment_description: values.employment_description || undefined,
      branch_id: values.branch_id ? Number(values.branch_id) : null,
    };

    try {
      const saved = isEditMode && applicationId
        ? await updateLoanApplication(applicationId, payload)
        : await createLoanApplication(payload as CreateLoanApplicationData);

      navigate(`/credit-applications/${saved.id}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No fue posible guardar la solicitud');
    } finally {
      setSaving(false);
    }
  }

  const isBusy = loadingProducts || loadingApplication;

  if (isBusy && !application) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-slate-500">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.10),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <button
          type="button"
          onClick={() => navigate('/credit-applications')}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </button>

        {application ? <ApplicationHeader application={application} /> : null}

        {application && !canEdit ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            Esta solicitud ya no está en borrador. Puedes revisar su detalle, pero no editarla desde este formulario.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
          <SectionCard
            title={isEditMode ? 'Editar borrador' : 'Crear borrador'}
            subtitle="La solicitud se guarda como borrador. Desde el detalle podrás enviarla para revisión."
            action={
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-slate-600">CU-11 listo</span>
              </div>
            }
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Producto</span>
                  <select
                    {...register('product_id', { required: 'Seleccione un producto' })}
                    disabled={!canEdit}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Seleccione un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {errors.product_id ? <span className="mt-2 block text-xs text-rose-600">{errors.product_id.message}</span> : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Monto solicitado</span>
                  <input
                    {...register('requested_amount', { required: 'Ingrese el monto solicitado' })}
                    disabled={!canEdit}
                    inputMode="decimal"
                    placeholder="5000.00"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  {errors.requested_amount ? <span className="mt-2 block text-xs text-rose-600">{errors.requested_amount.message}</span> : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Plazo en meses</span>
                  <input
                    type="number"
                    {...register('term_months', {
                      required: 'Ingrese el plazo',
                      valueAsNumber: true,
                    })}
                    disabled={!canEdit}
                    min={1}
                    max={360}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  {errors.term_months ? <span className="mt-2 block text-xs text-rose-600">{errors.term_months.message}</span> : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Ingreso mensual</span>
                  <input
                    {...register('monthly_income')}
                    disabled={!canEdit}
                    inputMode="decimal"
                    placeholder="2500.00"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Propósito</span>
                  <textarea
                    {...register('purpose', { required: 'Ingrese el propósito' })}
                    disabled={!canEdit}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Compra de equipos, consolidación de deuda, capital de trabajo..."
                  />
                  {errors.purpose ? <span className="mt-2 block text-xs text-rose-600">{errors.purpose.message}</span> : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tipo de empleo</span>
                  <select
                    {...register('employment_type')}
                    disabled={!canEdit}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Seleccione</option>
                    <option value="EMPLOYED">Empleado</option>
                    <option value="SELF_EMPLOYED">Independiente</option>
                    <option value="BUSINESS_OWNER">Empresario</option>
                    <option value="RETIRED">Jubilado</option>
                    <option value="UNEMPLOYED">Sin empleo</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Descripción laboral</span>
                  <input
                    {...register('employment_description')}
                    disabled={!canEdit}
                    placeholder="Cargo, empresa o actividad principal"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sucursal</span>
                  <input
                    type="number"
                    {...register('branch_id', { valueAsNumber: true })}
                    disabled={!canEdit}
                    placeholder="Opcional"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  La solicitud se guarda en estado <span className="font-semibold text-slate-700">DRAFT</span>.
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/credit-applications')}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !canEdit}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Guardar borrador'}
                  </button>
                </div>
              </div>
            </form>
          </SectionCard>

          <div className="space-y-6">
            <SectionCard title="Vista previa" subtitle="Resumen del producto seleccionado y de la solicitud.">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Producto</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{selectedProduct?.name || 'Selecciona un producto'}</div>
                  {selectedProduct ? (
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center justify-between gap-3">
                        <span>Rango</span>
                        <span>
                          {selectedProduct.selected_parameter_detail 
                            ? `${formatCurrency(selectedProduct.selected_parameter_detail.min_amount)} - ${formatCurrency(selectedProduct.selected_parameter_detail.max_amount)}`
                            : 'No disponible'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Plazo</span>
                        <span>
                          {selectedProduct.selected_parameter_detail
                            ? `${selectedProduct.selected_parameter_detail.min_term_months} - ${selectedProduct.selected_parameter_detail.max_term_months} meses`
                            : 'No disponible'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Tasa referencial</span>
                        <span>
                          {selectedProduct.selected_parameter_detail
                            ? `${selectedProduct.selected_parameter_detail.min_interest_rate}% - ${selectedProduct.selected_parameter_detail.max_interest_rate}%`
                            : 'No disponible'}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>

                {application ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Estado actual</div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">{application.application_number}</div>
                      </div>
                      <CreditApplicationStatusBadge status={application.status} label={application.status_display} />
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center justify-between gap-3">
                        <span>Monto</span>
                        <span className="font-medium text-slate-900">{formatCurrency(application.requested_amount)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Cuota</span>
                        <span className="font-medium text-slate-900">{formatCurrency(application.monthly_payment)}</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-800">
                  Completa el formulario y guarda el borrador. Luego podrás enviarlo desde el detalle para continuar el flujo de CU-11.
                </div>
              </div>
            </SectionCard>

            {application ? (
              <SectionCard title="Resumen actual" subtitle="Datos cargados desde la solicitud.">
                <ApplicationDetailsGrid application={application} />
              </SectionCard>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}