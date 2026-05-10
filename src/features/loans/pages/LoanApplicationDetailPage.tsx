import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MessageSquare, Send, ShieldAlert } from 'lucide-react';
import {
  addLoanApplicationComment,
  changeLoanApplicationStatus,
  getLoanApplication,
  submitLoanApplication,
  type LoanApplication,
  type LoanApplicationStatus,
} from '../services/loansApi';
import {
  ApplicationComments,
  ApplicationDetailsGrid,
  ApplicationDocuments,
  ApplicationHeader,
  ApplicationTimeline,
  CreditApplicationStatusBadge,
  SectionCard,
  formatDateTime,
} from '../components/CreditApplicationComponents';

type ActionFormValues = {
  new_status: LoanApplicationStatus | '';
  reason: string;
  approved_amount: string;
  approved_term_months: number | '';
  approved_interest_rate: string;
};

const actionDefaults: ActionFormValues = {
  new_status: '',
  reason: '',
  approved_amount: '',
  approved_term_months: '',
  approved_interest_rate: '',
};

export default function LoanApplicationDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const applicationId = Number(params.id);

  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ActionFormValues>({ defaultValues: actionDefaults });

  const selectedAction = watch('new_status');
  const timeline = application?.timeline || [];
  const comments = application?.comments || [];
  const documents = application?.documents || [];

  useEffect(() => {
    if (Number.isFinite(applicationId)) {
      loadApplication();
    }
  }, [applicationId]);

  async function loadApplication() {
    setLoading(true);
    setError(null);

    try {
      const detail = await getLoanApplication(applicationId);
      setApplication(detail);
      reset(actionDefaults);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar la solicitud');
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = useMemo(
    () => application?.status === 'DRAFT' || application?.status === 'OBSERVED',
    [application]
  );

  async function handleSubmitApplication() {
    if (!application) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await submitLoanApplication(application.id);
      setApplication(updated);
      await loadApplication();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No fue posible enviar la solicitud');
    } finally {
      setSaving(false);
    }
  }

  async function handleAction(values: ActionFormValues) {
    if (!application || !values.new_status) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await changeLoanApplicationStatus(application.id, {
        new_status: values.new_status as Exclude<LoanApplicationStatus, 'DRAFT'>,
        reason: values.reason || undefined,
        approved_amount: values.approved_amount || undefined,
        approved_term_months: values.approved_term_months ? Number(values.approved_term_months) : undefined,
        approved_interest_rate: values.approved_interest_rate || undefined,
      });
      setApplication(updated);
      reset(actionDefaults);
      await loadApplication();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'No fue posible cambiar el estado');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!application || !commentText.trim()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await addLoanApplicationComment(application.id, commentText.trim(), isInternalComment);
      setCommentText('');
      await loadApplication();
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : 'No fue posible agregar el comentario');
    } finally {
      setSaving(false);
    }
  }

  const actionNeedsApprovalFields = selectedAction === 'APPROVED';

  if (loading && !application) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-slate-500">Cargando detalle...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 text-center text-rose-700 shadow-sm">
          <p>{error || 'Solicitud no encontrada'}</p>
          <button
            type="button"
            onClick={() => navigate('/credit-applications')}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <button
          type="button"
          onClick={() => navigate('/credit-applications')}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </button>

        <ApplicationHeader application={application} />

        {error ? <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <div className="space-y-6">
            <SectionCard
              title="Detalles de la solicitud"
              subtitle="Resumen de los datos capturados para la originación."
              action={<CreditApplicationStatusBadge status={application.status} label={application.status_display} />}
            >
              <ApplicationDetailsGrid application={application} />
            </SectionCard>

            {/* Nueva sección: Validación KYC y Scoring */}
            {(application.identity_verification_details || application.credit_score) && (
              <SectionCard
                title="Validación KYC y Scoring Crediticio"
                subtitle="Datos reales de verificación de identidad y análisis de riesgo."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Validación KYC */}
                  {application.identity_verification_details && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">Verificación de Identidad</h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-xs text-slate-500">Estado</dt>
                          <dd className="text-sm font-semibold text-slate-900">{application.identity_verification_details.status}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">Decisión</dt>
                          <dd className="text-sm font-semibold text-slate-900">{application.identity_verification_details.decision}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">Documento</dt>
                          <dd className="text-sm font-semibold text-slate-900">
                            {application.identity_verification_details.document_type} - {application.identity_verification_details.document_number}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">Nombre Verificado</dt>
                          <dd className="text-sm font-semibold text-slate-900">{application.identity_verification_details.full_name || 'N/D'}</dd>
                        </div>
                        {application.identity_verification_details.date_of_birth && (
                          <div>
                            <dt className="text-xs text-slate-500">Fecha de Nacimiento</dt>
                            <dd className="text-sm font-semibold text-slate-900">{application.identity_verification_details.date_of_birth}</dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-xs text-slate-500">Proveedor</dt>
                          <dd className="text-sm font-semibold text-slate-900">{application.identity_verification_details.provider}</dd>
                        </div>
                        {application.identity_verification_details.completed_at && (
                          <div>
                            <dt className="text-xs text-slate-500">Completado</dt>
                            <dd className="text-sm font-semibold text-slate-900">{formatDateTime(application.identity_verification_details.completed_at)}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}

                  {/* Scoring Crediticio */}
                  {(application.credit_score || application.risk_level) && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">Análisis de Riesgo</h4>
                      <dl className="space-y-2">
                        {application.credit_score && (
                          <div>
                            <dt className="text-xs text-slate-500">Score Crediticio</dt>
                            <dd className="text-2xl font-bold text-slate-900">{application.credit_score}</dd>
                          </div>
                        )}
                        {application.risk_level && (
                          <div>
                            <dt className="text-xs text-slate-500">Nivel de Riesgo</dt>
                            <dd className="text-sm font-semibold text-slate-900">{application.risk_level_display || application.risk_level}</dd>
                          </div>
                        )}
                        {application.debt_to_income_ratio && (
                          <div>
                            <dt className="text-xs text-slate-500">Relación Deuda/Ingreso</dt>
                            <dd className="text-sm font-semibold text-slate-900">{application.debt_to_income_ratio}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            <SectionCard
              title="Timeline"
              subtitle="Eventos visibles del flujo de originación."
            >
              <ApplicationTimeline events={timeline} />
            </SectionCard>

            <SectionCard
              title="Comentarios"
              subtitle="Notas internas o públicas asociadas a la solicitud."
              action={<MessageSquare className="h-4 w-4 text-slate-400" />}
            >
              <ApplicationComments comments={comments} />
            </SectionCard>

            <SectionCard
              title="Documentos"
              subtitle="Soportes cargados para la solicitud."
              action={<ShieldAlert className="h-4 w-4 text-slate-400" />}
            >
              <ApplicationDocuments documents={documents} />
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Acciones" subtitle="Envía, cambia de estado o agrega comentarios sin salir del detalle.">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Actualización</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(application.updated_at)}</div>
                </div>

                {canSubmit ? (
                  <button
                    type="button"
                    onClick={handleSubmitApplication}
                    disabled={saving}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    {saving ? 'Enviando...' : 'Enviar solicitud'}
                  </button>
                ) : null}

                <form onSubmit={handleSubmit(handleAction)} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Nuevo estado</label>
                    <select
                      {...register('new_status', { required: 'Seleccione un estado' })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white"
                    >
                      <option value="">Seleccione</option>
                      <option value="SUBMITTED">Regresar a enviada</option>
                      <option value="IN_REVIEW">En revisión</option>
                      <option value="OBSERVED">Observar</option>
                      <option value="APPROVED">Aprobar</option>
                      <option value="REJECTED">Rechazar</option>
                      <option value="DISBURSED">Desembolsar</option>
                      <option value="CANCELLED">Cancelar</option>
                    </select>
                    {errors.new_status ? <span className="mt-2 block text-xs text-rose-600">{errors.new_status.message}</span> : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Motivo</label>
                    <textarea
                      {...register('reason')}
                      rows={4}
                      placeholder="Razón de la transición"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                    />
                  </div>

                  {actionNeedsApprovalFields ? (
                    <div className="grid gap-4">
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Monto aprobado</label>
                        <input
                          {...register('approved_amount')}
                          inputMode="decimal"
                          placeholder="4500.00"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Plazo aprobado</label>
                        <input
                          type="number"
                          {...register('approved_term_months', { valueAsNumber: true })}
                          placeholder="24"
                          min={1}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tasa aprobada</label>
                        <input
                          {...register('approved_interest_rate')}
                          inputMode="decimal"
                          placeholder="12.50"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                        />
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {saving ? 'Aplicando...' : 'Aplicar cambio de estado'}
                  </button>
                </form>

                <form onSubmit={handleAddComment} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Nuevo comentario</label>
                    <textarea
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      rows={4}
                      placeholder="Escribe un comentario para la solicitud"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                    />
                  </div>

                  <label className="flex items-center gap-3 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={isInternalComment}
                      onChange={(event) => setIsInternalComment(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    Comentario interno
                  </label>

                  <button
                    type="submit"
                    disabled={saving || !commentText.trim()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {saving ? 'Guardando...' : 'Agregar comentario'}
                  </button>
                </form>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}