import React from 'react';
import type { 
  ReportResults, 
  ReportConfig, 
  ExportFormat,
  ReportSummary,
  Pagination 
} from '../../types';
import { hasChartConfig } from '../../types';
import { ResultsSummary } from './ResultsSummary';
import { ReportChart } from './ReportChart';
import { ReportDataTable } from './ReportDataTable';
import { DownloadActions } from './DownloadActions';
import { calculateEstimatedSize } from '../../utils/helpers';
import styles from './ReportResultsView.module.css';

export interface ReportResultsViewProps {
  /** Resultados del reporte */
  results: ReportResults;
  
  /** Configuración del reporte */
  config: ReportConfig;
  
  /** Callback al descargar */
  onDownload: (format: ExportFormat) => void;
  
  /** Está descargando */
  downloading?: boolean;
  
  /** Formato que se está descargando */
  downloadingFormat?: ExportFormat;

  /** ✅ NUEVO: Callback para cambiar de página */
  onPageChange?: (page: number) => void;
}

export function ReportResultsView({
  results,
  config,
  onDownload,
  downloading = false,
  downloadingFormat,
  onPageChange
}: ReportResultsViewProps) {
  // Calcular tamaño estimado
  const estimatedSize = calculateEstimatedSize(results.data);

  // ✅ NUEVO: Extraer summary y pagination si existen
  const summary = (results as any).summary as ReportSummary | undefined;
  const pagination = (results as any).pagination as Pagination | undefined;

  return (
    <div className={styles.container}>
      {/* Resumen de métricas */}
      <ResultsSummary
        totalRows={results.total_rows}
        totalColumns={results.columns.length}
        estimatedSize={estimatedSize}
      />

      {/* ✅ NUEVO: Resumen estadístico del backend */}
      {summary && (
        <div className={styles.summarySection}>
          <h3 className={styles.sectionTitle}>Resumen Estadístico</h3>
          <div className={styles.summaryCards}>
            {Object.entries(summary).map(([key, value]) => (
              <div key={key} className={styles.summaryCard}>
                <span className={styles.summaryLabel}>
                  {formatSummaryLabel(key)}
                </span>
                <span className={styles.summaryValue}>
                  {formatSummaryValue(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráfico (si aplica) */}
      {hasChartConfig(results) && (
        <div className={styles.chartSection}>
          <ReportChart
            type={results.chart_config.chart_type}
            data={results.data}
            config={results.chart_config}
          />
        </div>
      )}

      {/* Tabla de datos */}
      <div className={styles.dataSection}>
        <h3 className={styles.sectionTitle}>Datos del Reporte</h3>
        <ReportDataTable
          data={results.data}
          columns={results.columns}
          pagination={true}
          pageSize={20}
          sortable={true}
        />
      </div>

      {/* ✅ NUEVO: Paginación del backend */}
      {pagination && onPageChange && (
        <div className={styles.paginationSection}>
          <div className={styles.paginationInfo}>
            Mostrando página {pagination.page} de {pagination.total_pages}
            {' '}({pagination.total_count} registros totales)
          </div>
          <div className={styles.paginationControls}>
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.has_previous}
              className={styles.paginationButton}
            >
              ← Anterior
            </button>
            <span className={styles.paginationCurrent}>
              Página {pagination.page}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.has_next}
              className={styles.paginationButton}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Acciones de descarga */}
      <DownloadActions
        onDownload={onDownload}
        formats={['csv', 'xlsx', 'pdf']}
        loading={downloading}
        downloadingFormat={downloadingFormat}
      />
    </div>
  );
}

/**
 * Formatea la etiqueta del resumen
 */
function formatSummaryLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Formatea el valor del resumen
 */
function formatSummaryValue(value: number): string {
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
