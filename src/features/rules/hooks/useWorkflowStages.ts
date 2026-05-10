import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowStageApi } from '../api/workflowStageApi';
import { toast } from 'sonner';
import type { WorkflowStageWrite } from '../types/workflowStage.types';

export const useWorkflowStages = (ruleSetId?: number) => {
  const queryClient = useQueryClient();

  // Listar etapas
  const { data: stagesData, isLoading, error } = useQuery({
    queryKey: ['workflow-stages', ruleSetId],
    queryFn: () => workflowStageApi.list(ruleSetId),
  });

  const stages = Array.isArray(stagesData) 
    ? stagesData 
    : (stagesData as any)?.results || [];


  // Crear etapa
  const createMutation = useMutation({
    mutationFn: workflowStageApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-stages'] });
      toast.success('Etapa del workflow creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear etapa del workflow');
    },
  });

  // Actualizar etapa
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WorkflowStageWrite> }) =>
      workflowStageApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-stages'] });
      toast.success('Etapa del workflow actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar etapa del workflow');
    },
  });

  // Eliminar etapa
  const deleteMutation = useMutation({
    mutationFn: workflowStageApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-stages'] });
      toast.success('Etapa del workflow eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar etapa del workflow');
    },
  });

  return {
    stages,
    loading: isLoading,
    error,
    createStage: createMutation.mutateAsync,
    updateStage: updateMutation.mutateAsync,
    deleteStage: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useWorkflowStage = (id: number) => {
  return useQuery({
    queryKey: ['workflow-stages', id],
    queryFn: () => workflowStageApi.get(id),
    enabled: !!id,
  });
};