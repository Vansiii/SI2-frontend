/**
 * Tarjeta de tipo de reporte específico
 */
import { FileText, ChevronRight } from 'lucide-react';
import type { ReportDefinition } from '../../types';

interface ReportTypeCardProps {
  report: ReportDefinition;
  onClick: () => void;
}

export function ReportTypeCard({ report, onClick }: ReportTypeCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 text-left group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {report.name}
            </h4>
          </div>

          {/* Descripción */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {report.description}
          </p>

          {/* Información adicional */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {report.available_columns.length} columnas
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {report.available_filters.length} filtros
            </span>
            {report.available_group_by.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                Agrupable
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2" />
      </div>
    </button>
  );
}
