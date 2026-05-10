/**
 * Modal de detalles de reporte generado
 */
import { X, FileText, Calendar, User, Clock, Database, Download } from 'lucide-react';
import type { GeneratedReport } from '../../types';
import { ReportStatusBadge } from './ReportStatusBadge';

interface ReportDetailsModalProps {
  report: GeneratedReport;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (report: GeneratedReport) => void;
}

export function ReportDetailsModal({
  report,
  isOpen,
  onClose,
  onDownload,
}: ReportDetailsModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (mb?: number): string => {
    if (!mb) return 'N/A';
    if (mb < 1) {
      const kb = mb * 1024;
      return `${kb.toFixed(1)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const getGenerationSourceLabel = (source: string): string => {
    return source === 'AUDIO' ? 'Reporte por Voz' : 'Generación Manual';
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      CREDITS: 'Créditos',
      CUSTOMERS: 'Clientes',
      DOCUMENTS: 'Documentos',
      IDENTITY_VERIFICATION: 'Verificación de Identidad',
      TENANTS: 'Tenants',
      USERS: 'Usuarios',
      SUBSCRIPTIONS: 'Suscripciones',
    };
    return labels[category] || category;
  };

  const getReportTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      loans_by_product: 'Créditos por Producto',
      loans_by_branch: 'Créditos por Sucursal',
      loans_by_status: 'Créditos por Estado',
      loans_by_date_range: 'Créditos por Rango de Fechas',
      active_loans: 'Créditos Activos',
      customers_registered: 'Clientes Registrados',
      customers_with_active_loans: 'Clientes con Créditos Activos',
      applications_with_pending_documents: 'Solicitudes con Documentos Pendientes',
      verifications_by_status: 'Verificaciones por Estado',
      tenants_by_status: 'Tenants por Estado',
      users_by_tenant: 'Usuarios por Tenant',
      subscriptions_by_status: 'Suscripciones por Estado',
    };
    return labels[type] || type;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Overlay con backdrop blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Detalles del Reporte
                </h2>
                <p className="text-sm text-gray-500">
                  ID: {report.id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
            {/* Estado y Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <ReportStatusBadge status={report.status} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origen
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    report.generation_source === 'AUDIO'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {getGenerationSourceLabel(report.generation_source)}
                </span>
              </div>
            </div>

            {/* Información del Reporte */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Información del Reporte
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Categoría</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getCategoryLabel(report.category)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tipo de Reporte</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getReportTypeLabel(report.report_type)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Scope</p>
                  <p className="text-sm font-medium text-gray-900">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        report.scope === 'TENANT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {report.scope}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Formato</p>
                  <p className="text-sm font-medium text-gray-900 uppercase">
                    {report.file_format}
                  </p>
                </div>
              </div>
            </div>

            {/* Métricas */}
            {report.status === 'COMPLETED' && (
              <div className="bg-green-50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Database className="h-4 w-4 mr-2 text-green-600" />
                  Métricas
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Filas Generadas</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {report.row_count?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tamaño del Archivo</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatFileSize(report.file_size_mb)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Información Temporal */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-600" />
                Información Temporal
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Fecha de Creación
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(report.created_at)}
                  </p>
                </div>
                
                {report.completed_at && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Fecha de Completado
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(report.completed_at)}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    Solicitado por
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {report.requested_by_name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cerrar
            </button>
            {report.status === 'COMPLETED' && (
              <button
                onClick={() => {
                  onDownload(report);
                  onClose();
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Reporte
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
