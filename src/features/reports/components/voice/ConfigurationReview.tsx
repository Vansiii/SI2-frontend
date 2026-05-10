/**
 * Revisión final antes de generar
 */
import { CheckCircle } from 'lucide-react';
import type { ReportConfig } from '../../types';

interface ConfigurationReviewProps {
  config: ReportConfig;
  transcription: string;
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
}

export function ConfigurationReview({
  config,
  transcription,
  onConfirm,
  onEdit,
  onCancel,
}: ConfigurationReviewProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-50 px-6 py-4 border-b border-green-100">
        <div className="flex items-center">
          <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
          <h2 className="text-lg font-medium text-gray-900">Configuración Lista</h2>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-6 py-4 space-y-6">
        {/* Transcripción original */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tu Orden de Voz:</h3>
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-sm text-gray-900 italic">"{transcription}"</p>
          </div>
        </div>

        {/* Resumen de configuración */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Configuración del Reporte:</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs font-medium text-gray-500">Scope</dt>
              <dd className="mt-1 text-sm text-gray-900">{config.scope}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Categoría</dt>
              <dd className="mt-1 text-sm text-gray-900">{config.category}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Tipo de Reporte</dt>
              <dd className="mt-1 text-sm text-gray-900">{config.report_type}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Formato</dt>
              <dd className="mt-1 text-sm text-gray-900">{config.format?.toUpperCase() || 'XLSX'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Rango de Fechas</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {config.date_range?.preset || 'No especificado'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Columnas</dt>
              <dd className="mt-1 text-sm text-gray-900">{config.columns?.length || 0} seleccionadas</dd>
            </div>
            {config.filters && config.filters.length > 0 && (
              <div>
                <dt className="text-xs font-medium text-gray-500">Filtros</dt>
                <dd className="mt-1 text-sm text-gray-900">{config.filters.length} aplicados</dd>
              </div>
            )}
            {config.group_by && config.group_by.length > 0 && (
              <div>
                <dt className="text-xs font-medium text-gray-500">Agrupación</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {config.group_by.join(', ')}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Editar Configuración
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Confirmar y Generar
        </button>
      </div>
    </div>
  );
}
