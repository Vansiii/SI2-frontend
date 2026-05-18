export interface DocumentRequirement {
  id: number;
  document_name: string;
  document_type: string;
  description: string;
  is_mandatory: boolean;
  allowed_formats: string[];
  max_file_size_mb: number;
}

export interface FileResourceDetail {
  id: number;
  original_filename: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  uploaded_at: string;
}

export interface DocumentReviewHistory {
  id: number;
  document_requirement: number;
  action: 'APPROVED' | 'REJECTED' | 'REQUESTED_REUPLOAD';
  reviewed_by: number | null;
  reviewed_by_name: string;
  comments: string;
  file_resource_at_review: number | null;
  file_name: string;
  created_at: string;
}

export interface LoanApplicationDocumentRequirement {
  id: number;
  loan_application: number;
  document_requirement: number;
  // Información del requisito
  document_name: string;
  document_type: string;
  description: string;
  is_mandatory: boolean;
  allowed_formats: string[];
  max_file_size_mb: number;
  // Estado
  status: 'PENDING' | 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  // Archivo
  file_resource: number | null;
  file_resource_detail: FileResourceDetail | null;
  signed_url: string | null;
  // Fechas y usuarios
  uploaded_at: string | null;
  uploaded_by: number | null;
  uploaded_by_name: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  reviewed_by_name: string;
  rejection_reason: string;
  notes: string;
  // Información de la solicitud (para staff)
  loan_application_client_name?: string;
  loan_application_product_name?: string;
  loan_application_number?: string;
  loan_application_status?: string;
  // Historial
  review_history: DocumentReviewHistory[];
  created_at: string;
  updated_at: string;
}

export interface DocumentUploadRequest {
  document_requirement_id: number;
  file: File;
}

export interface DocumentReviewRequest {
  action: 'APPROVED' | 'REJECTED' | 'REQUESTED_REUPLOAD';
  comments?: string;
}

export interface DocumentStats {
  total: number;
  pending: number;
  uploaded: number;
  under_review: number;
  approved: number;
  rejected: number;
  mandatory: number;
  optional: number;
}
