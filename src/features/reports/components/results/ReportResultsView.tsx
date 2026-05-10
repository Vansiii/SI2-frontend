import React from 'react';
import type { ReportResults, ReportConfig, ExportFormat } from '../../types';
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
}

export function ReportResultsView({
  results,
  config,
  onDownload,
  downloading = false,
  downloadingFormat
}: ReportResultsViewProps) {
  // Calcular tamaño estimado
  const estimatedSize = calculateEstimatedSize(results.data);

  return (
    <div className={styles.container}>
      {/* Resumen de métricas */}
      <ResultsSummary
        totalRows={results.total_rows}
        totalColumns={results.columns.length}
        estimatedSize={estimatedSize}
      />

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
