/**
 * API Service para el módulo de Préstamos (Loans)
 * Integración con el backend Django REST Framework
 */

import { apiClient } from '@/utils/apiClient';

// ============================================================================
// TIPOS (Types)
// ============================================================================

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
  contract_generated?: boolean;
  contract?: any;
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

// ============================================================================
// ENDPOINTS
// ============================================================================

const BASE = '/loans';

function buildQueryString(filters: LoanApplicationFilters = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// ============================================================================
// FUNCIONES DE API (CRUD de Solicitudes)
// ============================================================================

export async function getLoanApplications(filters?: LoanApplicationFilters) {
  const response = await apiClient.get<{ count: number; next: string | null; previous: string | null; results: LoanApplicationListItem[] }>(
    `${BASE}/credit-applications/${buildQueryString(filters)}`
  );
  return response;
}

export async function getLoanApplication(id: number): Promise<LoanApplication> {
  return apiClient.get<LoanApplication>(`${BASE}/credit-applications/${id}/`);
}

export async function createLoanApplication(data: CreateLoanApplicationData): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>(`${BASE}/credit-applications/`, data);
}

export async function updateLoanApplication(id: number, data: UpdateLoanApplicationData): Promise<LoanApplication> {
  return apiClient.patch<LoanApplication>(`${BASE}/credit-applications/${id}/`, data);
}

export async function submitLoanApplication(id: number): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>(`${BASE}/credit-applications/${id}/submit/`, {});
}

export async function changeLoanApplicationStatus(id: number, data: ChangeLoanApplicationStatusData): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>(`${BASE}/credit-applications/${id}/change-status/`, data);
}

export async function addLoanApplicationComment(id: number, data: AddLoanApplicationCommentData): Promise<LoanApplicationComment> {
  return apiClient.post<LoanApplicationComment>(`${BASE}/credit-applications/${id}/comments/`, data);
}

export async function uploadLoanApplicationDocument(applicationId: number, data: { file: File; notes?: string }): Promise<LoanApplicationDocument> {
  const formData = new FormData();
  formData.append('file', data.file);
  if (data.notes) formData.append('notes', data.notes);
  return apiClient.post<LoanApplicationDocument>(`${BASE}/credit-applications/${applicationId}/documents/`, formData);
}

export async function getLoanApplicationTimeline(id: number): Promise<LoanApplicationTimelineEvent[]> {
  return apiClient.get<LoanApplicationTimelineEvent[]>(`${BASE}/credit-applications/${id}/timeline/`);
}

export async function getLoanApplicationComments(id: number): Promise<LoanApplicationComment[]> {
  return apiClient.get<LoanApplicationComment[]>(`${BASE}/credit-applications/${id}/comments/`);
}

export async function reviewLoanApplication(id: number, data: ReviewLoanApplicationData): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>(`${BASE}/credit-applications/${id}/review/`, data);
}

export async function approveLoanApplication(id: number, data: ApproveLoanApplicationData): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>(`${BASE}/credit-applications/${id}/approve/`, data);
}

export async function rejectLoanApplication(id: number, data: RejectLoanApplicationData): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>(`${BASE}/credit-applications/${id}/reject/`, data);
}

export async function getRejectionReasons(): Promise<RejectionReason[]> {
  return apiClient.get<RejectionReason[]>('/api/loans/rejection-reasons/');
}

export async function disburseLoanApplication(id: number, data: DisburseLoanApplicationData): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>(`${BASE}/credit-applications/${id}/disburse/`, data);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function formatApplicationNumber(applicationNumber: string): string {
  return applicationNumber || 'N/D';
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    DRAFT: 'slate',
    SUBMITTED: 'blue',
    IN_REVIEW: 'amber',
    OBSERVED: 'orange',
    UNDER_REVIEW: 'amber',
    APPROVED: 'emerald',
    REJECTED: 'red',
    DISBURSED: 'teal',
    CANCELLED: 'slate',
  };
  return statusColors[status] || 'slate';
}

export function getIdentityStatusColor(status?: string | null): string {
  if (!status) return 'slate';
  const statusColors: Record<string, string> = {
    NOT_VERIFIED: 'slate',
    PENDING: 'amber',
    IN_PROGRESS: 'blue',
    APPROVED: 'emerald',
    DECLINED: 'red',
    MANUAL_REVIEW: 'orange',
  };
  return statusColors[status] || 'slate';
}

export function getDocumentsStatusColor(status?: string | null): string {
  if (!status) return 'slate';
  const statusColors: Record<string, string> = {
    NOT_REQUIRED: 'slate',
    PENDING: 'amber',
    COMPLETE: 'emerald',
    OBSERVED: 'orange',
  };
  return statusColors[status] || 'slate';
}

