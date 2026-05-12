/**
 * Filtros para Reporte de Productos
 * 
 * @module ProductFilters
 */

import React from 'react';
import type { ProductFilters as ProductFiltersType } from '../../../types/manualReports.types';
import { FilterSelect } from './FilterSelect';
import { useFilterOptions } from '../../../hooks/useFilterOptions';

interface Props {
  filters: ProductFiltersType;
  onChange: (filters: ProductFiltersType) => void;
}

export function ProductFilters({ filters, onChange }: Props) {
  const { data: filterOptions, isLoading } = useFilterOptions();
  
  const handleChange = (field: keyof ProductFiltersType, value: any) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Búsqueda */}
      <div className="lg:col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Buscar
        </label>
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Nombre o código del producto..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Estado */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <select
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>
      
      {/* Tipo de Producto */}
      <FilterSelect
        label="Tipo de Producto"
        value={filters.product_type_id}
        onChange={(value) => handleChange('product_type_id', value)}
        options={filterOptions?.product_types || []}
        placeholder="Seleccionar tipo"
        displayField="name"
        secondaryField="code"
        isLoading={isLoading}
      />
      
      {/* Monto Mínimo Desde */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monto Mínimo Desde
        </label>
        <input
          type="number"
          value={filters.min_amount_from || ''}
          onChange={(e) => handleChange('min_amount_from', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Monto Mínimo Hasta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monto Mínimo Hasta
        </label>
        <input
          type="number"
          value={filters.min_amount_to || ''}
          onChange={(e) => handleChange('min_amount_to', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="999999999"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Monto Máximo Desde */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monto Máximo Desde
        </label>
        <input
          type="number"
          value={filters.max_amount_from || ''}
          onChange={(e) => handleChange('max_amount_from', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Monto Máximo Hasta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monto Máximo Hasta
        </label>
        <input
          type="number"
          value={filters.max_amount_to || ''}
          onChange={(e) => handleChange('max_amount_to', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="999999999"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Fecha Desde */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha Desde
        </label>
        <input
          type="date"
          value={filters.date_from || ''}
          onChange={(e) => handleChange('date_from', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Fecha Hasta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha Hasta
        </label>
        <input
          type="date"
          value={filters.date_to || ''}
          onChange={(e) => handleChange('date_to', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

export default ProductFilters;
