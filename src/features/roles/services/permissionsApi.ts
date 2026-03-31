/**
 * Servicio API para gestión de permisos (Panel Tenant)
 */

import { apiClient } from '../../../utils/apiClient';
import type { Permission } from '../types';

/**
 * Obtiene permisos disponibles para el tenant actual
 */
export async function getAvailablePermissions(): Promise<Permission[]> {
  return apiClient.get<Permission[]>('/permissions/available/');
}

/**
 * Obtiene permisos de un rol específico
 */
export async function getRolePermissions(roleId: number): Promise<{
  role: {
    id: number;
    name: string;
    description: string;
  };
  permissions: Permission[];
}> {
  return apiClient.get(`/roles/${roleId}/permissions/list/`);
}

/**
 * Asigna permisos a un rol
 */
export async function assignRolePermissions(
  roleId: number,
  permissionIds: number[]
): Promise<{
  message: string;
  role: {
    id: number;
    name: string;
  };
  permissions_added: number;
  permissions_already_assigned: number;
}> {
  return apiClient.post(`/roles/${roleId}/permissions/assign/`, {
    permission_ids: permissionIds,
  });
}