export function calculateMonthlyPayment(
  amount: number,
  annualInterestRate: number,
  termMonths: number
): number {
  if (termMonths <= 0 || amount <= 0) return 0;
  const monthlyRate = annualInterestRate / 100 / 12;
  if (monthlyRate === 0) return amount / termMonths;
  return (
    (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)
  );
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

// ============================================================================
// CU-15: EVALUACIÓN CREDITICIA CON IA
// ============================================================================

export type AutoDecision = 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW' | 'ESCALATE' | null;

export interface SubScores {
  payment_capacity: number | null;
  employment_stability: number | null;
  credit_history: number | null;
  debt_burden: number | null;
  demographic: number | null;
}

export interface BureauQuerySummary {
  id?: number;
  provider: string | null;
  status: string | null;
  score_external: number | null;
  debt_total: string | null;
  has_defaults: boolean | null;
  cic_category: string | null;
  queried_at?: string | null;
  response_time_ms?: number | null;
}

export interface CreditEvaluationResult {
  evaluation_id: number;
  score_ia: number | null;
  score_bureau: number | null;
  score_weighted: number | null;
  risk_level: string | null;
  risk_level_display: string | null;
  debt_to_income_ratio: string | null;
  auto_decision: AutoDecision;
  auto_decision_reason: string;
  evaluated_at: string | null;
  application: LoanApplication;
  sub_scores: SubScores | null;
  bureau_query: BureauQuerySummary | null;
}

export interface CreditEvaluationDetail {
  id: number;
  status: string;
  score_ia: number | null;
  score_bureau: number | null;
  score_weighted: number | null;
  risk_level: string | null;
  risk_level_display: string | null;
  debt_to_income_ratio: string | null;
  auto_decision: AutoDecision;
  auto_decision_reason: string;
  eligibility_check_passed: boolean | null;
  bureau_check_passed: boolean | null;
  dti_calculated: string | null;
  recommended_amount: string | null;
  max_affordable_payment: string | null;
  sub_scores: SubScores | null;
  model_version: string;
  features_used: Record<string, number>;
  evaluated_at: string | null;
  evaluation_time_ms: number | null;
  error_message: string | null;
  bureau_query: BureauQuerySummary | null;
}

export async function calculateLoanApplicationScore(id: number): Promise<CreditEvaluationResult> {
  return apiClient.post<CreditEvaluationResult>(`${BASE}/credit-applications/${id}/calculate-score/`, {});
}

export async function getLoanApplicationEvaluation(id: number): Promise<CreditEvaluationDetail> {
  return apiClient.get<CreditEvaluationDetail>(`${BASE}/credit-applications/${id}/evaluation/`);
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
// APPROVAL QUEUE (SP3-99)
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

export async function getApprovalQueue(filters?: ApprovalQueueFilters): Promise<ApprovalQueueResponse> {
  const params = new URLSearchParams();
  if (filters?.priority) params.append('priority', filters.priority);
  const qs = params.toString();
  return apiClient.get<ApprovalQueueResponse>(`/api/loans/approvals/queue/${qs ? `?${qs}` : ''}`);
}

export async function getApprovalQueueMetrics(): Promise<ApprovalQueueMetrics> {
  return apiClient.get<ApprovalQueueMetrics>('/api/loans/approvals/queue/metrics/');
}

export async function getOverdueApplications(): Promise<{ results: WorkflowStageExecution[]; total_count: number }> {
  return apiClient.get<{ results: WorkflowStageExecution[]; total_count: number }>('/api/loans/approvals/queue/overdue/');
}

export async function assignStageToUser(stageExecutionId: number, userId: number): Promise<WorkflowStageExecution> {
  return apiClient.post<WorkflowStageExecution>('/api/loans/approvals/queue/assign/', {
    stage_execution_id: stageExecutionId,
    user_id: userId,
  });
}

// ============================================================================
// DEFAULT EXPORT (compatibilidad con código legacy)
// ============================================================================

const loansApi = {
  listApplications: getLoanApplications,
  getApplication: getLoanApplication,
  createApplication: createLoanApplication,
  updateApplication: updateLoanApplication,
  submitApplication: submitLoanApplication,
  changeStatus: changeLoanApplicationStatus,
  getTimeline: getLoanApplicationTimeline,
  addComment: addLoanApplicationComment,
  uploadDocument: uploadLoanApplicationDocument,
  approveApplication: approveLoanApplication,
  rejectApplication: rejectLoanApplication,
  reviewApplication: reviewLoanApplication,
  formatApplicationNumber,
  calculateMonthlyPayment,
};

export default loansApi;
