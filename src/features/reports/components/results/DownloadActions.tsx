import { FileText, FileSpreadsheet, FileDown, Loader2 } from 'lucide-react';
import type { ExportFormat } from '../../types';
import styles from './DownloadActions.module.css';

export interface DownloadActionsProps {
  /** Callback al descargar */
  onDownload: (format: ExportFormat) => void;
  
  /** Formatos disponibles */
  formats: ExportFormat[];
  
  /** Está descargando */
  loading?: boolean;
  
  /** Formato que se está descargando */
  downloadingFormat?: ExportFormat;
}

export function DownloadActions({
  onDownload,
  formats,
  loading = false,
  downloadingFormat
}: DownloadActionsProps) {
  const getButtonConfig = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return {
          icon: FileText,
          label: 'Descargar CSV',
          className: styles.btnCsv
        };
      case 'xlsx':
        return {
          icon: FileSpreadsheet,
          label: 'Descargar XLSX',
          className: styles.btnXlsx
        };
      case 'pdf':
        return {
          icon: FileDown,
          label: 'Descargar PDF',
          className: styles.btnPdf
        };
      default:
        return {
          icon: FileDown,
          label: 'Descargar',
          className: styles.btnDefault
        };
    }
  };

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Descargar Reporte</h4>
      <div className={styles.buttonGroup}>
        {formats.map((format) => {
          const config = getButtonConfig(format);
          const Icon = config.icon;
          const isDownloading = loading && downloadingFormat === format;

          return (
            <button
              key={format}
              onClick={() => onDownload(format)}
              disabled={loading}
              className={`${styles.downloadButton} ${config.className} ${
                isDownloading ? styles.downloading : ''
              }`}
            >
              {isDownloading ? (
                <Loader2 className={`${styles.icon} ${styles.spinning}`} />
              ) : (
                <Icon className={styles.icon} />
              )}
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
