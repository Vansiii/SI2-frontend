import { apiClient } from '../../../utils/apiClient';
import { getRefreshToken, saveTokens } from '../../../utils/tokenManager';

interface RefreshTokenResponse {
  access: string;
  refresh: string;
}

/**
 * Servicio de refresh token
 * Renueva el access token usando el refresh token
 */
export async function refreshToken(): Promise<RefreshTokenResponse> {
  try {
    const refreshTokenValue = getRefreshToken();

    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<RefreshTokenResponse>(
      '/auth/token/refresh/',
      { refresh: refreshTokenValue },
      { skipAuth: true, skipRefresh: true }
    );

    // Guardar los nuevos tokens
    saveTokens(response.access, response.refresh);

    return response;
  } catch (error) {
    throw error;
  }
}
