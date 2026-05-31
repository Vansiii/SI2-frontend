/**
 * Servicio API para SP3: Créditos Activos y Pagos.
 */

import { apiClient } from '@/utils/apiClient';
import type {
  ActiveCreditListItem,
  ActiveCreditDetail,
  CreditSummary,
  Installment,
  PaymentListItem,
  PaymentDetail,
  GracePeriod,
  RestructuringPreview,
  StatusHistory,
  CreatePaymentData,
  ApplyGracePeriodData,
  RestructuringData,
  ActiveCreditFilters,
  SupportRequest,
} from '../types/activeCredit.types';

// ─── Créditos Activos ────────────────────────────────────────────

export async function getActiveCredits(
  filters: ActiveCreditFilters = {}
): Promise<{ results: ActiveCreditListItem[]; count: number }> {
  return apiClient.get('/loans/active-credits/', filters);
}

export async function getActiveCredit(id: number): Promise<ActiveCreditDetail> {
  return apiClient.get(`/loans/active-credits/${id}/`);
}

export async function activateFromContract(
  contractId: number,
  notes?: string
): Promise<ActiveCreditDetail> {
  return apiClient.post('/loans/active-credits/activate-from-contract/', {
    contract_id: contractId,
    notes,
  });
}

export async function getActiveCreditSummary(id: number): Promise<CreditSummary> {
  return apiClient.get(`/loans/active-credits/${id}/summary/`);
}

export async function getActiveCreditSchedule(id: number): Promise<Installment[]> {
  return apiClient.get(`/loans/active-credits/${id}/schedule/`);
}

export async function getActiveCreditPayments(id: number): Promise<PaymentListItem[]> {
  return apiClient.get(`/loans/active-credits/${id}/payments/`);
}

export async function refreshCreditStatus(
  id: number
): Promise<{ credit_number: string; previous_status: string; new_status: string }> {
  return apiClient.post(`/loans/active-credits/${id}/refresh-status/`);
}

export async function recalculateSchedule(
  id: number,
  fromInstallment?: number
): Promise<Installment[]> {
  return apiClient.post(`/loans/active-credits/${id}/recalculate/`, {
    from_installment_number: fromInstallment || 1,
  });
}

export async function applyGracePeriod(
  id: number,
  data: ApplyGracePeriodData
): Promise<GracePeriod> {
  return apiClient.post(`/loans/active-credits/${id}/grace-period/`, data);
}

export async function restructureCredit(
  id: number,
  data: RestructuringData
): Promise<RestructuringPreview> {
  return apiClient.post(`/loans/active-credits/${id}/restructure/`, data);
}

export async function getStatusHistory(id: number): Promise<StatusHistory[]> {
  return apiClient.get(`/loans/active-credits/${id}/status-history/`);
}

// ─── Pagos ────────────────────────────────────────────────────────

export async function getPayments(filters: {
  page?: number;
  active_credit_id?: number;
  status?: string;
  channel?: string;
} = {}): Promise<{ results: PaymentListItem[]; count: number }> {
  return apiClient.get('/loans/payments/', filters);
}

export async function getPayment(id: number): Promise<PaymentDetail> {
  return apiClient.get(`/loans/payments/${id}/`);
}

export async function createPayment(data: CreatePaymentData): Promise<PaymentDetail> {
  return apiClient.post('/loans/payments/', data);
}

export async function confirmPayment(id: number): Promise<PaymentDetail> {
  return apiClient.post(`/loans/payments/${id}/confirm/`);
}

export async function cancelPayment(id: number): Promise<{ status: string }> {
  return apiClient.post(`/loans/payments/${id}/cancel/`);
}

export async function reversePayment(
  id: number,
  reason: string
): Promise<PaymentDetail> {
  return apiClient.post(`/loans/payments/${id}/reverse/`, { reason });
}

// ─── SP4: Solicitudes de Apoyo de Pago ─────────────────────────

export async function getSupportRequests(creditId?: number): Promise<SupportRequest[]> {
  const params: Record<string, string> = {};
  if (creditId) params.active_credit_id = String(creditId);
  const data = await apiClient.get<{ results: SupportRequest[]; count: number }>('/loans/support-requests/', params);
  return data.results || data as unknown as SupportRequest[];
}

export async function getCreditSupportRequests(creditId: number): Promise<SupportRequest[]> {
  return getSupportRequests(creditId);
}

export async function getSupportRequest(id: number): Promise<SupportRequest> {
  return apiClient.get(`/loans/support-requests/${id}/`);
}

export async function approveSupportRequest(id: number, bankResponse?: string): Promise<SupportRequest> {
  return apiClient.post(`/loans/support-requests/${id}/approve/`, { bank_response: bankResponse || '' });
}

export async function rejectSupportRequest(id: number, reason: string): Promise<SupportRequest> {
  return apiClient.post(`/loans/support-requests/${id}/reject/`, { bank_response: reason });
}

export async function requestMoreInfo(id: number, info: string): Promise<SupportRequest> {
  return apiClient.post(`/loans/support-requests/${id}/request-more-info/`, { requested_info: info });
}

export async function startReview(id: number): Promise<SupportRequest> {
  return apiClient.post(`/loans/support-requests/${id}/start-review/`);
}

// ─── Utilidades ───────────────────────────────────────────────────

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    IN_ARREARS: 'bg-red-100 text-red-800 border-red-300',
    IN_GRACE_PERIOD: 'bg-blue-100 text-blue-800 border-blue-300',
    RESTRUCTURED: 'bg-purple-100 text-purple-800 border-purple-300',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-300',
    LEGAL: 'bg-orange-100 text-orange-800 border-orange-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
}

export function getInstallmentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-emerald-100 text-emerald-800',
    PARTIAL: 'bg-orange-100 text-orange-800',
    OVERDUE: 'bg-red-100 text-red-800',
    IN_GRACE: 'bg-blue-100 text-blue-800',
    REPROGRAMMED: 'bg-purple-100 text-purple-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING_CONFIRMATION: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-emerald-100 text-emerald-800',
    FAILED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    REVERSED: 'bg-orange-100 text-orange-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
    MANUAL_REVIEW: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function formatCurrency(amount: string | number | null | undefined): string {
  if (amount == null) return '—';
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(n);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
