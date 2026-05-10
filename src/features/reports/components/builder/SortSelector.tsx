/**
 * Selector de ordenamiento
 */
import { ArrowUpDown, Plus, Trash2 } from 'lucide-react';
import type { SortConfig } from '../../types';

interface SortSelectorProps {
  availableFields: string[];
  sortConfig: SortConfig[];
  onChange: (config: SortConfig[]) => void;
}

export function SortSelector({
  availableFields,
  sortConfig,
  onChange,
}: SortSelectorProps) {
  const addSort = () => {
    onChange([...sortConfig, { field: '', direction: 'asc' }]);
  };

  const removeSort = (index: number) => {
    onChange(sortConfig.filter((_, i) => i !== index));
  };

  const updateSort = (index: number, field: keyof SortConfig, value: any) => {
    const newConfig = [...sortConfig];
    newConfig[index] = { ...newConfig[index], [field]: value };
    onChange(newConfig);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          <ArrowUpDown className="inline h-4 w-4 mr-1" />
          Ordenamiento
        </label>
        <button
          type="button"
          onClick={addSort}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar
        </button>
      </div>

      {sortConfig.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <ArrowUpDown className="h-6 w-6 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Sin ordenamiento específico</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortConfig.map((sort, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <select
                value={sort.field}
                onChange={(e) => updateSort(index, 'field', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Seleccionar campo...</option>
                {availableFields.map((field) => (
                  <option key={field} value={field}>
                    {field.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              <select
                value={sort.direction}
                onChange={(e) => updateSort(index, 'direction', e.target.value)}
                className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>

              <button
                type="button"
                onClick={() => removeSort(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
