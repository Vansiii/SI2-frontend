import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eligibilityRuleApi } from '../services/eligibilityRuleApi';
import { toast } from 'sonner';
import type { EligibilityRuleWrite } from '../types/eligibilityRule.types';

export const useEligibilityRules = () => {
  const queryClient = useQueryClient();

  // Listar reglas
  const { data: rulesData, isLoading, error } = useQuery({
    queryKey: ['eligibility-rules'],
    queryFn: eligibilityRuleApi.list,
  });

  const rules = Array.isArray(rulesData) 
    ? rulesData 
    : (rulesData as any)?.results || [];


  // Crear regla
  const createMutation = useMutation({
    mutationFn: eligibilityRuleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligibility-rules'] });
      toast.success('Regla de elegibilidad creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear regla de elegibilidad');
    },
  });

  // Actualizar regla
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EligibilityRuleWrite> }) =>
      eligibilityRuleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligibility-rules'] });
      toast.success('Regla de elegibilidad actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar regla de elegibilidad');
    },
  });

  // Eliminar regla
  const deleteMutation = useMutation({
    mutationFn: eligibilityRuleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligibility-rules'] });
      toast.success('Regla de elegibilidad eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar regla de elegibilidad');
    },
  });

  return {
    rules,
    isLoading,
    error,
    createRule: createMutation.mutate,
    updateRule: updateMutation.mutate,
    deleteRule: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useEligibilityRule = (id: number) => {
  return useQuery({
    queryKey: ['eligibility-rules', id],
    queryFn: () => eligibilityRuleApi.get(id),
    enabled: !!id,
  });
};
