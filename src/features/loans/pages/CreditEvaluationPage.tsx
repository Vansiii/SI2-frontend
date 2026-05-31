/**
 * CU-15: Evaluación Crediticia con IA (SP3-88)
 *
 * Visualiza el resultado completo de la evaluación crediticia automática,
 * incluyendo score IA, score buró, sub-scores y decisión automática.
 */

import { Component, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Brain,
  Building2,
  CheckCircle2,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  XCircle,
  BarChart3,
  Activity,
  Clock,
  Calculator,
  RefreshCw,
} from 'lucide-react';
import {
  calculateLoanApplicationScore,
  getLoanApplicationEvaluation,
  getLoanApplication,
  type LoanApplication,
  type CreditEvaluationDetail,
  type CreditEvaluationResult,
  type AutoDecision,
} from '../services/loansApi';
import {
  CreditApplicationStatusBadge,
  SectionCard,
} from '../components/CreditApplicationComponents';
import { formatCurrency, formatDateTime } from '../utils/componentHelpers';

type EvaluationData = CreditEvaluationResult | CreditEvaluationDetail;

export default function CreditEvaluationPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const applicationId = Number(id);

  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (applicationId) {
      loadPage();
    }
  }, [applicationId]);

  async function loadPage() {
    setLoading(true);
    setError(null);
    try {
      const [app, existingEval] = await Promise.all([
        getLoanApplication(applicationId),
        getLoanApplicationEvaluation(applicationId).catch(() => null),
      ]);
      setApplication(app);
      setEvaluation(existingEval);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }

  async function handleCalculateScore() {
    setCalculating(true);
    setError(null);
    try {
      const result = await calculateLoanApplicationScore(applicationId);
      setEvaluation(result);
      const app = await getLoanApplication(applicationId);
      setApplication(app);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular score');
    } finally {
      setCalculating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Cargando evaluación crediticia...
          </p>
        </div>
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-14 w-14 text-rose-500" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">Error</h2>
          <p className="mt-2 text-slate-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar
          </button>
        </div>
      </div>
    );
  }

  const isEvaluated =
    !!evaluation &&
    typeof evaluation === 'object' &&
    'score_weighted' in evaluation &&
    evaluation.score_weighted !== null &&
    evaluation.score_weighted !== undefined;
  const scoreWeighted = isEvaluated ? (evaluation as EvaluationData).score_weighted : null;
  const evalData = isEvaluated ? (evaluation as EvaluationData) : null;

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      {/* Header */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-slate-900" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-slate-900">
                Evaluación Crediticia con IA
              </h1>
              <p className="text-xs font-medium text-slate-500">
                {application?.application_number} &middot; {application?.client_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {application?.status && (
              <CreditApplicationStatusBadge
                status={application.status}
                label={application.status_display}
              />
            )}
            <button
              onClick={handleCalculateScore}
              disabled={calculating}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              {calculating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              {calculating ? 'Evaluando...' : isEvaluated ? 'Re-evaluar' : 'Evaluar con IA'}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorBoundary>
          {error && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            {error}
          </div>
        )}

        {!isEvaluated ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm ring-1 ring-blue-200">
              <Brain className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Evaluación Crediticia con IA
            </h2>
            <p className="mt-3 max-w-lg text-base text-slate-500">
              Presiona &ldquo;Evaluar con IA&rdquo; para calcular automáticamente
              el score crediticio, consultar buró de crédito y obtener una
              decisión basada en inteligencia artificial.
            </p>
            <button
              onClick={handleCalculateScore}
              disabled={calculating}
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-slate-950 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-60"
            >
              {calculating ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Brain className="h-5 w-5" />
              )}
              {calculating ? 'Ejecutando evaluación...' : 'Iniciar Evaluación con IA'}
            </button>
          </div>
        ) : (
          /* Results */
          <div className="space-y-8">
            {/* Score General */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Score Crediticio Ponderado
                  </p>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span
                      className={`text-6xl font-black tracking-tight ${
                        (scoreWeighted ?? 0) >= 700
                          ? 'text-emerald-600'
                          : (scoreWeighted ?? 0) >= 500
                            ? 'text-amber-600'
                            : 'text-rose-600'
                      }`}
                    >
                      {scoreWeighted}
                    </span>
                    <span className="text-lg text-slate-400">/ 1000</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <DecisionBadge decision={evalData?.auto_decision ?? null} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  <MiniScoreCard
                    label="Score IA"
                    value={evalData?.score_ia}
                    max={1000}
                    icon={<Brain className="h-4 w-4" />}
                  />
                  <MiniScoreCard
                    label="Score Buró"
                    value={evalData?.score_bureau}
                    max={999}
                    icon={<Building2 className="h-4 w-4" />}
                  />
                  <MiniScoreCard
                    label="Nivel de Riesgo"
                    value={evalData?.risk_level_display ?? evalData?.risk_level ?? 'N/D'}
                    icon={<ShieldAlert className="h-4 w-4" />}
                  />
                </div>
              </div>
            </div>

            {/* Sub-scores */}
            {evalData?.sub_scores && (
              <SectionCard
                title="Factores de Evaluación"
                subtitle="Desglose por factor del score crediticio."
                action={<BarChart3 className="h-5 w-5 text-slate-400" />}
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <FactorCard
                    label="Capacidad de Pago"
                    value={evalData.sub_scores.payment_capacity}
                  />
                  <FactorCard
                    label="Estabilidad Laboral"
                    value={evalData.sub_scores.employment_stability}
                  />
                  <FactorCard
                    label="Historial Crediticio"
                    value={evalData.sub_scores.credit_history}
                  />
                  <FactorCard
                    label="Carga de Deuda"
                    value={evalData.sub_scores.debt_burden}
                  />
                  {evalData.sub_scores.demographic !== null && (
                    <FactorCard
                      label="Perfil Demográfico"
                      value={evalData.sub_scores.demographic}
                    />
                  )}
                </div>
              </SectionCard>
            )}

            {/* Detalles */}
            <SectionCard
              title="Detalles de la Evaluación"
              subtitle="Información completa del análisis automático."
              action={<Activity className="h-5 w-5 text-slate-400" />}
            >
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  icon={<Calculator className="h-4 w-4" />}
                  label="DTI (Deuda/Ingreso)"
                  value={
                    evalData?.debt_to_income_ratio
                      ? `${evalData.debt_to_income_ratio}%`
                      : 'N/D'
                  }
                />
                {evalData && 'evaluation_time_ms' in evalData && (
                  <DetailItem
                    icon={<Clock className="h-4 w-4" />}
                    label="Tiempo de Evaluación"
                    value={
                      (evalData as CreditEvaluationDetail).evaluation_time_ms !== null
                        ? `${(evalData as CreditEvaluationDetail).evaluation_time_ms}ms`
                        : 'N/D'
                    }
                  />
                )}
                {'recommended_amount' in (evalData ?? {}) && (
                  <DetailItem
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Monto Recomendado"
                    value={
                      (evalData as CreditEvaluationDetail).recommended_amount
                        ? formatCurrency(
                            (evalData as CreditEvaluationDetail).recommended_amount!
                          )
                        : 'N/D'
                    }
                  />
                )}
                {'model_version' in (evalData ?? {}) && (
                  <DetailItem
                    icon={<Brain className="h-4 w-4" />}
                    label="Versión del Modelo"
                    value={
                      (evalData as CreditEvaluationDetail).model_version || 'N/D'
                    }
                  />
                )}
                {evalData?.evaluated_at && (
                  <DetailItem
                    icon={<Clock className="h-4 w-4" />}
                    label="Evaluado el"
                    value={formatDateTime(evalData.evaluated_at)}
                  />
                )}
                {'max_affordable_payment' in (evalData ?? {}) && (
                  <DetailItem
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Cuota Máxima Asequible"
                    value={
                      (evalData as CreditEvaluationDetail).max_affordable_payment
                        ? formatCurrency(
                            (evalData as CreditEvaluationDetail).max_affordable_payment!
                          )
                        : 'N/D'
                    }
                  />
                )}
              </div>

              {evalData?.auto_decision_reason && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    Razón de Decisión
                  </p>
                  <p className="text-sm text-slate-700">
                    {evalData.auto_decision_reason}
                  </p>
                </div>
              )}
            </SectionCard>

            {/* Buró */}
            {evalData?.bureau_query && (
              <SectionCard
                title="Consulta a Buró de Crédito"
                subtitle={`Proveedor: ${evalData.bureau_query.provider ?? 'N/D'}`}
                action={<Building2 className="h-5 w-5 text-slate-400" />}
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailItem
                    label="Score Externo"
                    value={
                      evalData.bureau_query.score_external !== null
                        ? String(evalData.bureau_query.score_external)
                        : 'N/D'
                    }
                  />
                  <DetailItem
                    label="Deuda Total"
                    value={
                      evalData.bureau_query.debt_total
                        ? formatCurrency(evalData.bureau_query.debt_total)
                        : 'N/D'
                    }
                  />
                  <DetailItem
                    label="Categoría CIC"
                    value={evalData.bureau_query.cic_category || 'N/D'}
                  />
                  <DetailItem
                    label="Tiene Moras"
                    value={
                      evalData.bureau_query.has_defaults === true
                        ? 'Sí'
                        : evalData.bureau_query.has_defaults === false
                          ? 'No'
                          : 'N/D'
                    }
                  />
                </div>
              </SectionCard>
            )}
          </div>
        )}
        </ErrorBoundary>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Subcomponentes internos
   ───────────────────────────────────────────────────── */

function MiniScoreCard({
  label,
  value,
  max,
  icon,
}: {
  label: string;
  value?: number | string | null;
  max?: number;
  icon?: React.ReactNode;
}) {
  const numericValue = typeof value === 'number' ? value : null;
  const percentage = numericValue !== null && max ? (numericValue / max) * 100 : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
      <div className="mb-3 flex items-center gap-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </p>
      </div>
      <p
        className={`text-2xl font-bold ${numericValue !== null ? 'text-slate-900' : 'text-slate-400'}`}
      >
        {value ?? 'N/D'}
      </p>
      {percentage !== null && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              percentage >= 70
                ? 'bg-emerald-500'
                : percentage >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

function FactorCard({ label, value }: { label: string; value: number | null }) {
  const v = value ?? 0;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p
        className={`text-3xl font-black ${
          v >= 70 ? 'text-emerald-600' : v >= 45 ? 'text-amber-600' : 'text-rose-600'
        }`}
      >
        {value ?? 'N/D'}
      </p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${
            v >= 70
              ? 'bg-emerald-500'
              : v >= 45
                ? 'bg-amber-500'
                : 'bg-rose-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, v))}%` }}
        />
      </div>
    </div>
  );
}

function DecisionBadge({ decision }: { decision: AutoDecision }) {
  const configMap: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    APPROVE: {
      label: 'Aprobación Automática',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    REJECT: {
      label: 'Rechazo Automático',
      color: 'bg-rose-100 text-rose-700 border-rose-200',
      icon: <XCircle className="h-4 w-4" />,
    },
    MANUAL_REVIEW: {
      label: 'Revisión Manual',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    ESCALATE: {
      label: 'Escalar a Gerente',
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      icon: <TrendingUp className="h-4 w-4" />,
    },
  };
  const config = configMap[decision ?? ''] ?? configMap.MANUAL_REVIEW;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-1 flex items-center gap-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </p>
      </div>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

// ─── Error Boundary ─────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  errorMsg: string;
}

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMsg: error.message || 'Error inesperado' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[CreditEvaluationPage] Error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-14 w-14 text-rose-500" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Error al renderizar evaluación
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {this.state.errorMsg || 'Ocurrió un error inesperado al mostrar los resultados.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, errorMsg: '' })}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
