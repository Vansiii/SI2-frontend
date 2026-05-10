/**
 * Selector de agrupación
 */
import { Group } from 'lucide-react';

interface GroupBySelectorProps {
  availableFields: string[];
  selectedFields: string[];
  onChange: (fields: string[]) => void;
}

export function GroupBySelector({
  availableFields,
  selectedFields,
  onChange,
}: GroupBySelectorProps) {
  const toggleField = (field: string) => {
    if (selectedFields.includes(field)) {
      onChange(selectedFields.filter((f) => f !== field));
    } else {
      onChange([...selectedFields, field]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        <Group className="inline h-4 w-4 mr-1" />
        Agrupar Por (Opcional)
      </label>

      {availableFields.length === 0 ? (
        <p className="text-sm text-gray-500 bg-gray-50 rounded-md p-3">
          Este reporte no soporta agrupación
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {availableFields.map((field) => (
            <label
              key={field}
              className="flex items-center gap-2 p-2 rounded hover:bg-white cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedFields.includes(field)}
                onChange={() => toggleField(field)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                {field.replace(/_/g, ' ')}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
