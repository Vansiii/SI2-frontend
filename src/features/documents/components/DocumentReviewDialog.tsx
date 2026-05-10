import React, { useState } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { Badge } from '../../../components/ui/Badge';
import { useReviewDocument } from '../hooks/useDocuments';
import { CheckCircle, XCircle, AlertCircle, X, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { LoanApplicationDocumentRequirement } from '../types/document.types';

interface DocumentReviewDialogProps {
  open: boolean;
  onClose: () => void;
  document: LoanApplicationDocumentRequirement;
  onReviewSuccess: () => void;
}

export const DocumentReviewDialog: React.FC<DocumentReviewDialogProps> = ({
  open,
  onClose,
  document,
  onReviewSuccess,
}) => {
  const [action, setAction] = useState<'APPROVED' | 'REJECTED' | 'REQUESTED_REUPLOAD' | null>(null);
  const [comments, setComments] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const reviewMutation = useReviewDocument();

  const handleReview = async () => {
    if (!action) {
      setValidationError('Debes seleccionar una acción');
      return;
    }

    if ((action === 'REJECTED' || action === 'REQUESTED_REUPLOAD') && !comments.trim()) {
      setValidationError('Los comentarios son obligatorios para rechazos o solicitudes de re-carga');
      return;
    }

    try {
      await reviewMutation.mutateAsync({
        id: document.id,
        review: {
          action,
          comments: comments.trim() || undefined,
        },
      });
      onReviewSuccess();
    } catch (error) {
      // El error ya se maneja en el hook con toast
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    if (document.signed_url) {
      window.open(document.signed_url, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Revisar Documento
              </h2>
              <p className="text-sm text-gray-600">
                {document.document_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* Información del documento */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Información del Documento
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-sm text-gray-600 w-32 flex-shrink-0">Tipo:</span>
                <span className="text-sm font-medium text-gray-900">{document.document_type}</span>
              </div>
              
              {document.description && (
                <div className="flex items-start gap-2">
                  <span className="text-sm text-gray-600 w-32 flex-shrink-0">Descripción:</span>
                  <span className="text-sm text-gray-900">{document.description}</span>
                </div>
              )}
              
              <div className="flex items-start gap-2">
                <span className="text-sm text-gray-600 w-32 flex-shrink-0">Obligatorio:</span>
                {document.is_mandatory ? (
                  <Badge variant="warning" size="sm">Sí</Badge>
                ) : (
                  <Badge variant="secondary" size="sm">No</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Archivo cargado */}
          {document.file_resource_detail && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Archivo Cargado
              </h3>
              
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">
                        {document.file_resource_detail.original_filename}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>{formatFileSize(document.file_resource_detail.file_size)}</span>
                        <span>{document.file_resource_detail.mime_type}</span>
                      </div>
                      {document.uploaded_at && (
                        <p className="text-xs text-gray-600 mt-1">
                          Cargado el {format(new Date(document.uploaded_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                        </p>
                      )}
                      {document.uploaded_by_name && (
                        <p className="text-xs text-gray-600">
                          Por: {document.uploaded_by_name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleDownload}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 hover:shadow-md"
                    style={{
                      borderColor: 'var(--tenant-primary, #2563EB)',
                      color: 'var(--tenant-primary, #2563EB)',
                      backgroundColor: 'var(--tenant-primary-soft, rgba(37, 99, 235, 0.12))',
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Historial de revisiones */}
          {document.review_history && document.review_history.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Historial de Revisiones
              </h3>
              
              <div className="space-y-2">
                {document.review_history.map((review) => (
                  <div key={review.id} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {review.action === 'APPROVED' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {review.action === 'REJECTED' && (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        {review.action === 'REQUESTED_REUPLOAD' && (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {review.action === 'APPROVED' && 'Aprobado'}
                          {review.action === 'REJECTED' && 'Rechazado'}
                          {review.action === 'REQUESTED_REUPLOAD' && 'Solicitó Re-carga'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(review.created_at), "d/MM/yyyy HH:mm", { locale: es })}
                      </span>
                    </div>
                    {review.comments && (
                      <p className="text-sm text-gray-700 mt-1">{review.comments}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Por: {review.reviewed_by_name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acción de revisión */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Acción de Revisión
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => setAction('APPROVED')}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${action === 'APPROVED'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                  }
                `}
              >
                <CheckCircle className={`h-6 w-6 mx-auto mb-2 ${action === 'APPROVED' ? 'text-green-600' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${action === 'APPROVED' ? 'text-green-900' : 'text-gray-700'}`}>
                  Aprobar
                </p>
              </button>

              <button
                onClick={() => setAction('REJECTED')}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${action === 'REJECTED'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                  }
                `}
              >
                <XCircle className={`h-6 w-6 mx-auto mb-2 ${action === 'REJECTED' ? 'text-red-600' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${action === 'REJECTED' ? 'text-red-900' : 'text-gray-700'}`}>
                  Rechazar
                </p>
              </button>

              <button
                onClick={() => setAction('REQUESTED_REUPLOAD')}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${action === 'REQUESTED_REUPLOAD'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-yellow-300'
                  }
                `}
              >
                <AlertCircle className={`h-6 w-6 mx-auto mb-2 ${action === 'REQUESTED_REUPLOAD' ? 'text-yellow-600' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${action === 'REQUESTED_REUPLOAD' ? 'text-yellow-900' : 'text-gray-700'}`}>
                  Solicitar Re-carga
                </p>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios
                {(action === 'REJECTED' || action === 'REQUESTED_REUPLOAD') && (
                  <span className="text-red-600 ml-1">*</span>
                )}
              </label>
              <textarea
                value={comments}
                onChange={(e) => {
                  setComments(e.target.value);
                  setValidationError(null);
                }}
                rows={4}
                placeholder="Escribe tus comentarios sobre la revisión..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Error de validación */}
          {validationError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{validationError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg sticky bottom-0">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={reviewMutation.isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleReview}
              disabled={!action || reviewMutation.isPending}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--tenant-primary, #2563EB)',
                color: 'var(--tenant-on-primary, #FFFFFF)',
              }}
            >
              {reviewMutation.isPending ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Procesando...
                </>
              ) : (
                'Confirmar Revisión'
              )}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
