/**
 * Tipos para el sistema de auditoría
 */

export interface AuditLog {
  id: number;
  user: number | null;
  user_email: string | null;
  user_name: string;
  action: string;
  action_display: string;
  resource_type: string;
  resource_id: number | null;
  description: string;
  timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
  institution: number | null;
  institution_name: string | null;
  severity: 'info' | 'warning' | 'error' | 'critical';
  severity_display: string;
  metadata: Record<string, any>;
}

export interface AuditLogList {
  id: number;
  user_email: string | null;
  action: string;
  action_display: string;
  resource_type: string;
  resource_id: number | null;
  description: string;
  timestamp: string;
  ip_address: string | null;
  institution_name: string | null;
  severity: 'info' | 'warning' | 'error' | 'critical';
  severity_display: string;
}

export interface SecurityEvent {
  id: number;
  event_type: string;
  event_type_display: string;
  user: number | null;
  user_email: string | null;
  user_name: string;
  email: string | null;
  ip_address: string;
  user_agent: string | null;
  timestamp: string;
  description: string;
  metadata: Record<string, any>;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: number | null;
  resolved_by_email: string | null;
}

export interface SecurityEventList {
  id: number;
  event_type: string;
  event_type_display: string;
  user_email: string | null;
  email: string | null;
  ip_address: string;
  timestamp: string;
  description: string;
  resolved: boolean;
}

export interface AuditStats {
  total_logs: number;
  actions: Array<{ action: string; count: number }>;
  severity: Array<{ severity: string; count: number }>;
  institutions: Array<{
    institution__id: number;
    institution__name: string;
    count: number;
  }>;
  users: Array<{
    user__id: number;
    user__email: string;
    count: number;
  }>;
}

export interface SecurityStats {
  total_events: number;
  unresolved_count: number;
  event_types: Array<{ event_type: string; count: number }>;
  top_ips: Array<{ ip_address: string; count: number }>;
}

export interface AuditFilters {
  user_id?: number;
  institution_id?: number;
  action?: string;
  severity?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface SecurityEventFilters {
  event_type?: string;
  resolved?: boolean;
  user_id?: number;
  ip_address?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}
