/**
 * Tipos TypeScript para el módulo de Préstamos (Loans)
 * Basado en la estructura del backend Django
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

export enum LoanApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  OBSERVED = 'OBSERVED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  CANCELLED = 'CANCELLED',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export enum EmploymentType {
  EMPLOYED = 'EMPLOYED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  RETIRED = 'RETIRED',
  UNEMPLOYED = 'UNEMPLOYED',
  STUDENT = 'STUDENT',
  OTHER = 'OTHER',
}

export enum IdentityVerificationStatus {
  NOT_VERIFIED = 'NOT_VERIFIED',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}

export enum DocumentsStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  PENDING = 'PENDING',
  COMPLETE = 'COMPLETE',
  OBSERVED = 'OBSERVED',
}

export enum DocumentRequirementStatus {
  PENDING = 'PENDING',
  UPLOADED = 'UPLOADED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum DocumentCategory {
  IDENTITY = 'IDENTITY',
  FINANCIAL = 'FINANCIAL',
  LEGAL = 'LEGAL',
  COLLATERAL = 'COLLATERAL',
  OTHER = 'OTHER',
}

export enum RuleSetStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

// ============================================================================
// INTERFACES DE MODELOS
// ============================================================================

export interface LoanApplication {
  id: number;
  application_number: string;
  client: number;
  client_name?: string;
  client_email?: string;
  product: number;
  product_name?: string;
  rule_set_snapshot?: number;
  branch?: number;
  branch_name?: string;
  assigned_to?: number;
  assigned_to_name?: string;
  
  // Montos y plazos
  requested_amount: string;
  term_months: number;
  purpose: string;
  approved_amount?: string;
  approved_term_months?: number;
  approved_interest_rate?: string;
  monthly_payment?: string;
  
  // Estados
  status: LoanApplicationStatus;
  identity_verification_status: IdentityVerificationStatus;
  documents_status: DocumentsStatus;
  contract_generated: boolean;
  
  // Información económica
  monthly_income?: string;
  employment_type?: EmploymentType;
  employment_description?: string;
  
  // Evaluación
  credit_score?: number;
  risk_level?: RiskLevel;
  debt_to_income_ratio?: string;
  
  // Observaciones
  rejection_reason?: string;
  internal_notes?: string;
  
  // Fechas
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  rejected_at?: string;
  disbursed_at?: string;
  
  // Relaciones anidadas (opcional)
  documents?: LoanApplicationDocumentRequirement[];
  timeline?: TimelineEvent[];
  contract?: ContractSummary;
}

export interface LoanApplicationDocumentRequirement {
  id: number;
  loan_application: number;
  product_document_requirement: number;
  document_type_code?: string;
  document_type_name?: string;
  file_resource?: number;
  file_url?: string;
  file_name?: string;
  status: DocumentRequirementStatus;
  uploaded_by?: number;
  uploaded_by_name?: string;
  uploaded_at?: string;
  reviewed_by?: number;
  reviewed_by_name?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  notes?: string;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: number;
  loan_application: number;
  previous_status?: LoanApplicationStatus;
  new_status: LoanApplicationStatus;
  title: string;
  description?: string;
  actor?: number;
  actor_name?: string;
  is_visible_to_borrower: boolean;
  client_message?: string;
  requires_client_action: boolean;
  action_description?: string;
  action_url?: string;
  created_at: string;
}

export interface TimelineEvent {
  id: number;
  loan_application: number;
  previous_status?: LoanApplicationStatus;
  new_status: LoanApplicationStatus;
  title: string;
  description?: string;
  actor?: number;
  actor_name?: string;
  is_visible_to_borrower: boolean;
  client_message?: string;
  requires_client_action: boolean;
  action_description?: string;
  action_url?: string;
  created_at: string;
}

// Alias para compatibilidad con componentes existentes
export interface LoanApplicationTimelineEvent extends TimelineEvent {
  actor_role?: string;
}

// Tipos adicionales para compatibilidad con componentes existentes
export interface LoanApplicationComment {
  id: number;
  loan_application: number;
  user: number;
  user_name: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoanApplicationDocument {
  id: number;
  loan_application: number;
  document_type: string;
  file: string;
  file_name: string;
  file_size?: number;
  description?: string;
  uploaded_by: number;
  uploaded_by_name?: string;
  is_verified: boolean;
  verified_by?: number;
  verified_by_name?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

// Resumen de contrato para mostrar en solicitud de préstamo
export interface ContractSummary {
  id: number;
  contract_number: string;
  status: string;
  status_display: string;
  principal_amount: string;
  interest_rate: string;
  term_months: number;
  monthly_payment: string;
  contract_date: string;
  is_signed_by_borrower: boolean;
  all_signatures_complete: boolean;
}

// Extensión de LoanApplication con campos adicionales para display
export interface LoanApplicationExtended extends LoanApplication {
  status_display?: string;
  identity_verification_display?: string;
  documents_status_display?: string;
  employment_type_display?: string;
  branch_name?: string;
  branch_detail?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface DocumentType {
  id: number;
  code: string;
  name: string;
  description?: string;
  category: DocumentCategory;
  default_formats?: string[];
  default_max_size_mb?: number;
  default_validity_days?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantRuleSet {
  id: number;
  version: string;
  status: RuleSetStatus;
  name: string;
  description?: string;
  activated_at?: string;
  activated_by?: number;
  activated_by_name?: string;
  archived_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EligibilityRule {
  id: number;
  rule_set: number;
  max_debt_to_income_ratio?: string;
  min_income_required?: string;
  min_employment_months?: number;
  max_arrears_allowed?: number;
  allowed_cic_categories?: string[];
  min_collateral_coverage?: string;
  min_age?: number;
  max_age?: number;
  created_at: string;
  updated_at: string;
}

export interface CreditProductParameter {
  id: number;
  rule_set: number;
  product: number;
  product_name?: string;
  
  // Montos
  min_amount?: string;
  max_amount?: string;
  
  // Plazos
  min_term_months?: number;
  max_term_months?: number;
  
  // Tasas
  min_interest_rate?: string;
  max_interest_rate?: string;
  interest_type?: string;
  
  // Comisiones
  commission_rate_min?: string;
  commission_rate_max?: string;
  
  // Seguros
  insurance_rate_min?: string;
  insurance_rate_max?: string;
  additional_insurance_rate?: string;
  
  // Período de gracia
  grace_period_months_min?: number;
  grace_period_months_max?: number;
  
  // Pago anticipado
  allows_early_payment: boolean;
  early_payment_penalty_min?: string;
  early_payment_penalty_max?: string;
  
  // Scoring
  min_credit_score_required?: number;
  auto_approval_enabled: boolean;
  max_auto_approval_amount?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DTOs PARA OPERACIONES
// ============================================================================

export interface CreateLoanApplicationDto {
  client: number;
  product: number;
  branch?: number;
  requested_amount: string;
  term_months: number;
  purpose: string;
  monthly_income?: string;
  employment_type?: EmploymentType;
  employment_description?: string;
}

export interface UpdateLoanApplicationDto {
  requested_amount?: string;
  term_months?: number;
  purpose?: string;
  monthly_income?: string;
  employment_type?: EmploymentType;
  employment_description?: string;
}

export interface SubmitLoanApplicationDto {
  // Puede incluir confirmaciones adicionales
  confirm_terms?: boolean;
}

export interface ChangeStatusDto {
  new_status: LoanApplicationStatus;
  reason?: string;
  internal_notes?: string;
}

export interface ReviewLoanApplicationDto {
  credit_score?: number;
  risk_level?: RiskLevel;
  debt_to_income_ratio?: string;
  internal_notes?: string;
}

export interface ApproveLoanApplicationDto {
  approved_amount: string;
  approved_term_months: number;
  approved_interest_rate: string;
  internal_notes?: string;
}

export interface RejectLoanApplicationDto {
  rejection_reason: string;
  internal_notes?: string;
}

export interface UploadDocumentDto {
  file: File;
  notes?: string;
}

export interface ReviewDocumentDto {
  status: DocumentRequirementStatus;
  rejection_reason?: string;
  notes?: string;
}

// ============================================================================
// FILTROS Y PARÁMETROS DE BÚSQUEDA
// ============================================================================

export interface LoanApplicationFilters {
  status?: LoanApplicationStatus;
  branch_id?: number;
  product_id?: number;
  identity_verification_status?: IdentityVerificationStatus;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// ============================================================================
// RESPUESTAS PAGINADAS
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// LABELS Y TRADUCCIONES
// ============================================================================

export const LoanApplicationStatusLabels: Record<LoanApplicationStatus, string> = {
  [LoanApplicationStatus.DRAFT]: 'Borrador',
  [LoanApplicationStatus.SUBMITTED]: 'Enviada',
  [LoanApplicationStatus.IN_REVIEW]: 'En Revisión',
  [LoanApplicationStatus.OBSERVED]: 'Observada',
  [LoanApplicationStatus.UNDER_REVIEW]: 'En Revisión Interna',
  [LoanApplicationStatus.APPROVED]: 'Aprobada',
  [LoanApplicationStatus.REJECTED]: 'Rechazada',
  [LoanApplicationStatus.DISBURSED]: 'Desembolsada',
  [LoanApplicationStatus.CANCELLED]: 'Cancelada',
};

export const RiskLevelLabels: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: 'Bajo',
  [RiskLevel.MEDIUM]: 'Medio',
  [RiskLevel.HIGH]: 'Alto',
  [RiskLevel.VERY_HIGH]: 'Muy Alto',
};

export const EmploymentTypeLabels: Record<EmploymentType, string> = {
  [EmploymentType.EMPLOYED]: 'Empleado en relación de dependencia',
  [EmploymentType.SELF_EMPLOYED]: 'Trabajador independiente',
  [EmploymentType.BUSINESS_OWNER]: 'Propietario de negocio',
  [EmploymentType.RETIRED]: 'Jubilado',
  [EmploymentType.UNEMPLOYED]: 'Desempleado',
  [EmploymentType.STUDENT]: 'Estudiante',
  [EmploymentType.OTHER]: 'Otro',
};

export const DocumentRequirementStatusLabels: Record<DocumentRequirementStatus, string> = {
  [DocumentRequirementStatus.PENDING]: 'Pendiente',
  [DocumentRequirementStatus.UPLOADED]: 'Cargado',
  [DocumentRequirementStatus.UNDER_REVIEW]: 'En Revisión',
  [DocumentRequirementStatus.APPROVED]: 'Aprobado',
  [DocumentRequirementStatus.REJECTED]: 'Rechazado',
};
