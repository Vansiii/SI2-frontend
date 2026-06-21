/**
 * Página principal de integraciones externas
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Webhook } from 'lucide-react';
import { integrationsApi } from '../services/integrationsApi';
import type { ExternalIntegrationList, ExternalIntegration } from '../types';
import { IntegrationForm } from '../components/IntegrationForm';
import { IntegrationCard } from '../components/IntegrationCard';

export const IntegrationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState<ExternalIntegrationList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<ExternalIntegration | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const data = await integrationsApi.getIntegrations();
      setIntegrations(data);
    } catch (error) {
      toast.error('Error al cargar integraciones');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingIntegration(undefined);
    setShowForm(true);
  };



  const handleView = (id: number) => {
    navigate(`/integrations/${id}`);
  };

  const handleTest = async (id: number) => {
    try {
      toast.loading('Probando conexión...');
      const result = await integrationsApi.testConnection(id);
      toast.dismiss();
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Error al probar conexión');
      console.error(error);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      if (editingIntegration) {
        await integrationsApi.updateIntegration(editingIntegration.id, data);
        toast.success('Integración actualizada exitosamente');
      } else {
        await integrationsApi.createIntegration(data);
        toast.success('Integración creada exitosamente');
      }
      
      setShowForm(false);
      loadIntegrations();
    } catch (error) {
      toast.error('Error al guardar integración');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingIntegration(undefined);
  };

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {editingIntegration ? 'Editar Integración' : 'Nueva Integración'}
          </h1>
          <p className="text-slate-600 mt-2">
            {editingIntegration 
              ? 'Edita la configuración de la integración externa'
              : 'Configura una nueva integración con un servicio externo'
            }
          </p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <IntegrationForm
            integration={editingIntegration}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Integraciones Externas</h1>
          <p className="text-slate-600 mt-2">
            Gestiona las conexiones con servicios de terceros
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nueva Integración
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Cargando integraciones...</p>
        </div>
      ) : (
        <>
          {integrations.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white border border-dashed border-slate-300 rounded-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-6 shadow-sm ring-1 ring-inset ring-slate-200">
                <Webhook className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No hay integraciones configuradas
              </h3>
              <p className="text-slate-600 mb-4">
                Comienza agregando tu primera integración externa
              </p>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Agregar Integración
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onView={handleView}
                  onTest={handleTest}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
