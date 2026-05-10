/**
 * Lista de plantillas de reportes
 */
import { Search, Plus, FileText } from 'lucide-react';
import { useState } from 'react';
import type { ReportTemplate } from '../../types';
import { TemplateCard } from './TemplateCard';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface TemplateListProps {
  templates: ReportTemplate[];
  loading: boolean;
  onUse: (template: ReportTemplate) => void;
  onEdit: (template: ReportTemplate) => void;
  onDelete: (templateId: number) => void;
  onCreateNew: () => void;
}

export function TemplateList({
  templates,
  loading,
  onUse,
  onEdit,
  onDelete,
  onCreateNew,
}: TemplateListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'TENANT' | 'SAAS'>('ALL');

  // Filtrar plantillas - validar que templates sea un array
  const filteredTemplates = (templates || []).filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesScope = scopeFilter === 'ALL' || template.scope === scopeFilter;

    return matchesSearch && matchesScope;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y filtros */}
      <div className="flex items-center justify-between gap-4">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar plantillas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filtro de scope */}
        <select
          value={scopeFilter}
          onChange={(e) => setScopeFilter(e.target.value as 'ALL' | 'TENANT' | 'SAAS')}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ALL">Todos los Scopes</option>
          <option value="TENANT">TENANT</option>
          <option value="SAAS">SAAS</option>
        </select>

        {/* Botón crear */}
        <button
          onClick={onCreateNew}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="Ir al constructor de reportes para crear una plantilla"
        >
          <Plus className="h-5 w-5 mr-2" />
          Crear Plantilla
        </button>
      </div>

      {/* Lista de plantillas */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay plantillas</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || scopeFilter !== 'ALL'
              ? 'No se encontraron plantillas con los filtros aplicados.'
              : 'Las plantillas te permiten guardar configuraciones de reportes para reutilizarlas.'}
          </p>
          {!searchTerm && scopeFilter === 'ALL' && (
            <div className="mt-6 space-y-3">
              <button
                onClick={onCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear Plantilla
              </button>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Serás redirigido al constructor de reportes para configurar tu reporte antes de guardarlo como plantilla.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={onUse}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
