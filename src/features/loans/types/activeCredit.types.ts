/**
 * Tipos TypeScript para SP3: Créditos Activos y Pagos.
 */

export type ActiveCreditStatus =
  | 'ACTIVE'
  | 'PENDING_PAYMENT'
  | 'IN_ARREARS'
  | 'IN_GRACE_PERIOD'
  | 'RESTRUCTURED'
  | 'CANCELLED'
  | 'LEGAL';

export type InstallmentStatus =
  | 'PENDING'
  | 'PAID'
  | 'PARTIAL'
  | 'OVERDUE'
  | 'IN_GRACE'
  | 'REPROGRAMMED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REVERSED'
  | 'REFUNDED'
  | 'MANUAL_REVIEW';

export type PaymentChannel = 'PRESENTIAL' | 'ONLINE';
export type GraceType = 'FULL_GRACE' | 'INTEREST_ONLY' | 'PARTIAL_PAYMENT';

export interface ActiveCreditListItem {
  id: number;
  credit_number: string;
  client: number;
  client_name: string;
  product: number;
  product_name: string;
  approved_amount: string;
  currency_code: string;
  current_balance: string;
  annual_interest_rate: string;
  term_periods: number;
  payment_frequency_name: string;
  amortization_system_name: string;
  disbursement_date: string;
  next_due_date: string;
  maturity_date: string;
  status: ActiveCreditStatus;
  status_display: string;
  days_in_arrears: number;
  total_paid: string;
  created_at: string;
}

export interface ActiveCreditDetail {
  id: number;
  credit_number: string;
  loan_application: number;
  application_number: string;
  contract: number | null;
  contract_number: string | null;
  client: number;
  client_name: string;
  product: number;
  product_name: string;
  approved_amount: string;
  currency?: number;
  currency_code: string;
  annual_interest_rate: string;
  term_periods: number;
  payment_frequency_name: string;
  amortization_system_name: string;
  disbursement_date: string;
  first_payment_date: string;
  maturity_date: string;
  next_due_date: string | null;
  current_balance: string;
  total_paid: string;
  principal_paid: string;
  interest_paid: string;
  fees_paid: string;
  penalty_paid: string;
  status: ActiveCreditStatus;
  status_display: string;
  days_in_arrears: number;
  notes: string;
  created_at: string;
  installments: Installment[];
  recent_payments: PaymentListItem[];
}

export interface CreditSummary {
  credit_number: string;
  status: string;
  status_display: string;
  approved_amount: string;
  current_balance: string;
  total_paid: string;
  principal_paid: string;
  interest_paid: string;
  fees_paid: string;
  penalty_paid: string;
  annual_interest_rate: string;
  term_periods: number;
  payment_frequency: string;
  amortization_system: string;
  currency: string;
  disbursement_date: string;
  first_payment_date: string;
  next_due_date: string | null;
  days_in_arrears: number;
  total_installments: number;
  paid_installments: number;
  pending_installments: number;
  overdue_installments: number;
  progress_percentage: number;
  next_installment: {
    number: number;
    due_date: string;
    total_amount: string;
    paid_amount: string;
    status: InstallmentStatus;
  } | null;
  total_pending_amount: string;
  client_name: string;
  product_name: string;
}

export interface Installment {
  id: number;
  installment_number: number;
  due_date: string;
  paid_at: string | null;
  days_overdue: number;
  opening_balance: string;
  principal_amount: string;
  interest_amount: string;
  insurance_amount: string;
  fee_amount: string;
  penalty_amount: string;
  total_amount: string;
  paid_amount: string;
  closing_balance: string;
  status: InstallmentStatus;
  status_display: string;
  original_due_date: string | null;
}

export interface PaymentListItem {
  id: number;
  active_credit: number;
  credit_number: string;
  amount: string;
  currency_code: string;
  payment_date: string;
  channel: PaymentChannel;
  channel_display: string;
  method: string;
  method_display: string;
  reference_number: string;
  status: PaymentStatus;
  status_display: string;
  registered_by_name: string;
  notes: string;
  created_at: string;
}

export interface PaymentDetail extends PaymentListItem {
  confirmed_at: string | null;
  provider: string | null;
  provider_payment_id: string | null;
  confirmed_by_name: string | null;
  receipt_file: number | null;
  metadata: Record<string, unknown>;
  allocations: PaymentAllocation[];
  invoice_url: string | null;
  invoice_pdf_url: string | null;
  invoice_number: string | null;
}

export interface PaymentAllocation {
  id: number;
  installment: number;
  installment_number: number;
  amount_applied: string;
  principal_covered: string;
  interest_covered: string;
  insurance_covered: string;
  fee_covered: string;
  penalty_covered: string;
}

export interface CreatePaymentData {
  active_credit: number;
  amount: number;
  currency: number;
  payment_date: string;
  channel: PaymentChannel;
  method: string;
  reference_number?: string;
  receipt_file?: number | null;
  notes?: string;
}

export interface GracePeriod {
  id: number;
  active_credit: number;
  grace_type: GraceType;
  grace_type_display: string;
  start_date: string;
  end_date: string;
  reason: string;
  applied_by_name: string;
  is_active: boolean;
  created_at: string;
}

export interface ApplyGracePeriodData {
  grace_type: GraceType;
  start_date: string;
  end_date: string;
  reason: string;
}

export interface RestructuringData {
  new_term_periods?: number;
  new_interest_rate?: number;
  new_payment_frequency_id?: number;
  new_amortization_system_id?: number;
  new_first_payment_date?: string;
  reason: string;
  preview?: boolean;
}

export interface RestructuringPreview {
  current_summary: Record<string, string>;
  new_summary: Record<string, string>;
  preview_schedule: Array<Record<string, unknown>>;
  comparison: Array<{
    field: string;
    label: string;
    current: string;
    proposed: string;
    changed: boolean;
  }>;
}

export interface StatusHistory {
  id: number;
  active_credit: number;
  previous_status: string;
  new_status: string;
  changed_by_name: string;
  reason: string;
  created_at: string;
}

export interface ActiveCreditFilters {
  page?: number;
  page_size?: number;
  status?: ActiveCreditStatus;
  client_id?: number;
  product_id?: number;
  search?: string;
  ordering?: string;
}

// ─── SP4: Solicitudes de Apoyo de Pago ──────────────────────────

export type SupportRequestType = 'GRACE_PERIOD' | 'RESTRUCTURING';

export type SupportRequestStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface SupportRequest {
  id: number;
  active_credit: number;
  credit_number: string;
  client: number;
  client_name: string;
  request_type: SupportRequestType;
  request_type_display: string;
  reason_category: string;
  reason_category_display: string;
  description: string;
  requested_months: number | null;
  contact_phone: string;
  status: SupportRequestStatus;
  status_display: string;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  bank_response: string;
  approved_terms_snapshot: Record<string, unknown> | null;
  requires_more_info: boolean;
  requested_info: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSupportRequestData {
  request_type: SupportRequestType;
  reason_category: string;
  description: string;
  requested_months?: number;
  contact_phone?: string;
}

export interface ReviewSupportRequestData {
  bank_response?: string;
  requested_info?: string;
}
