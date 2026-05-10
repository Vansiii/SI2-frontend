/**
 * Tipos para Reglas de Elegibilidad (CU-09)
 */

export interface EligibilityRule {
  id: number;
  rule_set: number;
  rule_set_name?: string;
  max_debt_to_income_ratio: string;
  min_income_required: string;
  min_employment_months: number;
  max_arrears_allowed: string;
  allowed_cic_categories: string[];
  min_collateral_coverage: string;
  min_age: number;
  max_age: number;
  created_at: string;
  updated_at: string;
}

export interface EligibilityRuleWrite {
  rule_set: number;
  max_debt_to_income_ratio: number;
  min_income_required: number;
  min_employment_months: number;
  max_arrears_allowed: number;
  allowed_cic_categories: string[];
  min_collateral_coverage: number;
  min_age: number;
  max_age: number;
}

export const CIC_CATEGORIES = [
  { value: 'A', label: 'A - Sin problemas' },
  { value: 'B', label: 'B - Problemas potenciales' },
  { value: 'C', label: 'C - Deficiente' },
  { value: 'D', label: 'D - Dudoso' },
  { value: 'E', label: 'E - Pérdida' },
];
