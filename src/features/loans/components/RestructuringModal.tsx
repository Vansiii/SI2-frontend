import { useState } from 'react';
import { X, Loader2, RotateCcw, ChevronRight } from 'lucide-react';
import { restructureCredit, formatCurrency } from '../services/activeCreditApi';
import type { RestructuringData, RestructuringPreview } from '../types/activeCredit.types';
import { toast } from 'sonner';

interface Props {
  creditId: number;
  creditNumber: string;
  currentRate: number;
  currentTerm: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RestructuringModal({ creditId, creditNumber, currentRate, currentTerm, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<'form' | 'preview' | 'confirming'>('form');
  const [newRate, setNewRate] = useState(currentRate.toString());
  const [newTerm, setNewTerm] = useState(currentTerm.toString());
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<RestructuringPreview | null>(null);

  async function handlePreview() {
    if (!reason.trim()) {
      toast.error('Indique el motivo de la reestructuración');
      return;
    }

    setSubmitting(true);
    try {
      const data: RestructuringData = {
        new_term_periods: parseInt(newTerm) || undefined,
        new_interest_rate: parseFloat(newRate) || undefined,
        reason,
        preview: true,
      };
      const result = await restructureCredit(creditId, data);
      setPreview(result);
      setStep('preview');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al simular reestructuración');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirm() {
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      const data: RestructuringData = {
        new_term_periods: parseInt(newTerm) || undefined,
        new_interest_rate: parseFloat(newRate) || undefined,
        reason,
        preview: false,
      };
      await restructureCredit(creditId, data);
      toast.success('Crédito reestructurado exitosamente');
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al reestructurar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-slate-800">Reestructurar Crédito — {creditNumber}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {step === 'form' && (
            <>
              <p className="text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                La reestructuración modificará las condiciones del crédito. Las cuotas ya pagadas no se alteran.
                Se generará un nuevo cronograma para el saldo pendiente.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nueva tasa de interés anual (%)
                  </label>
                  <input type="number" step="0.01" min="0" value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                  <p className="text-xs text-slate-400 mt-1">Actual: {currentRate}%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nuevo plazo (cuotas)
                  </label>
                  <input type="number" min="1" value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                  <p className="text-xs text-slate-400 mt-1">Actual: {currentTerm} cuotas</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de la reestructuración</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
                  placeholder="Explique el motivo..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
            </>
          )}

          {step === 'preview' && preview && (
            <>
              <h3 className="text-sm font-semibold text-slate-700">Comparación de condiciones</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-600">Concepto</th>
                      <th className="px-3 py-2 text-left text-slate-600">Actual</th>
                      <th className="px-3 py-2 text-center text-slate-600"></th>
                      <th className="px-3 py-2 text-left text-slate-600">Propuesto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.comparison?.map((c) => (
                      <tr key={c.field} className={c.changed ? 'bg-amber-50' : ''}>
                        <td className="px-3 py-2 font-medium text-slate-700">{c.label}</td>
                        <td className="px-3 py-2 text-slate-500">{c.current}</td>
                        <td className="px-3 py-2 text-center">
                          <ChevronRight className="h-4 w-4 text-slate-300 inline" />
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-700">{c.proposed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {preview.preview_schedule && preview.preview_schedule.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Nuevo cronograma (primeras 5 cuotas)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-2 py-1 text-left text-slate-600">#</th>
                          <th className="px-2 py-1 text-right text-slate-600">Capital</th>
                          <th className="px-2 py-1 text-right text-slate-600">Interés</th>
                          <th className="px-2 py-1 text-right text-slate-600">Total</th>
                          <th className="px-2 py-1 text-right text-slate-600">Saldo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {preview.preview_schedule.slice(0, 5).map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td className="px-2 py-1">{item.period}</td>
                            <td className="px-2 py-1 text-right">{formatCurrency(item.principal_amount)}</td>
                            <td className="px-2 py-1 text-right">{formatCurrency(item.interest_amount)}</td>
                            <td className="px-2 py-1 text-right font-medium">{formatCurrency(item.total_amount)}</td>
                            <td className="px-2 py-1 text-right">{formatCurrency(item.closing_balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <strong>Importante:</strong> Al confirmar, las cuotas pendientes se marcarán como reprogramadas y se
                generará un nuevo cronograma. Esta acción no se puede deshacer.
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200">
          {step === 'preview' && (
            <button onClick={() => setStep('form')}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
              Ajustar parámetros
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
            Cancelar
          </button>
          {step === 'form' && (
            <button onClick={handlePreview} disabled={submitting || !reason.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Simular
            </button>
          )}
          {step === 'preview' && (
            <button onClick={handleConfirm} disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar Reestructuración
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
