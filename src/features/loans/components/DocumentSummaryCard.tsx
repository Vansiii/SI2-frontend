import React from 'react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { DocumentSummary } from '../types/timeline.types';

interface DocumentSummaryCardProps {
  summary: DocumentSummary;
  className?: string;
}

export const DocumentSummaryCard: React.FC<DocumentSummaryCardProps> = ({
  summary,
  className = '',
}) => {
  const getCompletionColor = () => {
    if (summary.completion_percentage === 100) return 'text-green-600';
    if (summary.completion_percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = () => {
    if (summary.completion_percentage === 100) return 'bg-green-500';
    if (summary.completion_percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Documentos</h3>
          </div>
          
          {summary.is_complete ? (
            <Badge variant="success" size="sm">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Completo
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              Pendiente
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Barra de progreso */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progreso</span>
            <span className={`text-sm font-bold ${getCompletionColor()}`}>
              {summary.completion_percentage}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor()}`}
              style={{ width: `${summary.completion_percentage}%` }}
            />
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
            <FileText className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-sm font-semibold text-gray-900">
                {summary.total_documents}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-green-700">Aprobados</p>
              <p className="text-sm font-semibold text-green-900">
                {summary.approved_documents}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <div>
              <p className="text-xs text-yellow-700">Pendientes</p>
              <p className="text-sm font-semibold text-yellow-900">
                {summary.pending_documents}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-xs text-red-700">Rechazados</p>
              <p className="text-sm font-semibold text-red-900">
                {summary.rejected_documents}
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje de estado */}
        {!summary.is_complete && summary.mandatory_documents > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-800">
                Faltan {summary.mandatory_documents - summary.uploaded_documents} documentos obligatorios por cargar
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
