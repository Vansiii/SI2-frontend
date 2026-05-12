/**
 * Filtros para Reporte de Solicitudes
 * 
 * @module ApplicationFilters
 */

import type { ApplicationFilters as ApplicationFiltersType } from '../../../types/manualReports.types';
import { FilterSelect } from './FilterSelect';
import { useFilterOptions } from '../../../hooks/useFilterOptions';

interface Props {
  filters: ApplicationFiltersType;
  onChange: (filters: ApplicationFiltersType) => void;
}

export function ApplicationFilters({ filters, onChange }: Props) {
  const { data: filterOptions, isLoading } = useFilterOptions();
  
  const handleChange = (field: keyof ApplicationFiltersType, value: any) => {
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
          placeholder="Número de solicitud, cliente..."
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
          <option value="DRAFT">Borrador</option>
          <option value="SUBMITTED">Enviada</option>
          <option value="IN_REVIEW">En Revisión</option>
          <option value="APPROVED">Aprobada</option>
          <option value="REJECTED">Rechazada</option>
          <option value="CANCELLED">Cancelada</option>
        </select>
      </div>
      
      {/* Producto */}
      <FilterSelect
        label="Producto"
        value={filters.product_id}
        onChange={(value) => handleChange('product_id', value)}
        options={filterOptions?.products || []}
        placeholder="Seleccionar producto"
        displayField="name"
        secondaryField="code"
        isLoading={isLoading}
      />
      
      {/* Cliente */}
      <FilterSelect
        label="Cliente"
        value={filters.client_id}
        onChange={(value) => handleChange('client_id', value)}
        options={filterOptions?.clients || []}
        placeholder="Seleccionar cliente"
        displayField="name"
        secondaryField="document"
        isLoading={isLoading}
      />
      
      {/* Sucursal */}
      <FilterSelect
        label="Sucursal"
        value={filters.branch_id}
        onChange={(value) => handleChange('branch_id', value)}
        options={filterOptions?.branches || []}
        placeholder="Seleccionar sucursal"
        displayField="name"
        secondaryField="city"
        isLoading={isLoading}
      />
      
      {/* Asignado a */}
      <FilterSelect
        label="Asignado a"
        value={filters.assigned_to_id}
        onChange={(value) => handleChange('assigned_to_id', value)}
        options={filterOptions?.users || []}
        placeholder="Seleccionar usuario"
        displayField="name"
        secondaryField="email"
        isLoading={isLoading}
      />
      
      {/* Estado Verificación Identidad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado Verificación Identidad
        </label>
        <select
          value={filters.identity_verification_status || ''}
          onChange={(e) => handleChange('identity_verification_status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendiente</option>
          <option value="VERIFIED">Verificado</option>
          <option value="FAILED">Fallido</option>
        </select>
      </div>
      
      {/* Estado Documentos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado Documentos
        </label>
        <select
          value={filters.documents_status || ''}
          onChange={(e) => handleChange('documents_status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendiente</option>
          <option value="COMPLETE">Completo</option>
          <option value="INCOMPLETE">Incompleto</option>
        </select>
      </div>
      
      {/* Nivel de Riesgo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nivel de Riesgo
        </label>
        <select
          value={filters.risk_level || ''}
          onChange={(e) => handleChange('risk_level', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos</option>
          <option value="LOW">Bajo</option>
          <option value="MEDIUM">Medio</option>
          <option value="HIGH">Alto</option>
        </select>
      </div>
      
      {/* Fecha Enviada Desde */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha Enviada Desde
        </label>
        <input
          type="date"
          value={filters.submitted_from || ''}
          onChange={(e) => handleChange('submitted_from', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Fecha Enviada Hasta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha Enviada Hasta
        </label>
        <input
          type="date"
          value={filters.submitted_to || ''}
          onChange={(e) => handleChange('submitted_to', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Monto Mínimo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monto Mínimo
        </label>
        <input
          type="number"
          value={filters.amount_min || ''}
          onChange={(e) => handleChange('amount_min', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Monto Máximo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monto Máximo
        </label>
        <input
          type="number"
          value={filters.amount_max || ''}
          onChange={(e) => handleChange('amount_max', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="999999999"
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

export default ApplicationFilters;
