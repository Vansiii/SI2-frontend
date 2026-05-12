import apiClient from '../../../utils/apiClient';
import type { CreditProductParameter, CreditProductParameterWrite } from '../types/productParameter.types';

export const productParameterApi = {
  /**
   * Listar todos los parámetros de productos
   */
  list: async (filters?: { rule_set?: number }): Promise<CreditProductParameter[]> => {
    const params: Record<string, string | number | boolean> = {};
    if (filters?.rule_set !== undefined) {
      params.rule_set = filters.rule_set;
    }
    return await apiClient.get<CreditProductParameter[]>('/loans/product-parameters/', Object.keys(params).length > 0 ? params : undefined);
  },

  /**
   * Obtener un parámetro por ID
   */
  get: async (id: number): Promise<CreditProductParameter> => {
    return await apiClient.get<CreditProductParameter>(`/loans/product-parameters/${id}/`);
  },

  /**
   * Crear un nuevo parámetro
   */
  create: async (data: CreditProductParameterWrite): Promise<CreditProductParameter> => {
    return await apiClient.post<CreditProductParameter>('/loans/product-parameters/', data);
  },

  /**
   * Actualizar un parámetro
   */
  update: async (id: number, data: Partial<CreditProductParameterWrite>): Promise<CreditProductParameter> => {
    return await apiClient.put<CreditProductParameter>(`/loans/product-parameters/${id}/`, data);
  },

  /**
   * Eliminar un parámetro
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/loans/product-parameters/${id}/`);
  },
};
