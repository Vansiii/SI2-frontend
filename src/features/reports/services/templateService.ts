/**
 * Servicio para gestionar plantillas de reportes
 */
import { apiClient } from '../../../utils/apiClient';
import type {
  ReportTemplate,
  CreateTemplateData,
  UpdateTemplateData,
  GeneratedReport,
  PaginatedResponse,
} from '../types';

class TemplateService {
  /**
   * Obtiene lista de plantillas
   */
  async getTemplates(
    page: number = 1
  ): Promise<PaginatedResponse<ReportTemplate>> {
    const params = new URLSearchParams({
      page: page.toString(),
    });

    const response = await apiClient.get<PaginatedResponse<ReportTemplate>>(
      `/reports/templates/?${params}`
    );
    return response;
  }

  /**
   * Obtiene una plantilla específica
   */
  async getTemplate(id: string): Promise<ReportTemplate> {
    const response = await apiClient.get<ReportTemplate>(
      `/reports/templates/${id}/`
    );
    return response;
  }

  /**
   * Crea una nueva plantilla
   */
  async createTemplate(data: CreateTemplateData): Promise<ReportTemplate> {
    const response = await apiClient.post<ReportTemplate>(
      '/reports/templates/',
      data
    );
    return response;
  }

  /**
   * Actualiza una plantilla existente
   */
  async updateTemplate(
    id: string,
    data: UpdateTemplateData
  ): Promise<ReportTemplate> {
    const response = await apiClient.patch<ReportTemplate>(
      `/reports/templates/${id}/`,
      data
    );
    return response;
  }

  /**
   * Elimina una plantilla
   */
  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/reports/templates/${id}/`);
  }

  /**
   * Usa una plantilla para generar un reporte
   */
  async useTemplate(
    id: string,
    overrides?: {
      override_date_range?: any;
      override_filters?: any[];
    }
  ): Promise<GeneratedReport> {
    const response = await apiClient.post<GeneratedReport>(
      `/reports/templates/${id}/use/`,
      overrides || {}
    );
    return response;
  }
}

export const templateService = new TemplateService();
