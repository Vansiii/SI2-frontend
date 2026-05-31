import { Fragment, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Brain, CheckCircle2, MessageSquare, Send, ShieldAlert, FileText } from 'lucide-react';
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
import { contractsApi } from '../../contracts/services/contractsApi';

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
  const [generatingContract, setGeneratingContract] = useState(false);
  const [contractGenerated, setContractGenerated] = useState(false);

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

  const workflowActions = useMemo(() => {
    if (!application) return [];
    
    const stage = application.current_workflow_stage;
    if (stage) {
      const list: Array<{ value: string; label: string; isSuccess: boolean }> = [];
      if (stage.next_stage_on_success) {
        list.push({
          value: stage.next_stage_on_success,
          label: `Avanzar a: ${stage.next_stage_on_success}`,
          isSuccess: true,
        });
      }
      if (stage.next_stage_on_failure) {
        list.push({
          value: stage.next_stage_on_failure,
          label: `Desviar a: ${stage.next_stage_on_failure}`,
          isSuccess: false,
        });
      }
      return list;
    }
    
    // Fallback list of options if no custom workflow stage is found
    return [
      { value: 'SUBMITTED', label: 'Regresar a enviada', isSuccess: true },
      { value: 'IN_REVIEW', label: 'En revisión', isSuccess: true },
      { value: 'OBSERVED', label: 'Observar', isSuccess: false },
      { value: 'APPROVED', label: 'Aprobar', isSuccess: true },
      { value: 'REJECTED', label: 'Rechazar', isSuccess: false },
      { value: 'DISBURSED', label: 'Desembolsar', isSuccess: true },
      { value: 'CANCELLED', label: 'Cancelar', isSuccess: false },
    ];
  }, [application]);

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

  const canGenerateContract = useMemo(
    () => application?.status === 'APPROVED' && !contractGenerated,
    [application, contractGenerated]
  );

  async function handleGenerateContract() {
    if (!application) {
      return;
    }

    setGeneratingContract(true);
    setError(null);

    try {
      const contract = await contractsApi.generateFromApplication({
        loan_application_id: application.id,
      });
      
      setContractGenerated(true);
      alert(`¡Contrato generado exitosamente!\n\nNúmero: ${contract.contract_number}\nEstado: ${contract.status_display}`);
      
      // Navegar al detalle del contrato
      navigate(`/contracts/${contract.id}`);
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'No fue posible generar el contrato');
    } finally {
      setGeneratingContract(false);
    }
  }

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

        {/* Barra de Progreso del Workflow */}
        {application.product_workflow_stages && application.product_workflow_stages.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4 font-bold">Progreso del Flujo de Aprobación</h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
              {application.product_workflow_stages
                .sort((a: any, b: any) => a.stage_order - b.stage_order)
                .map((stage: any, index: number, arr: any[]) => {
                  const isCurrent = stage.stage_code === application.status;
                  const isPast = stage.stage_order < (application.current_workflow_stage?.stage_order ?? 999);
                  
                  return (
                    <Fragment key={stage.id}>
                      <div className="flex items-center gap-3 flex-1 justify-center md:justify-start">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent 
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md shadow-blue-200' 
                            : isPast 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-slate-100 text-slate-400'
                        }`}>
                          {stage.stage_order}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${isCurrent ? 'text-blue-600' : isPast ? 'text-emerald-700 font-medium' : 'text-slate-400 font-medium'}`}>
                            {stage.stage_name}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">
                            {stage.stage_code}
                          </span>
                        </div>
                      </div>
                      {index < arr.length - 1 && (
                        <div className="hidden md:block h-0.5 bg-slate-100 w-8 mx-2" />
                      )}
                    </Fragment>
                  );
                })}
            </div>
          </div>
        )}

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
                      <Link
                        to={`/loans/${application.id}/evaluation`}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        <Brain className="h-3 w-3" />
                        Ver evaluación completa
                      </Link>
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

            {/* Sección de Contrato */}
            {application.contract && (
              <SectionCard
                title="Contrato de Crédito"
                subtitle="Contrato generado para esta solicitud aprobada."
                action={<FileText className="h-4 w-4 text-slate-400" />}
              >
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">{application.contract.contract_number}</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Generado el {formatDateTime(application.contract.created_at)}
                      </p>
                    </div>
                    <CreditApplicationStatusBadge 
                      status={application.contract.status as any} 
                      label={application.contract.status_display} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <dt className="text-xs text-slate-500">Monto</dt>
                      <dd className="text-sm font-semibold text-slate-900">
                        Bs. {parseFloat(application.contract.principal_amount).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Plazo</dt>
                      <dd className="text-sm font-semibold text-slate-900">{application.contract.term_months} meses</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Tasa</dt>
                      <dd className="text-sm font-semibold text-slate-900">{application.contract.interest_rate}% anual</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Cuota Mensual</dt>
                      <dd className="text-sm font-semibold text-slate-900">
                        Bs. {parseFloat(application.contract.monthly_payment).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                      </dd>
                    </div>
                  </div>

                  {/* Estado de firmas */}
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Estado de Firmas</span>
                      {application.contract.all_signatures_complete ? (
                        <span className="inline-flex items-center text-xs text-green-700">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Completas
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-yellow-700">
                          <ShieldAlert className="w-4 h-4 mr-1" />
                          {application.contract.pending_signatures.length} pendiente(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/contracts/${application.contract!.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <FileText className="h-4 w-4" />
                      Ver Detalle
                    </button>
                    {application.contract.pdf_url && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const blob = await contractsApi.downloadPDF(application.contract!.id);
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `contrato-${application.contract!.contract_number}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            window.URL.revokeObjectURL(url);
                          } catch (err) {
                            alert('Error al descargar el PDF');
                          }
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <ArrowLeft className="h-4 w-4 rotate-90" />
                        Descargar PDF
                      </button>
                    )}
                  </div>
                </div>
              </SectionCard>
            )}
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

                {canGenerateContract ? (
                  <button
                    type="button"
                    onClick={handleGenerateContract}
                    disabled={generatingContract}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FileText className="h-4 w-4" />
                    {generatingContract ? 'Generando contrato...' : '🔥 Generar Contrato'}
                  </button>
                ) : null}

                {application.status === 'APPROVED' && contractGenerated ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
                    <p className="text-sm font-semibold text-emerald-700">✅ Contrato ya generado</p>
                    <button
                      type="button"
                      onClick={() => navigate('/contracts')}
                      className="mt-2 text-xs text-emerald-600 hover:text-emerald-800 underline"
                    >
                      Ver contratos
                    </button>
                  </div>
                ) : null}

                <form onSubmit={handleSubmit(handleAction)} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Nuevo estado</label>
                    <select
                      {...register('new_status', { required: 'Seleccione un estado' })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white"
                    >
                      <option value="">Seleccione</option>
                      {workflowActions.map((act) => (
                        <option key={act.value} value={act.value}>
                          {act.label}
                        </option>
                      ))}
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