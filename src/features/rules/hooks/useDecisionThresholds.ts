import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { decisionThresholdApi } from '../api/decisionThresholdApi';
import { toast } from 'sonner';
import type { DecisionThresholdWrite } from '../types/decisionThreshold.types';

export const useDecisionThresholds = (ruleSetId?: number) => {
  const queryClient = useQueryClient();

  // Listar umbrales
  const { data: thresholdsData, isLoading, error } = useQuery({
    queryKey: ['decision-thresholds', ruleSetId],
    queryFn: () => decisionThresholdApi.list(ruleSetId),
  });

  const thresholds = Array.isArray(thresholdsData) 
    ? thresholdsData 
    : (thresholdsData as any)?.results || [];


  // Crear umbral
  const createMutation = useMutation({
    mutationFn: decisionThresholdApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision-thresholds'] });
      toast.success('Umbral de decisión creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear umbral de decisión');
    },
  });

  // Actualizar umbral
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DecisionThresholdWrite> }) =>
      decisionThresholdApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision-thresholds'] });
      toast.success('Umbral de decisión actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar umbral de decisión');
    },
  });

  // Eliminar umbral
  const deleteMutation = useMutation({
    mutationFn: decisionThresholdApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision-thresholds'] });
      toast.success('Umbral de decisión eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar umbral de decisión');
    },
  });

  return {
    thresholds,
    loading: isLoading,
    error,
    createThreshold: createMutation.mutateAsync,
    updateThreshold: updateMutation.mutateAsync,
    deleteThreshold: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useDecisionThreshold = (id: number) => {
  return useQuery({
    queryKey: ['decision-thresholds', id],
    queryFn: () => decisionThresholdApi.get(id),
    enabled: !!id,
  });
};