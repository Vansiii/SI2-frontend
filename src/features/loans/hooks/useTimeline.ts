import { useQuery } from '@tanstack/react-query';
import { timelineApi } from '../services/timelineApi';

/**
 * Hook para obtener lista de solicitudes del cliente
 */
export const useMyApplications = () => {
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: timelineApi.getMyApplications,
    staleTime: 30000, // 30 segundos
    retry: 1,
    refetchOnWindowFocus: false,
    // Asegurar que siempre retorne un array
    select: (data) => data || [],
  });
};

/**
 * Hook para obtener detalle de una solicitud con timeline
 */
export const useApplicationDetail = (id: number) => {
  return useQuery({
    queryKey: ['my-applications', id],
    queryFn: () => timelineApi.getApplicationDetail(id),
    enabled: !!id,
    staleTime: 10000, // 10 segundos
  });
};

/**
 * Hook para obtener timeline detallado
 */
export const useTimeline = (id: number) => {
  return useQuery({
    queryKey: ['my-applications', id, 'timeline'],
    queryFn: () => timelineApi.getTimeline(id),
    enabled: !!id,
    staleTime: 10000,
  });
};

/**
 * Hook para obtener acciones pendientes
 */
export const usePendingActions = (id: number) => {
  return useQuery({
    queryKey: ['my-applications', id, 'pending-actions'],
    queryFn: () => timelineApi.getPendingActions(id),
    enabled: !!id,
    staleTime: 10000,
  });
};
