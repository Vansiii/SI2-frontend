/**
 * Servicio API para gestión de solicitudes de crédito CU-11.
 */

import { apiClient } from '@/utils/apiClient';

export type LoanApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'OBSERVED'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISBURSED'
  | 'CANCELLED';

export type IdentityVerificationStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'APPROVED'
  | 'DECLINED'
  | 'MANUAL_REVIEW'
  | 'EXPIRED'
  | 'ERROR';

export interface IdentityVerification {
  id: number;
  user: any;
  institution_name: string;
  credit_application_number: string;
  status: IdentityVerificationStatus;
  decision: string;
  document_type: string;
  document_number: string;
  full_name: string;
  date_of_birth: string;
  country: string;
  error_message?: string;
  raw_response?: any;
  completed_at: string;
  created_at: string;
}

export type DocumentsStatus = 'PENDING' | 'INCOMPLETE' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETE';

export interface LoanApplicationDocument {
  id: number;
  document_type: string;
  file: string;
  file_url?: string | null;
  file_name: string;
  file_size: number;
  description: string;
  uploaded_by: number;
  uploaded_by_name?: string | null;
  is_verified: boolean;
  verified_by?: number | null;
  verified_at?: string | null;
  created_at: string;
}

export interface LoanApplicationComment {
  id: number;
  user: number;
  user_name: string;
  user_email?: string | null;
  comment: string;
  is_internal: boolean;
  created_at: string;
  updated_at?: string;
}

