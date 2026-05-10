import apiClient from '../../../utils/apiClient';
import type {
  LoanApplicationDocumentRequirement,
  DocumentReviewRequest,
} from '../types/document.types';

export const documentApi = {
  /**
   * Obtener documentos de una solicitud (cliente)
   */
  getMyDocuments: async (applicationId: number): Promise<LoanApplicationDocumentRequirement[]> => {
    return await apiClient.get<LoanApplicationDocumentRequirement[]>(
      `/loans/my-documents/?loan_application=${applicationId}`
    );
  },

  /**
   * Obtener detalle de un documento específico (cliente)
   */
  getMyDocumentDetail: async (id: number): Promise<LoanApplicationDocumentRequirement> => {
    return await apiClient.get<LoanApplicationDocumentRequirement>(`/loans/my-documents/${id}/`);
  },

  /**
   * Cargar un documento (cliente)
   */
  uploadDocument: async (id: number, file: File): Promise<LoanApplicationDocumentRequirement> => {
    const formData = new FormData();
    formData.append('file', file);

    return await apiClient.post<LoanApplicationDocumentRequirement>(
      `/loans/my-documents/${id}/upload/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  /**
   * Obtener todos los documentos pendientes de revisión (staff)
   */
  getStaffDocuments: async (filters?: {
    status?: string;
    loan_application?: number;
  }): Promise<LoanApplicationDocumentRequirement[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.loan_application) params.append('loan_application', filters.loan_application.toString());

    return await apiClient.get<LoanApplicationDocumentRequirement[]>(
      `/loans/staff/documents/?${params.toString()}`
    );
  },

  /**
   * Revisar un documento (staff)
   */
  reviewDocument: async (
    id: number,
    review: DocumentReviewRequest
  ): Promise<LoanApplicationDocumentRequirement> => {
    return await apiClient.post<LoanApplicationDocumentRequirement>(
      `/loans/staff/documents/${id}/review/`,
      review
    );
  },

  /**
   * Descargar un documento
   */
  downloadDocument: async (signedUrl: string): Promise<void> => {
    window.open(signedUrl, '_blank');
  },
};
