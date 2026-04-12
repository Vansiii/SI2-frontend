/**
 * Servicio de API para gestión de solicitudes de crédito
 */

import { apiClient } from '@/utils/apiClient';

// Interfaces TypeScript
export interface LoanApplication {
  id: number;
  application_number: string;
  client: number;
  client_name: string;
  client_detail?: {
    id: number;
    full_name: string;
    document_number: string;
    email: string;
  };
  product: number;
  product_name: string;
  product_detail?: {
    id: number;
    name: string;
    product_type: string;
    min_amount: string;
    max_amount: string;
    min_term_months: number;
    max_term_months: number;
    interest_rate: string;
  };
  requested_amount: string;
  term_months: number;
  purpose: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'CANCELLED';
  status_display: string;
  submitted_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  rejected_at?: string;
  disbursed_at?: string;
  credit_score?: number;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  risk_level_display?: string;
  debt_to_income_ratio?: string;
  approved_amount?: string;
  approved_term_months?: number;
  approved_interest_rate?: string;
  monthly_payment?: string;
  reviewed_by?: number;
  reviewed_by_detail?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  approved_by?: number;
  approved_by_detail?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  notes: string;
  rejection_reason: string;
  documents?: LoanApplicationDocument[];
  comments?: LoanApplicationComment[];
  is_pending: boolean;
  can_be_edited: boolean;
  can_be_submitted: boolean;
  can_be_approved: boolean;
  can_be_rejected: boolean;
  can_be_disbursed: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoanApplicationDocument {
  id: number;
  document_type: 'ID_DOCUMENT' | 'INCOME_PROOF' | 'BANK_STATEMENT' | 'EMPLOYMENT_LETTER' | 'TAX_RETURN' | 'PROPERTY_DEED' | 'OTHER';
  file: string;
  file_url?: string;
  file_name: string;
  file_size: number;
  description: string;
  uploaded_by: number;
  uploaded_by_name: string;
  is_verified: boolean;
  verified_by?: number;
  verified_by_name?: string;
  verified_at?: string;
  created_at: string;
}

export interface LoanApplicationComment {
  id: number;
  user: number;
  user_name: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
}

export interface CreateLoanApplicationData {
  client: number;
  product: number;
  requested_amount: string;
  term_months: number;
  purpose?: string;
}

export interface UpdateLoanApplicationData {
  requested_amount?: string;
  term_months?: number;
  purpose?: string;
  notes?: string;
}

export interface ReviewLoanApplicationData {
  credit_score?: number;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  debt_to_income_ratio?: string;
  notes?: string;
}

export interface ApproveLoanApplicationData {
  approved_amount: string;
  approved_term_months: number;
  approved_interest_rate: string;
  notes?: string;
}

export interface RejectLoanApplicationData {
  rejection_reason: string;
}

export interface DisburseLoanApplicationData {
  notes?: string;
}

export interface LoanApplicationFilters {
  status?: string;
  client?: number;
  product?: number;
  risk_level?: string;
  page?: number;
  page_size?: number;
}

// Funciones de API

/**
 * Obtiene lista de solicitudes de crédito
 */
export async function getLoanApplications(filters: LoanApplicationFilters = {}): Promise<{ results: LoanApplication[]; count: number }> {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  return apiClient.get<{ results: LoanApplication[]; count: number }>(`/loans/?${params.toString()}`);
}

/**
 * Obtiene detalle de una solicitud de crédito
 */
export async function getLoanApplication(id: number): Promise<LoanApplication> {
  return apiClient.get<LoanApplication>(`/loans/${id}/`);
}

/**
 * Crea una nueva solicitud de crédito
 */
export async function createLoanApplication(data: CreateLoanApplicationData): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>('/loans/', data);
}

/**
 * Actualiza una solicitud de crédito (solo en borrador)
 */
export async function updateLoanApplication(id: number, data: UpdateLoanApplicationData): Promise<LoanApplication> {
  return apiClient.patch<LoanApplication>(`/loans/${id}/`, data);
}

/**
 * Elimina (desactiva) una solicitud de crédito
 */
export async function deleteLoanApplication(id: number): Promise<void> {
  await apiClient.delete(`/loans/${id}/`);
}

/**
 * Envía solicitud para revisión
 */
export async function submitLoanApplication(id: number): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>(`/loans/${id}/submit/`, {});
}

/**
 * Inicia revisión y actualiza evaluación
 */
export async function reviewLoanApplication(id: number, data: ReviewLoanApplicationData): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>(`/loans/${id}/review/`, data);
}

