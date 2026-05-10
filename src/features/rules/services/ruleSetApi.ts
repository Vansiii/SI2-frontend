import apiClient from '../../../utils/apiClient';
import type {
  TenantRuleSet,
  TenantRuleSetWrite,
  CloneRuleSetRequest,
  RuleSetAudit,
} from '../types/ruleSet.types';

export const ruleSetApi = {
  /**
   * Listar todos los conjuntos de reglas
   */
  list: async (): Promise<TenantRuleSet[]> => {
    return await apiClient.get<TenantRuleSet[]>('/loans/rule-sets/');
  },

  /**
   * Obtener un conjunto de reglas específico
   */
  get: async (id: number): Promise<TenantRuleSet> => {
    return await apiClient.get<TenantRuleSet>(`/loans/rule-sets/${id}/`);
  },

  /**
   * Obtener el conjunto de reglas activo
   */
  getActive: async (): Promise<TenantRuleSet> => {
    return await apiClient.get<TenantRuleSet>('/loans/rule-sets/active/');
  },

  /**
   * Crear un nuevo conjunto de reglas
   */
  create: async (data: TenantRuleSetWrite): Promise<TenantRuleSet> => {
    return await apiClient.post<TenantRuleSet>('/loans/rule-sets/', data);
  },

  /**
   * Actualizar un conjunto de reglas (solo DRAFT)
   */
  update: async (id: number, data: Partial<TenantRuleSetWrite>): Promise<TenantRuleSet> => {
    return await apiClient.put<TenantRuleSet>(`/loans/rule-sets/${id}/`, data);
  },

  /**
   * Eliminar un conjunto de reglas (solo DRAFT)
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/loans/rule-sets/${id}/`);
  },

  /**
   * Activar un conjunto de reglas
   */
  activate: async (id: number): Promise<TenantRuleSet> => {
    return await apiClient.post<TenantRuleSet>(`/loans/rule-sets/${id}/activate/`);
  },

  /**
   * Clonar un conjunto de reglas
   */
  clone: async (id: number, data: CloneRuleSetRequest): Promise<TenantRuleSet> => {
    return await apiClient.post<TenantRuleSet>(`/loans/rule-sets/${id}/clone/`, data);
  },

  /**
   * Obtener auditoría de un conjunto de reglas
   */
  getAudit: async (id: number): Promise<RuleSetAudit[]> => {
    return await apiClient.get<RuleSetAudit[]>(`/loans/rule-sets/${id}/audit/`);
  },
};
