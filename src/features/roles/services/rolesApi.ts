// erick sprint 0
import type { Role, Permission, RoleFormData, RoleAssignPermissionsData } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '/api';

export class RolesApiError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'RolesApiError';
    this.fieldErrors = fieldErrors;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new RolesApiError(`Error: ${response.status} ${response.statusText}`);
    }
    
    // Attempt to map typical drf errors
    const fieldErrors: Record<string, string> = {};
    let message = 'Error en la solicitud';
    
    if (typeof errorData === 'object' && errorData !== null) {
      if (errorData.detail) message = errorData.detail;
      else if (errorData.non_field_errors) message = errorData.non_field_errors[0];
      
      for (const [key, val] of Object.entries(errorData)) {
        if (key !== 'detail' && key !== 'non_field_errors') {
          fieldErrors[key] = Array.isArray(val) ? val[0] : String(val);
        }
      }
    }
    throw new RolesApiError(message, fieldErrors);
  }
  
  if (response.status === 204) {
    return {} as T;
  }
  
  return await response.json() as T;
}

export async function fetchRoles(includeInactive = false): Promise<Role[]> {
  const url = `${API_BASE_URL}/roles/?include_inactive=${includeInactive}`;
  const response = await fetch(url);
  return handleResponse<Role[]>(response);
}

export async function fetchRole(roleId: number): Promise<Role> {
  const url = `${API_BASE_URL}/roles/${roleId}/`;
  const response = await fetch(url);
  return handleResponse<Role>(response);
}

export async function createRole(data: RoleFormData): Promise<Role> {
  const url = `${API_BASE_URL}/roles/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Role>(response);
}

export async function updateRole(roleId: number, data: Partial<RoleFormData>): Promise<Role> {
  const url = `${API_BASE_URL}/roles/${roleId}/`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Role>(response);
}

export async function deactivateRole(roleId: number): Promise<{message: string}> {
  const url = `${API_BASE_URL}/roles/${roleId}/`;
  const response = await fetch(url, {
    method: 'DELETE',
  });
  return handleResponse<{message: string}>(response);
}

export async function fetchPermissions(): Promise<Permission[]> {
  const url = `${API_BASE_URL}/permissions/`;
  const response = await fetch(url);
  return handleResponse<Permission[]>(response);
}

export async function assignPermissions(roleId: number, data: RoleAssignPermissionsData): Promise<Role> {
  const url = `${API_BASE_URL}/roles/${roleId}/permissions/`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Role>(response);
}

export async function removePermission(roleId: number, permissionId: number): Promise<Role> {
  const url = `${API_BASE_URL}/roles/${roleId}/permissions/${permissionId}/`;
  const response = await fetch(url, {
    method: 'DELETE',
  });
  return handleResponse<Role>(response);
}