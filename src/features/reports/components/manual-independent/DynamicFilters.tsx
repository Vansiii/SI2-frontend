/**
 * Filtros Dinámicos
 * 
 * Renderiza filtros específicos según el tipo de reporte seleccionado.
 */

import { Filter, X, Search } from 'lucide-react';
import type { 
  ReportType, 
  ReportFilters,
  ClientFilters as ClientFiltersType,
  ProductFilters as ProductFiltersType,
  ApplicationFilters as ApplicationFiltersType,
  AuditFilters as AuditFiltersType,
  UserFilters as UserFiltersType,
  BranchFilters as BranchFiltersType
} from '../../types/manualReports.types';
import { ClientFilters } from './filters/ClientFilters';
import { ProductFilters } from './filters/ProductFilters';
import { ApplicationFilters } from './filters/ApplicationFilters';
import { AuditFilters } from './filters/AuditFilters';
import { UserFilters } from './filters/UserFilters';
import { BranchFilters } from './filters/BranchFilters';

interface Props {
  reportType: ReportType;
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
  onApply: () => void;
  onClear: () => void;
}

export function DynamicFilters({ reportType, filters, onChange, onApply, onClear }: Props) {
  
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    // Excluir metadatos de paginación y scope del conteo de filtros "activos"
    if (['page', 'page_size', 'scope'].includes(key)) return false;
    return value !== undefined && value !== '' && value !== null;
  }).length;
  
  /**
   * Renderiza los filtros específicos según el tipo de reporte
   */
  const renderFilters = () => {
    switch (reportType) {
      case 'clients':
        return <ClientFilters filters={filters as ClientFiltersType} onChange={onChange as any} />;
      case 'products':
        return <ProductFilters filters={filters as ProductFiltersType} onChange={onChange as any} />;
      case 'applications':
        return <ApplicationFilters filters={filters as ApplicationFiltersType} onChange={onChange as any} />;
      case 'audit':
        return <AuditFilters filters={filters as AuditFiltersType} onChange={onChange as any} />;
      case 'users':
        return <UserFilters filters={filters as UserFiltersType} onChange={onChange as any} />;
      case 'branches':
        return <BranchFilters filters={filters as BranchFiltersType} onChange={onChange as any} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      
      {/* Filtros específicos */}
      <div className="mb-6">
        {renderFilters()}
      </div>
      
      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onApply}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Search className="h-4 w-4" />
          Aplicar Filtros
        </button>
        
        <button
          onClick={onClear}
          disabled={activeFiltersCount === 0}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <X className="h-4 w-4" />
          Limpiar
        </button>
      </div>
    </div>
  );
}

export default DynamicFilters;
