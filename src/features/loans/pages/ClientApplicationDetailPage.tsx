import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import { LoadingState } from '../../../components/ui/LoadingState';
import { Timeline } from '../components/Timeline';
import { PendingActions } from '../components/PendingActions';
import { ApplicationStatusCard } from '../components/ApplicationStatus';
import { DocumentSummaryCard } from '../components/DocumentSummaryCard';
import { DocumentChecklist } from '../../documents/components/DocumentChecklist';
import { useApplicationDetail } from '../hooks/useTimeline';
import { useMyDocuments } from '../../documents/hooks/useDocuments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  User,
  Building,
} from 'lucide-react';

export const ClientApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const applicationId = id ? parseInt(id, 10) : 0;

  const { data: application, isLoading, error, refetch } = useApplicationDetail(applicationId);
  const { data: documents, isLoading: documentsLoading, refetch: refetchDocuments } = useMyDocuments(applicationId);

  const handleDocumentUploaded = () => {
    refetch();
    refetchDocuments();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState message="Cargando detalles de la solicitud..." />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Error al cargar la solicitud
          </h3>
          <p className="text-red-700 mb-4">
            {error instanceof Error ? error.message : 'No se pudo cargar la solicitud'}
          </p>
          <button
            onClick={() => navigate('/client/loans')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200"
            style={{
              backgroundColor: 'var(--tenant-primary, #2563EB)',
              color: 'var(--tenant-on-primary, #FFFFFF)',
            }}
          >
            <ArrowLeft className="h-5 w-5" />
            Volver a mis solicitudes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <div className="container mx-auto px-4 py-8">
        {/* Header con navegación */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/client/loans')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver a mis solicitudes
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Solicitud #{application.application_number}
              </h1>
              <p className="text-gray-600">
                {application.product_name}
              </p>
            </div>
          </div>
        </div>

        {/* Estado actual y acciones pendientes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ApplicationStatusCard
              status={application.status}
              statusDisplay={application.status_display}
              message={application.current_stage.message}
              requiresAction={application.current_stage.requires_action}
            />
          </div>

          <DocumentSummaryCard summary={application.documents_summary} />
        </div>

        {/* Acciones pendientes */}
        {application.pending_actions && application.pending_actions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Acciones Pendientes
            </h2>
            <PendingActions actions={application.pending_actions} />
          </div>
        )}

        {/* Información principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="h-5 w-5" />
                <h3 className="font-semibold">Monto Solicitado</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                Bs {parseFloat(application.requested_amount).toLocaleString('es-BO', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-5 w-5" />
                <h3 className="font-semibold">Plazo</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                {application.term_months} meses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <h3 className="font-semibold">Fecha de Solicitud</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-gray-900">
                {application.submitted_at
                  ? format(new Date(application.submitted_at), "d 'de' MMMM, yyyy", { locale: es })
                  : format(new Date(application.created_at), "d 'de' MMMM, yyyy", { locale: es })
                }
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {application.submitted_at
                  ? format(new Date(application.submitted_at), 'HH:mm', { locale: es })
                  : format(new Date(application.created_at), 'HH:mm', { locale: es })
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: Timeline y Documentos */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="timeline">
              <TabsList className="mb-6">
                <TabsTrigger value="timeline">
                  <Clock className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FileText className="h-4 w-4 mr-2" />
                  Documentos
                  {application.documents_summary.pending_documents > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center h-5 w-5 text-xs font-bold rounded-full bg-yellow-500 text-white">
                      {application.documents_summary.pending_documents}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Historial de la Solicitud
                    </h3>
                    <Timeline events={application.timeline} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Documentos Requeridos
                    </h3>
                    
                    {documentsLoading ? (
                      <LoadingState message="Cargando documentos..." />
                    ) : documents && documents.length > 0 ? (
                      <DocumentChecklist
                        documents={documents}
                        applicationId={applicationId}
                        onDocumentUploaded={handleDocumentUploaded}
                      />
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          No hay documentos requeridos para esta solicitud
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-5 w-5" />
                <h3 className="font-semibold">Información de la Solicitud</h3>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600">Número de Solicitud</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {application.application_number}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Producto</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {application.product_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Estado</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {application.status_display}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Última Actualización</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {format(new Date(application.updated_at), "d 'de' MMMM, yyyy 'a las' HH:mm", {
                      locale: es,
                    })}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="h-5 w-5" />
                <h3 className="font-semibold">Resumen de Documentos</h3>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Total de documentos</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {application.documents_summary.total_documents}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Documentos cargados</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {application.documents_summary.uploaded_documents}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Documentos aprobados</dt>
                  <dd className="text-sm font-medium text-green-600">
                    {application.documents_summary.approved_documents}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Documentos pendientes</dt>
                  <dd className="text-sm font-medium text-yellow-600">
                    {application.documents_summary.pending_documents}
                  </dd>
                </div>
                {application.documents_summary.rejected_documents > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Documentos rechazados</dt>
                    <dd className="text-sm font-medium text-red-600">
                      {application.documents_summary.rejected_documents}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
