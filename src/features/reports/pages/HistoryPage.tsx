/**
 * Página de historial de reportes generados
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { ReportHistory, ReportDetailsModal } from '../components/history';
import { ErrorAlert } from '../components/common';
import { useReportHistory } from '../hooks/useReportHistory';
import type { GeneratedReportList } from '../types';

export function HistoryPage() {
  const navigate = useNavigate();
  const { reports, loading, download, refetch, error } = useReportHistory();
  const [selectedReport, setSelectedReport] = useState<GeneratedReportList | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = async (report: GeneratedReportList) => {
    try {
      await download(report.id);
    } catch (err) {
      console.error('Error al descargar reporte:', err);
    }
  };

  const handleViewDetails = (report: GeneratedReportList) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/reports')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al Catálogo
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historial de Reportes</h1>
            <p className="mt-2 text-gray-600">
              Consulta y descarga los reportes que has generado
            </p>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && <ErrorAlert message={error} />}

      {/* Historial */}
      <ReportHistory
        reports={reports}
        loading={loading}
        onDownload={handleDownload}
        onViewDetails={handleViewDetails}
      />

      {/* Modal de Detalles */}
      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
