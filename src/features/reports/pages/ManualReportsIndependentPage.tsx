/**
 * Página Principal de Reportes Manuales Independientes
 * 
 * Orquesta todos los componentes del sistema de reportes manuales.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, RefreshCw, AlertCircle, Info, ArrowLeft, Building, Globe } from 'lucide-react';
import { ReportTypeSelector } from '../components/manual-independent/ReportTypeSelector';
import { DynamicFilters } from '../components/manual-independent/DynamicFilters';
import { ReportTable } from '../components/manual-independent/ReportTable';
import { ReportSummary } from '../components/manual-independent/ReportSummary';
import { ReportCharts } from '../components/manual-independent/ReportCharts';
import { ExportButtons } from '../components/manual-independent/ExportButtons';
import { useManualReport } from '../hooks/useManualReport';
import { useAuth } from '../../auth/hooks/useAuth';
import { REPORT_TYPE_LABELS } from '../types/manualReports.types';
import type { ReportType, ReportFilters } from '../types/manualReports.types';

type ReportScope = 'TENANT' | 'SAAS';

export function ManualReportsIndependentPage() {
  const navigate = useNavigate();
  const { userType } = useAuth();
  
  // Determinar el scope inicial según el tipo de usuario
  const initialScope: ReportScope = userType === 'saas_admin' ? 'SAAS' : 'TENANT';
  
  // Estado
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const selectedScope: ReportScope = initialScope;
  
  // Hooks
  const { data, isLoading, error, refetch, isFetching } = useManualReport(
    reportType,
    { ...filters, scope: selectedScope }, // Agregar scope a los filtros
    hasAppliedFilters
  );
  
  // Filtrar tipos de reportes según el scope
  const getAvailableReportTypes = useCallback((): ReportType[] => {
    if (selectedScope === 'SAAS') {
      // SAAS solo ve: Auditoría, Usuarios, Sucursales
      return ['audit', 'users', 'branches'];
    }
    // TENANT ve todos los reportes
    return ['clients', 'products', 'applications', 'audit', 'users', 'branches'];
  }, [selectedScope]);
  
  // Handlers
  const handleReportTypeChange = useCallback((type: ReportType) => {
    setReportType(type);
    setFilters({});
    setHasAppliedFilters(false);
  }, []);
  

  const handleFiltersChange = useCallback((newFilters: ReportFilters) => {
    setFilters(newFilters);
  }, []);
  
  const handleApplyFilters = useCallback(() => {
    setHasAppliedFilters(true);
    refetch();
  }, [refetch]);
  
  const handlePageChange = useCallback((newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    refetch();
  }, [refetch]);
  
  const handleClearFilters = useCallback(() => {
    setFilters({});
    setHasAppliedFilters(false);
  }, []);
  
  const handleRefresh = useCallback(() => {
    if (hasAppliedFilters) {
      refetch();
    }
  }, [hasAppliedFilters, refetch]);
  
  const handleBack = () => {
    navigate('/reports');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Volver a Reportes"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Reportes Manuales
                </h1>
                <p className="text-sm text-gray-500">
                  Genera reportes personalizados con filtros dinámicos
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Selector de Scope - Solo visible según tipo de usuario */}
              {userType === 'saas_admin' ? (
                /* SaaS Admin: Solo puede ver reportes SAAS */
                <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                  <Globe className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-700">Reportes SaaS</span>
                  <span className="text-xs text-purple-600">(Administración)</span>
                </div>
              ) : (
                /* Tenant User: Solo puede ver reportes TENANT */
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-700">Reportes Tenant</span>
                  <span className="text-xs text-blue-600">(Mi Institución)</span>
                </div>
              )}
              
              {reportType && hasAppliedFilters && (
                <button
                  onClick={handleRefresh}
                  disabled={isFetching}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                  Refrescar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Selector de Tipo de Reporte */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              1. Selecciona el tipo de reporte
            </h2>
            {selectedScope === 'SAAS' && (
              <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Modo SaaS: Auditoría, Usuarios y Sucursales (todos los tenants)
              </span>
            )}
          </div>
          <ReportTypeSelector 
            value={reportType} 
            onChange={handleReportTypeChange}
            availableTypes={getAvailableReportTypes()}
          />
        </div>
        
        {/* Filtros Dinámicos */}
        {reportType && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              2. Configura los filtros
            </h2>
            <DynamicFilters
              reportType={reportType}
              filters={filters}
              onChange={handleFiltersChange}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
            />
          </div>
        )}
        
        {/* Información de ayuda */}
        {reportType && !hasAppliedFilters && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">
                  Configura los filtros y haz clic en "Aplicar Filtros"
                </h3>
                <p className="text-sm text-blue-700">
                  Puedes dejar los filtros vacíos para obtener todos los registros de{' '}
                  <strong>{REPORT_TYPE_LABELS[reportType]}</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Estado de Carga */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Generando reporte...</p>
            </div>
          </div>
        )}
        
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900 mb-1">
                  Error al generar el reporte
                </h3>
                <p className="text-sm text-red-700">
                  {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Resultados */}
        {data && !isLoading && (
          <>
            {/* Header de Resultados */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                3. Resultados del reporte
              </h2>
              <ExportButtons
                reportType={reportType!}
                filters={filters}
              />
            </div>
            
            {/* Resumen Estadístico */}
            <div className="mb-8">
              <ReportSummary 
                summary={data.summary} 
                reportType={reportType!} 
              />
            </div>
            
            {/* Gráficos */}
            {data.chart_data && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Visualización de Datos
                </h3>
                <ReportCharts 
                  data={data.chart_data} 
                  reportType={reportType!} 
                />
              </div>
            )}
            
            {/* Tabla de Datos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Datos Detallados
              </h3>
              <ReportTable 
                rows={data.rows} 
                reportType={reportType!}
                pagination={data.pagination}
                onPageChange={handlePageChange}
              />
            </div>
            
            {/* Información de Paginación */}
            {data.pagination && (
              <div className="mt-4 text-sm text-gray-600 text-center">
                Mostrando {data.rows.length} de {data.pagination.total_count} registros
                {data.pagination.total_pages > 1 && (
                  <span> (Página {data.pagination.page} de {data.pagination.total_pages})</span>
                )}
              </div>
            )}
          </>
        )}
        
        {/* Sin Resultados */}
        {data && data.rows.length === 0 && !isLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-yellow-900 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-yellow-700">
              Intenta ajustar los filtros para obtener resultados diferentes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManualReportsIndependentPage;
