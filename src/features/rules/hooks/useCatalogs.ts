/**
 * Hooks para cargar catálogos centralizados desde la API
 * 
 * Estos hooks utilizan React Query para cachear los datos
 * y evitar llamadas innecesarias a la API.
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import type { 
  Currency, 
  PaymentFrequency, 
  AmortizationSystem,
  DocumentType,
  ProductType 
} from '../types/catalog.types';

/**
 * Hook para cargar monedas activas
 */
export function useCurrencies() {
  return useQuery({
    queryKey: ['catalogs', 'currencies'],
    queryFn: async () => {
      return await apiClient.get<Currency[]>('/loans/catalogs/currencies/active/');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para cargar frecuencias de pago activas
 */
export function usePaymentFrequencies() {
  return useQuery({
    queryKey: ['catalogs', 'payment-frequencies'],
    queryFn: async () => {
      return await apiClient.get<PaymentFrequency[]>('/loans/catalogs/payment-frequencies/active/');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para cargar sistemas de amortización activos
 */
export function useAmortizationSystems() {
  return useQuery({
    queryKey: ['catalogs', 'amortization-systems'],
    queryFn: async () => {
      return await apiClient.get<AmortizationSystem[]>('/loans/catalogs/amortization-systems/active/');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para cargar tipos de documento activos
 */
export function useDocumentTypes() {
  return useQuery({
    queryKey: ['catalogs', 'document-types'],
    queryFn: async () => {
      return await apiClient.get<DocumentType[]>('/loans/catalogs/document-types/active/');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para cargar tipos de producto activos
 */
export function useProductTypes() {
  return useQuery({
    queryKey: ['catalogs', 'product-types'],
    queryFn: async () => {
      return await apiClient.get<ProductType[]>('/loans/catalogs/product-types/active/');
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para cargar todos los catálogos a la vez
 * Útil cuando se necesitan múltiples catálogos en un mismo componente
 */
export function useAllCatalogs() {
  const currencies = useCurrencies();
  const paymentFrequencies = usePaymentFrequencies();
  const amortizationSystems = useAmortizationSystems();
  const documentTypes = useDocumentTypes();
  const productTypes = useProductTypes();

  return {
    currencies,
    paymentFrequencies,
    amortizationSystems,
    documentTypes,
    productTypes,
    isLoading: 
      currencies.isLoading || 
      paymentFrequencies.isLoading || 
      amortizationSystems.isLoading ||
      documentTypes.isLoading ||
      productTypes.isLoading,
    isError: 
      currencies.isError || 
      paymentFrequencies.isError || 
      amortizationSystems.isError ||
      documentTypes.isError ||
      productTypes.isError,
  };
}
