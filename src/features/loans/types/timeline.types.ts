export interface TimelineEvent {
  id: number;
  loan_application: number;
  from_status: string;
  to_status: string;
  changed_by: number | null;
  changed_by_name?: string;
  notes: string;
  is_visible_to_client: boolean;
  client_message: string;
  requires_client_action: boolean;
  action_description: string;
  action_url: string;
  action_completed_at: string | null;
  notification_sent: boolean;
  notification_sent_at: string | null;
  created_at: string;
  is_pending_action: boolean;
}

export interface PendingAction {
  id: number;
  client_message: string;
  action_description: string;
  action_url: string;
  created_at: string;
  to_status: string;
}

export interface DocumentSummary {
  total_documents: number;
  mandatory_documents: number;
  uploaded_documents: number;
  approved_documents: number;
  rejected_documents: number;
  pending_documents: number;
  is_complete: boolean;
  completion_percentage: number;
}

export interface CurrentStage {
  status: string;
  status_display: string;
  message: string;
  requires_action: boolean;
}

export interface LoanApplicationTimeline {
  id: number;
  application_number: string;
  product_name: string;
  requested_amount: string;
  term_months: number;
  status: string;
  status_display: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  current_stage: CurrentStage;
  timeline: TimelineEvent[];
  pending_actions: PendingAction[];
  documents_summary: DocumentSummary;
  document_checklist: any[]; // Se definirá en document.types.ts
}

export interface LoanApplicationListItem {
  id: number;
  application_number: string;
  product_name: string;
  requested_amount: string;
  term_months: number;
  status: string;
  status_display: string;
  submitted_at: string | null;
  created_at: string;
  current_stage: CurrentStage;
  pending_actions_count: number;
}
