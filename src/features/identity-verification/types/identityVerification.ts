/**
 * Tipos para verificación de identidad
 */

export type IdentityVerificationProvider = 'DIDIT';

export type IdentityVerificationStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'APPROVED'
  | 'DECLINED'
  | 'MANUAL_REVIEW'
  | 'EXPIRED'
  | 'ERROR';

export type IdentityVerificationDecision =
  | 'APPROVED'
  | 'DECLINED'
  | 'PENDING'
  | 'MANUAL_REVIEW';

export interface IdentityVerification {
  id: number;
  user: number;
  institution: number;
  institution_name: string;
  credit_application?: number | null;
  credit_application_number?: string | null;
  branch?: number | null;
  branch_name?: string | null;
  provider: IdentityVerificationProvider;
  provider_session_id: string;
  status: IdentityVerificationStatus;
  decision: IdentityVerificationDecision;
  document_type: string;
  document_number: string;
  full_name: string;
  date_of_birth?: string | null;
  country: string;
  error_message: string;
  verification_url: string;
  started_at: string;
  completed_at?: string | null;
  expires_at?: string | null;
  webhook_received_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StartVerificationRequest {
  credit_application_id?: number | null;
  branch_id?: number | null;
  return_url?: string;
}

export interface StartVerificationResponse {
  id: number;
  status: IdentityVerificationStatus;
  verification_url: string;
  provider: IdentityVerificationProvider;
  error?: string;
  error_code?: string;
}

export interface IdentityVerificationStatusResponse {
  id: number;
  status: IdentityVerificationStatus;
  decision: IdentityVerificationDecision;
  completed_at?: string | null;
  error_message: string;
}

export type IdentityVerificationStatusType =
  | 'not_started'
  | 'pending'
  | 'in_progress'
  | 'approved'
  | 'declined'
  | 'manual_review'
  | 'expired'
  | 'error';

export function mapStatusToDisplay(status: IdentityVerificationStatus): string {
  const statusMap: Record<IdentityVerificationStatus, string> = {
    PENDING: 'No iniciada',
    IN_PROGRESS: 'En progreso',
    APPROVED: 'Aprobada',
    DECLINED: 'Rechazada',
    MANUAL_REVIEW: 'Revisión manual',
    EXPIRED: 'Expirada',
    ERROR: 'Error',
  };
  return statusMap[status] || status;
}

export function getStatusColor(
  status: IdentityVerificationStatus
): 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'orange' {
  const colorMap: Record<IdentityVerificationStatus, any> = {
    PENDING: 'gray',
    IN_PROGRESS: 'blue',
    APPROVED: 'green',
    DECLINED: 'red',
    MANUAL_REVIEW: 'yellow',
    EXPIRED: 'orange',
    ERROR: 'red',
  };
  return colorMap[status] || 'gray';
}

export function isVerificationActive(status: IdentityVerificationStatus): boolean {
  return status === 'PENDING' || status === 'IN_PROGRESS';
}

export function isVerificationApproved(
  status: IdentityVerificationStatus,
  decision: IdentityVerificationDecision
): boolean {
  return status === 'APPROVED' && decision === 'APPROVED';
}

export function isVerificationDeclined(
  status: IdentityVerificationStatus,
  decision: IdentityVerificationDecision
): boolean {
  return status === 'DECLINED' && decision === 'DECLINED';
}
