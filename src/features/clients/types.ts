/**
 * Tipos para el módulo de Clientes
 */

export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  document_type: 'CI' | 'NIT' | 'PASSPORT' | 'OTHER';
  document_number: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  monthly_income: string;
  employment_status: 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'RETIRED';
  employer_name: string;
  is_active: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  first_name: string;
  last_name: string;
  document_type: 'CI' | 'NIT' | 'PASSPORT' | 'OTHER';
  document_number: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  monthly_income: string;
  employment_status: 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'RETIRED';
  employer_name?: string;
}

export interface UpdateClientData extends Partial<CreateClientData> {}

export interface ClientDocument {
  id: number;
  client: number;
  document_type: string;
  file_url: string;
  uploaded_at: string;
  verified: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
