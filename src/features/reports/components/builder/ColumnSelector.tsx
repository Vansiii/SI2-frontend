/**
 * Selector de columnas para el reporte
 */
import { Columns, Check } from 'lucide-react';

interface ColumnSelectorProps {
  availableColumns: string[];
  selectedColumns: string[];
  onChange: (columns: string[]) => void;
}

export function ColumnSelector({
  availableColumns,
  selectedColumns,
  onChange,
}: ColumnSelectorProps) {
  const toggleColumn = (column: string) => {
    if (selectedColumns.includes(column)) {
      onChange(selectedColumns.filter((c) => c !== column));
    } else {
      onChange([...selectedColumns, column]);
    }
  };

  const selectAll = () => {
    onChange(availableColumns);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          <Columns className="inline h-4 w-4 mr-1" />
          Columnas ({selectedColumns.length} seleccionadas)
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Seleccionar todas
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-gray-600 hover:text-gray-700"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
        {availableColumns.map((column) => (
          <label
            key={column}
            className="flex items-center gap-2 p-2 rounded hover:bg-white cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedColumns.includes(column)}
              onChange={() => toggleColumn(column)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 flex-1">
              {column.replace(/_/g, ' ')}
            </span>
            {selectedColumns.includes(column) && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </label>
        ))}
      </div>

      {selectedColumns.length === 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
          Debe seleccionar al menos una columna
        </p>
      )}
    </div>
  );
}