export interface LoanApplicationTimelineEvent {
  id: number;
  previous_status: LoanApplicationStatus | null;
  new_status: LoanApplicationStatus;
  title: string;
  description: string;
  actor: number | null;
  actor_name?: string | null;
  actor_role?: string | null;
  is_visible_to_borrower: boolean;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface LoanApplicationClient {
  id: number;
  full_name?: string;
  document_number?: string;
  email?: string;
  user?: {
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export interface LoanApplicationProduct {
  id: number;
  name: string;
  product_type?: string;
  min_amount?: string;
  max_amount?: string;
  min_term_months?: number;
  max_term_months?: number;
  interest_rate?: string;
}

export interface LoanApplicationBranch {
  id: number;
  name?: string;
  code?: string;
}

export interface LoanApplicationListItem {
  id: number;
  application_number: string;
  client_name: string;
  product_name: string;
  requested_amount: string;
  term_months: number;
  status: LoanApplicationStatus;
  status_display: string;
  submitted_at?: string | null;
  identity_verification_status?: IdentityVerificationStatus | null;
  assigned_to?: number | null;
  assigned_to_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanApplication extends LoanApplicationListItem {
  client?: LoanApplicationClient;
  product?: LoanApplicationProduct;
  branch?: LoanApplicationBranch | null;
  purpose?: string;
  monthly_income?: string | null;
  employment_type?: string | null;
  employment_type_display?: string | null;
  employment_description?: string | null;
  additional_data?: Record<string, unknown> | null;
  identity_verification_display?: string | null;
  documents_status?: DocumentsStatus | null;
  documents_status_display?: string | null;
  credit_score?: number | null;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | null;
  risk_level_display?: string | null;
  debt_to_income_ratio?: string | null;
  approved_amount?: string | null;
  approved_term_months?: number | null;
  approved_interest_rate?: string | null;
  monthly_payment?: string | null;
  reviewed_by?: number | null;
  reviewed_by_name?: string | null;
  approved_by?: number | null;
  approved_by_name?: string | null;
  created_by?: number | null;
  created_by_name?: string | null;
  updated_by?: number | null;
  updated_by_name?: string | null;
  notes?: string | null;
  internal_notes?: string | null;
  observation_reason?: string | null;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  disbursed_at?: string | null;
  timeline?: LoanApplicationTimelineEvent[];
  comments?: LoanApplicationComment[];
  documents?: LoanApplicationDocument[];
  identity_verification_id?: number | null;
  identity_verification_details?: {
    id: number;
    status: string;
    decision: string;
    document_type: string;
    document_number: string;
    full_name: string;
    date_of_birth: string | null;
    country: string;
    provider: string;
    completed_at: string | null;
    created_at: string;
  } | null;
  current_workflow_stage?: any;
  product_workflow_stages?: any[];
}

export type CreditApplication = LoanApplication;

export interface LoanApplicationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LoanApplicationListItem[];
}

export interface CreateLoanApplicationData {
  product_id: number;
  requested_amount: string;
  term_months: number;
  purpose: string;
  monthly_income?: string | null;
  employment_type?: string | null;
  employment_description?: string;
  branch_id?: number | null;
  additional_data?: Record<string, unknown>;
}

export interface UpdateLoanApplicationData {
  product_id?: number;
  requested_amount?: string;
  term_months?: number;
  purpose?: string;
  monthly_income?: string | null;
  employment_type?: string | null;
  employment_description?: string;
  branch_id?: number | null;
  additional_data?: Record<string, unknown>;
}

export interface ChangeLoanApplicationStatusData {
  new_status: Exclude<LoanApplicationStatus, 'DRAFT'>;
  reason?: string;
  approved_amount?: string | null;
  approved_term_months?: number | null;
  approved_interest_rate?: string | null;
}

export interface AddLoanApplicationCommentData {
  comment: string;
  is_internal?: boolean;
}

export interface ApproveLoanApplicationData {
  approved_amount?: string;
  approved_term_months?: number;
  approved_interest_rate?: string;
  notes?: string;
}

export interface DisburseLoanApplicationData {
  notes?: string;
}

export interface RejectLoanApplicationData {
  rejection_reason: string;
  notes?: string;
}

export interface RejectionReason {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  category_display: string;
  is_active: boolean;
  display_order: number;
  requires_notes: boolean;
}

export interface ReviewLoanApplicationData {
  credit_score?: number;
  risk_level?: string;
  notes?: string;
}

export interface LoanApplicationFilters {
  search?: string;
  status?: LoanApplicationStatus | '';
  branch_id?: number | '';
  product_id?: number | '';
  identity_verification_status?: IdentityVerificationStatus | '';
  ordering?: string;
  page?: number;
  page_size?: number;
}

const CREDIT_APPLICATIONS_ENDPOINT = '/loans/credit-applications/';

function buildQueryString(filters: LoanApplicationFilters = {}): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
}

function normalizeListResponse(
  response: LoanApplicationListResponse | LoanApplicationListItem[]
): LoanApplicationListResponse {
  if (Array.isArray(response)) {
    return {
      count: response.length,
      next: null,
      previous: null,
      results: response,
    };
  }

  return response;
}

function buildStatusPayload(
  status: ChangeLoanApplicationStatusData['new_status'],
  data: Record<string, unknown> = {}
): ChangeLoanApplicationStatusData {
  const payload: ChangeLoanApplicationStatusData = { new_status: status };

  if (typeof data.reason === 'string') {
    payload.reason = data.reason;
  }
  if (typeof data.approved_amount === 'string') {
    payload.approved_amount = data.approved_amount;
  }
  if (typeof data.approved_term_months === 'number') {
    payload.approved_term_months = data.approved_term_months;
  }
  if (typeof data.approved_interest_rate === 'string') {
    payload.approved_interest_rate = data.approved_interest_rate;
  }

  return payload;
}

export async function getLoanApplications(
  filters: LoanApplicationFilters = {}
): Promise<LoanApplicationListResponse> {
  const response = await apiClient.get<LoanApplicationListResponse | LoanApplicationListItem[]>(
    `${CREDIT_APPLICATIONS_ENDPOINT}${buildQueryString(filters)}`
  );

  return normalizeListResponse(response);
}

export async function getLoanApplication(id: number): Promise<LoanApplication> {
  return apiClient.get<LoanApplication>(`${CREDIT_APPLICATIONS_ENDPOINT}${id}/`);
}

export async function getIdentityVerification(id: number): Promise<IdentityVerification> {
  return apiClient.get<IdentityVerification>(`/identity-verifications/${id}/`);
}

export async function createLoanApplication(
  data: CreateLoanApplicationData
): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>(CREDIT_APPLICATIONS_ENDPOINT, data);
}

export async function updateLoanApplication(
  id: number,
  data: UpdateLoanApplicationData
): Promise<LoanApplication> {
  return apiClient.patch<LoanApplication>(`${CREDIT_APPLICATIONS_ENDPOINT}${id}/`, data);
}

export async function deleteLoanApplication(id: number): Promise<void> {
  await apiClient.delete(`${CREDIT_APPLICATIONS_ENDPOINT}${id}/`);
}

export async function submitLoanApplication(id: number): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>(`${CREDIT_APPLICATIONS_ENDPOINT}${id}/submit/`, {});
}

