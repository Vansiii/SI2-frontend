/**
 * Componente para seleccionar Reglas de Elegibilidad
 * 
 * Permite selección múltiple de reglas de elegibilidad del conjunto de reglas.
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../utils/apiClient';
import type { EligibilityRule } from '../types';

interface EligibilityRulesSelectorProps {
  ruleSetId?: number;
  value?: number[];
  onChange: (ruleIds: number[]) => void;
  disabled?: boolean;
  error?: string;
}

export function EligibilityRulesSelector({ 
  ruleSetId, 
  value = [], 
  onChange, 
  disabled, 
  error 
}: EligibilityRulesSelectorProps) {
  // Obtener reglas de elegibilidad del conjunto de reglas
  const { data: rulesResponse, isLoading } = useQuery({
    queryKey: ['rule-sets', ruleSetId, 'eligibility-rules'],
    queryFn: async () => {
      if (!ruleSetId) return null;
      return await apiClient.get<{ results: EligibilityRule[] }>(
        `/loans/rule-sets/${ruleSetId}/eligibility-rules/`
      );
    },
    enabled: !!ruleSetId,
  });

  const rules = rulesResponse?.results || [];

  const handleToggle = (ruleId: number) => {
    if (value.includes(ruleId)) {
      onChange(value.filter(id => id !== ruleId));
    } else {
      onChange([...value, ruleId]);
    }
  };

  const handleSelectAll = () => {
    onChange(rules.map(r => r.id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  if (!ruleSetId) {
    return (
      <div className="text-sm text-gray-500">
        Seleccione primero un conjunto de reglas
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Reglas de Elegibilidad
        </label>
        {rules.length > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={disabled || isLoading}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              Seleccionar todas
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={disabled || isLoading}
              className="text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {isLoading ? (
        <div className="text-sm text-gray-500">Cargando reglas...</div>
      ) : rules.length === 0 ? (
        <p className="text-xs text-amber-600">
          No hay reglas de elegibilidad configuradas para este conjunto de reglas
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
          {rules.map((rule) => (
            <label
              key={rule.id}
              className={`
                flex items-start p-3 border rounded-md cursor-pointer
                transition-colors
                ${value.includes(rule.id) 
                  ? 'bg-blue-50 border-blue-300' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="checkbox"
                checked={value.includes(rule.id)}
                onChange={() => handleToggle(rule.id)}
                disabled={disabled}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">
                  Regla #{rule.id}
                </div>
                <div className="text-xs text-gray-600 mt-1 space-y-1">
                  {rule.min_income_required && (
                    <div>Ingreso mínimo: {rule.min_income_required}</div>
                  )}
                  {rule.max_debt_to_income_ratio && (
                    <div>DTI máximo: {rule.max_debt_to_income_ratio}%</div>
                  )}
                  {rule.min_employment_months && (
                    <div>Empleo mínimo: {rule.min_employment_months} meses</div>
                  )}
                  {rule.min_age && rule.max_age && (
                    <div>Edad: {rule.min_age} - {rule.max_age} años</div>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-xs text-gray-600">
          {value.length} regla{value.length !== 1 ? 's' : ''} seleccionada{value.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
