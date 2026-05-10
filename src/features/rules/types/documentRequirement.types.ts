/**
 * Tipos para Requisitos Documentales (CU-09)
 */

export interface DocumentRequirement {
  id: number;
  rule_set: number;
  rule_set_name?: string;
  product: number;
  product_name?: string;
  document_type: string;
  document_name: string;
  description: string;
  is_mandatory: boolean;
  max_validity_days: number | null;
  allowed_formats: string[];
  max_file_size_mb: string;
  requires_manual_review: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentRequirementWrite {
  rule_set: number;
  product: number;
  document_type: string;
  document_name: string;
  description?: string;
  is_mandatory: boolean;
  max_validity_days?: number | null;
  allowed_formats: string[];
  max_file_size_mb: number;
  requires_manual_review: boolean;
  display_order?: number;
}

export const DOCUMENT_TYPES = [
  { value: 'ID_DOCUMENT', label: 'Documento de Identidad' },
  { value: 'INCOME_PROOF', label: 'Comprobante de Ingresos' },
  { value: 'BANK_STATEMENT', label: 'Extracto Bancario' },
  { value: 'EMPLOYMENT_LETTER', label: 'Carta de Trabajo' },
  { value: 'TAX_RETURN', label: 'Declaración de Impuestos' },
  { value: 'UTILITY_BILL', label: 'Factura de Servicios' },
  { value: 'PROPERTY_DEED', label: 'Escritura de Propiedad' },
  { value: 'OTHER', label: 'Otro' },
];

export const FILE_FORMATS = [
  { value: 'application/pdf', label: 'PDF' },
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/jpg', label: 'JPG' },
];
