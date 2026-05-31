import { useState } from 'react';
import { Shield, RotateCcw, Ban, HelpCircle, Check, X, Clock } from 'lucide-react';
import type { SupportRequest } from '../types/activeCredit.types';
import {
  approveSupportRequest,
  rejectSupportRequest,
  requestMoreInfo,
  startReview,
  formatDate,
} from '../services/activeCreditApi';

interface Props {
  request: SupportRequest;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SupportRequestReviewModal({ request, onClose, onSuccess }: Props) {
  const [action, setAction] = useState<'review' | 'approve' | 'reject' | 'moreInfo'>('review');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPending = request.status === 'PENDING';
  const isUnderReview = request.status === 'UNDER_REVIEW';

  async function handleStartReview() {
    setSubmitting(true);
    setError(null);
    try {
      await startReview(request.id);
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar revisión');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove() {
    setSubmitting(true);
    setError(null);
    try {
      await approveSupportRequest(request.id, comment);
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al aprobar');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!comment.trim()) {
      setError('Debe indicar el motivo de rechazo');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await rejectSupportRequest(request.id, comment);
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al rechazar');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMoreInfo() {
    if (!comment.trim()) {
      setError('Debe especificar qué información necesita');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await requestMoreInfo(request.id, comment);
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al solicitar información');
    } finally {
      setSubmitting(false);
    }
  }

  const statusColor =
    request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
    request.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' :
    request.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
    request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
    'bg-gray-100 text-gray-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {request.request_type === 'GRACE_PERIOD' ? (
              <Shield className="h-5 w-5 text-blue-600" />
            ) : (
              <RotateCcw className="h-5 w-5 text-purple-600" />
            )}
            <h3 className="text-lg font-semibold text-slate-800">Revisar Solicitud</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Details */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
              {request.status_display}
            </span>
            <span className="text-sm text-slate-500">{formatDate(request.created_at)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500 block">Tipo</span>
              <span className="font-medium text-slate-700">{request.request_type_display}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Cliente</span>
              <span className="font-medium text-slate-700">{request.client_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Crédito</span>
              <span className="font-medium text-slate-700">{request.credit_number}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Teléfono</span>
              <span className="font-medium text-slate-700">{request.contact_phone || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Meses solicitados</span>
              <span className="font-medium text-slate-700">{request.requested_months || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Motivo</span>
              <span className="font-medium text-slate-700">{request.reason_category_display}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-500 text-sm block mb-1">Descripción</span>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{request.description}</p>
          </div>

          {request.bank_response && (
            <div>
              <span className="text-slate-500 text-sm block mb-1">Respuesta del banco</span>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{request.bank_response}</p>
            </div>
          )}

          {request.approved_terms_snapshot && (
            <div>
              <span className="text-slate-500 text-sm block mb-1">Resultado de aprobación</span>
              <pre className="text-xs bg-slate-50 rounded-lg p-3 overflow-x-auto">
                {JSON.stringify(request.approved_terms_snapshot, null, 2)}
              </pre>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions - only for PENDING or UNDER_REVIEW */}
          {(isPending || isUnderReview) && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Acciones</p>

              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => setAction('review')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    action === 'review' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" /> En revisión
                </button>
                <button
                  onClick={() => setAction('approve')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    action === 'approve' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" /> Aprobar
                </button>
                <button
                  onClick={() => setAction('reject')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    action === 'reject' ? 'bg-red-50 border-red-300 text-red-700' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Ban className="h-3.5 w-3.5" /> Rechazar
                </button>
                <button
                  onClick={() => setAction('moreInfo')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    action === 'moreInfo' ? 'bg-purple-50 border-purple-300 text-purple-700' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <HelpCircle className="h-3.5 w-3.5" /> Pedir info
                </button>
              </div>

              {action !== 'review' && (
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm mb-3 resize-none"
                  placeholder={
                    action === 'approve' ? 'Comentario opcional...' :
                    action === 'reject' ? 'Motivo del rechazo *' :
                    '¿Qué información adicional necesitas? *'
                  }
                />
              )}

              <button
                onClick={
                  action === 'review' ? handleStartReview :
                  action === 'approve' ? handleApprove :
                  action === 'reject' ? handleReject :
                  handleMoreInfo
                }
                disabled={submitting}
                className={`w-full py-2.5 rounded-lg text-sm font-medium text-white ${
                  action === 'review' ? 'bg-blue-600 hover:bg-blue-700' :
                  action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-purple-600 hover:bg-purple-700'
                } disabled:opacity-50`}
              >
                {submitting ? 'Procesando...' :
                  action === 'review' ? 'Iniciar Revisión' :
                  action === 'approve' ? 'Aprobar Solicitud' :
                  action === 'reject' ? 'Rechazar Solicitud' :
                  'Solicitar Más Información'
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
