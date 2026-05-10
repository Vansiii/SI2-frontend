import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productTypeApi } from '../services/catalogsApi';
import { toast } from 'sonner';
import type { ProductType } from '../types';

export const useProductTypes = () => {
  const queryClient = useQueryClient();

  const { data: productTypes, isLoading, error } = useQuery({
    queryKey: ['productTypes'],
    queryFn: productTypeApi.list,
  });

  const createMutation = useMutation({
    mutationFn: productTypeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productTypes'] });
      toast.success('Tipo de producto creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear tipo de producto');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductType> }) =>
      productTypeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productTypes'] });
      toast.success('Tipo de producto actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar tipo de producto');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productTypeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productTypes'] });
      toast.success('Tipo de producto eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar tipo de producto');
    },
  });

  return {
    productTypes: productTypes || [],
    isLoading,
    error,
    createProductType: createMutation.mutate,
    updateProductType: updateMutation.mutate,
    deleteProductType: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useActiveProductTypes = () => {
  return useQuery({
    queryKey: ['productTypes', 'active'],
    queryFn: productTypeApi.getActive,
  });
};
