/**
 * Filtros para el historial de reportes
 */
import { Search, Filter } from 'lucide-react';
import type { ReportStatus, ReportScope } from '../../types';

interface ReportHistoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: ReportStatus | 'ALL';
  onStatusChange: (value: ReportStatus | 'ALL') => void;
  scopeFilter: ReportScope | 'ALL';
  onScopeChange: (value: ReportScope | 'ALL') => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
}

export function ReportHistoryFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  scopeFilter,
  onScopeChange,
  categoryFilter,
  onCategoryChange,
  categories,
}: ReportHistoryFiltersProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <Filter className="h-5 w-5 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Estado */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as ReportStatus | 'ALL')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ALL">Todos los Estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="PROCESSING">Procesando</option>
          <option value="COMPLETED">Completado</option>
          <option value="FAILED">Fallido</option>
        </select>

        {/* Scope */}
        <select
          value={scopeFilter}
          onChange={(e) => onScopeChange(e.target.value as ReportScope | 'ALL')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ALL">Todos los Scopes</option>
          <option value="TENANT">TENANT</option>
          <option value="SAAS">SAAS</option>
        </select>

        {/* Categoría */}
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todas las Categorías</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
