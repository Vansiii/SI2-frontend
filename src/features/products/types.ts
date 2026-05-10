/**
 * Tipos para el módulo de Productos Crediticios (REFACTORIZADO - Fase 2)
 * 
 * Arquitectura:
 * - CreditProduct: Información básica + RuleSet + Documentos Requeridos
 * - CreditProductParameter: Parámetros técnicos (asociados a producto y ruleset)
 * - ProductDocumentRequirement: Documentos requeridos por producto
 * - Catálogos: ProductType, Currency, PaymentFrequency, AmortizationSystem, DocumentType
 */

// ============================================================================
// CATÁLOGOS
// ============================================================================

export interface DocumentType {
  id: number;
  code: string;
  name: string;
  description?: string;
  category: string;
  default_formats: string[];
  default_max_size_mb: string;
  default_validity_days?: number;
  requires_verification: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TenantRuleSet {
  id: number;
  version: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  activated_at?: string;
  archived_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductType {
  id: number;
  code: string;
  name: string;
  description?: string;
  category: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  exchange_rate_to_base?: string;
  is_base_currency: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentFrequency {
  id: number;
  code: string;
  name: string;
  days_between_payments: number;
  payments_per_year: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AmortizationSystem {
  id: number;
  code: string;
  name: string;
  description?: string;
  formula_type: string;
  is_active: boolean;
  display_order: number;
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

export interface DecisionThreshold {
  id: number;
  rule_set: number;
  min_score_auto_approval?: number;
  min_score_manual_review?: number;
  max_score_auto_rejection?: number;
  max_amount_auto_approval?: string;
  requires_manager_approval_amount?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DOCUMENTOS REQUERIDOS POR PRODUCTO
// ============================================================================

export interface ProductDocumentRequirement {
  id: number;
  product: number;
  document_type: number;
  document_type_detail?: DocumentType;
  is_mandatory: boolean;
  display_order: number;
  max_validity_days?: number;
  allowed_formats: string[];
  max_file_size_mb?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentRequirementData {
  document_type: number;
  is_mandatory?: boolean;
  display_order?: number;
  max_validity_days?: number;
  allowed_formats?: string[];
  max_file_size_mb?: string;
}

// ============================================================================
// PRODUCTO CREDITICIO (REFACTORIZADO - Fase 2)
// ============================================================================

export interface CreditProduct {
  id: number;
  name: string;
  code: string;
  product_type: number; // FK a ProductType
  product_type_detail?: ProductType;
  rule_set?: number; // FK a TenantRuleSet (nullable)
  rule_set_detail?: TenantRuleSet;
  description: string;
  is_active: boolean;
  display_order: number;
  target_audience?: string;
  benefits?: string[];
  terms_and_conditions?: string;
  icon?: string;
  color?: string;
  has_parameters?: boolean;
  document_requirements?: ProductDocumentRequirement[]; // Documentos requeridos
  // Nuevos campos de selección
  selected_parameter?: number;
  selected_parameter_detail?: CreditProductParameter;
  selected_eligibility_rules?: number[];
  selected_eligibility_rules_detail?: EligibilityRule[];
  selected_threshold?: number;
  selected_threshold_detail?: DecisionThreshold;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  code: string;
  product_type: number;
  rule_set?: number;
  description: string;
  is_active?: boolean;
  display_order?: number;
  target_audience?: string;
  benefits?: string[];
  terms_and_conditions?: string;
  icon?: string;
  color?: string;
  document_requirements?: CreateDocumentRequirementData[];
  // Nuevos campos de selección
  selected_parameter?: number;
  selected_eligibility_rules?: number[];
  selected_threshold?: number;
}

export interface UpdateProductData extends Partial<Omit<CreateProductData, 'code'>> {}

// ============================================================================
// PARÁMETROS DEL PRODUCTO (del RuleSet)
// ============================================================================

export interface CreditProductParameter {
  id: number;
  rule_set: number;
  product?: number;
  product_name?: string;
  
  // Montos
  min_amount: string;
  max_amount: string;
  
  // Plazos
  min_term_months: number;
  max_term_months: number;
  
  // Tasas
  min_interest_rate: string;
  max_interest_rate: string;
  interest_type: 'FIXED' | 'VARIABLE' | 'MIXED';
  
  // Comisiones y seguros
  commission_rate_min: string;
  commission_rate_max: string;
  insurance_rate_min: string;
  insurance_rate_max: string;
  additional_insurance_rate?: string;
  
  // Sistema de pago
  grace_period_months_min: number;
  grace_period_months_max: number;
  allows_early_payment: boolean;
  early_payment_penalty_min: string;
  early_payment_penalty_max: string;
  
  // Catálogos M2M (IDs)
  allowed_currencies: number[];
  allowed_payment_frequencies: number[];
  allowed_amortization_systems: number[];
  
  // Catálogos M2M (objetos completos)
  allowed_currencies_detail?: Currency[];
  allowed_payment_frequencies_detail?: PaymentFrequency[];
  allowed_amortization_systems_detail?: AmortizationSystem[];
  
  // Financiamiento
  max_financing_percentage: string;
  
  // Elegibilidad
  min_income_required?: string;
  max_debt_to_income_ratio?: string;
  min_employment_months?: number;
  min_collateral_coverage?: string;
  
  // Garantías
  requires_guarantor: boolean;
  requires_collateral: boolean;
  
  // Scoring
  min_credit_score_required?: number;
  auto_approval_enabled: boolean;
  max_auto_approval_amount?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PRODUCTO CON CONFIGURACIÓN COMPLETA
// ============================================================================

export interface CreditProductWithParameters extends CreditProduct {
  parameters: CreditProductParameter | null;
}

export interface CreditProductFull extends CreditProduct {
  parameters: CreditProductParameter | null;
  workflow_stages?: WorkflowStage[];
}

export interface WorkflowStage {
  id: number;
  stage_name: string;
  stage_code: string;
  stage_order: number;
  is_automated: boolean;
  time_limit_hours?: number;
}

// ============================================================================
// CÁLCULOS
// ============================================================================

export interface ProductCalculationRequest {
  amount: string;
  term_months: number;
  interest_rate?: string;
  commission_rate?: string;
  insurance_rate?: string;
  amortization_system?: string;
}

export interface ProductCalculationResponse {
  monthly_payment: string;
  total_payments: string;
  total_interest: string;
  commission: string;
  insurance_cost: string;
  total_cost: string;
}

// ============================================================================
// RANGOS
// ============================================================================

export interface ProductRanges {
  amount: {
    min: string;
    max: string;
  };
  term_months: {
    min: number;
    max: number;
  };
  interest_rate: {
    min: string;
    max: string;
  };
  commission_rate: {
    min: string;
    max: string;
  };
  insurance_rate: {
    min: string;
    max: string;
  };
}

// ============================================================================
// UTILIDADES
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
