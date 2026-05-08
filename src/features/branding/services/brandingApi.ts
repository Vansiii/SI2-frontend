/**
 * API de personalización visual white-label del tenant.
 */

import { apiClient } from '../../../utils/apiClient';
import type { TenantBranding, FileUploadResponse, PublicBrandingResponse } from '../../../types';

export interface TenantBrandingResponse {
  success: boolean;
  message: string;
  branding: TenantBranding;
}

export interface UpdateBrandingColorsData {
  display_name?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
}

/**
 * Obtener branding del tenant actual (autenticado)
 */
export async function getTenantBranding(): Promise<TenantBrandingResponse> {
  return apiClient.get<TenantBrandingResponse>('/tenant/branding/');
}

/**
 * Actualizar colores y nombre del branding (sin archivos)
 */
export async function updateBrandingColors(data: UpdateBrandingColorsData): Promise<TenantBrandingResponse> {
  return apiClient.patch<TenantBrandingResponse>('/tenant/branding/', data);
}

/**
 * Subir logo del tenant
 */
export async function uploadLogo(file: File): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', 'logo');
  return apiClient.post<FileUploadResponse>('/tenant/branding/upload/', formData);
}

/**
 * Subir favicon del tenant
 */
export async function uploadFavicon(file: File): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', 'favicon');
  return apiClient.post<FileUploadResponse>('/tenant/branding/upload/', formData);
}

/**
 * Subir cover del tenant
 */
export async function uploadCover(file: File): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', 'cover');
  return apiClient.post<FileUploadResponse>('/tenant/branding/upload/', formData);
}

/**
 * Eliminar archivo de branding (logo, favicon o cover)
 */
export async function deleteBrandingFile(category: 'logo' | 'favicon' | 'cover'): Promise<TenantBrandingResponse> {
  return apiClient.delete<TenantBrandingResponse>('/tenant/branding/delete/', {
    params: { category },
  });
}

/**
 * Restaurar branding a valores por defecto
 */
export async function resetTenantBranding(): Promise<TenantBrandingResponse> {
  return apiClient.post<TenantBrandingResponse>('/tenant/branding/reset/');
}

/**
 * Obtener branding público por slug (sin autenticación)
 */
export async function getPublicBranding(slug: string): Promise<PublicBrandingResponse> {
  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tenant/branding/public/${slug}/`);
  
  if (!response.ok) {
    throw new Error('No se pudo cargar el branding del tenant');
  }
  
  return response.json();
}
