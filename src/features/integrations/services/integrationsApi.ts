/**
 * API service para integraciones externas
 */

import axios from 'axios';
import type {
  ExternalIntegration,
  ExternalIntegrationList,
  IntegrationLog,
  IntegrationLogList,
  IntegrationMetrics,
  TestConnectionResponse,
  SyncResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const integrationsApi = {
  // Obtener todas las integraciones
  getIntegrations: async (params?: {
    integration_type?: string;
    status?: string;
  }): Promise<ExternalIntegrationList[]> => {
    const response = await api.get('/integrations/integrations/', { params });
    return response.data;
  },

  // Obtener una integración por ID
  getIntegration: async (id: number): Promise<ExternalIntegration> => {
    const response = await api.get(`/integrations/integrations/${id}/`);
    return response.data;
  },

  // Crear una nueva integración
  createIntegration: async (
    data: Omit<ExternalIntegration, 'id' | 'institution' | 'created_at' | 'updated_at'>
  ): Promise<ExternalIntegration> => {
    const response = await api.post('/integrations/integrations/', data);
    return response.data;
  },

  // Actualizar una integración
  updateIntegration: async (
    id: number,
    data: Partial<ExternalIntegration>
  ): Promise<ExternalIntegration> => {
    const response = await api.patch(`/integrations/integrations/${id}/`, data);
    return response.data;
  },

  // Eliminar una integración
  deleteIntegration: async (id: number): Promise<void> => {
    await api.delete(`/integrations/integrations/${id}/`);
  },

  // Probar conexión con una integración
  testConnection: async (id: number): Promise<TestConnectionResponse> => {
    const response = await api.post(`/integrations/integrations/${id}/test_connection/`);
    return response.data;
  },

  // Sincronizar datos con una integración
  sync: async (id: number): Promise<SyncResponse> => {
    const response = await api.post(`/integrations/integrations/${id}/sync/`);
    return response.data;
  },

  // Obtener métricas de una integración
  getMetrics: async (id: number): Promise<IntegrationMetrics> => {
    const response = await api.get(`/integrations/integrations/${id}/metrics/`);
    return response.data;
  },

  // Obtener logs de una integración
  getIntegrationLogs: async (
    id: number,
    params?: {
      action?: string;
      status?: string;
      limit?: number;
    }
  ): Promise<IntegrationLogList[]> => {
    const response = await api.get(`/integrations/integrations/${id}/logs/`, { params });
    return response.data;
  },

  // Obtener todos los logs (filtrados)
  getLogs: async (params?: {
    integration?: string;
    action?: string;
    status?: string;
  }): Promise<IntegrationLogList[]> => {
    const response = await api.get('/integrations/logs/', { params });
    return response.data;
  },

  // Obtener un log por ID
  getLog: async (id: number): Promise<IntegrationLog> => {
    const response = await api.get(`/integrations/logs/${id}/`);
    return response.data;
  },
};
