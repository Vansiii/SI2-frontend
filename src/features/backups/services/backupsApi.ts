/**
 * API Service para backups automáticos configurables
 */
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  BackupScheduleConfig,
  BackupScheduleConfigCreate,
  BackupScheduleConfigUpdate,
  BackupScheduleStatus,
  ScheduledBackupLog,
  SchedulerStatus,
  RunNowResponse,
} from '../types/backup.types';

// Crear instancia de axios
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // DEBUG: Log de todas las peticiones
  console.log('🌐 Axios Request:', {
    method: config.method,
    url: config.url,
    data: config.data,
  });
  
  return config;
});

const BASE_URL = '/saas';

export const backupsApi = {
  // ============================================================
  // Configuración de Schedules
  // ============================================================

  /**
   * Obtiene todas las configuraciones de backups programados
   */
  getSchedules: async (): Promise<BackupScheduleConfig[]> => {
    const response = await api.get<BackupScheduleConfig[]>(`${BASE_URL}/schedules/`);
    return response.data;
  },

  /**
   * Obtiene una configuración específica
   */
  getSchedule: async (id: number): Promise<BackupScheduleConfig> => {
    const response = await api.get<BackupScheduleConfig>(`${BASE_URL}/schedules/${id}/`);
    return response.data;
  },

  /**
   * Crea una nueva configuración de backup programado
   */
  createSchedule: async (data: BackupScheduleConfigCreate): Promise<BackupScheduleConfig> => {
    const response = await api.post<BackupScheduleConfig>(`${BASE_URL}/schedules/`, data);
    return response.data;
  },

  /**
   * Actualiza una configuración existente
   */
  updateSchedule: async (
    id: number,
    data: BackupScheduleConfigUpdate
  ): Promise<BackupScheduleConfig> => {
    console.log('🌐 API updateSchedule - ID:', id, 'Data:', data);
    const response = await api.patch<BackupScheduleConfig>(`${BASE_URL}/schedules/${id}/`, data);
    console.log('🌐 API updateSchedule - Response:', response.data);
    return response.data;
  },

  /**
   * Elimina una configuración
   */
  deleteSchedule: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/schedules/${id}/`);
  },

  /**
   * Habilita un schedule
   */
  enableSchedule: async (id: number): Promise<BackupScheduleConfig> => {
    const response = await api.post<BackupScheduleConfig>(`${BASE_URL}/schedules/${id}/enable/`);
    return response.data;
  },

  /**
   * Deshabilita un schedule
   */
  disableSchedule: async (id: number): Promise<BackupScheduleConfig> => {
    const response = await api.post<BackupScheduleConfig>(`${BASE_URL}/schedules/${id}/disable/`);
    return response.data;
  },

  /**
   * Obtiene el estado detallado de un schedule
   */
  getScheduleStatus: async (id: number): Promise<BackupScheduleStatus> => {
    const response = await api.get<BackupScheduleStatus>(`${BASE_URL}/schedules/${id}/status/`);
    return response.data;
  },

  /**
   * Ejecuta un backup inmediatamente (fuera del schedule)
   */
  runNow: async (id: number): Promise<RunNowResponse> => {
    const response = await api.post<RunNowResponse>(`${BASE_URL}/schedules/${id}/run-now/`);
    return response.data;
  },

  /**
   * Obtiene el estado del scheduler automático
   */
  getSchedulerStatus: async (): Promise<SchedulerStatus> => {
    const response = await api.get<SchedulerStatus>(`${BASE_URL}/schedules/scheduler-status/`);
    return response.data;
  },

  // ============================================================
  // Logs de Ejecuciones
  // ============================================================

  /**
   * Obtiene todos los logs de ejecuciones programadas
   */
  getLogs: async (params?: {
    config_id?: number;
    status?: string;
  }): Promise<ScheduledBackupLog[]> => {
    const response = await api.get<ScheduledBackupLog[]>(`${BASE_URL}/scheduled-logs/`, {
      params,
    });
    return response.data;
  },

  /**
   * Obtiene un log específico
   */
  getLog: async (id: number): Promise<ScheduledBackupLog> => {
    const response = await api.get<ScheduledBackupLog>(`${BASE_URL}/scheduled-logs/${id}/`);
    return response.data;
  },

  // ============================================================
  // Utility Functions
  // ============================================================

  /**
   * Formatea el tamaño en MB a una cadena legible
   */
  formatSize: (sizeMb: number | undefined): string => {
    if (!sizeMb) return '0 MB';
    
    if (sizeMb < 1) {
      return `${(sizeMb * 1024).toFixed(2)} KB`;
    } else if (sizeMb < 1024) {
      return `${sizeMb.toFixed(2)} MB`;
    } else {
      return `${(sizeMb / 1024).toFixed(2)} GB`;
    }
  },

  /**
   * Formatea una fecha ISO a formato legible
   */
  formatDate: (dateString: string | undefined): string => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  },
};

export default backupsApi;
