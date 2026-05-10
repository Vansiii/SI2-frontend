/**
 * Selector de formato de exportación
 */
import { FileSpreadsheet, FileText } from 'lucide-react';
import type { ReportFormat } from '../../types';

interface FormatSelectorProps {
  value: ReportFormat;
  onChange: (format: ReportFormat) => void;
}

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Formato de Exportación
      </label>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange('xlsx')}
          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
            value === 'xlsx'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          <FileSpreadsheet className="h-6 w-6" />
          <div className="text-left">
            <div className="font-semibold">Excel (XLSX)</div>
            <div className="text-xs opacity-75">
              Formato con estilos y colores
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange('csv')}
          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
            value === 'csv'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          <FileText className="h-6 w-6" />
          <div className="text-left">
            <div className="font-semibold">CSV</div>
            <div className="text-xs opacity-75">
              Texto plano separado por comas
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
