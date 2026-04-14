/**
 * API Client
 * Cliente HTTP centralizado con interceptores para tokens y manejo de errores
 */

import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './tokenManager';
import { ApiErrorClass } from './errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
  headers?: Record<string, string>;
}

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  /**
   * Realiza una petición HTTP
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { skipAuth, skipRefresh, ...fetchConfig } = config;

    // Inicializar headers como objeto
    const headers: Record<string, string> = {};

    // Agregar token si no se debe saltar autenticación
    if (!skipAuth) {
      const token = getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Agregar headers existentes
    if (config.headers) {
      Object.assign(headers, config.headers);
    }

    // Agregar Content-Type por defecto si no existe
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    // Asignar headers al config
    fetchConfig.headers = headers;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchConfig);

      // Si es 401 y no se debe saltar refresh, intentar renovar token
      if (response.status === 401 && !skipRefresh && !skipAuth) {
        return await this.handleUnauthorized(endpoint, fetchConfig);
      }

      // Si no es exitoso, lanzar error
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Si es 204 No Content, retornar objeto vacío
      if (response.status === 204) {
        return {} as T;
      }

      // Parsear respuesta JSON
      const data = await response.json();
      return data as T;
    } catch (error) {
      // Si es un error de red
      if (error instanceof TypeError) {
        throw new ApiErrorClass(
          'Error de conexión. Verifica tu conexión a internet.',
          0,
          {}
        );
      }
      throw error;
    }
  }

  /**
   * Maneja respuestas de error
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let payload: any = null;

    try {
      payload = await response.json();
    } catch {
      // Si no se puede parsear JSON, usar mensaje según el código de estado
      const statusMessages: Record<number, string> = {
        502: 'El servidor no está disponible. Verifica que el backend esté ejecutándose.',
        503: 'El servicio no está disponible temporalmente. Intenta de nuevo más tarde.',
        504: 'El servidor tardó demasiado en responder. Intenta de nuevo.',
      };
      
      const message = statusMessages[response.status] || response.statusText || 'Error del servidor';
      payload = { error: message };
    }

    // Extraer errores de campo
    const fieldErrors: Record<string, string> = {};
    Object.entries(payload).forEach(([key, value]) => {
      if (key !== 'error' && key !== 'message' && key !== 'detail' && key !== 'non_field_errors') {
        if (typeof value === 'string') {
          fieldErrors[key] = value;
        } else if (Array.isArray(value)) {
          fieldErrors[key] = value[0];
        }
      }
    });

    // Extraer mensaje de error
    // Prioridad: error > message > detail > non_field_errors > primer field error
    let message = payload?.error || payload?.message || payload?.detail;

    // Si no hay mensaje, buscar en non_field_errors (errores de validación de DRF)
    if (!message && payload?.non_field_errors) {
      if (Array.isArray(payload.non_field_errors)) {
        message = payload.non_field_errors[0];
      } else {
        message = payload.non_field_errors;
      }
    }

    // Si aún no hay mensaje, usar el primer error de campo disponible
    if (!message) {
      const firstFieldError = Object.values(fieldErrors)[0];
      message = firstFieldError || 'Ha ocurrido un error';
    }

    throw new ApiErrorClass(message, response.status, fieldErrors, payload?.code);
  }

  /**
   * Maneja error 401 (no autorizado) intentando renovar el token
   */
  private async handleUnauthorized<T>(
    endpoint: string,
    config: RequestConfig
  ): Promise<T> {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      // No hay refresh token, limpiar sesión y redirigir
      clearTokens();
      window.location.href = '/login';
      throw new ApiErrorClass('Sesión expirada', 401, {});
    }

    // Si ya se está renovando, esperar
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.refreshSubscribers.push((token: string) => {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
          this.request<T>(endpoint, { ...config, skipRefresh: true })
            .then(resolve)
            .catch(reject);
        });
      });
    }

    this.isRefreshing = true;

    try {
      // Intentar renovar token
      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const data = await response.json();
      const { access, refresh } = data;

      // Guardar nuevos tokens
      saveTokens(access, refresh);

      // Notificar a suscriptores
      this.refreshSubscribers.forEach((callback) => callback(access));
      this.refreshSubscribers = [];

      // Reintentar request original
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${access}`,
      };
      return await this.request<T>(endpoint, { ...config, skipRefresh: true });
    } catch (error) {
      // Refresh falló, limpiar sesión
      clearTokens();
      window.location.href = '/login';
      throw new ApiErrorClass('Sesión expirada', 401, {});
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }
}

// Exportar instancia única
export const apiClient = new ApiClient();
// Exportar también como default para compatibilidad
export default apiClient;