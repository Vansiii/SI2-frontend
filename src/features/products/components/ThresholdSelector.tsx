/**
 * Componente para seleccionar un Umbral de Decisión (Scoring)
 * 
 * Muestra los umbrales disponibles del conjunto de reglas seleccionado.
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../utils/apiClient';
import type { DecisionThreshold } from '../types';

interface ThresholdSelectorProps {
  ruleSetId?: number;
  value?: number;
  onChange: (thresholdId: number | undefined) => void;
  disabled?: boolean;
  error?: string;
}

export function ThresholdSelector({ 
  ruleSetId, 
  value, 
  onChange, 
  disabled, 
  error 
}: ThresholdSelectorProps) {
  // Obtener umbrales del conjunto de reglas
  const { data: thresholdsResponse, isLoading } = useQuery({
    queryKey: ['rule-sets', ruleSetId, 'thresholds'],
    queryFn: async () => {
      if (!ruleSetId) return null;
      return await apiClient.get<{ results: DecisionThreshold[] }>(
        `/loans/rule-sets/${ruleSetId}/thresholds/`
      );
    },
    enabled: !!ruleSetId,
  });

  const thresholds = thresholdsResponse?.results || [];
  const selectedThreshold = thresholds.find(t => t.id === value);

  if (!ruleSetId) {
    return (
      <div className="text-sm text-gray-500">
        Seleccione primero un conjunto de reglas
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Umbral de Decisión (Scoring)
      </label>
      
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        disabled={disabled || isLoading || thresholds.length === 0}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      >
        <option value="">Seleccione un umbral</option>
        {thresholds.map((threshold) => (
          <option key={threshold.id} value={threshold.id}>
            Umbral #{threshold.id} - 
            Auto-aprobación: {threshold.min_score_auto_approval || 'N/A'} | 
            Revisión: {threshold.min_score_manual_review || 'N/A'}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Información del umbral seleccionado */}
      {selectedThreshold && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Detalles del Umbral
          </h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {selectedThreshold.min_score_auto_approval && (
              <>
                <dt className="text-gray-600">Auto-aprobación:</dt>
                <dd className="font-medium">
                  ≥ {selectedThreshold.min_score_auto_approval} puntos
                </dd>
              </>
            )}
            
            {selectedThreshold.min_score_manual_review && (
              <>
                <dt className="text-gray-600">Revisión manual:</dt>
                <dd className="font-medium">
                  ≥ {selectedThreshold.min_score_manual_review} puntos
                </dd>
              </>
            )}
            
            {selectedThreshold.max_score_auto_rejection && (
              <>
                <dt className="text-gray-600">Auto-rechazo:</dt>
                <dd className="font-medium">
                  ≤ {selectedThreshold.max_score_auto_rejection} puntos
                </dd>
              </>
            )}
            
            {selectedThreshold.max_amount_auto_approval && (
              <>
                <dt className="text-gray-600">Monto máximo auto-aprobación:</dt>
                <dd className="font-medium">
                  {selectedThreshold.max_amount_auto_approval}
                </dd>
              </>
            )}
            
            {selectedThreshold.requires_manager_approval_amount && (
              <>
                <dt className="text-gray-600">Requiere aprobación gerente:</dt>
                <dd className="font-medium">
                  ≥ {selectedThreshold.requires_manager_approval_amount}
                </dd>
              </>
            )}
          </dl>
        </div>
      )}

      {thresholds.length === 0 && !isLoading && (
        <p className="text-xs text-amber-600">
          No hay umbrales configurados para este conjunto de reglas
        </p>
      )}
    </div>
  );
}
