import { useState } from 'react';
import { X, Loader2, ShieldCheck } from 'lucide-react';
import { applyGracePeriod } from '../services/activeCreditApi';
import type { ApplyGracePeriodData, GraceType } from '../types/activeCredit.types';
import { toast } from 'sonner';

interface Props {
  creditId: number;
  creditNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

const GRACE_TYPES: { value: GraceType; label: string; desc: string }[] = [
  { value: 'FULL_GRACE', label: 'Gracia Total', desc: 'No se cobra capital ni interés durante el período' },
  { value: 'INTEREST_ONLY', label: 'Solo Intereses', desc: 'Solo se pagan intereses, capital se recalcula' },
  { value: 'PARTIAL_PAYMENT', label: 'Pago Parcial', desc: 'Pago reducido, la diferencia se capitaliza' },
];

export default function GracePeriodModal({ creditId, creditNumber, onClose, onSuccess }: Props) {
  const [graceType, setGraceType] = useState<GraceType>('FULL_GRACE');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!endDate) {
      toast.error('Seleccione una fecha de fin');
      return;
    }
    if (!reason.trim()) {
      toast.error('Indique el motivo del período de gracia');
      return;
    }

    setSubmitting(true);
    try {
      const data: ApplyGracePeriodData = { grace_type: graceType, start_date: startDate, end_date: endDate, reason };
      await applyGracePeriod(creditId, data);
      toast.success('Período de gracia aplicado exitosamente');
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al aplicar período de gracia');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">Período de Gracia — {creditNumber}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="max-h-[calc(90vh-152px)] overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Gracia</label>
            <div className="space-y-2">
              {GRACE_TYPES.map((gt) => (
                <label key={gt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  graceType === gt.value ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <input type="radio" name="grace_type" value={gt.value} checked={graceType === gt.value}
                    onChange={() => setGraceType(gt.value)} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{gt.label}</p>
                    <p className="text-xs text-slate-500">{gt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha inicio</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha fin</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              placeholder="Explique el motivo del período de gracia..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>

          {/* Impacto estimado */}
          {startDate && endDate && startDate < endDate && (
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
              <p className="font-medium mb-1">Impacto estimado:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>Duración: {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} días</li>
                <li>Cuotas afectadas: Las cuotas en este rango pasarán a estado IN_GRACE</li>
                {graceType === 'FULL_GRACE' && <li>Fechas de cuotas posteriores se desplazarán</li>}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancelar</button>
          <button onClick={handleSubmit} disabled={submitting || !endDate || !reason.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Aplicar Gracia
          </button>
        </div>
      </div>
    </div>
  );
}
