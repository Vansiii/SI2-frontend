/**
 * Componente para mostrar vista previa de parámetros de un RuleSet
 * 
 * Muestra los parámetros configurados en el conjunto de reglas seleccionado.
 */

import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../utils/apiClient';
import type { CreditProductParameter } from '../types';

interface ParametersPreviewProps {
  ruleSetId: number;
}

export function ParametersPreview({ ruleSetId }: ParametersPreviewProps) {
  const { data: parametersResponse, isLoading, error } = useQuery({
    queryKey: ['rule-sets', ruleSetId, 'parameters'],
    queryFn: async () => {
      const response = await apiClient.get<{ results: CreditProductParameter[] }>(
        `/loans/rule-sets/${ruleSetId}/parameters/`
      );
      return response;
    },
    enabled: !!ruleSetId,
  });

  const parameters = parametersResponse?.results || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600">Cargando parámetros...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span className="text-sm">Error al cargar parámetros</span>
      </div>
    );
  }

  if (!parameters || parameters.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-sm text-gray-500">
          No hay parámetros configurados en este conjunto de reglas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Los siguientes parámetros están configurados en el conjunto de reglas seleccionado:
      </p>

      {parameters.map((param) => (
        <div key={param.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          {param.product_name && (
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              {param.product_name}
            </h4>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {/* Montos */}
            <div>
              <dt className="text-gray-600 font-medium">Monto</dt>
              <dd className="text-gray-900 mt-1">
                Bs. {Number(param.min_amount).toLocaleString()} - Bs. {Number(param.max_amount).toLocaleString()}
              </dd>
            </div>

            {/* Plazos */}
            <div>
              <dt className="text-gray-600 font-medium">Plazo</dt>
              <dd className="text-gray-900 mt-1">
                {param.min_term_months} - {param.max_term_months} meses
              </dd>
            </div>

            {/* Tasas de Interés */}
            <div>
              <dt className="text-gray-600 font-medium">Tasa de Interés</dt>
              <dd className="text-gray-900 mt-1">
                {param.min_interest_rate}% - {param.max_interest_rate}%
              </dd>
            </div>

            {/* Tipo de Tasa */}
            <div>
              <dt className="text-gray-600 font-medium">Tipo de Tasa</dt>
              <dd className="text-gray-900 mt-1">
                {param.interest_type === 'FIXED' && 'Fija'}
                {param.interest_type === 'VARIABLE' && 'Variable'}
                {param.interest_type === 'MIXED' && 'Mixta'}
              </dd>
            </div>

            {/* Comisión */}
            {(Number(param.commission_rate_min) > 0 || Number(param.commission_rate_max) > 0) && (
              <div>
                <dt className="text-gray-600 font-medium">Comisión</dt>
                <dd className="text-gray-900 mt-1">
                  {param.commission_rate_min}% - {param.commission_rate_max}%
                </dd>
              </div>
            )}

            {/* Seguro */}
            {(Number(param.insurance_rate_min) > 0 || Number(param.insurance_rate_max) > 0) && (
              <div>
                <dt className="text-gray-600 font-medium">Seguro</dt>
                <dd className="text-gray-900 mt-1">
                  {param.insurance_rate_min}% - {param.insurance_rate_max}%
                </dd>
              </div>
            )}

            {/* Período de Gracia */}
            {param.grace_period_months_max > 0 && (
              <div>
                <dt className="text-gray-600 font-medium">Período de Gracia</dt>
                <dd className="text-gray-900 mt-1">
                  Hasta {param.grace_period_months_max} meses
                </dd>
              </div>
            )}

            {/* Pago Anticipado */}
            <div>
              <dt className="text-gray-600 font-medium">Pago Anticipado</dt>
              <dd className="text-gray-900 mt-1">
                {param.allows_early_payment ? 'Permitido' : 'No permitido'}
              </dd>
            </div>

            {/* Garantías */}
            {(param.requires_guarantor || param.requires_collateral) && (
              <div className="col-span-2">
                <dt className="text-gray-600 font-medium">Requisitos</dt>
                <dd className="text-gray-900 mt-1">
                  {param.requires_guarantor && 'Requiere garante'}
                  {param.requires_guarantor && param.requires_collateral && ' • '}
                  {param.requires_collateral && 'Requiere garantía real'}
                </dd>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
