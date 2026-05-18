import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { LoadingState } from '../../../components/ui/LoadingState';
import { DocumentCard } from '../components/DocumentCard';
import { DocumentReviewDialog } from '../components/DocumentReviewDialog';
import { useStaffDocuments } from '../hooks/useDocuments';
import { documentApi } from '../services/documentApi';
import { FileText, AlertCircle, Filter, CheckCircle, XCircle, Clock, Search, X } from 'lucide-react';
import type { LoanApplicationDocumentRequirement } from '../types/document.types';

type FilterType = 'all' | 'uploaded' | 'under_review' | 'approved' | 'rejected';

interface StaffDocumentsPageProps {
  embedded?: boolean;
}

export const StaffDocumentsPage: React.FC<StaffDocumentsPageProps> = ({ embedded = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<FilterType>('uploaded');
  const [selectedDocument, setSelectedDocument] = useState<LoanApplicationDocumentRequirement | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [applicationFilter, setApplicationFilter] = useState<string>(
    searchParams.get('loan_application') || ''
  );

  const statusFilter = filter === 'all' ? undefined : filter.toUpperCase();
  const loanApplicationFilter = applicationFilter ? parseInt(applicationFilter) : undefined;
  
  const { data: documents, isLoading, error, refetch } = useStaffDocuments({
    status: statusFilter,
    loan_application: loanApplicationFilter,
  });

  const handleApplicationFilterChange = (value: string) => {
    setApplicationFilter(value);
    if (value) {
      setSearchParams({ loan_application: value });
    } else {
      setSearchParams({});
    }
  };

  const clearApplicationFilter = () => {
    setApplicationFilter('');
    setSearchParams({});
  };

  const handleReviewClick = (documentId: number) => {
    const doc = documents?.find(d => d.id === documentId);
    if (doc) {
      setSelectedDocument(doc);
      setReviewDialogOpen(true);
    }
  };

  const handleReviewSuccess = () => {
    setReviewDialogOpen(false);
    setSelectedDocument(null);
    refetch();
  };

  const handleDownload = (signedUrl: string) => {
    documentApi.downloadDocument(signedUrl);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState message="Cargando documentos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Error al cargar documentos
          </h3>
          <p className="text-red-700">
            {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
          </p>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const allDocuments = documents || [];
  const stats = {
    total: allDocuments.length,
    uploaded: allDocuments.filter(d => d.status === 'UPLOADED').length,
    under_review: allDocuments.filter(d => d.status === 'UNDER_REVIEW').length,
    approved: allDocuments.filter(d => d.status === 'APPROVED').length,
    rejected: allDocuments.filter(d => d.status === 'REJECTED').length,
  };

  return (
    <div className={`animate-fadeIn ${embedded ? '' : 'min-h-screen bg-slate-50'}`}>
      <div className={embedded ? '' : 'container mx-auto px-4 py-8'}>
        {/* Header */}
        {!embedded && (
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
              Revisión de Documentos
            </h1>
            <p className="text-slate-600">
              Revisa y aprueba los documentos cargados por los clientes
            </p>
          </div>
        )}

        {/* Estadísticas */}
        <div className="flex gap-3 overflow-x-auto pb-4 md:pb-6 hide-scrollbar">
          <div className="flex flex-col p-4 rounded-xl border border-slate-100 bg-slate-50 min-w-[140px] hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Total
            </span>
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
          </div>

          <div className="flex flex-col p-4 rounded-xl border border-blue-100 bg-blue-50 min-w-[140px] hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Cargados
            </span>
            <span className="text-2xl font-black text-blue-900">{stats.uploaded}</span>
          </div>

          <div className="flex flex-col p-4 rounded-xl border border-yellow-100 bg-yellow-50 min-w-[140px] hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default">
            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-600 mb-2 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" /> En Revisión
            </span>
            <span className="text-2xl font-black text-yellow-900">{stats.under_review}</span>
          </div>

          <div className="flex flex-col p-4 rounded-xl border border-green-100 bg-green-50 min-w-[140px] hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default">
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-2 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" /> Aprobados
            </span>
            <span className="text-2xl font-black text-green-900">{stats.approved}</span>
          </div>

          <div className="flex flex-col p-4 rounded-xl border border-red-100 bg-red-50 min-w-[140px] hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 mb-2 flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5" /> Rechazados
            </span>
            <span className="text-2xl font-black text-red-900">{stats.rejected}</span>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 space-y-4">
          {/* Filtro por solicitud */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Search className="h-4 w-4" />
              <span className="font-medium">Filtrar por solicitud:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Número de solicitud..."
                value={applicationFilter}
                onChange={(e) => handleApplicationFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {applicationFilter && (
                <button
                  onClick={clearApplicationFilter}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Limpiar filtro"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {applicationFilter && (
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Mostrando solicitud #{applicationFilter}
              </div>
            )}
          </div>

          {/* Filtros de estado */}
          <div className="inline-flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-full border border-slate-200 overflow-x-auto max-w-full hide-scrollbar">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Todos ({stats.total})
            </button>

            <button
              onClick={() => setFilter('uploaded')}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                filter === 'uploaded'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-blue-100/50'
              }`}
            >
              Cargados ({stats.uploaded})
            </button>

            <button
              onClick={() => setFilter('under_review')}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                filter === 'under_review'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-yellow-700 hover:bg-yellow-100/50'
              }`}
            >
              En Revisión ({stats.under_review})
            </button>

            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                filter === 'approved'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-green-700 hover:bg-green-100/50'
              }`}
            >
              Aprobados ({stats.approved})
            </button>

            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                filter === 'rejected'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-red-700 hover:bg-red-100/50'
              }`}
            >
              Rechazados ({stats.rejected})
            </button>
          </div>
        </div>

        {/* Lista de documentos */}
        {!documents || documents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No hay documentos {filter !== 'all' ? `en estado "${filter}"` : 'para revisar'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {documents.map((document, index) => (
              <div
                key={document.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <DocumentCard
                  document={document}
                  onDownload={handleDownload}
                  onReview={handleReviewClick}
                  showActions={true}
                  showApplicationInfo={true}
                />
              </div>
            ))}
          </div>
        )}

        {/* Dialog de revisión */}
        {selectedDocument && (
          <DocumentReviewDialog
            open={reviewDialogOpen}
            onClose={() => {
              setReviewDialogOpen(false);
              setSelectedDocument(null);
            }}
            document={selectedDocument}
            onReviewSuccess={handleReviewSuccess}
          />
        )}
      </div>
    </div>
  );
};
