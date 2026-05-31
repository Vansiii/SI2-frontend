import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Filter, RefreshCw, Search, Receipt } from 'lucide-react';
import {
  getActiveCredits,
  getStatusColor,
  formatCurrency,
  formatDate,
} from '../services/activeCreditApi';
import type {
  ActiveCreditFilters,
  ActiveCreditListItem,
} from '../types/activeCredit.types';

export default function ActiveCreditListPage() {
  const [items, setItems] = useState<ActiveCreditListItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [searchDraft, setSearchDraft] = useState('');
  const [filters, setFilters] = useState<ActiveCreditFilters>({
    page: 1,
    page_size: pageSize,
    ordering: '-created_at',
  });

  useEffect(() => {
    loadCredits();
  }, [filters]);

  async function loadCredits() {
    setLoading(true);
    setError(null);
    try {
      const response = await getActiveCredits(filters);
      setItems(response.results || []);
      setCount(response.count || 0);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Error al cargar créditos activos');
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => {
    const active = items.filter((i) => i.status === 'ACTIVE').length;
    const inArrears = items.filter((i) => i.status === 'IN_ARREARS').length;
    const restructured = items.filter((i) => i.status === 'RESTRUCTURED' || i.status === 'IN_GRACE_PERIOD').length;
    const cancelled = items.filter((i) => i.status === 'CANCELLED').length;
    return { active, inArrears, restructured, cancelled };
  }, [items]);

  const canGoNext = page * pageSize < count;

  function updateFilter<K extends keyof ActiveCreditFilters>(key: K, value: ActiveCreditFilters[K]) {
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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 mb-3">{error}</p>
          <button onClick={loadCredits} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Créditos Activos</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de créditos desembolsados y su ciclo de vida</p>
        </div>
        <button
          onClick={loadCredits}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Al Día', value: metrics.active, color: 'emerald' },
          { label: 'En Mora', value: metrics.inArrears, color: 'red' },
          { label: 'Reestructurados', value: metrics.restructured, color: 'purple' },
          { label: 'Cancelados', value: metrics.cancelled, color: 'gray' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">{m.label}</p>
            <p className={`text-2xl font-bold text-${m.color}-600`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={applySearch} className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Buscar por código, cliente..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              Buscar
            </button>
          </form>

          <Filter className="h-4 w-4 text-slate-400" />

          <select
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', (e.target.value as ActiveCreditFilters['status']) || undefined)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Al Día</option>
            <option value="IN_ARREARS">En Mora</option>
            <option value="IN_GRACE_PERIOD">En Gracia</option>
            <option value="RESTRUCTURED">Reestructurado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>

          <button onClick={clearFilters} className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800">
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Cargando créditos activos...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No se encontraron créditos activos.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Código</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Cliente</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Producto</th>
                    <th className="text-right px-4 py-3 text-slate-600 font-medium">Monto</th>
                    <th className="text-right px-4 py-3 text-slate-600 font-medium">Saldo</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Próx. Vencimiento</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Frecuencia</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Amortización</th>
                    <th className="text-center px-4 py-3 text-slate-600 font-medium">Estado</th>
                    <th className="text-center px-4 py-3 text-slate-600 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-700">{item.credit_number}</td>
                      <td className="px-4 py-3 text-slate-600">{item.client_name}</td>
                      <td className="px-4 py-3 text-slate-600">{item.product_name}</td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatCurrency(item.approved_amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700 font-medium">
                        {formatCurrency(item.current_balance)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(item.next_due_date)}</td>
                      <td className="px-4 py-3 text-slate-600">{item.payment_frequency_name}</td>
                      <td className="px-4 py-3 text-slate-600">{item.amortization_system_name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {item.status_display}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/active-credits/${item.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100"
                          >
                            Detalle <ArrowRight className="h-3 w-3" />
                          </Link>
                          <Link
                            to={`/active-credits/${item.id}?tab=register-payment`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100"
                          >
                            <Receipt className="h-3 w-3" /> Pago
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm">
              <span className="text-slate-500">{count} créditos encontrados</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => { setPage(page - 1); updateFilter('page', page - 1); }}
                  className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-white"
                >
                  Anterior
                </button>
                <span className="text-slate-600">Página {page}</span>
                <button
                  disabled={!canGoNext}
                  onClick={() => { setPage(page + 1); updateFilter('page', page + 1); }}
                  className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-white"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
