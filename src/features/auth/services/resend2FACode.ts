import { apiClient } from '../../../utils/apiClient';

interface Resend2FACodeRequest {
  challenge_token: string;
}

interface Resend2FACodeResponse {
  challenge_token: string;
  message: string;
  expires_in: number;
}

/**
 * Reenvía el código 2FA por email
 */
export async function resend2FACode(
  challengeToken: string
): Promise<Resend2FACodeResponse> {
  return apiClient.post<Resend2FACodeResponse>(
    '/auth/2fa/email/resend/',
    { challenge_token: challengeToken } as Resend2FACodeRequest,
    { skipAuth: true }
  );
}
