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
}

export const backupsApi = new BackupsApi();
export default backupsApi;
