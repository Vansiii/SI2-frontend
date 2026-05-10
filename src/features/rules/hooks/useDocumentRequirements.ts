/**
 * @deprecated Este hook está DEPRECATED desde 2026-05-10
 * 
 * El modelo DocumentRequirement ha sido eliminado del sistema.
 * Los documentos requeridos ahora se gestionan directamente en cada producto
 * a través de ProductDocumentRequirement.
 * 
 * USAR EN SU LUGAR:
 * - useProducts() hook para obtener productos con sus document_requirements
 * - Gestionar documentos requeridos directamente en el formulario de productos
 * 
 * Ver: RESUMEN_ELIMINACION_DOCUMENT_REQUIREMENT.md
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentRequirementApi } from '../services/documentRequirementApi';
import { toast } from 'sonner';
import type { DocumentRequirementWrite } from '../types/documentRequirement.types';

/**
 * @deprecated No usar - El endpoint /loans/document-requirements/ ya no existe
 */
export const useDocumentRequirements = (filters?: { rule_set?: number; product?: number }) => {
  const queryClient = useQueryClient();

  // Listar requisitos
  const { data: requirementsData, isLoading, error } = useQuery({
    queryKey: ['document-requirements', filters],
    queryFn: () => documentRequirementApi.list(filters),
  });

  const requirements = Array.isArray(requirementsData) 
    ? requirementsData 
    : (requirementsData as any)?.results || [];


  // Crear requisito
  const createMutation = useMutation({
    mutationFn: documentRequirementApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-requirements'] });
      toast.success('Requisito documental creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear requisito documental');
    },
  });

  // Actualizar requisito
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DocumentRequirementWrite> }) =>
      documentRequirementApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-requirements'] });
      toast.success('Requisito documental actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar requisito documental');
    },
  });

  // Eliminar requisito
  const deleteMutation = useMutation({
    mutationFn: documentRequirementApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-requirements'] });
      toast.success('Requisito documental eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar requisito documental');
    },
  });

  return {
    requirements,
    isLoading,
    error,
    createRequirement: createMutation.mutate,
    updateRequirement: updateMutation.mutate,
    deleteRequirement: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * @deprecated No usar - El endpoint /loans/document-requirements/ ya no existe
 */
export const useDocumentRequirement = (id: number) => {
  return useQuery({
    queryKey: ['document-requirements', id],
    queryFn: () => documentRequirementApi.get(id),
    enabled: !!id,
  });
};
