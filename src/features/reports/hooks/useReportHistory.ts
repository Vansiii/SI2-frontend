/**
 * Hook para gestionar historial de reportes
 */
import { useState, useEffect } from 'react';
import { reportService } from '../services';
import type {
  GeneratedReportList,
  ReportHistoryFilters,
} from '../types';

export const useReportHistory = (
  autoLoad: boolean = true,
  initialFilters?: ReportHistoryFilters
) => {
  const [reports, setReports] = useState<GeneratedReportList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportHistoryFilters>(
    initialFilters || {}
  );
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    currentPage: 1,
  });

  const loadReports = async (page: number = 1, newFilters?: ReportHistoryFilters) => {
    try {
      setLoading(true);
      setError(null);
      const filtersToUse = newFilters || filters;
      const data = await reportService.getGeneratedReports(page, filtersToUse);
      setReports(data.results);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
        currentPage: page,
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar historial de reportes');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (newFilters: ReportHistoryFilters) => {
    setFilters(newFilters);
    loadReports(1, newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    loadReports(1, {});
  };

  const downloadReport = async (id: string) => {
    try {
      await reportService.downloadReport(id);
    } catch (err: any) {
      const errorMsg = err.message || 'Error al descargar reporte';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadReports();
    }
  }, [autoLoad]);

  return {
    reports,
    loading,
    error,
    filters,
    pagination,
    loadReports,
    applyFilters,
    clearFilters,
    download: downloadReport,
    refetch: () => loadReports(pagination.currentPage),
  };
};
