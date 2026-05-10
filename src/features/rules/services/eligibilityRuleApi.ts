import apiClient from '../../../utils/apiClient';
import type { EligibilityRule, EligibilityRuleWrite } from '../types/eligibilityRule.types';

export const eligibilityRuleApi = {
  /**
   * Listar todas las reglas de elegibilidad
   */
  list: async (): Promise<EligibilityRule[]> => {
    return await apiClient.get<EligibilityRule[]>('/loans/eligibility-rules/');
  },

  /**
   * Obtener una regla de elegibilidad por ID
   */
  get: async (id: number): Promise<EligibilityRule> => {
    return await apiClient.get<EligibilityRule>(`/loans/eligibility-rules/${id}/`);
  },

  /**
   * Crear una nueva regla de elegibilidad
   */
  create: async (data: EligibilityRuleWrite): Promise<EligibilityRule> => {
    return await apiClient.post<EligibilityRule>('/loans/eligibility-rules/', data);
  },

  /**
   * Actualizar una regla de elegibilidad
   */
  update: async (id: number, data: Partial<EligibilityRuleWrite>): Promise<EligibilityRule> => {
    return await apiClient.put<EligibilityRule>(`/loans/eligibility-rules/${id}/`, data);
  },

  /**
   * Eliminar una regla de elegibilidad
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/loans/eligibility-rules/${id}/`);
  },
};