/**
 * Calcula score automático
 */
export async function calculateLoanScore(id: number): Promise<{
  credit_score?: number;
  risk_level?: string;
  debt_to_income_ratio?: number;
}> {
  return apiClient.post(`/loans/${id}/calculate-score/`, {});
}

/**
 * Aprueba una solicitud
 */
export async function approveLoanApplication(id: number, data: ApproveLoanApplicationData): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>(`/loans/${id}/approve/`, data);
}

/**
 * Rechaza una solicitud
 */
export async function rejectLoanApplication(id: number, data: RejectLoanApplicationData): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>(`/loans/${id}/reject/`, data);
}

/**
 * Desembolsa una solicitud aprobada
 */
export async function disburseLoanApplication(id: number, data: DisburseLoanApplicationData): Promise<LoanApplication> {
  return apiClient.post<LoanApplication>(`/loans/${id}/disburse/`, data);
}

/**
 * Obtiene documentos de una solicitud
 */
export async function getLoanApplicationDocuments(applicationId: number): Promise<LoanApplicationDocument[]> {
  return apiClient.get<LoanApplicationDocument[]>(`/loans/${applicationId}/documents/`);
}

/**
 * Sube un documento a una solicitud
 */
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
  
  return apiClient.post<LoanApplicationDocument>(`/loans/${applicationId}/documents/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Obtiene comentarios de una solicitud
 */
export async function getLoanApplicationComments(applicationId: number): Promise<LoanApplicationComment[]> {
  return apiClient.get<LoanApplicationComment[]>(`/loans/${applicationId}/comments/`);
}

/**
 * Agrega un comentario a una solicitud
 */
export async function addLoanApplicationComment(
  applicationId: number,
  comment: string,
  isInternal: boolean = true
): Promise<LoanApplicationComment> {
  return apiClient.post<LoanApplicationComment>(`/loans/${applicationId}/comments/`, {
    comment,
    is_internal: isInternal,
  });
}

// Utilidades

/**
 * Calcula la cuota mensual estimada
 */
export function calculateMonthlyPayment(
  amount: number,
  termMonths: number,
  interestRate: number
): number {
  const monthlyRate = interestRate / 100 / 12;
  
  if (monthlyRate === 0) {
    return amount / termMonths;
  }
  
  const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                  (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  return Math.round(payment * 100) / 100;
}

/**
 * Obtiene el color del badge según el estado
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'gray',
    SUBMITTED: 'blue',
    UNDER_REVIEW: 'yellow',
    APPROVED: 'green',
    REJECTED: 'red',
    DISBURSED: 'emerald',
    CANCELLED: 'gray',
  };
  return colors[status] || 'gray';
}

/**
 * Obtiene el color del badge según el nivel de riesgo
 */
export function getRiskLevelColor(riskLevel: string): string {
  const colors: Record<string, string> = {
    LOW: 'green',
    MEDIUM: 'yellow',
    HIGH: 'orange',
    VERY_HIGH: 'red',
  };
  return colors[riskLevel] || 'gray';
}

/**
 * Formatea el número de solicitud para mostrar
 */
export function formatApplicationNumber(applicationNumber: string): string {
  // Formato: LOAN-1-2026-0001-1234 -> #2026-0001
  const parts = applicationNumber.split('-');
  if (parts.length >= 4) {
    return `#${parts[2]}-${parts[3]}`;
  }
  return applicationNumber;
}

/**
 * Obtiene las acciones disponibles para una solicitud
 */
export function getAvailableActions(application: LoanApplication) {
  const actions = [];
  
  if (application.can_be_edited) {
    actions.push({ key: 'edit', label: 'Editar', color: 'blue' });
  }
  
  if (application.can_be_submitted) {
    actions.push({ key: 'submit', label: 'Enviar', color: 'green' });
  }
  
  if (application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW') {
    actions.push({ key: 'review', label: 'Revisar', color: 'yellow' });
    actions.push({ key: 'calculate-score', label: 'Calcular Score', color: 'purple' });
  }
  
  if (application.can_be_approved) {
    actions.push({ key: 'approve', label: 'Aprobar', color: 'green' });
  }
  
  if (application.can_be_rejected) {
    actions.push({ key: 'reject', label: 'Rechazar', color: 'red' });
  }
  
  if (application.can_be_disbursed) {
    actions.push({ key: 'disburse', label: 'Desembolsar', color: 'emerald' });
  }
  
  return actions;
}