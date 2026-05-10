/**
 * Página principal del módulo de reportes
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Mic,
  Clock,
  BookTemplate,
  Building2,
  Globe,
} from 'lucide-react';
import { ReportCatalog } from '../components/catalog';
// import { ManualReportBuilder } from '../components/manual/ManualReportBuilder';
import type { ReportScope, ReportCategory } from '../types';

export function ReportsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { message?: string; error?: string } | null;
  const [selectedScope, setSelectedScope] = useState<ReportScope>('TENANT');
  const [selectedReport, setSelectedReport] = useState<{
    category: ReportCategory;
    reportType: string;
  } | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ type: 'info' | 'error'; text: string } | null>(null);

  // Mostrar mensaje del state si existe
  useEffect(() => {
    if (state?.message) {
      setAlertMessage({ type: 'info', text: state.message });
      // Limpiar el state para que no se muestre de nuevo
      window.history.replaceState({}, document.title);
      // Auto-ocultar después de 5 segundos
      setTimeout(() => setAlertMessage(null), 5000);
    } else if (state?.error) {
      setAlertMessage({ type: 'error', text: state.error });
      window.history.replaceState({}, document.title);
      setTimeout(() => setAlertMessage(null), 5000);
    }
  }, [state]);

  const handleSelectReport = (category: ReportCategory, reportType: string) => {
    setSelectedReport({ category, reportType });
    
    // Scroll suave al panel de construcción
    setTimeout(() => {
      const element = document.getElementById('manual-report-builder');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleCloseBuilder = () => {
    setSelectedReport(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reportes Personalizables
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Genera reportes manuales o por voz con configuración flexible
              </p>
            </div>

            {/* Acciones rápidas */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/reports/manual')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FileText className="h-4 w-4 mr-2" />
                Reportes Manuales
              </button>

              <button
                onClick={() => navigate('/reports/voice')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Mic className="h-4 w-4 mr-2" />
                Reporte por Voz
              </button>

              <button
                onClick={() => navigate('/reports/templates')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <BookTemplate className="h-4 w-4 mr-2" />
                Plantillas
              </button>

              <button
                onClick={() => navigate('/reports/history')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Clock className="h-4 w-4 mr-2" />
                Historial
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensaje de alerta */}
        {alertMessage && (
          <div
            className={`mb-6 rounded-lg p-4 ${
              alertMessage.type === 'info'
                ? 'bg-blue-50 border border-blue-200 text-blue-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <p className="text-sm">{alertMessage.text}</p>
          </div>
        )}

        {/* Selector de Scope */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Alcance del Reporte
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedScope('TENANT')}
                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                  selectedScope === 'TENANT'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Tenant</div>
                  <div className="text-xs opacity-75">
                    Créditos, Clientes, Documentos
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedScope('SAAS')}
                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                  selectedScope === 'SAAS'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <Globe className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">SaaS</div>
                  <div className="text-xs opacity-75">
                    Tenants, Usuarios, Planes
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Catálogo de reportes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Catálogo de Reportes
            </h2>
          </div>

          <ReportCatalog scope={selectedScope} onSelectReport={handleSelectReport} />
        </div>

        {/* Panel de Construcción Manual - TEMPORALMENTE DESHABILITADO */}
        {/* <div id="manual-report-builder" className="mt-8">
          <ManualReportBuilder
            scope={selectedScope}
            selectedReport={selectedReport}
            onClose={handleCloseBuilder}
          />
        </div> */}
      </div>
    </div>
  );
}
