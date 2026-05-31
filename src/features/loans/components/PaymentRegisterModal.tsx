import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createPayment, confirmPayment, getActiveCreditSchedule, formatCurrency, formatDate } from '../services/activeCreditApi';
import type { Installment, CreatePaymentData } from '../types/activeCredit.types';
import { toast } from 'sonner';

interface Props {
  creditId: number;
  creditNumber: string;
  currencyId: number;
  currencyCode: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentRegisterModal({ creditId, creditNumber, currencyId, currencyCode, onClose, onSuccess }: Props) {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadInstallments();
  }, [creditId]);

  async function loadInstallments() {
    setLoading(true);
    try {
      const data = await getActiveCreditSchedule(creditId);
      setInstallments(data.filter((i: Installment) =>
        ['PENDING', 'PARTIAL', 'OVERDUE', 'IN_GRACE'].includes(i.status)
      ));
      if (data.length > 0) {
        const firstPending = data.find((i: Installment) =>
          ['PENDING', 'PARTIAL', 'OVERDUE'].includes(i.status)
        );
        if (firstPending) {
          setSelectedInstallment(firstPending.installment_number);
          const pending = parseFloat(firstPending.total_amount) - parseFloat(firstPending.paid_amount);
          setAmount(pending.toFixed(2));
        }
      }
    } catch {
      toast.error('Error al cargar cuotas');
    } finally {
      setLoading(false);
    }
  }

  function handleInstallmentChange(instNum: number) {
    setSelectedInstallment(instNum);
    const inst = installments.find((i) => i.installment_number === instNum);
    if (inst) {
      const pending = parseFloat(inst.total_amount) - parseFloat(inst.paid_amount);
      setAmount(pending.toFixed(2));
    }
  }

  async function handleSubmit() {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Ingrese un monto válido');
      return;
    }

    setSubmitting(true);
    try {
      const paymentData: CreatePaymentData = {
        active_credit: creditId,
        amount: parseFloat(amount),
        currency: currencyId,
        payment_date: paymentDate,
        channel: 'PRESENTIAL',
        method,
        reference_number: reference || `PRES-${creditNumber}`,
        notes,
      };

      const payment = await createPayment(paymentData);
      await confirmPayment(payment.id);

      toast.success(`Pago de ${formatCurrency(amount)} registrado exitosamente`);
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al registrar pago');
    } finally {
      setSubmitting(false);
    }
  }

  const selectedInst = installments.find((i) => i.installment_number === selectedInstallment);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Registrar Pago — {creditNumber}</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {/* Cuota */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cuota a pagar</label>
                <select
                  value={selectedInstallment || ''}
                  onChange={(e) => handleInstallmentChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  {installments.map((inst) => (
                    <option key={inst.id} value={inst.installment_number}>
                      Cuota #{inst.installment_number} — {formatDate(inst.due_date)} — Pendiente: {formatCurrency(parseFloat(inst.total_amount) - parseFloat(inst.paid_amount))}
                    </option>
                  ))}
                </select>
              </div>

              {selectedInst && (
                <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monto esperado:</span>
                    <span className="font-medium">{formatCurrency(selectedInst.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ya pagado:</span>
                    <span className="text-emerald-600">{formatCurrency(selectedInst.paid_amount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1">
                    <span className="text-slate-500">Pendiente:</span>
                    <span className="font-bold text-slate-700">{formatCurrency(parseFloat(selectedInst.total_amount) - parseFloat(selectedInst.paid_amount))}</span>
                  </div>
                </div>
              )}

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monto recibido ({currencyCode})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                  placeholder="0.00"
                />
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de pago</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              {/* Método */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Método de pago</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="CASH">Efectivo</option>
                  <option value="TRANSFER">Transferencia Bancaria</option>
                  <option value="QR">QR</option>
                  <option value="DEPOSIT">Depósito</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>

              {/* Referencia */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número de comprobante</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="N° comprobante o recibo"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observación</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notas opcionales sobre este pago"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loading || !amount || parseFloat(amount) <= 0}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar Pago
          </button>
        </div>
      </div>
    </div>
  );
}
