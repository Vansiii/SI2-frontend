/**
 * Constructor de filtros dinámicos
 */
import { Plus, Trash2, Filter } from 'lucide-react';
import type { ReportFilter, FilterOperator, FilterDefinition } from '../../types';

interface FilterBuilderProps {
  filters: ReportFilter[];
  availableFilters: FilterDefinition[];
  onChange: (filters: ReportFilter[]) => void;
}

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'Igual a',
  not_equals: 'Diferente de',
  in: 'Está en',
  not_in: 'No está en',
  gte: 'Mayor o igual que',
  lte: 'Menor o igual que',
  gt: 'Mayor que',
  lt: 'Menor que',
  between: 'Entre',
  contains: 'Contiene',
  icontains: 'Contiene (sin mayúsculas)',
  startswith: 'Empieza con',
  endswith: 'Termina con',
  is_null: 'Es nulo',
  is_not_null: 'No es nulo',
};

export function FilterBuilder({
  filters,
  availableFilters,
  onChange,
}: FilterBuilderProps) {
  const addFilter = () => {
    onChange([
      ...filters,
      { field: '', operator: 'equals', value: '' },
    ]);
  };

  const removeFilter = (index: number) => {
    onChange(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (
    index: number,
    field: keyof ReportFilter,
    value: any
  ) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    onChange(newFilters);
  };

  const getOperatorsForField = (field: string): FilterOperator[] => {
    const filterDef = availableFilters.find((f) => f.field === field);
    if (!filterDef) return ['equals'];

    switch (filterDef.type) {
      case 'text':
        return ['equals', 'not_equals', 'contains', 'icontains', 'startswith', 'endswith', 'is_null', 'is_not_null'];
      case 'number':
        return ['equals', 'not_equals', 'gte', 'lte', 'gt', 'lt', 'between', 'is_null', 'is_not_null'];
      case 'date':
        return ['equals', 'gte', 'lte', 'between', 'is_null', 'is_not_null'];
      case 'choice':
        return ['equals', 'not_equals', 'in', 'not_in', 'is_null', 'is_not_null'];
      case 'boolean':
        return ['equals', 'is_null', 'is_not_null'];
      case 'foreign_key':
        return ['equals', 'not_equals', 'in', 'not_in', 'is_null', 'is_not_null'];
      default:
        return ['equals'];
    }
  };

  const renderValueInput = (filter: ReportFilter, index: number) => {
    const filterDef = availableFilters.find((f) => f.field === filter.field);
    
    // Operadores que no requieren valor
    if (filter.operator === 'is_null' || filter.operator === 'is_not_null') {
      return null;
    }

    // Campo de tipo choice
    if (filterDef?.type === 'choice' && filterDef.choices) {
      if (filter.operator === 'in' || filter.operator === 'not_in') {
        return (
          <select
            multiple
            value={Array.isArray(filter.value) ? filter.value : []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              updateFilter(index, 'value', selected);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            size={Math.min(filterDef.choices.length, 5)}
          >
            {filterDef.choices.map((choice) => (
              <option key={choice} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        );
      }

      return (
        <select
          value={filter.value || ''}
          onChange={(e) => updateFilter(index, 'value', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Seleccionar...</option>
          {filterDef.choices.map((choice) => (
            <option key={choice} value={choice}>
              {choice}
            </option>
          ))}
        </select>
      );
    }

    // Campo de tipo boolean
    if (filterDef?.type === 'boolean') {
      return (
        <select
          value={filter.value?.toString() || ''}
          onChange={(e) => updateFilter(index, 'value', e.target.value === 'true')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Seleccionar...</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      );
    }

    // Campo de tipo date
    if (filterDef?.type === 'date') {
      if (filter.operator === 'between') {
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={Array.isArray(filter.value) ? filter.value[0] || '' : ''}
              onChange={(e) => {
                const current = Array.isArray(filter.value) ? filter.value : ['', ''];
                updateFilter(index, 'value', [e.target.value, current[1]]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={Array.isArray(filter.value) ? filter.value[1] || '' : ''}
              onChange={(e) => {
                const current = Array.isArray(filter.value) ? filter.value : ['', ''];
                updateFilter(index, 'value', [current[0], e.target.value]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      }

      return (
        <input
          type="date"
          value={filter.value || ''}
          onChange={(e) => updateFilter(index, 'value', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      );
    }

    // Campo de tipo number
    if (filterDef?.type === 'number') {
      if (filter.operator === 'between') {
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={Array.isArray(filter.value) ? filter.value[0] || '' : ''}
              onChange={(e) => {
                const current = Array.isArray(filter.value) ? filter.value : ['', ''];
                updateFilter(index, 'value', [e.target.value, current[1]]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Desde"
            />
            <input
              type="number"
              value={Array.isArray(filter.value) ? filter.value[1] || '' : ''}
              onChange={(e) => {
                const current = Array.isArray(filter.value) ? filter.value : ['', ''];
                updateFilter(index, 'value', [current[0], e.target.value]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Hasta"
            />
          </div>
        );
      }

      return (
        <input
          type="number"
          value={filter.value || ''}
          onChange={(e) => updateFilter(index, 'value', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Valor"
        />
      );
    }

    // Campo de texto por defecto
    if (filter.operator === 'in' || filter.operator === 'not_in') {
      return (
        <input
          type="text"
          value={Array.isArray(filter.value) ? filter.value.join(', ') : filter.value || ''}
          onChange={(e) => {
            const values = e.target.value.split(',').map((v) => v.trim());
            updateFilter(index, 'value', values);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Valores separados por coma"
        />
      );
    }

    return (
      <input
        type="text"
        value={filter.value || ''}
        onChange={(e) => updateFilter(index, 'value', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Valor"
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          <Filter className="inline h-4 w-4 mr-1" />
          Filtros
        </label>
        <button
          type="button"
          onClick={addFilter}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar Filtro
        </button>
      </div>

      {filters.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Filter className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            No hay filtros configurados
          </p>
          <button
            type="button"
            onClick={addFilter}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Agregar primer filtro
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filters.map((filter, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Campo */}
              <div className="col-span-4">
                <select
                  value={filter.field}
                  onChange={(e) => {
                    updateFilter(index, 'field', e.target.value);
                    updateFilter(index, 'operator', 'equals');
                    updateFilter(index, 'value', '');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Seleccionar campo...</option>
                  {availableFilters.map((f) => (
                    <option key={f.field} value={f.field}>
                      {f.label || f.field}
                    </option>
                  ))}
                </select>
              </div>

              {/* Operador */}
              <div className="col-span-3">
                <select
                  value={filter.operator}
                  onChange={(e) => {
                    updateFilter(index, 'operator', e.target.value as FilterOperator);
                    updateFilter(index, 'value', '');
                  }}
                  disabled={!filter.field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
                >
                  {getOperatorsForField(filter.field).map((op) => (
                    <option key={op} value={op}>
                      {OPERATOR_LABELS[op]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Valor */}
              <div className="col-span-4">
                {renderValueInput(filter, index)}
              </div>

              {/* Eliminar */}
              <div className="col-span-1 flex items-center">
                <button
                  type="button"
                  onClick={() => removeFilter(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Eliminar filtro"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
