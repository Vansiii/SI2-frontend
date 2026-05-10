/**
 * Tarjeta de plantilla de reporte
 */
import { FileText, Play, Edit, Trash2, Calendar } from 'lucide-react';
import type { ReportTemplate } from '../../types';

interface TemplateCardProps {
  template: ReportTemplate;
  onUse: (template: ReportTemplate) => void;
  onEdit: (template: ReportTemplate) => void;
  onDelete: (templateId: number) => void;
}

export function TemplateCard({ template, onUse, onEdit, onDelete }: TemplateCardProps) {
  const scopeColors = {
    TENANT: 'bg-blue-100 text-blue-800',
    SAAS: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-400" />
          <h3 className="text-base font-medium text-gray-900">{template.name}</h3>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            scopeColors[template.scope]
          }`}
        >
          {template.scope}
        </span>
      </div>

      {/* Descripción */}
      {template.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
      )}

      {/* Metadata */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-xs text-gray-500">
          <span className="font-medium mr-1">Categoría:</span>
          <span>{template.category}</span>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <span className="font-medium mr-1">Tipo:</span>
          <span>{template.report_type}</span>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Creado: {new Date(template.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
        <button
          onClick={() => onUse(template)}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Play className="h-4 w-4 mr-1" />
          Usar
        </button>
        <button
          onClick={() => onEdit(template)}
          className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            if (confirm('¿Estás seguro de eliminar esta plantilla?')) {
              onDelete(template.id);
            }
          }}
          className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
