import { apiClient } from '../../../utils/apiClient';

// ============================================
// Tipos
// ============================================

export interface TwoFactorStatus {
  is_enabled: boolean;
  enabled_at: string | null;
  backup_codes_remaining: number;
  method?: 'totp' | 'email';
}

export interface TwoFactorEnableResponse {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

export interface TwoFactorVerifyResponse {
  message: string;
}

export interface TwoFactorDisableRequest {
  password: string;
}

export interface TwoFactorDisableResponse {
  message: string;
}

export interface TwoFactorSetMethodRequest {
  method: 'totp' | 'email';
  password: string;
}

export interface TwoFactorSetMethodResponse {
  method: 'totp' | 'email';
  message: string;
}

// ============================================
// Servicios
// ============================================

/**
 * Obtiene el estado actual de 2FA del usuario
 */
export async function get2FAStatus(): Promise<TwoFactorStatus> {
  return apiClient.get<TwoFactorStatus>('/auth/2fa/status/');
}

/**
 * Habilita 2FA (TOTP) y obtiene QR code y backup codes
 */
export async function enable2FA(password: string): Promise<TwoFactorEnableResponse> {
  return apiClient.post<TwoFactorEnableResponse>('/auth/2fa/enable/', {
    password,
  });
}

/**
 * Habilita 2FA directamente con método email
 */
export async function enableEmail2FA(password: string): Promise<{ method: string; message: string }> {
  return apiClient.post<{ method: string; message: string }>('/auth/2fa/email/enable/', {
    password,
  });
}

/**
 * Verifica el código TOTP inicial para confirmar la habilitación de 2FA
 */
export async function verify2FASetup(
  code: string
): Promise<TwoFactorVerifyResponse> {
  return apiClient.post<TwoFactorVerifyResponse>('/auth/2fa/verify/', {
    token: code,
  });
}

/**
 * Deshabilita 2FA
 */
export async function disable2FA(
  password: string
): Promise<TwoFactorDisableResponse> {
  return apiClient.post<TwoFactorDisableResponse>('/auth/2fa/disable/', {
    password,
  } as TwoFactorDisableRequest);
}

/**
 * Cambia el método de 2FA (TOTP o Email)
 */
export async function set2FAMethod(
  method: 'totp' | 'email',
  password: string
): Promise<TwoFactorSetMethodResponse> {
  return apiClient.post<TwoFactorSetMethodResponse>('/auth/2fa/method/set/', {
    method,
    password,
  } as TwoFactorSetMethodRequest);
}
