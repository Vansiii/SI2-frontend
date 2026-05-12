import React, { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Filter, Plus, RefreshCw, Search } from 'lucide-react';
import {
  getLoanApplications,
  formatApplicationNumber,
  type LoanApplicationFilters,
  type LoanApplicationListItem,
} from '../services/loansApi';
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

export default function LoanApplicationListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<LoanApplicationListItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
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
      const response = await getLoanApplications(filters);
      setItems(response.results || []);
      setCount(response.count || 0);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => {
    const submitted = items.filter((item) => item.status === 'SUBMITTED' || item.status === 'IN_REVIEW').length;
    const draft = items.filter((item) => item.status === 'DRAFT').length;
    const approved = items.filter((item) => item.status === 'APPROVED' || item.status === 'DISBURSED').length;
    const rejected = items.filter((item) => item.status === 'REJECTED' || item.status === 'CANCELLED').length;

    return { submitted, draft, approved, rejected };
  }, [items]);

  const canGoNext = page * pageSize < count;

  function updateFilter<K extends keyof LoanApplicationFilters>(key: K, value: LoanApplicationFilters[K]) {
    setPage(1);
    setFilters((previous) => ({
      ...previous,
      page: 1,
      [key]: value,
    }));
  }

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilter('search', searchDraft.trim() || undefined);
  }

  function clearFilters() {
    setSearchDraft('');
    setPage(1);
    setFilters({ page: 1, page_size: pageSize, ordering: '-created_at' });
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    setFilters((previous) => ({
      ...previous,
      page: nextPage,
      page_size: pageSize,
    }));
  }

  const hasFilters = Boolean(filters.search || filters.status || filters.identity_verification_status);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_36%),linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="rounded-4xl border border-slate-200 bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-200/40">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">CU-11 · Originación</div>
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Solicitudes de crédito</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Gestiona el ciclo completo de la originación: borradores, revisión, observaciones, aprobación y desembolso.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/credit-applications/new')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              <Plus className="h-4 w-4" />
              Nueva solicitud
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <MetricCard label="Total visible" value={String(count)} helper="Resultados filtrados" color="blue" />
          <MetricCard label="Borradores" value={String(metrics.draft)} helper="Pendientes de envío" color="slate" />
          <MetricCard label="En revisión" value={String(metrics.submitted)} helper="En ruta de decisión" color="amber" />
          <MetricCard label="Cerradas" value={String(metrics.approved + metrics.rejected)} helper="Aprobadas, desembolsadas o rechazadas" color="emerald" />
        </div>

        <SectionCard
          title="Filtros"
          subtitle="Filtra por estado, identidad y búsqueda libre para encontrar solicitudes rápidamente."
          action={
            <button
              type="button"
              onClick={loadApplications}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          }
        >
          <form onSubmit={applySearch} className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))_auto]">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Buscar</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Número de solicitud, cliente o producto"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Estado</span>
              <select
                value={filters.status || ''}
                onChange={(event) => updateFilter('status', (event.target.value || '') as LoanApplicationFilters['status'])}
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
                onChange={(event) =>
                  updateFilter(
                    'identity_verification_status',
                    (event.target.value || '') as LoanApplicationFilters['identity_verification_status']
                  )
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white"
              >
                <option value="">Todos</option>
                <option value="PENDING">Pendiente</option>
                <option value="IN_PROGRESS">En progreso</option>
                <option value="APPROVED">Aprobada</option>
                <option value="DECLINED">Rechazada</option>
                <option value="MANUAL_REVIEW">Revisión manual</option>
                <option value="EXPIRED">Expirada</option>
                <option value="ERROR">Error</option>
              </select>
            </label>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="inline-flex h-11.5 items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Filter className="h-4 w-4" />
                Filtrar
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-11.5 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Limpiar
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {hasFilters ? <Badge label="Filtros activos" color="blue" /> : <Badge label="Sin filtros" color="slate" />}
            <Badge label={`Página ${page}`} color="emerald" />
          </div>
        </SectionCard>

        {loading && items.length === 0 ? (
          <div className="rounded-4xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-500">Cargando solicitudes de crédito...</p>
          </div>
        ) : error && items.length === 0 ? (
          <div className="rounded-4xl border border-rose-200 bg-rose-50 p-10 text-center">
            <p className="text-sm font-medium text-rose-700">{error}</p>
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
            title="No hay solicitudes"
            description="No encontramos solicitudes con los filtros actuales. Prueba una búsqueda más amplia o crea una nueva solicitud."
            action={
              <button
                type="button"
                onClick={() => navigate('/credit-applications/new')}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Nueva solicitud
              </button>
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {items.map((application) => (
              <article
                key={application.id}
                className="group rounded-4xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{formatApplicationNumber(application.application_number)}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{application.application_number}</div>
                  </div>
                  <CreditApplicationStatusBadge status={application.status} label={application.status_display} />
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <span>Cliente</span>
                    <span className="font-medium text-slate-900">{application.client_name}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Producto</span>
                    <span className="font-medium text-slate-900">{application.product_name}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Monto</span>
                    <span className="font-medium text-slate-900">{formatCurrency(application.requested_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Plazo</span>
                    <span className="font-medium text-slate-900">{application.term_months} meses</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Identidad</span>
                    <IdentityStatusBadge
                      status={application.identity_verification_status}
                      label={application.identity_verification_status || 'N/D'}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Creada</span>
                    <span className="font-medium text-slate-900">{formatDateTime(application.created_at)}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <Link
                    to={`/loans/${application.id}/dossier`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition group-hover:text-blue-800"
                  >
                    Ver expediente
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => navigate(`/credit-applications/${application.id}/edit`)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Editar borrador
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

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
      </div>
    </div>
  );
}