/**
 * Tarjeta de categoría de reportes
 */
import { ChevronRight } from 'lucide-react';
import type { ReportCategory } from '../../types';
import { getCategoryLabel } from '../../utils';

interface ReportCategoryCardProps {
  category: ReportCategory;
  reportCount: number;
  icon: React.ReactNode;
  description: string;
  onClick: () => void;
}

export function ReportCategoryCard({
  category,
  reportCount,
  icon,
  description,
  onClick,
}: ReportCategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-6 text-left group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-2xl group-hover:bg-blue-200 transition-colors">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {getCategoryLabel(category)}
            </h3>
            <p className="text-sm text-gray-500">
              {reportCount} {reportCount === 1 ? 'reporte' : 'reportes'}
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>

      {/* Descripción */}
      <p className="text-sm text-gray-600 line-clamp-2">
        {description}
      </p>
    </button>
  );
}
