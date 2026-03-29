// erick sprint 0
export interface Permission {
  id: number;
  name: string;
  description: string;
  code: string;
  module?: string;
  is_active: boolean;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  institution: number | null;
  permissions: Permission[];
}

export interface RoleFormData {
  institution: number; // Requerido por el backend
  name: string;
  description: string;
  is_active?: boolean;
}

export interface RoleAssignPermissionsData {
  permission_ids: number[];
}