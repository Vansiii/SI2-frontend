/**
 * Filtros para Reporte de Sucursales
 * 
 * @module BranchFilters
 */

import type { BranchFilters as BranchFiltersType } from '../../../types/manualReports.types';

interface Props {
  filters: BranchFiltersType;
  onChange: (filters: BranchFiltersType) => void;
}

export function BranchFilters({ filters, onChange }: Props) {
  
  const handleChange = (field: keyof BranchFiltersType, value: any) => {
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
          placeholder="Nombre o código de sucursal..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Estado Activo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <select
          value={filters.is_active === undefined ? '' : filters.is_active.toString()}
          onChange={(e) => handleChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas</option>
          <option value="true">Activa</option>
          <option value="false">Inactiva</option>
        </select>
      </div>
      
      {/* Ciudad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ciudad
        </label>
        <input
          type="text"
          value={filters.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="Ej: Bogotá"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Departamento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Departamento
        </label>
        <input
          type="text"
          value={filters.department || ''}
          onChange={(e) => handleChange('department', e.target.value)}
          placeholder="Ej: Cundinamarca"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Fecha Desde */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha Creación Desde
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
          Fecha Creación Hasta
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

export default BranchFilters;
