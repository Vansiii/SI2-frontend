import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ruleSetApi } from '../services/ruleSetApi';
import type { TenantRuleSetWrite, CloneRuleSetRequest, TenantRuleSet, PaginatedRuleSetResponse } from '../types/ruleSet.types';
import { toast } from 'sonner';

/**
 * Hook para listar todos los conjuntos de reglas
 */
export const useRuleSets = () => {
  const query = useQuery<PaginatedRuleSetResponse | TenantRuleSet[]>({
    queryKey: ['rule-sets'],
    queryFn: ruleSetApi.list,
    staleTime: 30000,
  });

  const ruleSets = Array.isArray(query.data) 
    ? query.data 
    : (query.data as any)?.results || [];

  return {
    ...query,
    data: ruleSets,
    // Keep raw data just in case
    rawData: query.data
  };
};


/**
 * Hook para obtener un conjunto de reglas específico
 */
export const useRuleSet = (id: number) => {
  return useQuery<TenantRuleSet>({
    queryKey: ['rule-sets', id],
    queryFn: () => ruleSetApi.get(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

/**
 * Hook para obtener el conjunto de reglas activo
 */
export const useActiveRuleSet = () => {
  return useQuery<TenantRuleSet>({
    queryKey: ['rule-sets', 'active'],
    queryFn: ruleSetApi.getActive,
    staleTime: 60000,
  });
};

/**
 * Hook para crear un conjunto de reglas
 */
export const useCreateRuleSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TenantRuleSetWrite) => ruleSetApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rule-sets'] });
      toast.success('Conjunto de reglas creado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al crear el conjunto de reglas';
      toast.error(message);
    },
  });
};

/**
 * Hook para actualizar un conjunto de reglas
 */
export const useUpdateRuleSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TenantRuleSetWrite> }) =>
      ruleSetApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rule-sets'] });
      queryClient.invalidateQueries({ queryKey: ['rule-sets', data.id] });
      toast.success('Conjunto de reglas actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al actualizar el conjunto de reglas';
      toast.error(message);
    },
  });
};

/**
 * Hook para eliminar un conjunto de reglas
 */
export const useDeleteRuleSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ruleSetApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rule-sets'] });
      toast.success('Conjunto de reglas eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al eliminar el conjunto de reglas';
      toast.error(message);
    },
  });
};

/**
 * Hook para activar un conjunto de reglas
 */
export const useActivateRuleSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ruleSetApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rule-sets'] });
      queryClient.invalidateQueries({ queryKey: ['rule-sets', 'active'] });
      toast.success('Conjunto de reglas activado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al activar el conjunto de reglas';
      toast.error(message);
    },
  });
};

/**
 * Hook para clonar un conjunto de reglas
 */
export const useCloneRuleSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CloneRuleSetRequest }) =>
      ruleSetApi.clone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rule-sets'] });
      toast.success('Conjunto de reglas clonado exitosamente');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Error al clonar el conjunto de reglas';
      toast.error(message);
    },
  });
};

/**
 * Hook para obtener auditoría de un conjunto de reglas
 */
export const useRuleSetAudit = (id: number) => {
  return useQuery({
    queryKey: ['rule-sets', id, 'audit'],
    queryFn: () => ruleSetApi.getAudit(id),
    enabled: !!id,
    staleTime: 10000,
  });
};
