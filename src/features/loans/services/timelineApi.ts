import apiClient from '../../../utils/apiClient';
import type {
  LoanApplicationTimeline,
  LoanApplicationListItem,
  TimelineEvent,
  PendingAction,
} from '../types/timeline.types';

export const timelineApi = {
  /**
   * Obtener lista de solicitudes del cliente
   */
  getMyApplications: async (): Promise<LoanApplicationListItem[]> => {
    // DRF retorna directamente el array, no un objeto con propiedad 'data'
    return await apiClient.get<LoanApplicationListItem[]>('/loans/my-applications/');
  },

  /**
   * Obtener detalle completo de una solicitud con timeline
   */
  getApplicationDetail: async (id: number): Promise<LoanApplicationTimeline> => {
    return await apiClient.get<LoanApplicationTimeline>(`/loans/my-applications/${id}/`);
  },

  /**
   * Obtener timeline detallado de una solicitud
   */
  getTimeline: async (id: number): Promise<TimelineEvent[]> => {
    return await apiClient.get<TimelineEvent[]>(`/loans/my-applications/${id}/timeline/`);
  },

  /**
   * Obtener acciones pendientes del cliente
   */
  getPendingActions: async (id: number): Promise<PendingAction[]> => {
    return await apiClient.get<PendingAction[]>(`/loans/my-applications/${id}/pending-actions/`);
  },
};
