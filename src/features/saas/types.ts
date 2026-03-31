/**
 * Tipos para el módulo de administración SaaS
 */

export interface Institution {
  id: number;
  name: string;
  slug: string;
  institution_type: 'banking' | 'microfinance' | 'cooperative' | 'fintech';
  is_active: boolean;
  created_at: string;
  users_count?: number;
  roles_count?: number;
  active_users_count?: number;
}

export interface TenantDetail extends Institution {
  updated_at: string;
  created_by: {
    id: number;
    email: string;
    full_name: string;
  } | null;
  stats: {
    total_users: number;
    users_with_roles: number;
    users_without_roles: number;
    total_roles: number;
    active_roles: number;
    inactive_roles: number;
  };
  recent_users: Array<{
    id: number;
    email: string;
    full_name: string;
    joined_at: string;
  }>;
}

export interface TenantStats {
  total_institutions: number;
  active_institutions: number;
  inactive_institutions: number;
  total_users: number;
  total_roles: number;
  institutions_by_type: Record<string, number>;
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  description: string;
  module: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionFormData {
  name: string;
  code: string;
  description: string;
  module: string;
  is_active?: boolean;
}

export interface PermissionCoverageReport {
  total_permissions: number;
  active_permissions: number;
  inactive_permissions: number;
  permissions_by_module: Record<string, number>;
  admin_roles_with_all_permissions: number;
  total_admin_roles: number;
  coverage_percentage: number;
}
