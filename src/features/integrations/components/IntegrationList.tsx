/**
 * Componente para listar integraciones externas
 */

import type { ExternalIntegrationList } from '../types';

interface IntegrationListProps {
  integrations: ExternalIntegrationList[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

export const IntegrationList: React.FC<IntegrationListProps> = ({
  integrations,
  onEdit,
  onDelete,
  onView,
}) => {
  if (integrations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No hay integraciones configuradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <div
          key={integration.id}
          className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {integration.integration_type_display}
                </span>
                {integration.is_default && (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Por defecto
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                <span className={`px-2 py-1 rounded ${
                  integration.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  integration.status === 'ERROR' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {integration.status_display}
                </span>
                <span>Éxitos: {integration.success_count}</span>
                <span>Errores: {integration.error_count}</span>
                {integration.last_success_at && (
                  <span>Último éxito: {new Date(integration.last_success_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onView(integration.id)}
                className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Ver
              </button>
              <button
                onClick={() => onEdit(integration.id)}
                className="px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(integration.id)}
                className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
