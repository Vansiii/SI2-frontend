/**
 * Servicio para gestionar auditoría y eventos de seguridad
 */
import { apiClient } from '../../../utils/apiClient';
import type {
  AuditLog,
  AuditLogList,
  SecurityEvent,
  SecurityEventList,
  AuditStats,
  SecurityStats,
  AuditFilters,
  SecurityEventFilters,
} from '../types';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class AuditService {
  /**
   * Obtiene logs de auditoría con filtros y paginación
   */
  async getAuditLogs(
    page: number = 1,
    filters?: AuditFilters
  ): Promise<PaginatedResponse<AuditLogList>> {
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

    const response = await apiClient.get<PaginatedResponse<AuditLogList>>(
      `/audit/logs/?${params}`
    );
    return response;
  }

  /**
   * Obtiene un log de auditoría específico
   */
  async getAuditLog(id: number): Promise<AuditLog> {
    const response = await apiClient.get<AuditLog>(`/audit/logs/${id}/`);
    return response;
  }

  /**
   * Obtiene estadísticas de auditoría
   */
  async getAuditStats(): Promise<AuditStats> {
    const response = await apiClient.get<AuditStats>('/audit/logs/stats/');
    return response;
  }

  /**
   * Obtiene eventos críticos recientes
   */
  async getRecentCritical(): Promise<AuditLogList[]> {
    const response = await apiClient.get<AuditLogList[]>(
      '/audit/logs/recent_critical/'
    );
    return response;
  }

  /**
   * Obtiene eventos de seguridad con filtros y paginación
   */
  async getSecurityEvents(
    page: number = 1,
    filters?: SecurityEventFilters
  ): Promise<PaginatedResponse<SecurityEventList>> {
    const params = new URLSearchParams({
      page: page.toString(),
      ...(filters as any),
    });

    const response = await apiClient.get<PaginatedResponse<SecurityEventList>>(
      `/audit/security-events/?${params}`
    );
    return response;
  }

  /**
   * Obtiene un evento de seguridad específico
   */
  async getSecurityEvent(id: number): Promise<SecurityEvent> {
    const response = await apiClient.get<SecurityEvent>(
      `/audit/security-events/${id}/`
    );
    return response;
  }

  /**
   * Obtiene eventos de seguridad no resueltos
   */
  async getUnresolvedEvents(): Promise<PaginatedResponse<SecurityEventList>> {
    const response = await apiClient.get<PaginatedResponse<SecurityEventList>>(
      '/audit/security-events/unresolved/'
    );
    return response;
  }

  /**
   * Marca un evento de seguridad como resuelto
   */
  async resolveSecurityEvent(
    id: number,
    notes?: string
  ): Promise<SecurityEvent> {
    const response = await apiClient.post<SecurityEvent>(
      `/audit/security-events/${id}/resolve/`,
      { notes }
    );
    return response;
  }

  /**
   * Obtiene estadísticas de eventos de seguridad
   */
  async getSecurityStats(): Promise<SecurityStats> {
    const response = await apiClient.get<SecurityStats>(
      '/audit/security-events/stats/'
    );
    return response;
  }
}

export const auditService = new AuditService();
