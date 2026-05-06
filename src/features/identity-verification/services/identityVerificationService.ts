/**
 * Servicio para consumir API de verificación de identidad
 */

import { apiClient } from '../../../utils/apiClient';
import type {
  IdentityVerification,
  StartVerificationRequest,
  StartVerificationResponse,
  IdentityVerificationStatusResponse,
} from '../types/identityVerification';

const BASE_URL = '/api/identity-verifications';

export const identityVerificationService = {
  /**
   * Obtener las verificaciones de identidad del usuario actual
   */
  async listVerifications(): Promise<IdentityVerification[]> {
    try {
      const response = await apiClient.get<IdentityVerification[]>(BASE_URL);
      return response;
    } catch (error) {
      console.error('Error fetching identity verifications:', error);
      throw error;
    }
  },

  /**
   * Obtener la última verificación del usuario actual
   */
  async getMyVerification(): Promise<IdentityVerification | null> {
    try {
      const response = await apiClient.get<IdentityVerification>(`${BASE_URL}/me/`);
      return response;
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      console.error('Error fetching user verification:', error);
      throw error;
    }
  },

  /**
   * Obtener verificación por ID
   */
  async getVerification(id: number): Promise<IdentityVerification> {
    try {
      const response = await apiClient.get<IdentityVerification>(`${BASE_URL}/${id}/`);
      return response;
    } catch (error) {
      console.error(`Error fetching verification ${id}:`, error);
      throw error;
    }
  },

  /**
   * Iniciar una nueva verificación de identidad
   * 
   * Retorna el URL de Didit donde el usuario debe completar la verificación
   */
  async startVerification(
    request: StartVerificationRequest
  ): Promise<StartVerificationResponse> {
    try {
      const response = await apiClient.post<StartVerificationResponse>(
        BASE_URL,
        request
      );
      return response;
    } catch (error) {
      console.error('Error starting identity verification:', error);
      throw error;
    }
  },

  /**
   * Refrescar el estado de una verificación consultando el backend
   * 
   * Útil después de que el usuario regresa del flujo de Didit
   */
  async refreshVerification(id: number): Promise<IdentityVerification> {
    try {
      const response = await apiClient.post<IdentityVerification>(
        `${BASE_URL}/${id}/refresh/`,
        {}
      );
      return response;
    } catch (error) {
      console.error(`Error refreshing verification ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener solo el estado de una verificación (ligero)
   */
  async getVerificationStatus(
    id: number
  ): Promise<IdentityVerificationStatusResponse> {
    try {
      const verification = await this.getVerification(id);
      return {
        id: verification.id,
        status: verification.status,
        decision: verification.decision,
        completed_at: verification.completed_at,
        error_message: verification.error_message,
      };
    } catch (error) {
      console.error(`Error getting verification status ${id}:`, error);
      throw error;
    }
  },
};
