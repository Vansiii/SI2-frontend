/**
 * Servicio API para gestión de sucursales
 */

import { apiClient } from '../../../utils/apiClient';
import type {
  Branch,
  BranchDeleteResponse,
  BranchListResponse,
  BranchMutationResponse,
  CreateBranchData,
  UpdateBranchData,
} from '../types';

interface GetBranchesParams {
  page?: number;
  page_size?: number;
  is_active?: boolean;
}

export async function getBranches(params: GetBranchesParams = {}): Promise<BranchListResponse> {
  const { page = 1, page_size = 20, is_active } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    page_size: page_size.toString(),
  });

  if (typeof is_active === 'boolean') {
    queryParams.append('is_active', is_active.toString());
  }

  return apiClient.get<BranchListResponse>(`/branches/?${queryParams}`);
}

export async function createBranch(data: CreateBranchData): Promise<Branch> {
  const response = await apiClient.post<BranchMutationResponse>('/branches/', data);
  return response.branch;
}

export async function updateBranch(branchId: number, data: UpdateBranchData): Promise<Branch> {
  const response = await apiClient.put<BranchMutationResponse>(`/branches/${branchId}/`, data);
  return response.branch;
}

export async function deactivateBranch(branchId: number): Promise<BranchDeleteResponse> {
  return apiClient.delete<BranchDeleteResponse>(`/branches/${branchId}/`);
}
