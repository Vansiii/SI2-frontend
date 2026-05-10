import apiClient from '../../../utils/apiClient';
import type { DecisionThreshold, DecisionThresholdWrite } from '../types/decisionThreshold.types';

export const decisionThresholdApi = {
  list: async (ruleSetId?: number): Promise<DecisionThreshold[]> => {
    const params = ruleSetId ? { rule_set: ruleSetId } : undefined;
    return await apiClient.get<DecisionThreshold[]>('/loans/decision-thresholds/', params);
  },

  get: async (id: number): Promise<DecisionThreshold> => {
    return await apiClient.get<DecisionThreshold>(`/loans/decision-thresholds/${id}/`);
  },

  create: async (data: DecisionThresholdWrite): Promise<DecisionThreshold> => {
    return await apiClient.post<DecisionThreshold>('/loans/decision-thresholds/', data);
  },

  update: async (id: number, data: Partial<DecisionThresholdWrite>): Promise<DecisionThreshold> => {
    return await apiClient.patch<DecisionThreshold>(`/loans/decision-thresholds/${id}/`, data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/loans/decision-thresholds/${id}/`);
  },
};