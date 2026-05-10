import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { 
  FileText, 
  Upload, 
  Download, 
  AlertCircle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { LoanApplicationDocumentRequirement } from '../types/document.types';

interface DocumentCardProps {
  document: LoanApplicationDocumentRequirement;
  onUpload?: (documentId: number) => void;
  onDownload?: (signedUrl: string) => void;
  onReview?: (documentId: number) => void;
  showActions?: boolean;
  className?: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onUpload,
  onDownload,
  onReview,
  showActions = true,
  className = '',
}) => {
  const getStatusIcon = () => {
    switch (document.status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'UNDER_REVIEW':
        return <Eye className="h-5 w-5 text-yellow-500" />;
      case 'UPLOADED':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Upload className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canUpload = document.status === 'PENDING' || document.status === 'REJECTED';
  const canDownload = document.file_resource_detail && document.signed_url;
  const canReview = document.status === 'UPLOADED' || document.status === 'UNDER_REVIEW';

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icono de estado */}
          <div className="flex-shrink-0 mt-1">
            {getStatusIcon()}
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {document.document_name}
                </h4>
                {document.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {document.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {document.is_mandatory && (
                  <Badge variant="warning" size="sm">
                    Obligatorio
                  </Badge>
                )}
                <DocumentStatusBadge status={document.status} size="sm" />
              </div>
            </div>

            {/* Información del archivo */}
            {document.file_resource_detail && (
              <div className="mb-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {document.file_resource_detail.original_filename}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>
                    {formatFileSize(document.file_resource_detail.file_size)}
                  </span>
                  <span>
                    {document.file_resource_detail.mime_type}
                  </span>
                  {document.uploaded_at && (
                    <span>
                      Cargado: {format(new Date(document.uploaded_at), "d 'de' MMM, yyyy", { locale: es })}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Información de revisión */}
            {document.reviewed_at && (
              <div className="mb-3 text-sm text-gray-600">
                <p>
                  Revisado por {document.reviewed_by_name} el{' '}
                  {format(new Date(document.reviewed_at), "d 'de' MMMM, yyyy 'a las' HH:mm", {
                    locale: es,
                  })}
                </p>
              </div>
            )}

            {/* Motivo de rechazo */}
            {document.status === 'REJECTED' && document.rejection_reason && (
              <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-900 mb-1">
                      Motivo de rechazo:
                    </p>
                    <p className="text-sm text-red-800">
                      {document.rejection_reason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notas */}
            {document.notes && (
              <div className="mb-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">Nota:</span> {document.notes}
                </p>
              </div>
            )}

            {/* Formatos permitidos */}
            <div className="text-xs text-gray-500 mb-3">
              Formatos permitidos: {document.allowed_formats.join(', ')} • 
              Tamaño máximo: {document.max_file_size_mb} MB
            </div>

            {/* Acciones */}
            {showActions && (
              <div className="flex items-center gap-2">
                {canUpload && onUpload && (
                  <button
                    onClick={() => onUpload(document.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                    style={{
                      backgroundColor: 'var(--tenant-primary, #2563EB)',
                      color: 'var(--tenant-on-primary, #FFFFFF)',
                    }}
                  >
                    <Upload className="h-4 w-4" />
                    {document.status === 'REJECTED' ? 'Volver a cargar' : 'Cargar documento'}
                  </button>
                )}

                {canDownload && onDownload && (
                  <button
                    onClick={() => onDownload(document.signed_url!)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 hover:shadow-md"
                    style={{
                      borderColor: 'var(--tenant-primary, #2563EB)',
                      color: 'var(--tenant-primary, #2563EB)',
                      backgroundColor: 'var(--tenant-primary-soft, rgba(37, 99, 235, 0.12))',
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Descargar
                  </button>
                )}

                {canReview && onReview && (
                  <button
                    onClick={() => onReview(document.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 hover:shadow-md"
                    style={{
                      borderColor: 'var(--tenant-primary, #2563EB)',
                      color: 'var(--tenant-primary, #2563EB)',
                      backgroundColor: 'var(--tenant-primary-soft, rgba(37, 99, 235, 0.12))',
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    Revisar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
