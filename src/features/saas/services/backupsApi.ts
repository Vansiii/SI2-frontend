/**
 * Servicio de API para gestión de backups
 */

import { apiClient } from '../../../utils/apiClient';
import type {
  Backup,
  CreateBackupRequest,
  DownloadUrlResponse,
  AuditLog,
  CleanupStats,
  RestorePreview,
  RestoreBackupRequest,
  RestoreResult,
} from '../types/backup.types';

class BackupsApi {
  private baseUrl = '/saas/tenants';

  /**
   * Listar backups de un tenant
   */
  async listBackups(tenantId: number): Promise<Backup[]> {
    return apiClient.get<Backup[]>(`${this.baseUrl}/${tenantId}/backups/`);
  }

  /**
   * Obtener detalle de un backup
   */
  async getBackup(tenantId: number, backupId: number): Promise<Backup> {
    return apiClient.get<Backup>(
      `${this.baseUrl}/${tenantId}/backups/${backupId}/`
    );
  }

  /**
   * Crear nuevo backup
   */
  async createBackup(
    tenantId: number,
    data: CreateBackupRequest
  ): Promise<Backup> {
    return apiClient.post<Backup>(
      `${this.baseUrl}/${tenantId}/backups/`,
      data
    );
  }

  /**
   * Obtener URL de descarga
   */
  async getDownloadUrl(
    tenantId: number,
    backupId: number
  ): Promise<DownloadUrlResponse> {
    return apiClient.get<DownloadUrlResponse>(
      `${this.baseUrl}/${tenantId}/backups/${backupId}/download/`
    );
  }

  /**
   * Eliminar backup (solo superadmin)
   */
  async deleteBackup(tenantId: number, backupId: number): Promise<void> {
    return apiClient.delete<void>(
      `${this.baseUrl}/${tenantId}/backups/${backupId}/`
    );
  }

  /**
   * Obtener logs de auditoría de un backup
   */
  async getAuditLogs(tenantId: number, backupId: number): Promise<AuditLog[]> {
    return apiClient.get<AuditLog[]>(
      `${this.baseUrl}/${tenantId}/backups/${backupId}/audit-logs/`
    );
  }

  /**
   * Obtener estadísticas de limpieza
   */
  async getCleanupStats(tenantId: number): Promise<CleanupStats> {
    return apiClient.get<CleanupStats>(
      `${this.baseUrl}/${tenantId}/backups/cleanup-stats/`
    );
  }

  /**
   * Obtener preview de restauración
   */
  async getRestorePreview(
    tenantId: number,
    backupId: number
  ): Promise<RestorePreview> {
    return apiClient.get<RestorePreview>(
      `${this.baseUrl}/${tenantId}/backups/${backupId}/restore-preview/`
    );
  }

  /**
   * Restaurar backup
   */
  async restoreBackup(
    tenantId: number,
    backupId: number,
    data: RestoreBackupRequest
  ): Promise<RestoreResult> {
    return apiClient.post<RestoreResult>(
      `${this.baseUrl}/${tenantId}/backups/${backupId}/restore/`,
      data
    );
  }

  /**
   * Descargar backup directamente al dispositivo
   */
  async downloadBackupDirect(downloadUrl: string, filename: string): Promise<void> {
    try {
      // Crear un enlace temporal y hacer clic en él
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar backup:', error);
      throw new Error('Error al descargar el archivo');
    }
  }

  /**
   * Descargar backup (abre en nueva ventana) - DEPRECATED
   * @deprecated Use downloadBackupDirect instead
   */
  downloadBackup(downloadUrl: string): void {
    window.open(downloadUrl, '_blank');
  }

  /**
   * Formatear tamaño en MB
   */
  formatSize(mb: number): string {
    if (mb < 1) return `${(mb * 1024).toFixed(2)} KB`;
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  }

  /**
   * Formatear duración en segundos
   */
  formatDuration(seconds: number | null): string {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ============================================================
  // Automatic Backups (Scheduled)
  // ============================================================

  /**
   * Obtiene todas las configuraciones de backups programados
   */
  async getSchedules(): Promise<any[]> {
    return apiClient.get<any[]>('/saas/schedules/');
  }

  /**
   * Obtiene una configuración específica
   */
  async getSchedule(id: number): Promise<any> {
    return apiClient.get<any>(`/saas/schedules/${id}/`);
  }

  /**
   * Crea una nueva configuración de backup programado
   */
  async createSchedule(data: any): Promise<any> {
    return apiClient.post<any>('/saas/schedules/', data);
  }

  /**
   * Actualiza una configuración existente
   */
  async updateSchedule(id: number, data: any): Promise<any> {
    return apiClient.patch<any>(`/saas/schedules/${id}/`, data);
  }

  /**
   * Elimina una configuración
   */
  async deleteSchedule(id: number): Promise<void> {
    return apiClient.delete<void>(`/saas/schedules/${id}/`);
  }

  /**
   * Habilita un schedule
   */
  async enableSchedule(id: number): Promise<any> {
    return apiClient.post<any>(`/saas/schedules/${id}/enable/`);
  }

  /**
   * Deshabilita un schedule
   */
  async disableSchedule(id: number): Promise<any> {
    return apiClient.post<any>(`/saas/schedules/${id}/disable/`);
  }

  /**
   * Obtiene el estado detallado de un schedule
   */
  async getScheduleStatus(id: number): Promise<any> {
    return apiClient.get<any>(`/saas/schedules/${id}/status/`);
  }

  /**
   * Ejecuta un backup inmediatamente (fuera del schedule)
   */
  async runNow(id: number): Promise<any> {
    return apiClient.post<any>(`/saas/schedules/${id}/run-now/`);
  }

  /**
   * Obtiene el estado del scheduler automático
   */
  async getSchedulerStatus(): Promise<any> {
    return apiClient.get<any>('/saas/schedules/scheduler-status/');
  }

  /**
   * Obtiene todos los logs de ejecuciones programadas
   */
  async getLogs(params?: { config_id?: number; status?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.config_id) query.append('config_id', String(params.config_id));
    if (params?.status) query.append('status', params.status);
    const qs = query.toString();
    return apiClient.get<any[]>(`/saas/scheduled-logs/${qs ? `?${qs}` : ''}`);
  }

  /**
   * Obtiene un log específico
   */
  async getLog(id: number): Promise<any> {
    return apiClient.get<any>(`/saas/scheduled-logs/${id}/`);
  }
}

export const backupsApi = new BackupsApi();
export default backupsApi;
