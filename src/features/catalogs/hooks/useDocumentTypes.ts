import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentTypeApi } from '../services/catalogsApi';
import { toast } from 'sonner';
import type { DocumentTypeWrite } from '../types';

export const useDocumentTypes = () => {
  const queryClient = useQueryClient();

  const { data: documentTypes, isLoading, error } = useQuery({
    queryKey: ['documentTypes'],
    queryFn: documentTypeApi.list,
  });

  const createMutation = useMutation({
    mutationFn: documentTypeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTypes'] });
      toast.success('Tipo de documento creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear tipo de documento');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DocumentTypeWrite> }) =>
      documentTypeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTypes'] });
      toast.success('Tipo de documento actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar tipo de documento');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: documentTypeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTypes'] });
      toast.success('Tipo de documento eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar tipo de documento');
    },
  });

  return {
    documentTypes: documentTypes || [],
    isLoading,
    error,
    createDocumentType: createMutation.mutate,
    updateDocumentType: updateMutation.mutate,
    deleteDocumentType: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
