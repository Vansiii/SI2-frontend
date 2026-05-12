/**
 * API SIMPLE para reportes manuales
 * 
 * Este servicio usa endpoints simples y directos, independientes del sistema de audio.
 */

import React from 'react';
import { apiClient } from '../../../utils/apiClient';

// ============================================================================
// TIPOS
// ============================================================================

export interface SimpleReportFilter {
  [key: string]: any;
}

export interface SimpleReportRequest {
  report_type: string;
  filters?: SimpleReportFilter;
  page?: number;
  page_size?: number;
}

export interface SimpleReportPagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface SimpleReportResponse {
  data: Record<string, any>[];
  pagination: SimpleReportPagination;
}

export interface SimpleReportDefinition {
  type: string;
  name: string;
  description: string;
  columns: string[];
  filters: Array<{
    field: string;
    type: string;
  }>;
}

export interface SimpleReportCatalog {
  reports: SimpleReportDefinition[];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Obtiene el catálogo de reportes disponibles
 */
export async function getSimpleReportCatalog(): Promise<SimpleReportCatalog> {
  try {
    const response = await apiClient.get<SimpleReportCatalog>('/reports/simple/catalog/');
    console.log('Catálogo recibido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener catálogo:', error);
    throw new Error(error.response?.data?.error || error.message || 'Error al obtener catálogo');
  }
}

/**
 * Obtiene vista previa de un reporte
 */
export async function getSimpleReportPreview(
  request: SimpleReportRequest
): Promise<SimpleReportResponse> {
  try {
    const response = await apiClient.post<SimpleReportResponse>(
      '/reports/simple/preview/',
      request
    );
    console.log('Vista previa recibida:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener vista previa:', error);
    throw new Error(error.response?.data?.error || error.message || 'Error al obtener vista previa');
  }
}

/**
 * Hook personalizado para obtener catálogo de reportes
 */
export function useSimpleReportCatalog() {
  const [catalog, setCatalog] = React.useState<SimpleReportCatalog | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getSimpleReportCatalog()
      .then(setCatalog)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { catalog, loading, error };
}

/**
 * Hook personalizado para obtener datos de reporte
 */
export function useSimpleReportData(request: SimpleReportRequest | null) {
  const [data, setData] = React.useState<SimpleReportResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    if (!request) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getSimpleReportPreview(request);
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Error al obtener datos del reporte');
    } finally {
      setLoading(false);
    }
  }, [request]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
