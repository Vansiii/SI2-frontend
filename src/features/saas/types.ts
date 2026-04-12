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
  subscription: {
    id: number;
    plan_name: string;
    status: string;
    start_date: string;
    end_date: string | null;
    current_users: number;
    current_branches: number;
    current_products: number;
    current_storage_gb: number;
    max_users: number;
    max_branches: number;
    max_products: number;
    max_storage_gb: number;
    usage_percentage: {
      users: number;
      branches: number;
      products: number;
      storage: number;
    };
    is_within_limits: boolean;
  } | null;
  stats: {
    total_users: number;
    users_with_roles: number;
    users_without_roles: number;
    total_roles: number;
    active_roles: number;
    inactive_roles: number;
  };
  all_users: Array<{
    id: number;
    email: string;
    full_name: string;
    joined_at: string;
    is_active: boolean;
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

// Tipos para Planes de Suscripción
export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  billing_cycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  trial_days: number;
  setup_fee: string;
  
  // Límites
  max_users: number;
  max_branches: number;
  max_products: number;
  max_loans_per_month: number;
  max_storage_gb: number;
  
  // Features
  has_ai_scoring: boolean;
  has_workflows: boolean;
  has_reporting: boolean;
  has_mobile_app: boolean;
  has_api_access: boolean;
  has_white_label: boolean;
  has_custom_integrations: boolean;
  has_priority_support: boolean;
  
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlanFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  billing_cycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  trial_days: number;
  setup_fee: string;
  
  max_users: number;
  max_branches: number;
  max_products: number;
  max_loans_per_month: number;
  max_storage_gb: number;
  
  has_ai_scoring: boolean;
  has_workflows: boolean;
  has_reporting: boolean;
  has_mobile_app: boolean;
  has_api_access: boolean;
  has_white_label: boolean;
  has_custom_integrations: boolean;
  has_priority_support: boolean;
  
  is_active: boolean;
  display_order: number;
}
