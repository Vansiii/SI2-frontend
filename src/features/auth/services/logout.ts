import { apiClient } from '../../../utils/apiClient';
import { getRefreshToken } from '../../../utils/tokenManager';

/**
 * Servicio de logout
 * Cierra la sesión del usuario y hace blacklist del refresh token
 */
export async function logout(): Promise<void> {
  try {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      await apiClient.post('/auth/logout/', {
        refresh: refreshToken,
      });
    }
  } catch (error) {
    // Si falla el logout en el backend, continuar con logout local
    console.error('Error during logout:', error);
  }
}
