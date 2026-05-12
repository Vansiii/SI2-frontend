/**
 * Hook personalizado para reportes manuales
 * 
 * @module useManualReport
 */

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ReportType, ReportData, ReportFilters } from '../types/manualReports.types';
import { manualReportsApi } from '../services/manualReportsApi';

/**
 * Hook para obtener datos de un reporte manual
 */
export function useManualReport(
  reportType: ReportType | null,
  filters: ReportFilters,
  enabled: boolean = true
): UseQueryResult<ReportData, Error> {
  return useQuery({
    queryKey: ['manual-report', reportType, filters],
    queryFn: async () => {
      if (!reportType) {
        throw new Error('Report type is required');
      }
      return manualReportsApi.fetchReportData(reportType, filters);
    },
    enabled: enabled && !!reportType,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener reportes disponibles
 */
export function useAvailableReports() {
  return useQuery({
    queryKey: ['available-reports'],
    queryFn: () => manualReportsApi.getAvailableReports(),
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 2 * 60 * 60 * 1000, // 2 horas
  });
}

export default useManualReport;
