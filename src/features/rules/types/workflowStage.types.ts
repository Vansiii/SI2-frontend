export interface WorkflowStageDefinition {
  id: number;
  rule_set: number;
  rule_set_name?: string;
  stage_name: string;
  stage_code: string;
  stage_order: number;
  responsible_role: number | null;
  responsible_role_name?: string;
  time_limit_hours: number | null;
  is_automated: boolean;
  auto_advance_enabled: boolean;
  auto_advance_conditions: Record<string, any>;
  next_stage_on_success: string | null;
  next_stage_on_failure: string | null;
  requires_manual_approval: boolean;
  escalation_enabled: boolean;
  escalation_rules: Record<string, any>;
  notification_template: string | null;
  client_message_template: string | null;
  requires_client_action: boolean;
  client_action_description: string | null;
  client_action_url: string | null;
  is_final_stage: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStageWrite {
  rule_set: number;
  stage_name: string;
  stage_code: string;
  stage_order: number;
  responsible_role?: number | null;
  time_limit_hours?: number | null;
  is_automated?: boolean;
  auto_advance_enabled?: boolean;
  auto_advance_conditions?: Record<string, any>;
  next_stage_on_success?: string | null;
  next_stage_on_failure?: string | null;
  requires_manual_approval?: boolean;
  escalation_enabled?: boolean;
  escalation_rules?: Record<string, any>;
  notification_template?: string | null;
  client_message_template?: string | null;
  requires_client_action?: boolean;
  client_action_description?: string | null;
  client_action_url?: string | null;
  is_final_stage?: boolean;
}

export const STAGE_CODES = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'SUBMITTED', label: 'Enviada' },
  { value: 'DOCUMENTS', label: 'Documentos' },
  { value: 'KYC', label: 'Verificación de Identidad' },
  { value: 'SCORING', label: 'Evaluación Crediticia' },
  { value: 'REVIEW', label: 'Revisión Manual' },
  { value: 'APPROVED', label: 'Aprobada' },
  { value: 'REJECTED', label: 'Rechazada' },
  { value: 'DISBURSED', label: 'Desembolsada' },
  { value: 'CANCELLED', label: 'Cancelada' },
] as const;