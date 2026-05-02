/**
 * API de personalización visual white-label del tenant.
 */

import { apiClient } from '../../../utils/apiClient';
import type { TenantBranding } from '../../../types';

export interface TenantBrandingResponse {
  success: boolean;
  message: string;
  branding: TenantBranding;
}

export async function getTenantBranding(): Promise<TenantBrandingResponse> {
  return apiClient.get<TenantBrandingResponse>('/tenant/branding/');
}

export async function saveTenantBranding(data: FormData): Promise<TenantBrandingResponse> {
  return apiClient.put<TenantBrandingResponse>('/tenant/branding/', data);
}

export async function resetTenantBranding(): Promise<TenantBrandingResponse> {
  return apiClient.post<TenantBrandingResponse>('/tenant/branding/reset/');
}
