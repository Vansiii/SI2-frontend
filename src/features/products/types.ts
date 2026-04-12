/**
 * Tipos para el módulo de Productos Crediticios
 */

export interface CreditProduct {
  id: number;
  name: string;
  description: string;
  product_type: 
    | 'PERSONAL'
    | 'VEHICULAR'
    | 'HIPOTECARIO'
    | 'VIVIENDA_SOCIAL'
    | 'PYME'
    | 'EMPRESARIAL'
    | 'AGROPECUARIO'
    | 'MICROEMPRESA';
  min_amount: string;
  max_amount: string;
  interest_rate: string;
  interest_type: 'FIXED' | 'VARIABLE' | 'MIXED';
  min_term_months: number;
  max_term_months: number;
  commission_rate: string;
  insurance_rate: string;
  amortization_system: 'FRENCH' | 'GERMAN' | 'AMERICAN';
  requires_guarantor: boolean;
  required_documents: string[];
  min_credit_score: number | null;
  auto_approval_enabled: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  product_type: CreditProduct['product_type'];
  min_amount: string;
  max_amount: string;
  interest_rate: string;
  interest_type: 'FIXED' | 'VARIABLE' | 'MIXED';
  min_term_months: number;
  max_term_months: number;
  commission_rate: string;
  insurance_rate: string;
  amortization_system: 'FRENCH' | 'GERMAN' | 'AMERICAN';
  requires_guarantor: boolean;
  required_documents?: string[];
  min_credit_score?: number | null;
  auto_approval_enabled?: boolean;
  display_order?: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
