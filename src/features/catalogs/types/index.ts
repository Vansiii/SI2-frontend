/**
 * Tipos para catálogos centralizados
 */

export interface DocumentType {
  id: number;
  code: string;
  name: string;
  description: string;
  category: 'IDENTITY' | 'FINANCIAL' | 'LEGAL' | 'COLLATERAL' | 'OTHER';
  default_formats: string[];
  default_max_size_mb: string;
  default_validity_days: number | null;
  is_active: boolean;
  display_order: number;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentTypeWrite {
  code: string;
  name: string;
  description?: string;
  category: 'IDENTITY' | 'FINANCIAL' | 'FINANCIAL' | 'LEGAL' | 'COLLATERAL' | 'OTHER';
  default_formats: string[];
  default_max_size_mb: number;
  default_validity_days?: number | null;
  is_active?: boolean;
  display_order?: number;
  icon?: string;
}

export interface ProductType {
  id: number;
  code: string;
  name: string;
  description: string;
  category: 'CONSUMER' | 'COMMERCIAL' | 'MORTGAGE' | 'AGRICULTURAL';
  icon: string;
  color: string;
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
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  exchange_rate_to_base: string;
  is_base_currency: boolean;
  is_active: boolean;
}

export interface AmortizationSystem {
  id: number;
  code: string;
  name: string;
  description: string;
  formula_type: string;
  is_active: boolean;
}
