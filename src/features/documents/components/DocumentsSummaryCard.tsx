import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { useMyDocuments } from '../hooks/useDocuments';
import type { LoanApplicationDocumentRequirement } from '../types/document.types';

interface DocumentsSummaryCardProps {
  applicationId: number;
  className?: string;
}

export const DocumentsSummaryCard: React.FC<DocumentsSummaryCardProps> = ({
  applicationId,
  className = '',
}) => {
  const navigate = useNavigate();
  const { data: documents, isLoading } = useMyDocuments(applicationId);

  if (isLoading) {
    return (
      <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <span className="text-sm text-slate-600">Cargando documentos...</span>
        </div>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-400" />
            <h3 className="font-semibold text-slate-900">Documentos</h3>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          No hay documentos requeridos para esta solicitud.
        </p>
      </div>
    );
  }

  // Calcular estadísticas
  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'PENDING').length,
    uploaded: documents.filter(d => d.status === 'UPLOADED' || d.status === 'UNDER_REVIEW').length,
    approved: documents.filter(d => d.status === 'APPROVED').length,
    rejected: documents.filter(d => d.status === 'REJECTED').length,
    mandatory: documents.filter(d => d.is_mandatory).length,
  };

  const completionPercentage = Math.round((stats.approved / stats.mandatory) * 100) || 0;

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Documentos</h3>
        </div>
        <button
          onClick={() => navigate(`/documents/loan/${applicationId}`)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            Documentos obligatorios completados
          </span>
          <span className="text-sm font-bold text-slate-900">
            {stats.approved}/{stats.mandatory}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              completionPercentage === 100 ? 'bg-green-500' :
              completionPercentage >= 50 ? 'bg-blue-500' :
              'bg-yellow-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {completionPercentage}% completado
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 mx-auto mb-1">
            <FileText className="h-4 w-4 text-slate-600" />
          </div>
          <p className="text-xs font-medium text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 mx-auto mb-1">
            <Clock className="h-4 w-4 text-yellow-600" />
          </div>
          <p className="text-xs font-medium text-slate-900">{stats.pending}</p>
          <p className="text-xs text-slate-500">Pendientes</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 mx-auto mb-1">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xs font-medium text-slate-900">{stats.uploaded}</p>
          <p className="text-xs text-slate-500">Cargados</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 mx-auto mb-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-xs font-medium text-slate-900">{stats.approved}</p>
          <p className="text-xs text-slate-500">Aprobados</p>
        </div>
      </div>

      {/* Alertas importantes */}
      {stats.rejected > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm font-medium text-red-900">
              {stats.rejected} documento{stats.rejected > 1 ? 's' : ''} rechazado{stats.rejected > 1 ? 's' : ''}
            </p>
          </div>
          <p className="text-xs text-red-700 mt-1">
            Requiere atención inmediata
          </p>
        </div>
      )}

      {completionPercentage === 100 && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-green-900">
              ¡Documentación completa!
            </p>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Todos los documentos obligatorios han sido aprobados
          </p>
        </div>
      )}
    </div>
  );
};