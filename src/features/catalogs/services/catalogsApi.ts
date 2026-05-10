/**
 * API service para catálogos centralizados
 */

import apiClient from '../../../utils/apiClient';
import type { DocumentType, DocumentTypeWrite, ProductType, PaymentFrequency, Currency, AmortizationSystem } from '../types';

// ==================== DOCUMENT TYPES ====================

export const documentTypeApi = {
  list: async (): Promise<DocumentType[]> => {
    return await apiClient.get<DocumentType[]>('/loans/catalogs/document-types/');
  },

  get: async (id: number): Promise<DocumentType> => {
    return await apiClient.get<DocumentType>(`/loans/catalogs/document-types/${id}/`);
  },

  create: async (data: DocumentTypeWrite): Promise<DocumentType> => {
    return await apiClient.post<DocumentType>('/loans/catalogs/document-types/', data);
  },

  update: async (id: number, data: Partial<DocumentTypeWrite>): Promise<DocumentType> => {
    return await apiClient.patch<DocumentType>(`/loans/catalogs/document-types/${id}/`, data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/loans/catalogs/document-types/${id}/`);
  },

  getActive: async (): Promise<DocumentType[]> => {
    return await apiClient.get<DocumentType[]>('/loans/catalogs/document-types/active/');
  },
};

// ==================== PRODUCT TYPES ====================

export const productTypeApi = {
  list: async (): Promise<ProductType[]> => {
    return await apiClient.get<ProductType[]>('/loans/catalogs/product-types/');
  },

  get: async (id: number): Promise<ProductType> => {
    return await apiClient.get<ProductType>(`/loans/catalogs/product-types/${id}/`);
  },

  create: async (data: Partial<ProductType>): Promise<ProductType> => {
    return await apiClient.post<ProductType>('/loans/catalogs/product-types/', data);
  },

  update: async (id: number, data: Partial<ProductType>): Promise<ProductType> => {
    return await apiClient.patch<ProductType>(`/loans/catalogs/product-types/${id}/`, data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/loans/catalogs/product-types/${id}/`);
  },

  getActive: async (): Promise<ProductType[]> => {
    return await apiClient.get<ProductType[]>('/loans/catalogs/product-types/active/');
  },
};

// ==================== PAYMENT FREQUENCIES ====================

export const paymentFrequencyApi = {
  list: async (): Promise<PaymentFrequency[]> => {
    return await apiClient.get<PaymentFrequency[]>('/loans/catalogs/payment-frequencies/');
  },

  getActive: async (): Promise<PaymentFrequency[]> => {
    return await apiClient.get<PaymentFrequency[]>('/loans/catalogs/payment-frequencies/active/');
  },
};

// ==================== CURRENCIES ====================

export const currencyApi = {
  list: async (): Promise<Currency[]> => {
    return await apiClient.get<Currency[]>('/loans/catalogs/currencies/');
  },

  getActive: async (): Promise<Currency[]> => {
    return await apiClient.get<Currency[]>('/loans/catalogs/currencies/active/');
  },
};

// ==================== AMORTIZATION SYSTEMS ====================

export const amortizationSystemApi = {
  list: async (): Promise<AmortizationSystem[]> => {
    return await apiClient.get<AmortizationSystem[]>('/loans/catalogs/amortization-systems/');
  },

  getActive: async (): Promise<AmortizationSystem[]> => {
    return await apiClient.get<AmortizationSystem[]>('/loans/catalogs/amortization-systems/active/');
  },
};
