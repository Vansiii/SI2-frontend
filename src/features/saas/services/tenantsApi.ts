/**
 * Servicio API para gestión de tenants (Panel SaaS)
 */

import { apiClient } from '../../../utils/apiClient';
import type { Institution, TenantStats, TenantDetail } from '../types';

/**
 * Obtiene la lista de todas las instituciones
 */
export async function getTenants(params?: {
  is_active?: boolean;
  institution_type?: string;
  search?: string;
}): Promise<Institution[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString());
  }
  if (params?.institution_type) {
    queryParams.append('institution_type', params.institution_type);
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  
  const url = `/saas/tenants/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<Institution[]>(url);
}

/**
 * Obtiene detalles de una institución específica
 */
export async function getTenantDetail(tenantId: number): Promise<TenantDetail> {
  return apiClient.get<TenantDetail>(`/saas/tenants/${tenantId}/`);
}

/**
 * Obtiene estadísticas globales de la plataforma
 */
export async function getTenantStats(): Promise<TenantStats> {
  return apiClient.get<TenantStats>('/saas/stats/');
}

/**
 * Activa o desactiva una institución
 */
export async function toggleTenantActive(
  tenantId: number,
  isActive: boolean
): Promise<{ message: string; institution: Institution }> {
  return apiClient.patch(`/saas/tenants/${tenantId}/toggle-active/`, {
    is_active: isActive,
  });
}
