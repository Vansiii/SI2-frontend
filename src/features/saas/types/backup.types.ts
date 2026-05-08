/**
 * Tipos TypeScript para el sistema de backups
 */

export interface Tenant {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  email: string;
}

export interface BackupManifest {
  included_tables: string[];
  total_records: number;
  schema_version: string;
  record_counts: Record<string, number>;
  file_list: string[];
}

export type BackupType = 'full' | 'metadata_only' | 'storage_only';
export type BackupStatus = 'pending' | 'running' | 'completed' | 'failed' | 'expired';

export interface Backup {
  id: number;
  tenant: Tenant;
  tenant_name?: string;
  backup_type: BackupType;
  status: BackupStatus;
  backup_path?: string;  // Ruta del archivo en storage
  total_size_mb: number;
  file_count: number;
  created_at: string;
  completed_at: string | null;
  expires_at: string | null;
  duration_seconds: number | null;
  requested_by?: User;
  requested_by_email?: string;
  manifest?: BackupManifest;
  error_message?: string;
  notes?: string;
  is_expired?: boolean;
}

export interface CreateBackupRequest {
  backup_type: BackupType;
  notes?: string;
  include_audit_logs?: boolean;
  include_physical_files?: boolean;
}

export interface RestoreBackupRequest {
  conflict_strategy?: 'skip' | 'overwrite' | 'fail';
  restore_files?: boolean;
  dry_run?: boolean;
}

export interface RestorePreview {
  backup_id: number;
  tenant_id: number;
  tenant_name: string;
  backup_date: string;
  total_records: number;
  potential_conflicts: number;
  file_count: number;
  models: Record<string, {
    total: number;
    conflicts: number;
    new: number;
  }>;
}

export interface RestoreResult {
  success: boolean;
  backup_id: number;
  tenant_id: number;
  tenant_name: string;
  duration_seconds: number;
  files_restored: number;
  dry_run: boolean;
  import_stats: {
    total_created: number;
    total_updated: number;
    total_skipped: number;
    total_errors: number;
    created: Record<string, number>;
    updated: Record<string, number>;
    skipped: Record<string, number>;
    errors: Record<string, number>;
  };
}

export interface DownloadUrlResponse {
  download_url: string;
  expires_in: number;
  backup_id: number;
  size_mb: number;
}

export type AuditAction =
  | 'backup_requested'
  | 'backup_started'
  | 'backup_completed'
  | 'backup_failed'
  | 'backup_downloaded'
  | 'backup_deleted'
  | 'backup_expired'
  | 'restore_started'
  | 'restore_completed'
  | 'restore_failed'
  | 'backup_access_denied'
  | 'backup_unauthorized_attempt';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLog {
  id: number;
  action: AuditAction;
  severity: AuditSeverity;
  description: string;
  actor: User | null;
  actor_email?: string;
  created_at: string;
  ip_address: string | null;
  metadata: Record<string, any>;
}

export interface CleanupStats {
  expired: {
    count: number;
    size_mb: number;
  };
  failed_old: {
    count: number;
  };
  expiring_soon: {
    count: number;
  };
  timestamp: string;
}

export interface BackupFilters {
  status?: BackupStatus;
  backup_type?: BackupType;
  date_from?: string;
  date_to?: string;
}
