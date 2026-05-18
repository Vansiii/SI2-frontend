import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, User, Calendar, AlertCircle } from 'lucide-react';
import { DocumentChecklist } from '../components/DocumentChecklist';
import { useMyDocuments } from '../hooks/useDocuments';
import { LoadingState } from '../../../components/ui/LoadingState';
import { getLoanApplication, type LoanApplication } from '../../loans/services/loansApi';

/**
 * Página para mostrar documentos de una solicitud específica
 * Filtrada por solicitud para evitar mezclar documentos de diferentes clientes
 */
export function LoanDocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const applicationId = Number(id);

  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);

  const { 
    data: documents, 
    isLoading: loadingDocs, 
    error: docsError, 
    refetch 
  } = useMyDocuments(applicationId);

  React.useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
  }, [applicationId]);

  async function loadApplication() {
    setLoadingApp(true);
    try {
      const data = await getLoanApplication(applicationId);
      setApplication(data);
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Error al cargar la solicitud');
    } finally {
      setLoadingApp(false);
    }
  }

  if (loadingApp || loadingDocs) {
    return (
      <div className="min-h-screen bg-slate-50">
        <LoadingState message="Cargando documentos de la solicitud..." />
      </div>
    );
  }

  if (appError || docsError) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Error al cargar documentos</h2>
          <p className="mt-2 text-slate-600">
            {appError || (docsError instanceof Error ? docsError.message : 'Error inesperado')}
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
            <FileText className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Solicitud no encontrada</h2>
          <p className="mt-2 text-slate-600">No se pudo encontrar la solicitud especificada</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-slate-900" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Documentos de Solicitud</h1>
              <p className="text-sm font-medium text-slate-500">{application.application_number}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Información de la solicitud */}
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{application.client_name}</h2>
                <p className="text-sm text-slate-600">{application.product_name}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Creada: {new Date(application.created_at).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>{documents?.length || 0} documentos</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                application.status === 'APPROVED' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                application.status === 'REJECTED' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                application.status === 'IN_REVIEW' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
              }`}>
                {application.status_display}
              </span>
            </div>
          </div>
        </div>

        {/* Lista de documentos */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-lg font-semibold text-slate-900">Documentos Requeridos</h3>
            <p className="mt-1 text-sm text-slate-600">
              Documentos específicos para esta solicitud de crédito
            </p>
          </div>
          
          <div className="p-6">
            {documents && documents.length > 0 ? (
              <DocumentChecklist
                documents={documents}
                applicationId={applicationId}
                onDocumentUploaded={refetch}
              />
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay documentos requeridos
                </h4>
                <p className="text-gray-600">
                  Esta solicitud no tiene documentos configurados o aún no se han creado los requisitos.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}