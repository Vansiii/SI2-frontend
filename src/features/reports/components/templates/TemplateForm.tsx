/**
 * Formulario de creación/edición de plantilla
 */
import { useState } from 'react';
import type { ReportTemplate, ReportConfig } from '../../types';

interface TemplateFormProps {
  template?: ReportTemplate;
  config: ReportConfig;
  onSave: (template: Partial<ReportTemplate>) => void;
  onCancel: () => void;
}

export function TemplateForm({ template, config, onSave, onCancel }: TemplateFormProps) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [errors, setErrors] = useState<{ name?: string }>({});

  const validate = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    } else if (name.length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      scope: config.scope,
      category: config.category,
      report_type: config.report_type,
      config_json: config,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre de la Plantilla *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Ej: Reporte Mensual de Créditos"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descripción (Opcional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Describe el propósito de esta plantilla..."
        />
        <p className="mt-1 text-sm text-gray-500">
          {description.length}/500 caracteres
        </p>
      </div>

      {/* Información de configuración */}
      <div className="bg-gray-50 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Configuración del Reporte</h4>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Scope:</dt>
            <dd className="text-gray-900">{config.scope}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Categoría:</dt>
            <dd className="text-gray-900">{config.category}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Tipo:</dt>
            <dd className="text-gray-900">{config.report_type}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Formato:</dt>
            <dd className="text-gray-900">{config.format?.toUpperCase() || 'N/A'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Columnas:</dt>
            <dd className="text-gray-900">{config.columns?.length || 0} seleccionadas</dd>
          </div>
          {config.filters && config.filters.length > 0 && (
            <div>
              <dt className="font-medium text-gray-500">Filtros:</dt>
              <dd className="text-gray-900">{config.filters.length} aplicados</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Acciones */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {template ? 'Actualizar Plantilla' : 'Guardar Plantilla'}
        </button>
      </div>
    </form>
  );
}
