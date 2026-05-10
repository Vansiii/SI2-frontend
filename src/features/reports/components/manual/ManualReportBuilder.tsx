import { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import type { ReportScope, ReportCategory, ReportConfig, ReportResults, ExportFormat, ReportPreviewResponse } from '../../types';
import { DynamicReportFilters } from './DynamicReportFilters';
import { ReportResultsView } from '../results/ReportResultsView';
import { useReportDefinition } from '../../hooks/useReportCatalog';
import { reportService } from '../../services/reportService';
import styles from './ManualReportBuilder.module.css';

export interface ManualReportBuilderProps {
  /** Scope del reporte (TENANT o SAAS) */
  scope: ReportScope;
  
  /** Reporte seleccionado */
  selectedReport: {
    category: ReportCategory;
    reportType: string;
  } | null;
  
  /** Callback al cerrar */
  onClose: () => void;
}

export function ManualReportBuilder({
  scope,
  selectedReport,
  onClose
}: ManualReportBuilderProps) {
  // Estado
  const [config, setConfig] = useState<ReportConfig | null>(null);
  const [results, setResults] = useState<ReportResults | null>(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<ExportFormat>();
  const [error, setError] = useState<string | null>(null);

  // Cargar definición del reporte
  const {
    definition,
    loading: loadingDefinition,
    error: definitionError
  } = useReportDefinition(
    scope,
    selectedReport?.category || '',
    selectedReport?.reportType || '',
    !!selectedReport
  );

  // Inicializar configuración cuando se carga la definición
  useEffect(() => {
    if (definition && !config) {
      setConfig({
        scope,
        category: definition.category,
        report_type: definition.report_type,
        filters: [],
        date_range: undefined,
        format: 'csv'
      });
    }
  }, [definition, config, scope]);

  // Resetear estado cuando cambia el reporte
  useEffect(() => {
    setResults(null);
    setError(null);
    setConfig(null);
  }, [selectedReport]);

  // Generar reporte (preview)
  const handleGenerate = async () => {
    if (!config) return;

    setGenerating(true);
    setError(null);

    try {
      const response: ReportPreviewResponse = await reportService.previewReport({
        config,
        page: 1,
        page_size: 100
      });
      
      // Convertir ReportPreviewResponse a ReportResults
      const reportResults: ReportResults = {
        data: response.preview_rows,
        total_rows: response.total_rows,
        columns: response.columns,
        metadata: {
          generated_at: new Date().toISOString(),
          filters_applied: config.filters || [],
          execution_time_ms: 0
        }
      };
      
      setResults(reportResults);
    } catch (err: any) {
      setError(err.message || 'Error al generar el reporte');
      setResults(null);
    } finally {
      setGenerating(false);
    }
  };

  // Descargar reporte
  const handleDownload = async (format: ExportFormat) => {
    if (!config) return;

    setDownloading(true);
    setDownloadingFormat(format);
    setError(null);

    try {
      // Convertir ExportFormat a ReportFormat para el config
      const reportFormat = format === 'pdf' ? 'csv' : format;
      const downloadConfig: ReportConfig = { 
        ...config, 
        format: reportFormat 
      };
      
      const response = await reportService.generateReport({
        config: downloadConfig
      });
      
      // Descargar archivo si está disponible
      if (response.file_resource?.download_url) {
        window.open(response.file_resource.download_url, '_blank');
      } else if (response.id) {
        // Si no hay URL directa, usar el servicio de descarga
        await reportService.downloadReport(response.id);
      }
    } catch (err: any) {
      setError(err.message || 'Error al descargar el reporte');
    } finally {
      setDownloading(false);
      setDownloadingFormat(undefined);
    }
  };

  // Limpiar y cerrar
  const handleClose = () => {
    setResults(null);
    setError(null);
    setConfig(null);
    onClose();
  };

  // No mostrar si no hay reporte seleccionado
  if (!selectedReport) {
    return null;
  }

  // Estado de carga de definición
  if (loadingDefinition) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Loader2 className={styles.spinner} />
          <p>Cargando configuración del reporte...</p>
        </div>
      </div>
    );
  }

  // Error al cargar definición
  if (definitionError || !definition) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <AlertCircle />
          <p>Error al cargar la configuración del reporte</p>
          <p className={styles.errorDetail}>{definitionError}</p>
          <button onClick={handleClose} className={styles.closeButton}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{definition.name}</h2>
          {definition.description && (
            <p className={styles.description}>{definition.description}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className={styles.closeIconButton}
          aria-label="Cerrar"
        >
          <X />
        </button>
      </div>

      {/* Filtros dinámicos */}
      {config && (
        <DynamicReportFilters
          definition={definition}
          config={config}
          onChange={setConfig}
        />
      )}

      {/* Acciones */}
      <div className={styles.actions}>
        <button
          onClick={handleGenerate}
          disabled={generating || !config}
          className={styles.generateButton}
        >
          {generating ? (
            <>
              <Loader2 className={styles.spinner} />
              Generando...
            </>
          ) : (
            'Generar Reporte'
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorAlert}>
          <AlertCircle />
          <p>{error}</p>
        </div>
      )}

      {/* Resultados */}
      {results && config && (
        <div className={styles.results}>
          <ReportResultsView
            results={results}
            config={config}
            onDownload={handleDownload}
            downloading={downloading}
            downloadingFormat={downloadingFormat}
          />
        </div>
      )}
    </div>
  );
}
