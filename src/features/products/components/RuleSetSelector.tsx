/**
 * Componente para seleccionar un Conjunto de Reglas (RuleSet)
 * 
 * Muestra una lista de RuleSets activos y permite seleccionar uno.
 * Al seleccionar, muestra información del conjunto seleccionado.
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../utils/apiClient';
import type { TenantRuleSet } from '../types';

interface RuleSetSelectorProps {
  value?: number;
  onChange: (ruleSetId: number | undefined) => void;
  disabled?: boolean;
  error?: string;
}

export function RuleSetSelector({ value, onChange, disabled, error }: RuleSetSelectorProps) {
  // Obtener RuleSets activos
  const { data: ruleSetsResponse, isLoading, error: queryError } = useQuery({
    queryKey: ['rule-sets', 'active'],
    queryFn: async () => {
      return await apiClient.get<TenantRuleSet[] | { results: TenantRuleSet[] }>(
        '/loans/rule-sets/?status=ACTIVE'
      );
    },
  });

  // Normalizar respuesta (puede ser array directo o paginado)
  const ruleSets = Array.isArray(ruleSetsResponse) 
    ? ruleSetsResponse 
    : ruleSetsResponse?.results || [];

  console.log('RuleSets data:', ruleSets);
  console.log('RuleSets loading:', isLoading);
  console.log('RuleSets error:', queryError);

  // Encontrar el RuleSet seleccionado
  const selectedRuleSet = ruleSets?.find(rs => rs.id === value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Conjunto de Reglas *
      </label>
      
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        disabled={disabled || isLoading}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      >
        <option value="">Seleccione un conjunto de reglas</option>
        {ruleSets?.map((ruleSet) => (
          <option key={ruleSet.id} value={ruleSet.id}>
            {ruleSet.name} (v{ruleSet.version})
          </option>
        ))}
      </select>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Información del RuleSet seleccionado */}
      {selectedRuleSet && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Información del Conjunto de Reglas
          </h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-600">Versión:</dt>
            <dd className="font-medium">{selectedRuleSet.version}</dd>
            
            <dt className="text-gray-600">Estado:</dt>
            <dd>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                {selectedRuleSet.status}
              </span>
            </dd>
            
            {selectedRuleSet.activated_at && (
              <>
                <dt className="text-gray-600">Activado:</dt>
                <dd className="font-medium">
                  {new Date(selectedRuleSet.activated_at).toLocaleDateString()}
                </dd>
              </>
            )}
          </dl>
          
          {selectedRuleSet.description && (
            <p className="mt-2 text-sm text-gray-600">
              {selectedRuleSet.description}
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500">
        El conjunto de reglas define los parámetros, documentos y workflow del producto.
      </p>
    </div>
  );
}
