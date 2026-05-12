/**
 * Página de construcción manual de reportes
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, Download, Save, Loader2 } from 'lucide-react';
import {
  DateRangeSelector,
  FilterBuilder,
  ColumnSelector,
  GroupBySelector,
  SortSelector,
  FormatSelector,
} from '../components/builder';
import { LoadingSpinner, ErrorAlert, SuccessAlert } from '../components/common';
import { useReportDefinition, useReportGeneration } from '../hooks';
import { validateReportConfig } from '../utils';
import type { ReportConfig, ReportScope, ReportCategory } from '../types';

export function ReportBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const state = location.state as { 
    config?: ReportConfig; 
    saveAsTemplate?: boolean; 
    message?: string 
  } | null;

  // Obtener parámetros de query string o del state
  const scope = (searchParams.get('scope') || state?.config?.scope) as ReportScope;
  const category = (searchParams.get('category') || state?.config?.category) as ReportCategory;
  const reportType = searchParams.get('type') || state?.config?.report_type || '';

  // Si no hay parámetros necesarios, redirigir al catálogo
  useEffect(() => {
    if (!scope || !category || !reportType) {
      navigate('/reports', { 
        state: { 
          error: 'Debe seleccionar un tipo de reporte desde el catálogo' 
        } 
      });
    }
  }, [scope, category, reportType, navigate]);

  const { definition, loading: loadingDef, error: errorDef } = useReportDefinition(
    scope,
    category,
    reportType,
    !!(scope && category && reportType)
  );

  const {
    previewing,
    generating,
    previewData,
    generatedReport,
    error: genError,
    previewReport,
    generateReport,
    downloadReport,
  } = useReportGeneration();

  const [config, setConfig] = useState<ReportConfig>(
    state?.config || {
      scope,
      category,
      report_type: reportType,
      date_range: { preset: null, start_date: null, end_date: null },
      filters: [],
      columns: [],
      group_by: [],
      sort: [],
      format: 'xlsx',
    }
  );

  const [saveAsTemplate, setSaveAsTemplate] = useState(state?.saveAsTemplate || false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Inicializar columnas cuando se carga la definición
  useEffect(() => {
    if (definition && (config.columns?.length || 0) === 0) {
      setConfig((prev) => ({
        ...prev,
        columns: definition.available_columns.slice(0, 5), // Primeras 5 columnas por defecto
      }));
    }
  }, [definition]);

  const handlePreview = async () => {
    const validation = validateReportConfig(config);
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    try {
      await previewReport(config);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleGenerate = async () => {
    const validation = validateReportConfig(config);
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    if (saveAsTemplate && !templateName.trim()) {
      alert('Debe proporcionar un nombre para la plantilla');
      return;
    }

    try {
      await generateReport(
        config,
        saveAsTemplate,
        templateName,
        templateDescription
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleDownload = async () => {
    if (generatedReport) {
      try {
        await downloadReport(generatedReport.id);
      } catch (error) {
        // Error manejado por el hook
      }
    }
  };

  if (loadingDef) {
    return <LoadingSpinner message="Cargando definición de reporte..." />;
  }

  if (errorDef || !definition) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <ErrorAlert message={errorDef || 'No se pudo cargar la definición del reporte'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/reports')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {definition.name}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {definition.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensaje informativo si viene del state */}
        {state?.message && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">{state.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuración */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rango de fechas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <DateRangeSelector
                value={config.date_range || { preset: null, start_date: null, end_date: null }}
                onChange={(dateRange) =>
                  setConfig((prev) => ({ ...prev, date_range: dateRange }))
                }
              />
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FilterBuilder
                filters={config.filters || []}
                availableFilters={definition.available_filters}
                onChange={(filters) =>
                  setConfig((prev) => ({ ...prev, filters }))
                }
              />
            </div>

            {/* Columnas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ColumnSelector
                availableColumns={definition.available_columns}
                selectedColumns={config.columns || []}
                onChange={(columns) =>
                  setConfig((prev) => ({ ...prev, columns }))
                }
              />
            </div>

            {/* Agrupación */}
            {definition.available_group_by.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <GroupBySelector
                  availableFields={definition.available_group_by}
                  selectedFields={config.group_by || []}
                  onChange={(group_by) =>
                    setConfig((prev) => ({ ...prev, group_by }))
                  }
                />
              </div>
            )}

            {/* Ordenamiento */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <SortSelector
                availableFields={definition.available_columns}
                sortConfig={config.sort || []}
                onChange={(sort) => setConfig((prev) => ({ ...prev, sort }))}
              />
            </div>

            {/* Formato */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <FormatSelector
                value={config.format || 'xlsx'}
                onChange={(format) =>
                  setConfig((prev) => ({ ...prev, format }))
                }
              />
            </div>

            {/* Guardar como plantilla */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Guardar como plantilla
                </span>
              </label>

              {saveAsTemplate && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nombre de la plantilla"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="Descripción (opcional)"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Acciones */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones
              </h3>

              <div className="space-y-3">
                <button
                  onClick={handlePreview}
                  disabled={previewing || generating}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {previewing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  Vista Previa
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={previewing || generating}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Generar Reporte
                </button>

                {generatedReport && (
                  <button
                    onClick={handleDownload}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </button>
                )}
              </div>

              {/* Alertas */}
              <div className="mt-4 space-y-2">
                {genError && <ErrorAlert message={genError} />}
                {showSuccess && (
                  <SuccessAlert message="Reporte generado exitosamente" />
                )}
              </div>
            </div>

            {/* Vista previa */}
            {previewData && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vista Previa
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de filas:</span>
                    <span className="font-semibold">{previewData.total_rows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tamaño estimado:</span>
                    <span className="font-semibold">
                      {previewData.estimated_file_size_mb.toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Columnas:</span>
                    <span className="font-semibold">{previewData.columns.length}</span>
                  </div>
                </div>

                {previewData.preview_rows.length > 0 && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          {previewData.columns.slice(0, 3).map((col) => (
                            <th
                              key={col}
                              className="px-2 py-1 text-left font-medium text-gray-700"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.preview_rows.slice(0, 3).map((row, i) => (
                          <tr key={i} className="border-t">
                            {previewData.columns.slice(0, 3).map((col) => (
                              <td key={col} className="px-2 py-1 text-gray-600">
                                {String(row[col] || '-').substring(0, 20)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-xs text-gray-500 mt-2">
                      Mostrando primeras 3 filas y 3 columnas
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
