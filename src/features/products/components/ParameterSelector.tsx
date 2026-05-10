/**
 * Componente para seleccionar un Parámetro de Producto
 * 
 * Muestra los parámetros disponibles del conjunto de reglas seleccionado.
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../utils/apiClient';
import type { CreditProductParameter } from '../types';

interface ParameterSelectorProps {
  ruleSetId?: number;
  value?: number;
  onChange: (parameterId: number | undefined) => void;
  disabled?: boolean;
  error?: string;
}

export function ParameterSelector({ 
  ruleSetId, 
  value, 
  onChange, 
  disabled, 
  error 
}: ParameterSelectorProps) {
  // Obtener parámetros del conjunto de reglas
  const { data: parametersResponse, isLoading } = useQuery({
    queryKey: ['rule-sets', ruleSetId, 'parameters'],
    queryFn: async () => {
      if (!ruleSetId) return null;
      return await apiClient.get<{ results: CreditProductParameter[] }>(
        `/loans/rule-sets/${ruleSetId}/parameters/`
      );
    },
    enabled: !!ruleSetId,
  });

  const parameters = parametersResponse?.results || [];
  const selectedParameter = parameters.find(p => p.id === value);

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
        Parámetro del Producto
      </label>
      
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        disabled={disabled || isLoading || parameters.length === 0}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      >
        <option value="">Seleccione un parámetro</option>
        {parameters.map((param) => (
          <option key={param.id} value={param.id}>
            Monto: {param.min_amount} - {param.max_amount} | 
            Plazo: {param.min_term_months}-{param.max_term_months} meses
          </option>
        ))}
      </select>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Información del parámetro seleccionado */}
      {selectedParameter && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Detalles del Parámetro
          </h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-600">Monto:</dt>
            <dd className="font-medium">
              {selectedParameter.min_amount} - {selectedParameter.max_amount}
            </dd>
            
            <dt className="text-gray-600">Plazo:</dt>
            <dd className="font-medium">
              {selectedParameter.min_term_months} - {selectedParameter.max_term_months} meses
            </dd>
            
            <dt className="text-gray-600">Tasa de Interés:</dt>
            <dd className="font-medium">
              {selectedParameter.min_interest_rate}% - {selectedParameter.max_interest_rate}%
            </dd>
            
            <dt className="text-gray-600">Tipo:</dt>
            <dd className="font-medium">{selectedParameter.interest_type}</dd>
          </dl>
        </div>
      )}

      {parameters.length === 0 && !isLoading && (
        <p className="text-xs text-amber-600">
          No hay parámetros configurados para este conjunto de reglas
        </p>
      )}
    </div>
  );
}
