import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Plus, Filter, RefreshCw, Users } from 'lucide-react';
import { LoadingState } from '../../../components/ui/LoadingState';
import { useAuth } from '../../auth/hooks/useAuth';
import { getCollaterals } from '../services/garantiasApi';
import type { CollateralFilters, CollateralListItem, PaginatedResponse } from '../types';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  RELEASED: 'Liberado',
};

const TYPE_LABELS: Record<string, string> = {
  REAL_ESTATE: 'Inmueble',
  VEHICLE: 'Vehiculo',
  MACHINERY: 'Maquinaria',
  SAVINGS: 'Ahorros',
  GUARANTOR: 'Garante',
  OTHER: 'Otro',
};

const PAGE_SIZE = 20;

function formatCurrency(value?: string | null) {
  if (!value) return '-';
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return value;
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(parsed);
}

export function CollateralListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [items, setItems] = useState<CollateralListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<CollateralFilters>({
    page: 1,
    page_size: PAGE_SIZE,
  });
  const [loanApplicationInput, setLoanApplicationInput] = useState('');

  const canCreate = hasPermission('collaterals.create');
  const canEdit = hasPermission('collaterals.edit');

  useEffect(() => {
    loadCollaterals();
  }, [filters]);

  async function loadCollaterals() {
    setLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<CollateralListItem> = await getCollaterals(filters);
      setItems(response.results || []);
      setTotalPages(response.total_pages || Math.ceil((response.count || 0) / PAGE_SIZE) || 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar las garantias');
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    const parsedLoan = loanApplicationInput ? Number(loanApplicationInput) : '';
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      page: 1,
      loan_application: Number.isFinite(parsedLoan) ? parsedLoan : '',
    }));
  }

  function handleFilterChange(key: keyof CollateralFilters, value: CollateralFilters[keyof CollateralFilters]) {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      page: 1,
      [key]: value,
    }));
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    setFilters((prev) => ({
      ...prev,
      page: nextPage,
    }));
  }

  const canGoNext = useMemo(() => page < totalPages, [page, totalPages]);

  if (loading) {
    return <LoadingState message="Cargando garantias..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            Panel de Garantias
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Controla garantias, documentos y valuaciones por solicitud.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => navigate('/garantias/guarantors')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
          >
            <Users className="h-4 w-4" />
            Ver garantes
          </button>
          {canCreate && (
            <button
              onClick={() => navigate('/garantias/new')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Nueva garantia
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-700 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <label className="block text-sm text-slate-600">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Estado</span>
            <select
              value={filters.status || ''}
              onChange={(event) => handleFilterChange('status', event.target.value as CollateralFilters['status'])}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendiente</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
              <option value="RELEASED">Liberado</option>
            </select>
          </label>

          <label className="block text-sm text-slate-600">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Tipo</span>
            <select
              value={filters.collateral_type || ''}
              onChange={(event) => handleFilterChange('collateral_type', event.target.value as CollateralFilters['collateral_type'])}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="REAL_ESTATE">Inmueble</option>
              <option value="VEHICLE">Vehiculo</option>
              <option value="MACHINERY">Maquinaria</option>
              <option value="SAVINGS">Ahorros</option>
              <option value="GUARANTOR">Garante</option>
              <option value="OTHER">Otro</option>
            </select>
          </label>

          <label className="block text-sm text-slate-600">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Solicitud</span>
            <input
              value={loanApplicationInput}
              onChange={(event) => setLoanApplicationInput(event.target.value)}
              placeholder="ID solicitud"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              <Filter className="h-4 w-4" />
              Filtrar
            </button>
            <button
              type="button"
              onClick={loadCollaterals}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Solicitud</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Tipo</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Valor</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Cobertura</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Estado</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No hay garantias registradas con los filtros actuales.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">
                    {item.loan_application_number || `#${item.loan_application}`}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {item.collateral_type_display || TYPE_LABELS[item.collateral_type]}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatCurrency(item.appraised_value || item.estimated_value)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {item.coverage_percentage ? `${item.coverage_percentage}%` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                      {item.status_display || STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/garantias/${item.id}`)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Ver
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => navigate(`/garantias/${item.id}/edit`)}
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <span>Pagina {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={!canGoNext}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
