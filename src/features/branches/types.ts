/**
 * Tipos para el módulo de Sucursales
 */

export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  is_active: boolean;
  created_at: string;
  assigned_users_count: number;
  assigned_operations_count: number;
  assigned_user_ids: number[];
  assigned_operation_ids: number[];
}

export interface CreateBranchData {
  name: string;
  address: string;
  city: string;
  is_active?: boolean;
  assigned_user_ids?: number[];
  assigned_operation_ids?: number[];
}

export interface UpdateBranchData extends Partial<CreateBranchData> {}

export interface BranchListResponse {
  success: boolean;
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: Branch[];
}

export interface BranchMutationResponse {
  success: boolean;
  message: string;
  branch: Branch;
}

export interface BranchDeleteResponse {
  success: boolean;
  message: string;
}
