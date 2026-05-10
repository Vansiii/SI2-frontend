import apiClient from '../../../utils/apiClient';
import type { WorkflowStageDefinition, WorkflowStageWrite } from '../types/workflowStage.types';

export const workflowStageApi = {
  list: async (ruleSetId?: number): Promise<WorkflowStageDefinition[]> => {
    const params = ruleSetId ? { rule_set: ruleSetId } : undefined;
    return await apiClient.get<WorkflowStageDefinition[]>('/loans/workflow-stages/', params);
  },

  get: async (id: number): Promise<WorkflowStageDefinition> => {
    return await apiClient.get<WorkflowStageDefinition>(`/loans/workflow-stages/${id}/`);
  },

  create: async (data: WorkflowStageWrite): Promise<WorkflowStageDefinition> => {
    return await apiClient.post<WorkflowStageDefinition>('/loans/workflow-stages/', data);
  },

  update: async (id: number, data: Partial<WorkflowStageWrite>): Promise<WorkflowStageDefinition> => {
    return await apiClient.patch<WorkflowStageDefinition>(`/loans/workflow-stages/${id}/`, data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/loans/workflow-stages/${id}/`);
  },
};