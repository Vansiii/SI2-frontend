import React from 'react';
import { FileText } from 'lucide-react';
import { DocumentTypeListPage } from '../../catalogs/pages/DocumentTypeListPage';

interface DocumentRequirementListPageProps {
  embedded?: boolean;
}

export const DocumentRequirementListPage: React.FC<DocumentRequirementListPageProps> = ({ embedded = false }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      {!embedded && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-(--tenant-primary)" />
            Documentos
          </h2>
          <p className="text-slate-500 text-sm">Catálogo de documentos que pueden ser requeridos para solicitudes de crédito.</p>
        </div>
      )}

      {/* Vista de Tipos de Documento */}
      <DocumentTypeListPage embedded />
    </div>
  );
};


