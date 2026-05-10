import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../services/documentApi';
import type { DocumentReviewRequest } from '../types/document.types';
import { toast } from 'sonner';

/**
 * Hook para obtener documentos de una solicitud (cliente)
 */
export const useMyDocuments = (applicationId: number) => {
  return useQuery({
    queryKey: ['my-documents', applicationId],
    queryFn: () => documentApi.getMyDocuments(applicationId),
    enabled: !!applicationId,
    staleTime: 10000, // 10 segundos
  });
};

/**
 * Hook para obtener detalle de un documento (cliente)
 */
export const useMyDocumentDetail = (id: number) => {
  return useQuery({
    queryKey: ['my-documents', id],
    queryFn: () => documentApi.getMyDocumentDetail(id),
    enabled: !!id,
    staleTime: 10000,
  });
};

/**
 * Hook para cargar un documento (cliente)
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      documentApi.uploadDocument(id, file),
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      
      toast.success('Documento cargado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al cargar el documento';
      toast.error(message);
    },
  });
};

/**
 * Hook para obtener documentos pendientes de revisión (staff)
 */
export const useStaffDocuments = (filters?: {
  status?: string;
  loan_application?: number;
}) => {
  return useQuery({
    queryKey: ['staff-documents', filters],
    queryFn: () => documentApi.getStaffDocuments(filters),
    staleTime: 10000,
  });
};

/**
 * Hook para revisar un documento (staff)
 */
export const useReviewDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, review }: { id: number; review: DocumentReviewRequest }) =>
      documentApi.reviewDocument(id, review),
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['staff-documents'] });
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      
      const actionText = variables.review.action === 'APPROVED' 
        ? 'aprobado' 
        : variables.review.action === 'REJECTED'
        ? 'rechazado'
        : 'marcado para re-carga';
      
      toast.success(`Documento ${actionText} exitosamente`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al revisar el documento';
      toast.error(message);
    },
  });
};
