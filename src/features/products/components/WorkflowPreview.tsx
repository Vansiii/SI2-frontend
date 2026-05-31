/**
 * Componente para mostrar vista previa del workflow de un RuleSet
 * 
 * Muestra las etapas del workflow configuradas en el conjunto de reglas seleccionado
 * usando el visualizador interactivo de diagrama.
 */

import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../utils/apiClient';
import { WorkflowVisualizer } from '../../rules/components/WorkflowVisualizer';
import type { WorkflowStageDefinition } from '../../rules/types/workflowStage.types';

interface WorkflowPreviewProps {
  ruleSetId: number;
}

export function WorkflowPreview({ ruleSetId }: WorkflowPreviewProps) {
  const { data: stagesResponse, isLoading, error } = useQuery({
    queryKey: ['rule-sets', ruleSetId, 'workflow-stages'],
    queryFn: async () => {
      const response = await apiClient.get<{ results: WorkflowStageDefinition[] }>(
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
      <p className="text-sm text-gray-600 mb-4">
        Las solicitudes de este producto seguirán el siguiente flujo de trabajo:
      </p>

      {/* Visualizador de Workflow (Diagrama Interactivo) */}
      <WorkflowVisualizer
        stages={stages}
        // No pasamos onEditStage ni onDeleteStage porque es solo vista previa
      />

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>Nota:</strong> Este workflow se aplicará automáticamente a todas las solicitudes de este producto.
          Puedes hacer zoom y mover el diagrama para explorarlo mejor.
        </p>
      </div>
    </div>
  );
}
