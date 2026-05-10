/**
 * Componente de filtros para lista de productos crediticios
 */

import { useQuery } from '@tanstack/react-query';
import { Filter, X } from 'lucide-react';
import { apiClient } from '../../../utils/apiClient';
import type { ProductType, TenantRuleSet } from '../types';

interface CreditProductFiltersProps {
  filters: {
    is_active?: boolean;
    product_type_id?: number;
    rule_set_id?: number;
  };
  onFiltersChange: (filters: {
    is_active?: boolean;
    product_type_id?: number;
    rule_set_id?: number;
  }) => void;
}

export function CreditProductFilters({ filters, onFiltersChange }: CreditProductFiltersProps) {
  // Obtener tipos de producto
  const { data: productTypes } = useQuery<ProductType[]>({
    queryKey: ['product-types', 'active'],
    queryFn: async () => {
      const response = await apiClient.get<{ results: ProductType[] }>(
        '/loans/catalogs/product-types/?is_active=true'
      );
      return response.results;
    },
  });

  // Obtener conjuntos de reglas
  const { data: ruleSets } = useQuery<TenantRuleSet[]>({
    queryKey: ['rule-sets', 'active'],
    queryFn: async () => {
      const response = await apiClient.get<{ results: TenantRuleSet[] }>(
        '/loans/rule-sets/?status=ACTIVE'
      );
      return response.results;
    },
  });

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = 
    filters.is_active !== undefined || 
    filters.product_type_id !== undefined || 
    filters.rule_set_id !== undefined;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filters.is_active === undefined ? '' : filters.is_active ? 'true' : 'false'}
            onChange={(e) => handleFilterChange(
              'is_active', 
              e.target.value === '' ? undefined : e.target.value === 'true'
            )}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        {/* Tipo de Producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Producto
          </label>
          <select
            value={filters.product_type_id || ''}
            onChange={(e) => handleFilterChange(
              'product_type_id', 
              e.target.value ? Number(e.target.value) : undefined
            )}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {productTypes?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Conjunto de Reglas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conjunto de Reglas
          </label>
          <select
            value={filters.rule_set_id || ''}
            onChange={(e) => handleFilterChange(
              'rule_set_id', 
              e.target.value ? Number(e.target.value) : undefined
            )}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {ruleSets?.map((ruleSet) => (
              <option key={ruleSet.id} value={ruleSet.id}>
                {ruleSet.name} (v{ruleSet.version})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Indicadores de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.is_active !== undefined && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Estado: {filters.is_active ? 'Activos' : 'Inactivos'}
              <button
                onClick={() => handleFilterChange('is_active', undefined)}
                className="ml-1 inline-flex items-center"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.product_type_id && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Tipo: {productTypes?.find(t => t.id === filters.product_type_id)?.name}
              <button
                onClick={() => handleFilterChange('product_type_id', undefined)}
                className="ml-1 inline-flex items-center"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.rule_set_id && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              RuleSet: {ruleSets?.find(rs => rs.id === filters.rule_set_id)?.name}
              <button
                onClick={() => handleFilterChange('rule_set_id', undefined)}
                className="ml-1 inline-flex items-center"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
