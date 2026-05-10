import React, { useState } from 'react';
import { DocumentCard } from './DocumentCard';
import { DocumentUploadDialog } from './DocumentUploadDialog';
import { Badge } from '../../../components/ui/Badge';
import { FileText, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import type { LoanApplicationDocumentRequirement } from '../types/document.types';
import { documentApi } from '../services/documentApi';

interface DocumentChecklistProps {
  documents: LoanApplicationDocumentRequirement[];
  applicationId: number;
  onDocumentUploaded?: () => void;
  className?: string;
}

type FilterType = 'all' | 'pending' | 'uploaded' | 'approved' | 'rejected';

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  documents,
  applicationId,
  onDocumentUploaded,
  className = '',
}) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const handleUploadClick = (documentId: number) => {
    setSelectedDocumentId(documentId);
    setUploadDialogOpen(true);
  };

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
    setSelectedDocumentId(null);
    onDocumentUploaded?.();
  };

  const handleDownload = (signedUrl: string) => {
    documentApi.downloadDocument(signedUrl);
  };

  // Calcular estadísticas
  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'PENDING').length,
    uploaded: documents.filter(d => d.status === 'UPLOADED' || d.status === 'UNDER_REVIEW').length,
    approved: documents.filter(d => d.status === 'APPROVED').length,
    rejected: documents.filter(d => d.status === 'REJECTED').length,
    mandatory: documents.filter(d => d.is_mandatory).length,
  };

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    switch (filter) {
      case 'pending':
        return doc.status === 'PENDING';
      case 'uploaded':
        return doc.status === 'UPLOADED' || doc.status === 'UNDER_REVIEW';
      case 'approved':
        return doc.status === 'APPROVED';
      case 'rejected':
        return doc.status === 'REJECTED';
      default:
        return true;
    }
  });

  // Ordenar: obligatorios primero, luego por estado
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    // Obligatorios primero
    if (a.is_mandatory && !b.is_mandatory) return -1;
    if (!a.is_mandatory && b.is_mandatory) return 1;
    
    // Luego por estado (pendientes y rechazados primero)
    const statusOrder = {
      REJECTED: 0,
      PENDING: 1,
      UPLOADED: 2,
      UNDER_REVIEW: 3,
      APPROVED: 4,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No hay documentos requeridos para esta solicitud</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-700">Pendientes</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>

        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Cargados</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.uploaded}</p>
        </div>

        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Aprobados</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
        </div>

        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-xs font-medium text-red-700">Rechazados</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filtrar:</span>
        </div>
        
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            filter === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos ({stats.total})
        </button>
        
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
          }`}
        >
          Pendientes ({stats.pending})
        </button>
        
        <button
          onClick={() => setFilter('uploaded')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            filter === 'uploaded'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          Cargados ({stats.uploaded})
        </button>
        
        <button
          onClick={() => setFilter('approved')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            filter === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          Aprobados ({stats.approved})
        </button>
        
        <button
          onClick={() => setFilter('rejected')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            filter === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          Rechazados ({stats.rejected})
        </button>
      </div>

      {/* Mensaje de documentos obligatorios */}
      {stats.mandatory > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-900">
              <span className="font-medium">{stats.mandatory}</span> documento
              {stats.mandatory > 1 ? 's' : ''} obligatorio
              {stats.mandatory > 1 ? 's' : ''} debe
              {stats.mandatory > 1 ? 'n' : ''} ser aprobado
              {stats.mandatory > 1 ? 's' : ''} para continuar con la solicitud.
            </p>
          </div>
        </div>
      )}

      {/* Lista de documentos */}
      <div className="space-y-4">
        {sortedDocuments.map((document, index) => (
          <div
            key={document.id}
            className="animate-fadeIn"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <DocumentCard
              document={document}
              onUpload={handleUploadClick}
              onDownload={handleDownload}
              showActions={true}
            />
          </div>
        ))}
      </div>

      {/* Dialog de carga */}
      {selectedDocumentId && (
        <DocumentUploadDialog
          open={uploadDialogOpen}
          onClose={() => {
            setUploadDialogOpen(false);
            setSelectedDocumentId(null);
          }}
          documentId={selectedDocumentId}
          document={documents.find(d => d.id === selectedDocumentId)!}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};
