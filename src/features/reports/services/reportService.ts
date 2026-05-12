/**
 * Servicio para gestionar reportes personalizables
 */
import { apiClient } from '../../../utils/apiClient';
import type {
  ReportCatalog,
  ReportDefinition,
  ReportPreviewRequest,
  ReportPreviewResponse,
  ReportGenerationRequest,
  GeneratedReport,
  GeneratedReportList,
  PaginatedResponse,
  ReportHistoryFilters,
} from '../types';

class ReportService {
  /**
   * Obtiene el catálogo completo de reportes disponibles
   */
  async getCatalog(): Promise<ReportCatalog> {
    try {
      const response = await apiClient.get<any>('/reports/catalog/');
      
      console.log('📦 Backend response:', response);
      
      // Transformar respuesta del backend al formato esperado
      // Backend retorna: { scope: "TENANT", categories: { CREDITS: [...] } }
      // Frontend espera: { TENANT: { CREDITS: [...] } }
      
      const catalog: ReportCatalog = {};
      
      if (response.scope && response.categories) {
        console.log('✅ Transformando catálogo:', response.scope, Object.keys(response.categories));
        
        // Transformar cada categoría
        const transformedCategories: any = {};
        
        for (const [category, reports] of Object.entries(response.categories)) {
          console.log(`📁 Categoría ${category}:`, reports);
          
          // Verificar que reports sea un array
          if (!Array.isArray(reports)) {
            console.warn(`⚠️ Categoría ${category} no contiene un array de reportes:`, reports);
            continue;
          }
          
          transformedCategories[category] = reports.map((report: any) => {
            // Mapear campos del backend al formato frontend
            const transformed = {
              scope: response.scope,
              category: category as any,
              report_type: report.type || report.report_type,  // Backend puede usar 'type' o 'report_type'
              name: report.name,
              description: report.description || '',
              model: report.datasource || report.model || '',
              available_columns: report.available_columns || [],
              available_filters: this.transformFilters(report.available_filters || {}),
              available_group_by: report.available_groupings || report.available_group_by || [],
              required_roles: report.roles || report.required_roles || []
            };
            
            console.log(`  ✓ Reporte transformado: ${transformed.report_type}`, transformed);
            return transformed;
          });
        }
        
        catalog[response.scope] = transformedCategories;
        console.log('✅ Catálogo transformado completo:', catalog);
      } else {
        console.warn('⚠️ Respuesta del backend no tiene el formato esperado:', response);
      }
      
      return catalog;
    } catch (error) {
      console.error('❌ Error al obtener catálogo:', error);
      throw error;
    }
  }

  /**
   * Transforma filtros del formato backend al formato frontend
   */
  private transformFilters(backendFilters: any): any[] {
    const filters: any[] = [];
    
    for (const [field, config] of Object.entries(backendFilters)) {
      filters.push({
        field,
        type: (config as any).type || 'text',
        choices: (config as any).values || undefined,
        label: field
      });
    }
    
    return filters;
  }

  /**
   * Obtiene la definición de un reporte específico
   */
  async getReportDefinition(
    scope: string,
    category: string,
    reportType: string
  ): Promise<ReportDefinition> {
    const response = await apiClient.get<ReportDefinition>(
      `/reports/catalog/definition/${scope}/${category}/${reportType}/`
    );
    return response;
  }

  /**
   * Genera vista previa de un reporte
   */
  async previewReport(
    config: ReportPreviewRequest
  ): Promise<ReportPreviewResponse> {
    const response = await apiClient.post<ReportPreviewResponse>(
      '/reports/generate/preview/',
      config
    );
    return response;
  }

  /**
   * Genera un reporte completo
   */
  async generateReport(
    config: ReportGenerationRequest
  ): Promise<GeneratedReport> {
    const response = await apiClient.post<GeneratedReport>(
      '/reports/generate/',
      config
    );
    return response;
  }

  /**
   * Obtiene lista de reportes generados con filtros y paginación
   */
  async getGeneratedReports(
    page: number = 1,
    filters?: ReportHistoryFilters
  ): Promise<PaginatedResponse<GeneratedReportList>> {
    const params = new URLSearchParams({
      page: page.toString(),
    });

    // Agregar filtros si existen
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<GeneratedReportList>>(
      `/reports/generated/?${params}`
    );
    return response;
  }

  /**
   * Obtiene un reporte generado específico
   */
  async getGeneratedReport(id: string): Promise<GeneratedReport> {
    const response = await apiClient.get<GeneratedReport>(
      `/reports/generated/${id}/`
    );
    return response;
  }

  /**
   * Obtiene URL de descarga de un reporte
   */
  async getDownloadUrl(id: string): Promise<{
    download_url: string;
    expires_in: number;
    filename: string;
    file_size_bytes: number;
  }> {
    const response = await apiClient.get<{
      download_url: string;
      expires_in: number;
      filename: string;
      file_size_bytes: number;
    }>(`/reports/generated/${id}/download/`);
    return response;
  }

  /**
   * Descarga un reporte directamente
   */
  async downloadReport(id: string): Promise<void> {
    const { download_url, filename } = await this.getDownloadUrl(id);
    
    // Descargar archivo
    const link = document.createElement('a');
    link.href = download_url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Obtiene metadatos completos de un reporte para construir formulario
   * ✅ NUEVO MÉTODO - FASE 2
   */
  async getReportMetadata(
    reportType: string,
    scope?: string
  ): Promise<any> {
    const params = scope ? `?scope=${scope}` : '';
    const response = await apiClient.get<any>(
      `/reports/catalog/${reportType}/${params}`
    );
    return response;
  }

  /**
   * Genera vista previa con chart_config incluido
   * ✅ NUEVO MÉTODO - FASE 2
   */
  async getPreviewWithChart(
    scope: string,
    category: string,
    reportType: string,
    config: any,
    page: number = 1,
    pageSize: number = 50
  ): Promise<any> {
    const response = await apiClient.post<any>(
      '/reports/generate/preview/',
      {
        scope,
        category,
        report_type: reportType,
        config,
        page,
        page_size: pageSize
      }
    );
    return response;
  }
}

export const reportService = new ReportService();
