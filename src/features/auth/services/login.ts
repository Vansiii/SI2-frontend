import { apiClient } from '../../../utils/apiClient';
import type { LoginCredentials, LoginResponse } from '../../../types';

/**
 * Servicio de login
 * Autentica al usuario con email y contraseña
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>(
      '/auth/login/',
      credentials,
      { skipAuth: true }
    );

    return response;
  } catch (error) {
    throw error;
  }
}
