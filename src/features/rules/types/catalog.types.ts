/**
 * Tipos para Catálogos Centralizados (CU-09)
 * 
 * Estos catálogos son compartidos entre todos los productos
 * y se configuran a nivel de institución financiera.
 */

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  is_base: boolean;
  is_active: boolean;
  financial_institution: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentFrequency {
  id: number;
  code: string;
  name: string;
  months_between_payments: number;
  is_active: boolean;
  financial_institution: number;
  created_at: string;
  updated_at: string;
}

export interface AmortizationSystem {
  id: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  financial_institution: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentType {
  id: number;
  code: string;
  name: string;
  description: string;
  category: 'IDENTITY' | 'INCOME' | 'PROPERTY' | 'OTHER';
  default_max_validity_days: number | null;
  default_allowed_formats: string[];
  default_max_file_size_mb: number;
  is_active: boolean;
  financial_institution: number;
  created_at: string;
  updated_at: string;
}

export interface ProductType {
  id: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  financial_institution: number;
  created_at: string;
  updated_at: string;
}
