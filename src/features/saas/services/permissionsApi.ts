/**
 * Servicio API para gestión de permisos (Panel SaaS)
 */

import { apiClient } from '../../../utils/apiClient';
import type { Permission, PermissionFormData, PermissionCoverageReport } from '../types';

/**
 * Obtiene la lista de todos los permisos (Panel SaaS)
 */
export async function getSaaSPermissions(params?: {
  is_active?: boolean;
  module?: string;
  search?: string;
}): Promise<Permission[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString());
  }
  if (params?.module) {
    queryParams.append('module', params.module);
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  
  const url = `/saas/permissions/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<Permission[]>(url);
}

/**
 * Obtiene un permiso específico
 */
export async function getSaaSPermission(permissionId: number): Promise<Permission> {
  return apiClient.get<Permission>(`/saas/permissions/${permissionId}/`);
}

/**
 * Crea un nuevo permiso
 */
export async function createSaaSPermission(data: PermissionFormData): Promise<Permission> {
  return apiClient.post<Permission>('/saas/permissions/', data);
}

/**
 * Actualiza un permiso existente
 */
export async function updateSaaSPermission(
  permissionId: number,
  data: Partial<PermissionFormData>
): Promise<Permission> {
  return apiClient.patch<Permission>(`/saas/permissions/${permissionId}/`, data);
}

/**
 * Elimina un permiso
 */
export async function deleteSaaSPermission(permissionId: number): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/saas/permissions/${permissionId}/`);
}

/**
 * Sincroniza permisos con roles de administrador
 */
export async function syncAdminPermissions(): Promise<{
  message: string;
  roles_updated: number;
  permissions_added: number;
}> {
  return apiClient.post('/saas/permissions/sync/', {});
}

/**
 * Obtiene reporte de cobertura de permisos
 */
export async function getPermissionCoverage(): Promise<PermissionCoverageReport> {
  return apiClient.get<PermissionCoverageReport>('/saas/permissions/coverage/');
}

/**
 * Obtiene usuarios multi-tenant (Panel SaaS)
 */
export async function getSaaSUsers(params?: {
  institution?: number;
  user_type?: string;
  search?: string;
}): Promise<any[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.institution) {
    queryParams.append('institution', params.institution.toString());
  }
  if (params?.user_type) {
    queryParams.append('user_type', params.user_type);
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  
  const url = `/saas/users/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<any[]>(url);
}

/**
 * Obtiene roles multi-tenant (Panel SaaS)
 */
export async function getSaaSRoles(params?: {
  institution?: number;
  is_active?: boolean;
  search?: string;
}): Promise<any[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.institution) {
    queryParams.append('institution', params.institution.toString());
  }
  if (params?.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString());
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  
  const url = `/saas/roles/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiClient.get<any[]>(url);
}
