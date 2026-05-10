/**
 * @deprecated Este archivo está DEPRECATED desde 2026-05-10
 * 
 * El modelo DocumentRequirement ha sido eliminado del sistema.
 * Los documentos requeridos ahora se gestionan directamente en cada producto
 * a través de ProductDocumentRequirement.
 * 
 * USAR EN SU LUGAR:
 * - GET /api/products/credit-products/{id}/ - Incluye campo document_requirements
 * - POST /api/products/credit-products/ - Con campo document_requirements
 * - PUT/PATCH /api/products/credit-products/{id}/ - Con campo document_requirements
 * 
 * Ver: RESUMEN_ELIMINACION_DOCUMENT_REQUIREMENT.md
 */

import apiClient from '../../../utils/apiClient';
import type { DocumentRequirement, DocumentRequirementWrite } from '../types/documentRequirement.types';

/**
 * @deprecated No usar - El endpoint /loans/document-requirements/ ya no existe
 */
export const documentRequirementApi = {
  /**
   * @deprecated Listar todos los requisitos documentales
   */
  list: async (filters?: { rule_set?: number; product?: number }): Promise<DocumentRequirement[]> => {
    const params: Record<string, number> = {};
    if (filters?.rule_set) params.rule_set = filters.rule_set;
    if (filters?.product) params.product = filters.product;
    
    return await apiClient.get<DocumentRequirement[]>('/loans/document-requirements/', params);
  },

  /**
   * @deprecated Obtener un requisito por ID
   */
  get: async (id: number): Promise<DocumentRequirement> => {
    return await apiClient.get<DocumentRequirement>(`/loans/document-requirements/${id}/`);
  },

  /**
   * @deprecated Crear un nuevo requisito
   */
  create: async (data: DocumentRequirementWrite): Promise<DocumentRequirement> => {
    return await apiClient.post<DocumentRequirement>('/loans/document-requirements/', data);
  },

  /**
   * @deprecated Actualizar un requisito
   */
  update: async (id: number, data: Partial<DocumentRequirementWrite>): Promise<DocumentRequirement> => {
    return await apiClient.put<DocumentRequirement>(`/loans/document-requirements/${id}/`, data);
  },

  /**
   * @deprecated Eliminar un requisito
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/loans/document-requirements/${id}/`);
  },
};