export async function changeLoanApplicationStatus(
  id: number,
  data: ChangeLoanApplicationStatusData
): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>(`${CREDIT_APPLICATIONS_ENDPOINT}${id}/change-status/`, data);
}

export async function getLoanApplicationTimeline(
  applicationId: number
): Promise<LoanApplicationTimelineEvent[]> {
  return apiClient.get<LoanApplicationTimelineEvent[]>(
    `${CREDIT_APPLICATIONS_ENDPOINT}${applicationId}/timeline/`
  );
}

export async function getLoanApplicationComments(
  applicationId: number
): Promise<LoanApplicationComment[]> {
  return apiClient.get<LoanApplicationComment[]>(
    `${CREDIT_APPLICATIONS_ENDPOINT}${applicationId}/comments/`
  );
}

export async function addLoanApplicationComment(
  applicationId: number,
  comment: string,
  isInternal = true
): Promise<LoanApplicationComment> {
  return apiClient.post<LoanApplicationComment>(
    `${CREDIT_APPLICATIONS_ENDPOINT}${applicationId}/comments/`,
    {
      comment,
      is_internal: isInternal,
    }
  );
}

export async function uploadLoanApplicationDocument(
  applicationId: number,
  file: File,
  documentType: string,
  description?: string
): Promise<LoanApplicationDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);
  if (description) {
    formData.append('description', description);
  }

  return apiClient.post<LoanApplicationDocument>(
    `${CREDIT_APPLICATIONS_ENDPOINT}${applicationId}/documents/`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
}

export function calculateMonthlyPayment(
  amount: number,
  termMonths: number,
  interestRate: number
): number {
  const monthlyRate = interestRate / 100 / 12;

  if (termMonths <= 0) {
    return 0;
  }

  if (monthlyRate === 0) {
    return Math.round((amount / termMonths) * 100) / 100;
  }

  const payment =
    (amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  return Math.round(payment * 100) / 100;
}

export function formatApplicationNumber(applicationNumber: string): string {
  const parts = applicationNumber.split('-');

  if (parts.length >= 4) {
    return `#${parts[2]}-${parts[3]}`;
  }

  return applicationNumber;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'slate',
    SUBMITTED: 'blue',
    IN_REVIEW: 'amber',
    OBSERVED: 'orange',
    APPROVED: 'emerald',
    REJECTED: 'rose',
    DISBURSED: 'teal',
    CANCELLED: 'gray',
  };

  return colors[status] || 'slate';
}

export function getIdentityStatusColor(status?: string | null): string {
  const colors: Record<string, string> = {
    PENDING: 'slate',
    IN_PROGRESS: 'blue',
    APPROVED: 'emerald',
    DECLINED: 'rose',
    MANUAL_REVIEW: 'amber',
    EXPIRED: 'orange',
    ERROR: 'red',
  };

  return colors[status || ''] || 'slate';
}

export function getDocumentsStatusColor(status?: string | null): string {
  const colors: Record<string, string> = {
    PENDING: 'slate',
    INCOMPLETE: 'amber',
    UNDER_REVIEW: 'blue',
    APPROVED: 'emerald',
    REJECTED: 'rose',
    COMPLETE: 'teal',
  };

  return colors[status || ''] || 'slate';
}

export function getAvailableActions(application: Pick<LoanApplication, 'status'>) {
  const actions: Array<{ key: string; label: string; color: string }> = [];

  if (application.status === 'DRAFT' || application.status === 'OBSERVED') {
    actions.push({ key: 'submit', label: 'Enviar', color: 'emerald' });
  }

  if (application.status === 'SUBMITTED' || application.status === 'IN_REVIEW') {
    actions.push({ key: 'review', label: 'Poner en revisión', color: 'amber' });
    actions.push({ key: 'observe', label: 'Observar', color: 'orange' });
    actions.push({ key: 'approve', label: 'Aprobar', color: 'emerald' });
    actions.push({ key: 'reject', label: 'Rechazar', color: 'rose' });
  }

  if (application.status === 'APPROVED') {
    actions.push({ key: 'disburse', label: 'Desembolsar', color: 'teal' });
  }

  return actions;
}

export async function reviewLoanApplication(
  id: number,
  data: { credit_score?: number; risk_level?: string; debt_to_income_ratio?: string; notes?: string }
): Promise<LoanApplication> {
  return changeLoanApplicationStatus(id, buildStatusPayload('IN_REVIEW', { reason: data.notes }));
}

