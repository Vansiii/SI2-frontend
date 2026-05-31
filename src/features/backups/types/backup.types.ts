/**
 * Tipos para el sistema de backups automáticos configurables
 */

export type BackupFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type BackupType = 'full' | 'metadata_only';
export type BackupStatus = 'pending' | 'running' | 'completed' | 'failed' | 'expired';
export type ScheduledBackupLogStatus = 'success' | 'failed' | 'skipped';

export interface BackupScheduleConfig {
  id: number;
  tenant: number;
  tenant_name: string;
  is_enabled: boolean;
  frequency: BackupFrequency;
  hour: number;
  minute: number;
  day_of_week?: number | null;
  day_of_month?: number | null;
  cron_expression?: string | null;
  backup_type: BackupType;
  include_audit_logs: boolean;
  include_physical_files: boolean;
  retention_days: number;
  max_backups_to_keep: number;
  last_run_at?: string | null;
  next_run_at?: string | null;
  last_backup_id?: number | null;
  notify_on_success: boolean;
  notify_on_failure: boolean;
  notification_emails: string[];
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  success_rate: number;
  schedule_description: string;
  created_at: string;
  updated_at: string;
}

export interface BackupScheduleConfigCreate {
  tenant: number;
  is_enabled: boolean;
  frequency: BackupFrequency;
  hour: number;
  minute: number;
  day_of_week?: number | null;
  day_of_month?: number | null;
  cron_expression?: string | null;
  backup_type: BackupType;
  include_audit_logs?: boolean;
  include_physical_files?: boolean;
  retention_days: number;
  max_backups_to_keep: number;
  notify_on_success?: boolean;
  notify_on_failure?: boolean;
  notification_emails?: string[];
}

export interface BackupScheduleConfigUpdate {
  is_enabled?: boolean;
  frequency?: BackupFrequency;
  hour?: number;
  minute?: number;
  day_of_week?: number | null;
  day_of_month?: number | null;
  cron_expression?: string | null;
  backup_type?: BackupType;
  include_audit_logs?: boolean;
  include_physical_files?: boolean;
  retention_days?: number;
  max_backups_to_keep?: number;
  notify_on_success?: boolean;
  notify_on_failure?: boolean;
  notification_emails?: string[];
}

export interface ScheduledBackupLog {
  id: number;
  schedule_config: number;
  tenant_name: string;
  backup_id?: number | null;
  status: ScheduledBackupLogStatus;
  started_at: string;
  completed_at?: string | null;
  duration_seconds?: number | null;
  error_message?: string | null;
  error_traceback?: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface BackupScheduleStatus {
  config_id: number;
  tenant_id: number;
  tenant_name: string;
  is_enabled: boolean;
  frequency: BackupFrequency;
  schedule_description: string;
  last_run_at?: string | null;
  next_run_at?: string | null;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  success_rate: number;
  last_backup_id?: number | null;
  recent_logs: RecentLog[];
}

export interface RecentLog {
  id: number;
  status: ScheduledBackupLogStatus;
  started_at: string;
  duration_seconds?: number | null;
  error_message?: string | null;
}

export interface SchedulerStatus {
  scheduler_running: boolean;
  status: 'running' | 'stopped';
  message: string;
  info: string;
}

export interface RunNowResponse {
  detail: string;
  backup_id?: number;
  duration_seconds?: number;
  reason?: string;
  error?: string;
}

// Opciones para selectores
export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'custom', label: 'Personalizado (Cron)' },
] as const;

export const BACKUP_TYPE_OPTIONS = [
  { value: 'full', label: 'Completo (Datos + Archivos)' },
  { value: 'metadata_only', label: 'Solo Metadatos' },
] as const;

export const DAY_OF_WEEK_OPTIONS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
] as const;

// Helpers
export const getStatusColor = (status: ScheduledBackupLogStatus): string => {
  switch (status) {
    case 'success':
      return 'success';
    case 'failed':
      return 'error';
    case 'skipped':
      return 'warning';
    default:
      return 'default';
  }
};

export const getStatusIcon = (status: ScheduledBackupLogStatus): string => {
  switch (status) {
    case 'success':
      return '✓';
    case 'failed':
      return '✗';
    case 'skipped':
      return '⊘';
    default:
      return '?';
  }
};

export const formatDuration = (seconds?: number | null): string => {
  if (!seconds) return '-';
  
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatTime = (hour: number, minute: number): string => {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};
