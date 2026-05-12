import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/reportService';
import type { ReportScope } from '../types';

/**
 * Hook para cargar metadatos enriquecidos de un reporte
 * Incluye filtros con UI components, columnas, agrupaciones y chart_config
 * 
 * @param reportType - Tipo de reporte (ej: 'loans_by_status')
 * @param scope - Scope del reporte (TENANT o SAAS)
 * @returns Query con metadatos del reporte
 */
export const useReportMetadata = (
  reportType: string | null,
  scope?: ReportScope
) => {
  return useQuery({
    queryKey: ['reportMetadata', reportType, scope],
    queryFn: () => reportService.getReportMetadata(reportType!, scope),
    enabled: !!reportType,
    staleTime: 0, // ✅ Sin caché - siempre obtener datos frescos del backend
    gcTime: 0, // ✅ No guardar en caché
  });
};
