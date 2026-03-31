/**
 * Servicio API para gestión de roles
 */

import { apiClient } from '../../../utils/apiClient';
import type { Role, Permission, RoleFormData, RoleAssignPermissionsData } from '../types';

/**
 * Obtiene la lista de roles
 */
export async function fetchRoles(includeInactive = false): Promise<Role[]> {
  const url = `/roles/?include_inactive=${includeInactive}`;
  return apiClient.get<Role[]>(url);
}

/**
 * Obtiene un rol por ID
 */
export async function fetchRole(roleId: number): Promise<Role> {
  return apiClient.get<Role>(`/roles/${roleId}/`);
}

/**
 * Crea un nuevo rol
 */
export async function createRole(data: RoleFormData): Promise<Role> {
  return apiClient.post<Role>('/roles/', data);
}

/**
 * Actualiza un rol existente
 */
export async function updateRole(roleId: number, data: Partial<RoleFormData>): Promise<Role> {
  return apiClient.patch<Role>(`/roles/${roleId}/`, data);
}

/**
 * Desactiva un rol
 */
export async function deactivateRole(roleId: number): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/roles/${roleId}/`);
}

/**
 * Obtiene la lista de permisos disponibles
 */
export async function fetchPermissions(): Promise<Permission[]> {
  return apiClient.get<Permission[]>('/permissions/');
}

/**
 * Asigna permisos a un rol
 */
export async function assignPermissions(
  roleId: number,
  data: RoleAssignPermissionsData
): Promise<Role> {
  return apiClient.put<Role>(`/roles/${roleId}/permissions/`, data);
}

/**
 * Remueve un permiso de un rol
 */
export async function removePermission(roleId: number, permissionId: number): Promise<Role> {
  return apiClient.delete<Role>(`/roles/${roleId}/permissions/${permissionId}/`);
}