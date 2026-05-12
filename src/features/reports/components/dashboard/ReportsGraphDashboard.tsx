/**
 * Dashboard con gráficos en vivo de reportes principales
 * Muestra solo un gráfico representativo por reporte
 */
import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { SingleReportChart } from './SingleReportChart';
import type { ReportScope, ReportCategory, ReportPreviewResponse } from '../../types';
import type { ReportType, ChartData } from '../../types/manualReports.types';
import styles from './ReportsGraphDashboard.module.css';

interface ReportsGraphDashboardProps {
  scope: ReportScope;
  onSelectReport?: (reportType: ReportType) => void;
}

interface GraphReport {
  reportType: ReportType;
  name: string;
  loading: boolean;
  error: string | null;
  data: ChartData | null;
}

// Reportes principales para mostrar gráficos según el scope
// TENANT: Reportes operativos de la institución
const GRAPH_REPORTS_TENANT: Array<{ reportType: ReportType; name: string }> = [
  { reportType: 'applications', name: 'Solicitudes de Crédito' },
  { reportType: 'audit', name: 'Bitácora de Auditoría' },
];

// SAAS: Reportes de administración de la plataforma
// Solo Auditoría y Usuarios (datos de administración, no operativos)
const GRAPH_REPORTS_SAAS: Array<{ reportType: ReportType; name: string }> = [
  { reportType: 'audit', name: 'Bitácora de Auditoría' },
  { reportType: 'users', name: 'Usuarios del Sistema' },
];

export function ReportsGraphDashboard({
  scope,
  onSelectReport
}: ReportsGraphDashboardProps) {
  const [reports, setReports] = useState<GraphReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Seleccionar reportes según scope
  const selectedReports = scope === 'TENANT' ? GRAPH_REPORTS_TENANT : GRAPH_REPORTS_SAAS;

  // Cargar datos de reportes
  const loadReports = async () => {
    setRefreshing(true);
    
    const initialReports: GraphReport[] = selectedReports.map(r => ({
      ...r,
      loading: true,
      error: null,
      data: null
    }));
    
    setReports(initialReports);

    // Cargar cada reporte en paralelo usando el API de reportes manuales
    const promises = selectedReports.map(async (report, index) => {
      try {
        // Importar el API de reportes manuales
        const { manualReportsApi } = await import('../../services/manualReportsApi');
        
        // Obtener datos del reporte manual con gráficos
        // Pasar el scope para que el backend filtre correctamente
        const response = await manualReportsApi.fetchReportData(
          report.reportType,
          { scope } // Incluir scope en los filtros
        );

        setReports(prev => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            loading: false,
            data: response.chart_data
          };
          return updated;
        });
      } catch (error) {
        console.error(`Error loading ${report.reportType}:`, error);
        setReports(prev => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            loading: false,
            error: 'Error al cargar el reporte'
          };
          return updated;
        });
      }
    });

    await Promise.all(promises);
    setRefreshing(false);
  };

  // Cargar reportes al montar o cambiar scope
  useEffect(() => {
    loadReports();
  }, [scope]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <BarChart3 className={styles.headerIcon} />
          <div>
            <h2 className={styles.title}>Dashboard de Reportes</h2>
            <p className={styles.subtitle}>
              Visualización en tiempo real de los reportes principales
            </p>
          </div>
        </div>
        <button
          onClick={loadReports}
          disabled={refreshing}
          className={styles.refreshButton}
        >
          <RefreshCw className={`${styles.buttonIcon} ${refreshing ? styles.spinning : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Grid de gráficos */}
      <div className={styles.graphGrid}>
        {reports.map((report) => (
          <div key={report.reportType} className={styles.graphCard}>
            {/* Header de la tarjeta */}
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{report.name}</h3>
              {onSelectReport && (
                <button
                  onClick={() => onSelectReport(report.reportType)}
                  className={styles.detailButton}
                >
                  Ver Detalle
                </button>
              )}
            </div>

            {/* Contenido de la tarjeta */}
            <div className={styles.cardContent}>
              {report.loading && (
                <div className={styles.loading}>
                  <RefreshCw className={styles.loadingIcon} />
                  <p>Cargando datos...</p>
                </div>
              )}

              {report.error && (
                <div className={styles.error}>
                  <AlertCircle className={styles.errorIcon} />
                  <p>{report.error}</p>
                  <button
                    onClick={loadReports}
                    className={styles.retryButton}
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {!report.loading && !report.error && report.data && (
                <div className={styles.chartContainer}>
                  <SingleReportChart
                    data={report.data}
                    reportType={report.reportType}
                  />
                </div>
              )}

              {!report.loading && !report.error && !report.data && (
                <div className={styles.noChart}>
                  <p className={styles.noChartText}>
                    No hay datos disponibles para este reporte
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje si no hay reportes */}
      {reports.length === 0 && (
        <div className={styles.empty}>
          <BarChart3 className={styles.emptyIcon} />
          <p>No hay reportes disponibles para este scope</p>
        </div>
      )}
    </div>
  );
}
