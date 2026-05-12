/**
 * Hook para exportación de reportes
 * 
 * @module useReportExport
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { ReportType, ReportFilters, ExportFormat } from '../types/manualReports.types';
import { manualReportsApi } from '../services/manualReportsApi';

interface ExportOptions {
  reportType: ReportType;
  filters: ReportFilters;
  format: ExportFormat;
}

/**
 * Hook para manejar exportación de reportes
 */
export function useReportExport() {
  const [error, setError] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ reportType, filters, format }: ExportOptions) => {
      setExportingFormat(format);
      let blob: Blob;

      switch (format) {
        case 'csv':
          blob = await manualReportsApi.exportCSV(reportType, filters);
          break;
        case 'xlsx':
          blob = await manualReportsApi.exportXLSX(reportType, filters);
          break;
        case 'pdf':
          blob = await manualReportsApi.exportPDF(reportType, filters);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      return { blob, format, reportType };
    },
    onSuccess: ({ blob, format, reportType }) => {
      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-${reportType}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setError(null);
      setExportingFormat(null);
    },
    onError: (err: Error) => {
      console.error('Error al exportar:', err);
      setError('Error al exportar el reporte. Intente nuevamente.');
      setExportingFormat(null);
    },
  });

  return {
    exportReport: mutation.mutate,
    isExporting: mutation.isPending,
    exportingFormat,
    error,
  };
}

export default useReportExport;
