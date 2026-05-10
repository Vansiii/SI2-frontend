/**
 * Tabla de historial de reportes
 */
import { Download, Eye, Calendar, FileText } from 'lucide-react';
import type { GeneratedReport } from '../../types';
import { ReportStatusBadge } from './ReportStatusBadge';

interface ReportHistoryTableProps {
  reports: GeneratedReport[];
  onDownload: (report: GeneratedReport) => void;
  onViewDetails: (report: GeneratedReport) => void;
}

export function ReportHistoryTable({ reports, onDownload, onViewDetails }: ReportHistoryTableProps) {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
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

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay reportes</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron reportes con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reporte
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scope
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Métricas
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {report.category} - {report.report_type}
                      </div>
                      <div className="text-sm text-gray-500">{report.file_format?.toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ReportStatusBadge status={report.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      report.scope === 'TENANT'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {report.scope}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(report.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.status === 'COMPLETED' && (
                    <div className="space-y-1">
                      <div>{report.row_count?.toLocaleString() || 0} filas</div>
                      <div>{formatFileSize(report.file_size_mb)}</div>
                    </div>
                  )}
                  {report.status === 'FAILED' && (
                    <div className="text-red-600 text-xs">Error al generar</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onViewDetails(report)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Ver detalles"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    {report.status === 'COMPLETED' && (
                      <button
                        onClick={() => onDownload(report)}
                        className="text-green-600 hover:text-green-900"
                        title="Descargar"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
