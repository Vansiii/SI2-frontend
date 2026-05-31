/**
 * CU-07 — Vista de Solicitudes Entrantes para empleados del tenant.
 * Muestra todas las solicitudes de crédito con filtros avanzados y métricas.
 */

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Filter,
  Inbox,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import loansApi, { formatApplicationNumber } from '../services/loansApi';
import type { LoanApplicationListItem, LoanApplicationFilters } from '../services/loansApi';

const LoanApplicationStatusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  SUBMITTED: 'Enviada',
  IN_REVIEW: 'En revisión',
  OBSERVED: 'Observada',
  UNDER_REVIEW: 'En revisión',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  DISBURSED: 'Desembolsada',
  CANCELLED: 'Cancelada',
};
import {
  Badge,
  CreditApplicationStatusBadge,
  EmptyState,
  IdentityStatusBadge,
  MetricCard,
  SectionCard,
  formatCurrency,
  formatDateTime,
} from '../components/CreditApplicationComponents';

// ─── Component ──────────────────────────────────────────────────────────────

export function IncomingApplicationsPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<LoanApplicationListItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [searchDraft, setSearchDraft] = useState('');
  const [filters, setFilters] = useState<LoanApplicationFilters>({
    page: 1,
    page_size: pageSize,
    ordering: '-created_at',
  });

  useEffect(() => {
    loadApplications();
  }, [filters]);

  async function loadApplications() {
    setLoading(true);
    setError(null);
    try {
      const response = await loansApi.listApplications(filters);
      setItems(response.results || []);
      setCount(response.count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => {
    const pending = items.filter((i) => i.status === 'SUBMITTED').length;
    const inReview = items.filter((i) => i.status === 'IN_REVIEW' || i.status === 'OBSERVED').length;
    const approved = items.filter((i) => i.status === 'APPROVED' || i.status === 'DISBURSED').length;
    const rejected = items.filter((i) => i.status === 'REJECTED' || i.status === 'CANCELLED').length;
    return { pending, inReview, approved, rejected };
  }, [items]);

  const canGoNext = page * pageSize < count;
  const hasFilters = Boolean(filters.search || filters.status || filters.identity_verification_status);

  function updateFilter<K extends keyof LoanApplicationFilters>(key: K, value: LoanApplicationFilters[K]) {
    setPage(1);
    setFilters((prev) => ({ ...prev, page: 1, [key]: value }));
  }

  function applySearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateFilter('search', searchDraft.trim() || undefined);
  }

  function clearFilters() {
    setSearchDraft('');
    setPage(1);
    setFilters({ page: 1, page_size: pageSize, ordering: '-created_at' });
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    setFilters((prev) => ({ ...prev, page: nextPage, page_size: pageSize }));
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">

        {/* ─── Header ─────────────────────────────────────────────────── */}
        <div className="rounded-4xl border border-slate-200 bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-200/40">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                <Inbox className="h-3.5 w-3.5" />
                CU-07 · Bandeja de Entrada
              </div>
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Solicitudes entrantes</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Vista centralizada de todas las solicitudes de crédito del tenant. Revisa, filtra y gestiona el pipeline de originación.
              </p>
            </div>
            <button
              type="button"
              onClick={loadApplications}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* ─── Metric Cards ─────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total"
            value={String(count)}
            helper="Solicitudes encontradas"
            color="blue"
          />
          <MetricCard
            label="Pendientes"
            value={String(metrics.pending)}
            helper="Esperando revisión"
            color="amber"
          />
          <MetricCard
            label="En revisión"
            value={String(metrics.inReview)}
            helper="En proceso de análisis"
            color="slate"
          />
          <MetricCard
            label="Cerradas"
            value={String(metrics.approved + metrics.rejected)}
            helper="Aprobadas o rechazadas"
            color="emerald"
          />
        </div>

        {/* ─── Filters ──────────────────────────────────────────────── */}
        <SectionCard
          title="Filtros avanzados"
          subtitle="Filtra por estado, verificación de identidad, o búsqueda libre para encontrar solicitudes rápidamente."
        >
          <form onSubmit={applySearch} className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))_auto]">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Buscar</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  placeholder="Número, cliente o producto..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Estado</span>
              <select
                value={filters.status || ''}
                onChange={(e) => updateFilter('status', (e.target.value || '') as LoanApplicationFilters['status'])}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white"
              >
                <option value="">Todos</option>
                <option value="DRAFT">Borrador</option>
                <option value="SUBMITTED">Enviada</option>
                <option value="IN_REVIEW">En revisión</option>
                <option value="OBSERVED">Observada</option>
                <option value="APPROVED">Aprobada</option>
                <option value="REJECTED">Rechazada</option>
                <option value="DISBURSED">Desembolsada</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Identidad</span>
              <select
                value={filters.identity_verification_status || ''}
                onChange={(e) =>
                  updateFilter(
                    'identity_verification_status',
                    (e.target.value || '') as LoanApplicationFilters['identity_verification_status']
                  )
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white"
              >
                <option value="">Todos</option>
                <option value="PENDING">Pendiente</option>
                <option value="IN_PROGRESS">En progreso</option>
                <option value="APPROVED">Verificada</option>
                <option value="DECLINED">Rechazada</option>
                <option value="MANUAL_REVIEW">Revisión manual</option>
              </select>
            </label>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="inline-flex h-[46px] items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Filter className="h-4 w-4" />
                Filtrar
              </button>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-[46px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Limpiar
                </button>
              )}
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {hasFilters ? <Badge label="Filtros activos" color="blue" /> : <Badge label="Sin filtros" color="slate" />}
            <Badge label={`Página ${page} · ${count} resultados`} color="emerald" />
          </div>
        </SectionCard>

        {/* ─── Application Cards ────────────────────────────────────── */}
        {loading && items.length === 0 ? (
          <div className="rounded-4xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-500">Cargando solicitudes entrantes...</p>
          </div>
        ) : error && items.length === 0 ? (
          <div className="rounded-4xl border border-rose-200 bg-rose-50 p-10 text-center">
            <XCircle className="mx-auto h-10 w-10 text-rose-400" />
            <p className="mt-3 text-sm font-medium text-rose-700">{error}</p>
            <button
              type="button"
              onClick={loadApplications}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Reintentar
            </button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No hay solicitudes entrantes"
            description="No se encontraron solicitudes con los filtros seleccionados. Prueba con un criterio más amplio."
            action={
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Limpiar filtros
              </button>
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {items.map((application) => (
              <IncomingApplicationCard
                key={application.id}
                application={application}
                onView={() => navigate(`/loans/${application.id}/dossier`)}
              />
            ))}
          </div>
        )}

        {/* ─── Pagination ───────────────────────────────────────────── */}
        {count > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <div>
              Mostrando {items.length} de {count} solicitudes
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="rounded-xl bg-slate-950 px-3 py-2 font-semibold text-white">
                {page}
              </span>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={!canGoNext}
                className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── IncomingApplicationCard ─────────────────────────────────────────────────

interface IncomingApplicationCardProps {
  application: LoanApplicationListItem;
  onView: () => void;
}

function IncomingApplicationCard({ application, onView }: IncomingApplicationCardProps) {
  const urgency = getUrgencyLevel(application);

  return (
    <article className="group relative rounded-4xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      {/* Urgency stripe */}
      {urgency === 'high' && (
        <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-amber-400" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-slate-900">
            {formatApplicationNumber(application.application_number)}
          </div>
          <div className="mt-0.5 text-xs uppercase tracking-[0.18em] text-slate-400">
            {application.application_number}
          </div>
        </div>
        <CreditApplicationStatusBadge status={application.status} label={LoanApplicationStatusLabels[application.status]} />
      </div>

      {/* Body */}
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <InfoRow label="Cliente" value={application.client_name} />
        <InfoRow label="Producto" value={application.product_name} />
        <InfoRow label="Monto" value={formatCurrency(application.requested_amount)} />
        <InfoRow label="Plazo" value={`${application.term_months} meses`} />
        <div className="flex items-center justify-between gap-3">
          <span>Identidad</span>
          <IdentityStatusBadge
            status={application.identity_verification_status}
            label={application.identity_verification_status ?? 'N/D'}
          />
        </div>
        {application.assigned_to_name && (
          <InfoRow label="Asignado a" value={application.assigned_to_name} />
        )}
        <InfoRow label="Recibida" value={formatDateTime(application.created_at)} />
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition group-hover:text-blue-800"
        >
          Ver expediente completo
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Status icons */}
        <div className="flex items-center gap-2">
          {application.identity_verification_status === 'APPROVED' && (
            <span title="Identidad verificada">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </span>
          )}
          {(application.status === 'SUBMITTED' || application.status === 'IN_REVIEW') && (
            <span title="Requiere atención">
              <Clock className="h-4 w-4 text-amber-500" />
            </span>
          )}
          {(application.status === 'APPROVED' || application.status === 'DISBURSED') && (
            <span title="Aprobada">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </span>
          )}
          {(application.status === 'REJECTED' || application.status === 'CANCELLED') && (
            <span title="Cerrada">
              <XCircle className="h-4 w-4 text-rose-400" />
            </span>
          )}
          <span title="Ver detalle">
            <BarChart3 className="h-4 w-4 text-slate-400" />
          </span>
        </div>
      </div>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function getUrgencyLevel(application: LoanApplicationListItem): 'high' | 'normal' {
  if (application.status === 'SUBMITTED') return 'high';
  return 'normal';
}
