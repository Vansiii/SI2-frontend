/**
 * Filtros para Reporte de Clientes
 * 
 * @module ClientFilters
 */

import React from 'react';
import type { ClientFilters as ClientFiltersType } from '../../../types/manualReports.types';

interface Props {
  filters: ClientFiltersType;
  onChange: (filters: ClientFiltersType) => void;
}

export function ClientFilters({ filters, onChange }: Props) {
  
  const handleChange = (field: keyof ClientFiltersType, value: any) => {
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
          placeholder="Nombre, documento o email..."
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
      
      {/* Estado KYC */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado KYC
        </label>
        <select
          value={filters.kyc_status || ''}
          onChange={(e) => handleChange('kyc_status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendiente</option>
          <option value="VERIFIED">Verificado</option>
          <option value="REJECTED">Rechazado</option>
          <option value="EXPIRED">Expirado</option>
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
      
      {/* Estado Laboral */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado Laboral
        </label>
        <select
          value={filters.employment_status || ''}
          onChange={(e) => handleChange('employment_status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos</option>
          <option value="EMPLOYED">Empleado</option>
          <option value="SELF_EMPLOYED">Independiente</option>
          <option value="BUSINESS_OWNER">Empresario</option>
          <option value="RETIRED">Pensionado</option>
          <option value="UNEMPLOYED">Desempleado</option>
          <option value="OTHER">Otro</option>
        </select>
      </div>
      
      {/* Ingreso Mínimo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ingreso Mínimo
        </label>
        <input
          type="number"
          value={filters.income_min || ''}
          onChange={(e) => handleChange('income_min', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Ingreso Máximo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ingreso Máximo
        </label>
        <input
          type="number"
          value={filters.income_max || ''}
          onChange={(e) => handleChange('income_max', e.target.value ? parseFloat(e.target.value) : undefined)}
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

export default ClientFilters;
