/**
 * Página de detalle de una integración externa
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { integrationsApi } from '../services/integrationsApi';
import type { ExternalIntegration, IntegrationMetrics, IntegrationLogList } from '../types';
import { IntegrationForm } from '../components/IntegrationForm';

export const IntegrationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [integration, setIntegration] = useState<ExternalIntegration | null>(null);
  const [metrics, setMetrics] = useState<IntegrationMetrics | null>(null);
  const [logs, setLogs] = useState<IntegrationLogList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadIntegration();
      loadMetrics();
      loadLogs();
    }
  }, [id]);

  const loadIntegration = async () => {
    try {
      const data = await integrationsApi.getIntegration(Number(id));
      setIntegration(data);
    } catch (error) {
      toast.error('Error al cargar integración');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await integrationsApi.getMetrics(Number(id));
      setMetrics(data);
    } catch (error) {
      console.error('Error al cargar métricas:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await integrationsApi.getIntegrationLogs(Number(id), { limit: 20 });
      setLogs(data);
    } catch (error) {
      console.error('Error al cargar logs:', error);
    }
  };

  const handleTest = async () => {
    if (!id) return;
    
    try {
      setIsTesting(true);
      toast.loading('Probando conexión...');
      const result = await integrationsApi.testConnection(Number(id));
      toast.dismiss();
      
      if (result.success) {
        toast.success(result.message);
        loadMetrics();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Error al probar conexión');
      console.error(error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSync = async () => {
    if (!id) return;
    
    try {
      setIsSyncing(true);
      toast.loading('Sincronizando...');
      const result = await integrationsApi.sync(Number(id));
      toast.dismiss();
      toast.success(result.message);
      loadIntegration();
      loadMetrics();
    } catch (error) {
      toast.dismiss();
      toast.error('Error al sincronizar');
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !integration) return;
    
    if (!confirm('¿Está seguro de eliminar esta integración?')) {
      return;
    }

    try {
      await integrationsApi.deleteIntegration(Number(id));
      toast.success('Integración eliminada exitosamente');
      navigate('/integrations');
    } catch (error) {
      toast.error('Error al eliminar integración');
      console.error(error);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (integration) {
        await integrationsApi.updateIntegration(integration.id, data);
        toast.success('Integración actualizada exitosamente');
      }
      setShowForm(false);
      loadIntegration();
    } catch (error) {
      toast.error('Error al actualizar integración');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  if (isLoading || !integration) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Cargando integración...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'TESTING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Editar Integración</h1>
          <p className="text-slate-600 mt-2">Edita la configuración de la integración externa</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <IntegrationForm
            integration={integration}
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
      <div className="mb-6">
        <button
          onClick={() => navigate('/integrations')}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Volver a Integraciones
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{integration.name}</h1>
            <p className="text-slate-600 mt-2">{integration.integration_type_display}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {isTesting ? 'Probando...' : 'Probar Conexión'}
            </button>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Información General</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Estado</p>
                <span className={`px-2 py-1 rounded ${getStatusColor(integration.status)}`}>
                  {integration.status_display}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Descripción</p>
                <p className="text-slate-900">{integration.description || 'Sin descripción'}</p>
              </div>
              {integration.webhook_url && (
                <div>
                  <p className="text-sm text-slate-500">URL de Webhook</p>
                  <p className="text-slate-900 font-mono text-sm">{integration.webhook_url}</p>
                </div>
              )}
              {integration.notes && (
                <div>
                  <p className="text-sm text-slate-500">Notas</p>
                  <p className="text-slate-900">{integration.notes}</p>
                </div>
              )}
              {integration.is_default && (
                <div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Integración por defecto
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Configuración</h2>
            <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(integration.configuration, null, 2)}
            </pre>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Logs Recientes</h2>
            {logs.length === 0 ? (
              <p className="text-slate-500">No hay logs recientes</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{log.action_display}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded ${
                        log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                        log.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.status_display}
                      </span>
                      {log.duration_ms && (
                        <p className="text-xs text-slate-500 mt-1">{log.duration_ms}ms</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {metrics && (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Métricas</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Total de Llamadas</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {metrics.metrics.total_calls}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Éxitos</p>
                    <p className="text-xl font-bold text-green-600">
                      {metrics.metrics.success_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Errores</p>
                    <p className="text-xl font-bold text-red-600">
                      {metrics.metrics.error_count}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tasa de Éxito</p>
                  <p className="text-xl font-bold text-slate-900">
                    {metrics.metrics.success_rate}%
                  </p>
                </div>
                {metrics.metrics.last_success_at && (
                  <div>
                    <p className="text-sm text-slate-500">Último Éxito</p>
                    <p className="text-sm text-slate-900">
                      {new Date(metrics.metrics.last_success_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {metrics.metrics.last_error_at && (
                  <div>
                    <p className="text-sm text-slate-500">Último Error</p>
                    <p className="text-sm text-red-600">
                      {new Date(metrics.metrics.last_error_at).toLocaleString()}
                    </p>
                    {metrics.metrics.last_error_message && (
                      <p className="text-xs text-slate-500 mt-1">
                        {metrics.metrics.last_error_message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Timestamps</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500">Creado</p>
                <p className="text-slate-900">
                  {new Date(integration.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Última Actualización</p>
                <p className="text-slate-900">
                  {new Date(integration.updated_at).toLocaleString()}
                </p>
              </div>
              {integration.last_sync_at && (
                <div>
                  <p className="text-slate-500">Última Sincronización</p>
                  <p className="text-slate-900">
                    {new Date(integration.last_sync_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
