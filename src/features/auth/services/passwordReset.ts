import { apiClient } from '../../../utils/apiClient';

// ============================================
// Tipos
// ============================================

export interface PasswordResetRequestData {
  email: string;
}

export interface PasswordResetRequestResponse {
  message: string;
}

export interface PasswordResetConfirmData {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordResetConfirmResponse {
  message: string;
}

// ============================================
// Servicios
// ============================================

/**
 * Solicita recuperación de contraseña
 */
export async function requestPasswordReset(
  email: string
): Promise<PasswordResetRequestResponse> {
  return apiClient.post<PasswordResetRequestResponse>(
    '/auth/password-reset/request/',
    { email } as PasswordResetRequestData,
    { skipAuth: true }
  );
}

/**
 * Confirma nueva contraseña con token
 */
export async function confirmPasswordReset(
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<PasswordResetConfirmResponse> {
  return apiClient.post<PasswordResetConfirmResponse>(
    '/auth/password-reset/confirm/',
    {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword,
    } as PasswordResetConfirmData,
    { skipAuth: true }
  );
}
