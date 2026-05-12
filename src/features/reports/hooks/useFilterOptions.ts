/**
 * Hook para cargar opciones de filtros dinámicos
 * 
 * @module useFilterOptions
 */

import { useQuery } from '@tanstack/react-query';
import { manualReportsApi } from '../services/manualReportsApi';

export interface FilterOption {
  id: number;
  name: string;
  code?: string;
  email?: string;
  document?: string;
  city?: string;
}

export interface FilterOptions {
  users: FilterOption[];
  products: FilterOption[];
  clients: FilterOption[];
  branches: FilterOption[];
  product_types: FilterOption[];
}

/**
 * Hook para obtener opciones de filtros
 */
export function useFilterOptions() {
  return useQuery<FilterOptions>({
    queryKey: ['filter-options'],
    queryFn: () => manualReportsApi.getFilterOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
}

export default useFilterOptions;
