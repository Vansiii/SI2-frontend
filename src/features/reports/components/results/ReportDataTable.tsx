import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { SortConfiguration } from '../../types';
import { formatCellValue, getColumnLabel } from '../../utils/helpers';
import styles from './ReportDataTable.module.css';

export interface ReportDataTableProps {
  /** Datos de la tabla */
  data: Record<string, any>[];
  
  /** Nombres de columnas */
  columns: string[];
  
  /** Habilitar paginación */
  pagination?: boolean;
  
  /** Tamaño de página */
  pageSize?: number;
  
  /** Habilitar ordenamiento */
  sortable?: boolean;
}

export function ReportDataTable({
  data,
  columns,
  pagination = true,
  pageSize = 20,
  sortable = true
}: ReportDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfiguration | null>(null);

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortConfig || !sortable) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.column];
      const bValue = b[sortConfig.column];

      // Manejar valores null/undefined
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Comparar valores
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig, sortable]);

  // Paginar datos
  const paginatedData = useMemo(() => {
    if (!pagination) {
      return sortedData;
    }

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize, pagination]);

  // Calcular total de páginas
  const totalPages = pagination ? Math.ceil(sortedData.length / pageSize) : 1;

  // Manejar ordenamiento
  const handleSort = (column: string) => {
    if (!sortable) return;

    setSortConfig((current) => {
      if (!current || current.column !== column) {
        return { column, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { column, direction: 'desc' };
      }
      return null; // Remover ordenamiento
    });
  };

  // Obtener icono de ordenamiento
  const getSortIcon = (column: string) => {
    if (!sortConfig || sortConfig.column !== column) {
      return <ChevronsUpDown className={styles.sortIcon} />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className={styles.sortIcon} />
    ) : (
      <ChevronDown className={styles.sortIcon} />
    );
  };

  // Sin datos
  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  onClick={() => handleSort(column)}
                  className={sortable ? styles.sortableHeader : ''}
                >
                  <div className={styles.headerContent}>
                    <span>{getColumnLabel(column)}</span>
                    {sortable && getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column}>
                    {formatCellValue(row[column], column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

/**
 * Componente de paginación
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas con elipsis
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={styles.pagination}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.paginationButton}
      >
        Anterior
      </button>

      <div className={styles.pageNumbers}>
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {typeof page === 'number' ? (
              <button
                onClick={() => onPageChange(page)}
                className={`${styles.pageButton} ${
                  currentPage === page ? styles.pageButtonActive : ''
                }`}
              >
                {page}
              </button>
            ) : (
              <span className={styles.ellipsis}>{page}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.paginationButton}
      >
        Siguiente
      </button>
    </div>
  );
}
