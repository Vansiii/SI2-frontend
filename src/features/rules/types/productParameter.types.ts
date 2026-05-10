/**
 * Tipos para Parámetros de Productos (CU-09)
 */

import type { Currency, PaymentFrequency, AmortizationSystem } from './catalog.types';

export interface CreditProductParameter {
  id: number;
  rule_set: number;
  rule_set_name?: string;
  product: number;
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
  
  // Comisiones y Seguros
  commission_rate_min: string;
  commission_rate_max: string;
  insurance_rate_min: string;
  insurance_rate_max: string;
  additional_insurance_rate: string;
  
  // Sistema de Pago
  grace_period_months_min: number;
  grace_period_months_max: number;
  allows_early_payment: boolean;
  early_payment_penalty_min: string;
  early_payment_penalty_max: string;
  
  // Catálogos M2M (IDs)
  allowed_currencies: number[];
  allowed_payment_frequencies: number[];
  allowed_amortization_systems: number[];
  
  // Catálogos M2M (nested data - read only)
  allowed_currencies_detail?: Currency[];
  allowed_payment_frequencies_detail?: PaymentFrequency[];
  allowed_amortization_systems_detail?: AmortizationSystem[];
  
  // Financiamiento
  max_financing_percentage: string;
  
  // Elegibilidad (opcionales con fallback)
  min_income_required: string | null;
  max_debt_to_income_ratio: string | null;
  min_employment_months: number | null;
  min_collateral_coverage: string | null;
  
  // Garantías
  requires_guarantor: boolean;
  requires_collateral: boolean;
  
  // Scoring
  min_credit_score_required: number | null;
  auto_approval_enabled: boolean;
  max_auto_approval_amount: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface CreditProductParameterWrite {
  // Relaciones
  rule_set: number;
  product?: number; // Opcional - puede no estar asociado a un producto específico
  
  // Montos
  min_amount: number;
  max_amount: number;
  
  // Plazos
  min_term_months: number;
  max_term_months: number;
  
  // Tasas
  min_interest_rate: number;
  max_interest_rate: number;
  interest_type: 'FIXED' | 'VARIABLE' | 'MIXED';
  
  // Comisiones y Seguros
  commission_rate_min: number;
  commission_rate_max: number;
  insurance_rate_min: number;
  insurance_rate_max: number;
  additional_insurance_rate: number;
  
  // Sistema de Pago
  grace_period_months_min: number;
  grace_period_months_max: number;
  allows_early_payment: boolean;
  early_payment_penalty_min: number;
  early_payment_penalty_max: number;
  
  // Catálogos M2M (IDs en lugar de strings)
  allowed_currencies: number[];
  allowed_payment_frequencies: number[];
  allowed_amortization_systems: number[];
  
  // Financiamiento
  max_financing_percentage: number;
  
  // Elegibilidad (opcionales con fallback)
  min_income_required?: number;
  max_debt_to_income_ratio?: number;
  min_employment_months?: number;
  min_collateral_coverage?: number;
  
  // Garantías
  requires_guarantor: boolean;
  requires_collateral: boolean;
  
  // Scoring
  min_credit_score_required?: number;
  auto_approval_enabled: boolean;
  max_auto_approval_amount?: number;
}

// Deprecated - use catalog API instead
export const CURRENCIES = [
  { value: 'BOB', label: 'Bolivianos (BOB)' },
  { value: 'USD', label: 'Dólares (USD)' },
];

// Deprecated - use catalog API instead
export const PAYMENT_FREQUENCIES = [
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'BIWEEKLY', label: 'Quincenal' },
  { value: 'WEEKLY', label: 'Semanal' },
];
