import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productParameterApi } from '../services/productParameterApi';
import { toast } from 'sonner';
import type { CreditProductParameterWrite } from '../types/productParameter.types';

export const useProductParameters = (ruleSetId?: number) => {
  const queryClient = useQueryClient();

  // Listar parámetros
  const { data: parametersData, isLoading, error } = useQuery({
    queryKey: ['product-parameters', ruleSetId],
    queryFn: () => productParameterApi.list(ruleSetId ? { rule_set: ruleSetId } : undefined),
  });

  const parameters = Array.isArray(parametersData) 
    ? parametersData 
    : (parametersData as any)?.results || [];


  // Crear parámetro
  const createMutation = useMutation({
    mutationFn: productParameterApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-parameters'] });
      toast.success('Parámetro de producto creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear parámetro de producto');
    },
  });

  // Actualizar parámetro
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreditProductParameterWrite> }) =>
      productParameterApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-parameters'] });
      toast.success('Parámetro de producto actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar parámetro de producto');
    },
  });

  // Eliminar parámetro
  const deleteMutation = useMutation({
    mutationFn: productParameterApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-parameters'] });
      toast.success('Parámetro de producto eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar parámetro de producto');
    },
  });

  return {
    parameters,
    isLoading,
    error,
    createParameter: createMutation.mutate,
    updateParameter: updateMutation.mutate,
    deleteParameter: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useProductParameter = (id: number) => {
  return useQuery({
    queryKey: ['product-parameters', id],
    queryFn: () => productParameterApi.get(id),
    enabled: !!id,
  });
};
