import { apiClient } from '../../../utils/apiClient';
import type { TwoFactorVerifyRequest, TwoFactorVerifyResponse } from '../../../types';

/**
 * Servicio de verificación 2FA durante login
 * Verifica el código de 6 dígitos y completa el login
 */
export async function verify2FA(
  challengeToken: string,
  code: string,
  isBackupCode: boolean = false
): Promise<TwoFactorVerifyResponse> {
  const payload: TwoFactorVerifyRequest = {
    challenge_token: challengeToken,
    totp_code: code,
    is_backup_code: isBackupCode,
  };

  const response = await apiClient.post<TwoFactorVerifyResponse>(
    '/auth/login/2fa/',
    payload,
    { skipAuth: true }
  );

  return response;
}
