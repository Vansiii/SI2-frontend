/**
 * Tipos para el módulo de integraciones externas
 */

export type IntegrationType =
  | 'STRIPE'
  | 'DIDIT'
  | 'BREVO'
  | 'SUPABASE'
  | 'GROQ'
  | 'CREDIT_BUREAU'
  | 'PAYMENT_GATEWAY'
  | 'NOTIFICATION'
  | 'BI_ANALYTICS'
  | 'ACCOUNTING'
  | 'DIGITAL_SIGNATURE'
  | 'GOVERNMENT_API';

export type IntegrationStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'TESTING';

export type LogAction =
  | 'PAYMENT_PROCESSED'
  | 'IDENTITY_VERIFIED'
  | 'EMAIL_SENT'
  | 'FILE_UPLOADED'
  | 'AI_REQUEST'
  | 'CREDIT_CHECK'
  | 'WEBHOOK_RECEIVED'
  | 'SYNC'
  | 'TEST_CONNECTION'
  | 'OTHER';

export type LogStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'TIMEOUT';

export interface ExternalIntegration {
  id: number;
  institution: number;
  integration_type: IntegrationType;
  integration_type_display: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  status_display: string;
  configuration: Record<string, any>;
  webhook_url: string;
  webhook_secret: string;
  last_sync_at: string | null;
  last_success_at: string | null;
  last_error_at: string | null;
  last_error_message: string;
  error_count: number;
  success_count: number;
  is_default: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ExternalIntegrationList {
  id: number;
  integration_type: IntegrationType;
  integration_type_display: string;
  name: string;
  status: IntegrationStatus;
  status_display: string;
  is_default: boolean;
  last_success_at: string | null;
  last_error_at: string | null;
  error_count: number;
  success_count: number;
}

export interface IntegrationLog {
  id: number;
  integration: number;
  integration_name: string;
  integration_type: IntegrationType;
  action: LogAction;
  action_display: string;
  status: LogStatus;
  status_display: string;
  request_data: Record<string, any>;
  response_data: Record<string, any>;
  error_message: string;
  error_code: string;
  duration_ms: number | null;
  user: number | null;
  user_email: string | null;
  ip_address: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface IntegrationLogList {
  id: number;
  integration_name: string;
  action: LogAction;
  action_display: string;
  status: LogStatus;
  status_display: string;
  error_message: string;
  duration_ms: number | null;
  created_at: string;
}

export interface IntegrationMetrics {
  integration_id: number;
  integration_name: string;
  integration_type: IntegrationType;
  status: IntegrationStatus;
  metrics: {
    total_calls: number;
    success_count: number;
    error_count: number;
    success_rate: number;
    last_sync_at: string | null;
    last_success_at: string | null;
    last_error_at: string | null;
    last_error_message: string;
  };
  recent_logs: IntegrationLogList[];
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  duration_ms: number;
}

export interface SyncResponse {
  success: boolean;
  message: string;
  synced_at: string;
}
