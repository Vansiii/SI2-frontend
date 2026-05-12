/**
 * Filtros para Reporte de Auditoría
 * 
 * @module AuditFilters
 */

import type { AuditFilters as AuditFiltersType } from '../../../types/manualReports.types';
import { FilterSelect } from './FilterSelect';
import { useFilterOptions } from '../../../hooks/useFilterOptions';

interface Props {
  filters: AuditFiltersType;
  onChange: (filters: AuditFiltersType) => void;
}

export function AuditFilters({ filters, onChange }: Props) {
  const { data: filterOptions, isLoading } = useFilterOptions();
  
  const handleChange = (field: keyof AuditFiltersType, value: any) => {
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
          placeholder="Descripción del evento..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Usuario */}
      <FilterSelect
        label="Usuario"
        value={filters.user_id}
        onChange={(value) => handleChange('user_id', value)}
        options={filterOptions?.users || []}
        placeholder="Seleccionar usuario"
        displayField="name"
        secondaryField="email"
        isLoading={isLoading}
      />
      
      {/* Acción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Acción
        </label>
        <select
          value={filters.action || ''}
          onChange={(e) => handleChange('action', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas</option>
          <option value="CREATE">Crear</option>
          <option value="UPDATE">Actualizar</option>
          <option value="DELETE">Eliminar</option>
          <option value="VIEW">Ver</option>
          <option value="LOGIN">Iniciar Sesión</option>
          <option value="LOGOUT">Cerrar Sesión</option>
          <option value="EXPORT">Exportar</option>
        </select>
      </div>
      
      {/* Tipo de Recurso */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Recurso
        </label>
        <input
          type="text"
          value={filters.resource_type || ''}
          onChange={(e) => handleChange('resource_type', e.target.value)}
          placeholder="Ej: Client, Application"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* ID Recurso */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID Recurso
        </label>
        <input
          type="number"
          value={filters.resource_id || ''}
          onChange={(e) => handleChange('resource_id', e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="ID del recurso"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Severidad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Severidad
        </label>
        <select
          value={filters.severity || ''}
          onChange={(e) => handleChange('severity', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas</option>
          <option value="INFO">Información</option>
          <option value="WARNING">Advertencia</option>
          <option value="ERROR">Error</option>
          <option value="CRITICAL">Crítico</option>
        </select>
      </div>
      
      {/* Dirección IP */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección IP
        </label>
        <input
          type="text"
          value={filters.ip_address || ''}
          onChange={(e) => handleChange('ip_address', e.target.value)}
          placeholder="Ej: 192.168.1.1"
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

export default AuditFilters;
