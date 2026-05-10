/**
 * Selector de rango de fechas con presets
 */
import { Calendar } from 'lucide-react';
import type { DateRange, DatePreset } from '../../types';
import { DATE_PRESET_LABELS, DATE_PRESETS, calculateDateRange } from '../../utils';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const handlePresetChange = (preset: DatePreset) => {
    if (preset === 'custom') {
      onChange({ preset, start_date: null, end_date: null });
    } else {
      const calculatedRange = calculateDateRange(preset);
      onChange(calculatedRange);
    }
  };

  const handleCustomDateChange = (field: 'start_date' | 'end_date', date: string) => {
    onChange({
      ...value,
      [field]: date,
    });
  };

  return (
    <div className="space-y-4">
      {/* Selector de preset */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="inline h-4 w-4 mr-1" />
          Rango de Fechas
        </label>
        <select
          value={value.preset || ''}
          onChange={(e) => handlePresetChange(e.target.value as DatePreset)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Seleccionar rango...</option>
          {DATE_PRESETS.map((preset) => (
            <option key={preset} value={preset}>
              {DATE_PRESET_LABELS[preset]}
            </option>
          ))}
        </select>
      </div>

      {/* Fechas personalizadas */}
      {value.preset === 'custom' && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={value.start_date || ''}
              onChange={(e) => handleCustomDateChange('start_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={value.end_date || ''}
              onChange={(e) => handleCustomDateChange('end_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Vista previa de fechas */}
      {value.start_date && value.end_date && (
        <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-md p-3">
          <span className="font-medium">Rango seleccionado:</span>{' '}
          {new Date(value.start_date).toLocaleDateString('es-ES')} -{' '}
          {new Date(value.end_date).toLocaleDateString('es-ES')}
        </div>
      )}
    </div>
  );
}
