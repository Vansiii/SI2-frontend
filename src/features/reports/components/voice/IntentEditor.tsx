/**
 * Editor de intención inferida por IA
 */
import { AlertCircle, XCircle } from 'lucide-react';
import type { VoiceIntent, UnsupportedTerm } from '../../types';
import { DateRangeSelector } from '../builder/DateRangeSelector';
import { FormatSelector } from '../builder/FormatSelector';

interface IntentEditorProps {
  intent: VoiceIntent;
  onChange: (intent: VoiceIntent) => void;
  missingFields: string[];
  unsupportedTerms: UnsupportedTerm[];

}

export function IntentEditor({
  intent,
  onChange,
  missingFields,
  unsupportedTerms,

}: IntentEditorProps) {
  const hasIssues = missingFields.length > 0 || unsupportedTerms.length > 0;

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {hasIssues && (
        <div className="space-y-3">
          {/* Campos faltantes */}
          {missingFields.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Información Faltante</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Los siguientes campos necesitan ser completados:</p>
                    <ul className="list-disc list-inside mt-1">
                      {missingFields.map((field) => (
                        <li key={field}>{field}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Términos no soportados */}
          {unsupportedTerms.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Términos No Soportados</h3>
                  <div className="mt-2 text-sm text-red-700 space-y-2">
                    {unsupportedTerms.map((term, index) => (
                      <div key={index}>
                        <strong>"{term.term}":</strong> {term.reason}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notas de interpretación */}
      {intent.interpretation_notes && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Notas de Interpretación</h4>
          <p className="text-sm text-blue-700">{intent.interpretation_notes}</p>
        </div>
      )}

      {/* Editor de configuración */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración del Reporte</h3>
        <p className="text-sm text-gray-600 mb-4">
          Revisa y ajusta la configuración inferida antes de generar el reporte.
        </p>

        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
              <input
                type="text"
                value={intent.scope}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <input
                type="text"
                value={intent.category || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Reporte
              </label>
              <input
                type="text"
                value={intent.report_type || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          {/* Rango de fechas */}
          {intent.date_range && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rango de Fechas
              </label>
              <DateRangeSelector
                value={intent.date_range}
                onChange={(dateRange) =>
                  onChange({
                    ...intent,
                    date_range: dateRange,
                  })
                }
              />
            </div>
          )}

          {/* Columnas - Vista simplificada */}
          {intent.columns && intent.columns.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Columnas Seleccionadas</label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {intent.columns.map((col, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Formato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
            <FormatSelector
              value={intent.format || 'csv'}
              onChange={(format) =>
                onChange({
                  ...intent,
                  format,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
