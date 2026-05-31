/**
 * API Service para contratos
 */

import { apiClient } from '../../../utils/apiClient';
import type {
  Contract,
  ContractTemplate,
  ContractCreateRequest,
  ContractSignRequest,
  SignatureStatus,
  PaymentSummary,
  AmortizationScheduleItem,
} from '../types';

export const contractsApi = {
  // ==================== CONTRATOS ====================

  /**
   * Listar contratos
   */
  list: async (params?: {
    status?: string;
    search?: string;
    page?: number;
  }): Promise<{ results: Contract[]; count: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const url = `/contracts/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiClient.get<{ results: Contract[]; count: number }>(url);
  },

  /**
   * Obtener detalle de un contrato
   */
  get: async (id: number): Promise<Contract> => {
    return apiClient.get<Contract>(`/contracts/${id}/`);
  },

  /**
   * Generar contrato desde solicitud aprobada
   */
  generateFromApplication: async (
    data: ContractCreateRequest
  ): Promise<Contract> => {
    return apiClient.post<Contract>('/contracts/generate-from-application/', data);
  },

  /**
   * Publicar contrato (DRAFT -> PENDING_SIGNATURE)
   */
  publish: async (id: number): Promise<Contract> => {
    return apiClient.post<Contract>(`/contracts/${id}/publish/`, {});
  },

  /**
   * Firmar contrato
   */
  sign: async (id: number, data: ContractSignRequest): Promise<{
    message: string;
    signature: any;
    contract_status: string;
  }> => {
    return apiClient.post<{
      message: string;
      signature: any;
      contract_status: string;
    }>(`/contracts/${id}/sign/`, data);
  },

  /**
   * Descargar PDF del contrato
   */
  downloadPDF: async (id: number): Promise<Blob> => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/contracts/${id}/pdf/`, {
      headers,
    });
    if (!response.ok) throw new Error('Error al descargar el PDF');
    return response.blob();
  },

  /**
   * Vista previa HTML del contrato
   */
  preview: async (id: number): Promise<string> => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/contracts/${id}/preview/`, {
      headers,
    });
    if (!response.ok) throw new Error('Error al obtener la vista previa');
    return response.text();
  },

  /**
   * Cancelar contrato
   */
  cancel: async (id: number, reason: string): Promise<Contract> => {
    return apiClient.post<Contract>(`/contracts/${id}/cancel/`, {
      cancellation_reason: reason,
    });
  },

  /**
   * Obtener estado de firmas
   */
  getSignatureStatus: async (id: number): Promise<SignatureStatus> => {
    return apiClient.get<SignatureStatus>(`/contracts/${id}/signature-status/`);
  },

  /**
   * Obtener resumen de pagos
   */
  getPaymentSummary: async (id: number): Promise<PaymentSummary> => {
    return apiClient.get<PaymentSummary>(`/contracts/${id}/payment-summary/`);
  },

  // ==================== PLANTILLAS ====================

  /**
   * Listar plantillas de contratos
   */
  listTemplates: async (): Promise<ContractTemplate[]> => {
    return apiClient.get<ContractTemplate[]>('/contract-templates/');
  },

  /**
   * Obtener detalle de una plantilla
   */
  getTemplate: async (id: number): Promise<ContractTemplate> => {
    return apiClient.get<ContractTemplate>(`/contract-templates/${id}/`);
  },

  /**
   * Crear plantilla
   */
  createTemplate: async (
    data: Partial<ContractTemplate>
  ): Promise<ContractTemplate> => {
    return apiClient.post<ContractTemplate>('/contract-templates/', data);
  },

  /**
   * Actualizar plantilla
   */
  updateTemplate: async (
    id: number,
    data: Partial<ContractTemplate>
  ): Promise<ContractTemplate> => {
    return apiClient.patch<ContractTemplate>(`/contract-templates/${id}/`, data);
  },

  /**
   * Eliminar plantilla
   */
  deleteTemplate: async (id: number): Promise<void> => {
    await apiClient.delete(`/contract-templates/${id}/`);
  },

  /**
   * Vista previa de plantilla
   */
  previewTemplate: async (id: number): Promise<string> => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/contract-templates/${id}/preview/`, {
      headers,
    });
    if (!response.ok) throw new Error('Error al obtener la vista previa');
    return response.text();
  },

  // ==================== TABLA DE AMORTIZACIÓN ====================

  /**
   * Obtener tabla de amortización de un contrato
   */
  getAmortizationSchedule: async (
    contractId: number
  ): Promise<AmortizationScheduleItem[]> => {
    return apiClient.get<AmortizationScheduleItem[]>(
      `/contract-amortization/?contract_id=${contractId}`
    );
  },
};

export default contractsApi;

// ==================== FUNCIONES WRAPPER PARA COMPATIBILIDAD ====================

export const fetchContracts = async (params?: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<Contract[]> => {
  const response = await contractsApi.list(params);
  return response.results;
};

export const fetchContract = async (id: number): Promise<Contract> => {
  return contractsApi.get(id);
};

export const downloadContractPDF = async (id: number): Promise<void> => {
  const blob = await contractsApi.downloadPDF(id);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `contrato-${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const fetchSignatureStatus = async (id: number): Promise<SignatureStatus> => {
  return contractsApi.getSignatureStatus(id);
};

export const fetchPaymentSummary = async (id: number): Promise<PaymentSummary> => {
  return contractsApi.getPaymentSummary(id);
};

export const fetchTemplates = async (): Promise<ContractTemplate[]> => {
  return contractsApi.listTemplates();
};

export const fetchTemplate = async (id: number): Promise<ContractTemplate> => {
  return contractsApi.getTemplate(id);
};

export const createTemplate = async (data: Partial<ContractTemplate>): Promise<ContractTemplate> => {
  return contractsApi.createTemplate(data);
};

export const updateTemplate = async (id: number, data: Partial<ContractTemplate>): Promise<ContractTemplate> => {
  return contractsApi.updateTemplate(id, data);
};

export const deleteTemplate = async (id: number): Promise<void> => {
  return contractsApi.deleteTemplate(id);
};

export const setDefaultTemplate = async (id: number): Promise<ContractTemplate> => {
  return apiClient.post<ContractTemplate>(`/contract-templates/${id}/set-default/`, {});
};