export async function approveLoanApplication(
  id: number,
  data: ApproveLoanApplicationData
): Promise<LoanApplication> {
  return changeLoanApplicationStatus(
    id,
    buildStatusPayload('APPROVED', {
      reason: data.notes,
      approved_amount: data.approved_amount,
      approved_term_months: data.approved_term_months,
      approved_interest_rate: data.approved_interest_rate,
    })
  );
}

export async function rejectLoanApplication(
  id: number,
  data: { rejection_reason: string }
): Promise<LoanApplication> {
  return changeLoanApplicationStatus(id, buildStatusPayload('REJECTED', { reason: data.rejection_reason }));
}

export async function getRejectionReasons(): Promise<RejectionReason[]> {
  const response = await apiClient.get<RejectionReason[]>('/api/loans/rejection-reasons/');
  return response.data;
}

export async function disburseLoanApplication(
  id: number,
  data: { notes?: string }
): Promise<LoanApplication> {
  return changeLoanApplicationStatus(id, buildStatusPayload('DISBURSED', { reason: data.notes }));
}

export async function calculateLoanScore(id: number): Promise<{
  credit_score?: number;
  risk_level?: string;
  debt_to_income_ratio?: number;
}> {
  const application = await getLoanApplication(id);
  return {
    credit_score: application.credit_score ?? undefined,
    risk_level: application.risk_level ?? undefined,
    debt_to_income_ratio: application.debt_to_income_ratio ? Number(application.debt_to_income_ratio) : undefined,
  };
}


// ============================================================================
// APPROVAL QUEUE - SP3-99
// ============================================================================

export interface WorkflowStageExecution {
  id: number;
  workflow_execution: number;
  stage_definition: {
    id: number;
    stage_name: string;
    stage_code: string;
    stage_order: number;
    requires_manual_approval: boolean;
    time_limit_hours: number | null;
  };
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'FAILED';
  assigned_to: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  entered_at: string;
  started_at: string | null;
  completed_at: string | null;
  sla_deadline: string | null;
  time_remaining_hours: number | null;
  is_overdue: boolean;
  loan_application: {
    id: number;
    application_number: string;
    client: LoanApplicationClient;
    product: LoanApplicationProduct;
    requested_amount: string;
    term_months: number;
    status: LoanApplicationStatus;
    credit_score: number | null;
    risk_level: string | null;
  };
}

export interface ApprovalQueueMetrics {
  total_pending: number;
  overdue_count: number;
  total_decisions_30d: number;
  approved_count_30d: number;
  rejected_count_30d: number;
  approval_rate: number;
  avg_decision_time_hours: number;
}

export interface ApprovalQueueResponse {
  results: WorkflowStageExecution[];
  total_count: number;
  urgent_count: number;
  normal_count: number;
  low_priority_count: number;
  metrics: ApprovalQueueMetrics;
}

export interface ApprovalQueueFilters {
  priority?: 'urgent' | 'normal' | 'low';
}

/**
 * Obtiene la cola de aprobaciones del usuario actual
 */
export async function getApprovalQueue(filters?: ApprovalQueueFilters): Promise<ApprovalQueueResponse> {
  const response = await apiClient.get<ApprovalQueueResponse>('/api/loans/approvals/queue/', {
    params: filters
  });
  return response.data;
}

/**
 * Obtiene las métricas de la cola de aprobaciones
 */
export async function getApprovalQueueMetrics(): Promise<ApprovalQueueMetrics> {
  const response = await apiClient.get<ApprovalQueueMetrics>('/api/loans/approvals/queue/metrics/');
  return response.data;
}

/**
 * Obtiene las solicitudes vencidas (SLA excedido)
 */
export async function getOverdueApplications(): Promise<{ results: WorkflowStageExecution[]; total_count: number }> {
  const response = await apiClient.get<{ results: WorkflowStageExecution[]; total_count: number }>(
    '/api/loans/approvals/queue/overdue/'
  );
  return response.data;
}

/**
 * Asigna una etapa a un usuario
 */
export async function assignStageToUser(stageExecutionId: number, userId: number): Promise<WorkflowStageExecution> {
  const response = await apiClient.post<WorkflowStageExecution>('/api/loans/approvals/queue/assign/', {
    stage_execution_id: stageExecutionId,
    user_id: userId
  });
  return response.data;
}
