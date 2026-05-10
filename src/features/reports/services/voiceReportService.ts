/**
 * Servicio para gestionar reportes por voz
 */
import { apiClient } from '../../../utils/apiClient';
import type {
  VoiceInterpretRequest,
  VoiceInterpretResponse,
  VoiceReportRequest,
  PaginatedResponse,
  VoiceHistoryFilters,
} from '../types';

class VoiceReportService {
  /**
   * Interpreta audio y devuelve configuración propuesta
   */
  async interpretAudio(
    audioFile: File,
    scope: 'TENANT' | 'SAAS'
  ): Promise<VoiceInterpretResponse> {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    formData.append('scope', scope);

    const response = await apiClient.post<VoiceInterpretResponse>(
      '/reports/voice/interpret/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  }

  /**
   * Obtiene historial de solicitudes de voz
   */
  async getVoiceHistory(
    page: number = 1,
    filters?: VoiceHistoryFilters
  ): Promise<PaginatedResponse<VoiceReportRequest>> {
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

    const response = await apiClient.get<PaginatedResponse<VoiceReportRequest>>(
      `/reports/voice/history/?${params}`
    );
    return response;
  }

  /**
   * Obtiene detalle de una solicitud de voz
   */
  async getVoiceRequest(id: string): Promise<VoiceReportRequest> {
    const response = await apiClient.get<VoiceReportRequest>(
      `/reports/voice/history/${id}/`
    );
    return response;
  }
}

export const voiceReportService = new VoiceReportService();
