import { useEffect, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import {
  getPayments,
  getPaymentStatusColor,
  formatCurrency,
  formatDate,
} from '../services/activeCreditApi';
import type { PaymentListItem } from '../types/activeCredit.types';
import { Link } from 'react-router-dom';
import PaymentDetailModal from '../components/PaymentDetailModal';

export default function PaymentHistoryPage() {
  const [items, setItems] = useState<PaymentListItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

  useEffect(() => {
    loadPayments();
  }, [page, statusFilter, channelFilter]);

  async function loadPayments() {
    setLoading(true);
    try {
      const response = await getPayments({
        page,
        status: statusFilter || undefined,
        channel: channelFilter || undefined,
      });
      setItems(response.results || []);
      setCount(response.count || 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Historial de Pagos</h1>
          <p className="text-sm text-slate-500 mt-1">Registro de todos los pagos procesados</p>
        </div>
        <button onClick={loadPayments} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-sm">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por crédito, referencia..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
          <option value="">Todos los estados</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="PENDING_CONFIRMATION">Pendiente</option>
          <option value="REVERSED">Reversado</option>
          <option value="FAILED">Fallido</option>
        </select>
        <select value={channelFilter} onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
          <option value="">Todos los canales</option>
          <option value="PRESENTIAL">Presencial</option>
          <option value="ONLINE">En Línea</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Cargando pagos...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No se encontraron pagos</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Fecha</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Crédito</th>
                    <th className="text-right px-4 py-3 text-slate-600 font-medium">Monto</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Canal</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Método</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Comprobante</th>
                    <th className="text-center px-4 py-3 text-slate-600 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Registrado por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPaymentId(p.id)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-600">{formatDate(p.payment_date)}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/active-credits/${p.active_credit}`}
                          className="text-blue-600 hover:underline font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {p.credit_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700 font-medium">
                        {formatCurrency(p.amount)} {p.currency_code}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.channel_display}</td>
                      <td className="px-4 py-3 text-slate-600">{p.method_display || p.method}</td>
                      <td className="px-4 py-3 text-slate-600">{p.reference_number}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(p.status)}`}>
                          {p.status_display}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.registered_by_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t text-sm">
              <span className="text-slate-500">{count} pagos encontrados</span>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                  className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-40">
                  Anterior
                </button>
                <span className="text-slate-600">Página {page}</span>
                <button disabled={page * 12 >= count} onClick={() => setPage(page + 1)}
                  className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-40">
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedPaymentId && (
        <PaymentDetailModal
          paymentId={selectedPaymentId}
          onClose={() => setSelectedPaymentId(null)}
        />
      )}
    </div>
  );
}
