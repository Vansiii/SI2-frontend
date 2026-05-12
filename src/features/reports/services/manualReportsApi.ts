/**
 * Servicio API para Reportes Manuales Independientes
 * 
 * @module manualReportsApi
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { 
  ReportType, 
  ReportData, 
  ReportFilters 
} from '../types/manualReports.types';

// Configuración de Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Servicio de API para reportes manuales
 */
export const manualReportsApi = {
  /**
   * Obtiene los datos de un reporte
   */
  async fetchReportData(
    reportType: ReportType,
    filters: ReportFilters
  ): Promise<ReportData> {
    const response = await apiClient.get(`/api/reports/manual/${reportType}/`, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Exporta reporte a CSV
   */
  async exportCSV(
    reportType: ReportType,
    filters: ReportFilters
  ): Promise<Blob> {
    const response = await apiClient.post(
      '/api/reports/manual/export/csv/',
      { report_type: reportType, filters },
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Exporta reporte a XLSX
   */
  async exportXLSX(
    reportType: ReportType,
    filters: ReportFilters
  ): Promise<Blob> {
    const response = await apiClient.post(
      '/api/reports/manual/export/xlsx/',
      { report_type: reportType, filters },
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Exporta reporte a PDF con gráficos
   */
  async exportPDF(
    reportType: ReportType,
    filters: ReportFilters
  ): Promise<Blob> {
    const response = await apiClient.post(
      '/api/reports/manual/export/pdf/',
      {
        report_type: reportType,
        filters,
        include_chart: true,
      },
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Obtiene la lista de tipos de reportes disponibles
   */
  async getAvailableReports(): Promise<string[]> {
    const response = await apiClient.get('/api/reports/manual/available/');
    return response.data.report_types;
  },

  /**
   * Obtiene las opciones disponibles para los filtros
   */
  async getFilterOptions(): Promise<any> {
    const response = await apiClient.get('/api/reports/manual-filter-options/');
    return response.data;
  },
};

export default manualReportsApi;
