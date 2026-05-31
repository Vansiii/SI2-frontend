/**
 * Tipos para el módulo de contratos
 */

export interface Contract {
  id: number;
  contract_number: string;
  status: ContractStatus;
  status_display: string;
  loan_application: {
    id: number;
    application_number: string;
    client_name: string;
  };
  template: {
    id: number;
    name: string;
  };
  principal_amount: string;
  interest_rate: string;
  term_months: number;
  monthly_payment: string;
  total_amount: string;
  contract_date: string;
  start_date: string;
  end_date: string;
  first_payment_date: string;
  pdf_url?: string;
  pdf_expires_at?: string;
  borrower_signed_at?: string;
  is_signed_by_borrower: boolean;
  requires_guarantor_signatures: boolean;
  all_signatures_complete: boolean;
  pending_signatures: PendingSignature[];
  signatures: ContractSignature[];
  amortization_schedule: AmortizationScheduleItem[];
  generated_by_name?: string;
  published_by_name?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export type ContractStatus =
  | 'DRAFT'
  | 'PENDING_SIGNATURE'
  | 'PARTIALLY_SIGNED'
  | 'ACTIVE'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'DEFAULTED';

export interface ContractSignature {
  id: number;
  signer_type: 'BORROWER' | 'GUARANTOR' | 'INSTITUTION';
  signer_type_display: string;
  signer_name: string;
  signed_at: string;
  signature_method: string;
  signature_method_display: string;
  ip_address: string;
  identity_verified: boolean;
}

export interface PendingSignature {
  type: 'BORROWER' | 'GUARANTOR';
  name: string;
  required: boolean;
}

export interface AmortizationScheduleItem {
  id: number;
  payment_number: number;
  due_date: string;
  principal_amount: string;
  interest_amount: string;
  total_payment: string;
  remaining_balance: string;
  is_paid: boolean;
  paid_at?: string;
  is_overdue: boolean;
  days_overdue: number;
}

export interface ContractTemplate {
  id: number;
  name: string;
  code: string;
  product: number | null;
  product_name?: string;
  template_content: string;
  available_variables: string[];
  is_active: boolean;
  is_default: boolean;
  requires_guarantor_signature: boolean;
  terms_and_conditions: string;
  legal_clauses: any[];
  description: string;
  version: string;
  contracts_count: number;
  created_at: string;
  updated_at: string;
}

export interface ContractCreateRequest {
  loan_application_id: number;
  template_id?: number;
  contract_date?: string;
  start_date?: string;
  special_clauses?: Record<string, any>;
  notes?: string;
}

export interface ContractSignRequest {
  signature_method?: 'DIGITAL' | 'BIOMETRIC' | 'OTP';
  signature_data: string;
  device_info?: Record<string, any>;
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  verification_method?: string;
}

export interface SignatureStatus {
  borrower_signed: boolean;
  borrower_signed_at?: string;
  guarantors_required: number;
  guarantors_signed: number;
  guarantors_pending: number;
  institution_signed: boolean;
  institution_signed_at?: string;
  all_signatures_complete: boolean;
  pending_signatures: PendingSignature[];
  total_signatures: number;
}

export interface PaymentSummary {
  total_payments: number;
  paid_payments: number;
  pending_payments: number;
  overdue_payments: number;
  total_paid: string;
  total_pending: string;
  next_payment_number?: number;
  next_payment_date?: string;
  next_payment_amount?: string;
  completion_percentage: number;
}

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: 'Borrador',
  PENDING_SIGNATURE: 'Pendiente de Firma',
  PARTIALLY_SIGNED: 'Parcialmente Firmado',
  ACTIVE: 'Activo',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Completado',
  DEFAULTED: 'En Mora',
};

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  DRAFT: 'gray',
  PENDING_SIGNATURE: 'yellow',
  PARTIALLY_SIGNED: 'blue',
  ACTIVE: 'green',
  CANCELLED: 'red',
  COMPLETED: 'purple',
  DEFAULTED: 'red',
};
