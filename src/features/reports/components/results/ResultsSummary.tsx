import { FileText, Columns, HardDrive } from 'lucide-react';
import { formatFileSize } from '../../utils/helpers';
import styles from './ResultsSummary.module.css';

export interface ResultsSummaryProps {
  /** Total de registros */
  totalRows: number;
  
  /** Cantidad de columnas */
  totalColumns: number;
  
  /** Tamaño estimado en bytes */
  estimatedSize: number;
}

export function ResultsSummary({
  totalRows,
  totalColumns,
  estimatedSize
}: ResultsSummaryProps) {
  return (
    <div className={styles.summaryContainer}>
      <div className={styles.summaryCard}>
        <div className={styles.iconWrapper}>
          <FileText className={styles.icon} />
        </div>
        <div className={styles.content}>
          <p className={styles.label}>Total de Registros</p>
          <p className={styles.value}>{totalRows.toLocaleString('es-BO')}</p>
        </div>
      </div>

      <div className={styles.summaryCard}>
        <div className={styles.iconWrapper}>
          <Columns className={styles.icon} />
        </div>
        <div className={styles.content}>
          <p className={styles.label}>Columnas</p>
          <p className={styles.value}>{totalColumns}</p>
        </div>
      </div>

      <div className={styles.summaryCard}>
        <div className={styles.iconWrapper}>
          <HardDrive className={styles.icon} />
        </div>
        <div className={styles.content}>
          <p className={styles.label}>Tamaño Estimado</p>
          <p className={styles.value}>{formatFileSize(estimatedSize)}</p>
        </div>
      </div>
    </div>
  );
}
