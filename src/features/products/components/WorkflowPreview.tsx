/**
 * Componente para mostrar vista previa del workflow de un RuleSet
 * 
 * Muestra las etapas del workflow configuradas en el conjunto de reglas seleccionado.
 */

import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { apiClient } from '../../../utils/apiClient';
import type { WorkflowStage } from '../types';

interface WorkflowPreviewProps {
  ruleSetId: number;
}

export function WorkflowPreview({ ruleSetId }: WorkflowPreviewProps) {
  const { data: stagesResponse, isLoading, error } = useQuery({
    queryKey: ['rule-sets', ruleSetId, 'workflow-stages'],
    queryFn: async () => {
      const response = await apiClient.get<{ results: WorkflowStage[] }>(
        `/loans/rule-sets/${ruleSetId}/workflow-stages/`
      );
      return response;
    },
    enabled: !!ruleSetId,
  });

  const stages = stagesResponse?.results || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600">Cargando workflow...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span className="text-sm">Error al cargar workflow</span>
      </div>
    );
  }

  if (!stages || stages.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-sm text-gray-500">
          No hay etapas de workflow configuradas en este conjunto de reglas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Las solicitudes de este producto seguirán el siguiente flujo de trabajo:
      </p>

      <div className="relative">
        {/* Línea conectora */}
        <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-300" />

        {/* Etapas */}
        <div className="space-y-4">
          {stages.map((stage) => (
            <div key={stage.id} className="relative flex items-start">
              {/* Número de etapa */}
              <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium">
                {stage.stage_order}
              </div>

              {/* Contenido de la etapa */}
              <div className="ml-4 flex-1 bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {stage.stage_name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Código: {stage.stage_code}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center space-x-2">
                    {stage.is_automated && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Automática
                      </span>
                    )}
                    {stage.time_limit_hours && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        {stage.time_limit_hours}h
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>Nota:</strong> Este workflow se aplicará automáticamente a todas las solicitudes de este producto.
        </p>
      </div>
    </div>
  );
}
