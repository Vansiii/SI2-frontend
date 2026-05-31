import { useState, useEffect } from 'react';
import { X, Receipt, Download, ExternalLink, Calendar, CreditCard, Hash, User, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { getPayment, formatCurrency, formatDate, getPaymentStatusColor } from '../services/activeCreditApi';
import type { PaymentDetail } from '../types/activeCredit.types';

interface Props {
  paymentId: number;
  onClose: () => void;
}

export default function PaymentDetailModal({ paymentId, onClose }: Props) {
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  async function loadPayment() {
    setLoading(true);
    setError(null);
    try {
      const data = await getPayment(paymentId);
      setPayment(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar el pago');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 text-center text-slate-400">
          Cargando detalle del pago...
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
          <p className="text-red-600">{error || 'Pago no encontrado'}</p>
          <button onClick={onClose} className="mt-4 text-blue-600 hover:underline text-sm">Cerrar</button>
        </div>
      </div>
    );
  }

  const hasInvoice = !!(payment.invoice_url || payment.invoice_pdf_url);
  const isStripePayment = payment.provider === 'STRIPE' || payment.channel === 'ONLINE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-slate-800">Detalle del Pago</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Status + Amount */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
              {payment.status === 'CONFIRMED' ? <CheckCircle2 size={13} /> :
               payment.status === 'PENDING_CONFIRMATION' ? <Clock size={13} /> :
               <AlertCircle size={13} />}
              {payment.status_display}
            </span>
            <span className="text-2xl font-bold text-slate-800">{formatCurrency(payment.amount)}</span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Calendar size={12} /> Fecha
              </div>
              <div className="font-medium text-slate-700">{formatDate(payment.payment_date)}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <CreditCard size={12} /> Canal
              </div>
              <div className="font-medium text-slate-700">{payment.channel_display}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <CreditCard size={12} /> Método
              </div>
              <div className="font-medium text-slate-700">{payment.method_display || payment.method}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Hash size={12} /> Comprobante
              </div>
              <div className="font-medium text-slate-700">{payment.reference_number || '—'}</div>
            </div>
          </div>

          {/* Registered / Confirmed by */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <User size={12} /> Registrado por
              </div>
              <div className="font-medium text-slate-700">{payment.registered_by_name || '—'}</div>
            </div>
            {payment.confirmed_by_name && (
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <CheckCircle2 size={12} /> Confirmado por
                </div>
                <div className="font-medium text-slate-700">{payment.confirmed_by_name}</div>
              </div>
            )}
          </div>

          {/* Invoice Buttons */}
          {hasInvoice && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Factura</div>
              <div className="flex gap-2">
                {payment.invoice_url && (
                  <a
                    href={payment.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <ExternalLink size={15} />
                    Ver Factura
                  </a>
                )}
                {payment.invoice_pdf_url && (
                  <a
                    href={payment.invoice_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium"
                  >
                    <Download size={15} />
                    Descargar PDF
                  </a>
                )}
              </div>
              {payment.invoice_number && (
                <p className="text-xs text-slate-400 text-center">
                  Factura {payment.invoice_number}
                </p>
              )}
            </div>
          )}

          {/* Stripe hint for online payments without invoice yet */}
          {isStripePayment && !hasInvoice && payment.status === 'PENDING_CONFIRMATION' && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-xs text-yellow-700 flex items-center gap-2">
              <AlertCircle size={14} />
              La factura estará disponible cuando el pago sea confirmado.
            </div>
          )}

          {/* Allocations */}
          {payment.allocations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Receipt size={14} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Aplicación del Pago</span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-500 font-medium">Cuota</th>
                      <th className="px-3 py-2 text-right text-slate-500 font-medium">Capital</th>
                      <th className="px-3 py-2 text-right text-slate-500 font-medium">Interés</th>
                      <th className="px-3 py-2 text-right text-slate-500 font-medium">Otros</th>
                      <th className="px-3 py-2 text-right text-slate-500 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payment.allocations.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-medium text-slate-700">#{a.installment_number}</td>
                        <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(a.principal_covered)}</td>
                        <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(a.interest_covered)}</td>
                        <td className="px-3 py-2 text-right text-slate-600">
                          {formatCurrency(parseFloat(a.insurance_covered) + parseFloat(a.fee_covered) + parseFloat(a.penalty_covered))}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-slate-700">{formatCurrency(a.amount_applied)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {payment.notes && (
            <div className="bg-slate-50 rounded-xl p-3 text-sm">
              <div className="text-xs text-slate-400 mb-1">Notas</div>
              <div className="text-slate-600">{payment.notes}</div>
            </div>
          )}

          {/* Provider info */}
          {payment.provider && (
            <div className="text-center text-xs text-slate-400">
              Procesado por {payment.provider}
              {payment.provider_payment_id && <> · ID: {payment.provider_payment_id}</>}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
