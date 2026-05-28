/**
 * API service for garantias (collaterals and guarantors).
 */

import { apiClient } from '../../../utils/apiClient';
import type {
  Collateral,
  CollateralCreatePayload,
  CollateralDocument,
  CollateralFilters,
  CollateralListItem,
  CollateralUpdatePayload,
  CollateralValuation,
  CollateralValuationCreatePayload,
  Guarantor,
  GuarantorCreatePayload,
  GuarantorFilters,
  GuarantorListItem,
  GuarantorUpdatePayload,
  PaginatedResponse,
} from '../types';

const unwrap = <T>(payload: { success?: boolean; [key: string]: any }, key: string): T => {
  if (payload && payload[key]) {
    return payload[key] as T;
  }
  return payload as unknown as T;
};

export async function getCollaterals(
  filters: CollateralFilters = {}
): Promise<PaginatedResponse<CollateralListItem>> {
  const params: Record<string, string | number | boolean> = {
    page: filters.page || 1,
    page_size: filters.page_size || 20,
  };

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.collateral_type) {
    params.collateral_type = filters.collateral_type;
  }

  if (filters.loan_application !== undefined && filters.loan_application !== '') {
    params.loan_application = filters.loan_application;
  }

  return apiClient.get<PaginatedResponse<CollateralListItem>>('/garantias/', params);
}

export async function getCollateralById(collateralId: number): Promise<Collateral> {
  const response = await apiClient.get<{ success: boolean; collateral: Collateral }>(
    `/garantias/${collateralId}/`
  );
  return unwrap<Collateral>(response, 'collateral');
}

export async function createCollateral(payload: CollateralCreatePayload): Promise<Collateral> {
  const response = await apiClient.post<{ success: boolean; collateral: Collateral }>(
    '/garantias/',
    payload
  );
  return unwrap<Collateral>(response, 'collateral');
}

export async function updateCollateral(
  collateralId: number,
  payload: CollateralUpdatePayload
): Promise<Collateral> {
  const response = await apiClient.patch<{ success: boolean; collateral: Collateral }>(
    `/garantias/${collateralId}/`,
    payload
  );
  return unwrap<Collateral>(response, 'collateral');
}

export async function deactivateCollateral(collateralId: number): Promise<void> {
  await apiClient.delete(`/garantias/${collateralId}/`);
}

export async function approveCollateral(collateralId: number, notes?: string): Promise<Collateral> {
  const response = await apiClient.post<{ success: boolean; collateral: Collateral }>(
    `/garantias/${collateralId}/approve/`,
    { notes }
  );
  return unwrap<Collateral>(response, 'collateral');
}

export async function rejectCollateral(collateralId: number, reason: string): Promise<Collateral> {
  const response = await apiClient.post<{ success: boolean; collateral: Collateral }>(
    `/garantias/${collateralId}/reject/`,
    { reason }
  );
  return unwrap<Collateral>(response, 'collateral');
}

export async function releaseCollateral(collateralId: number, notes?: string): Promise<Collateral> {
  const response = await apiClient.post<{ success: boolean; collateral: Collateral }>(
    `/garantias/${collateralId}/release/`,
    { notes }
  );
  return unwrap<Collateral>(response, 'collateral');
}

export async function getCollateralDocuments(
  collateralId: number,
  params: { page?: number; page_size?: number } = {}
): Promise<PaginatedResponse<CollateralDocument>> {
  return apiClient.get<PaginatedResponse<CollateralDocument>>(
    `/garantias/${collateralId}/documents/`,
    {
      page: params.page || 1,
      page_size: params.page_size || 20,
    }
  );
}

export async function uploadCollateralDocument(
  collateralId: number,
  data: {
    document_type: string;
    file: File;
    description?: string;
    expiry_date?: string | null;
    notes?: string;
  }
): Promise<CollateralDocument> {
  const formData = new FormData();
  formData.append('document_type', data.document_type);
  formData.append('file', data.file);
  if (data.description) formData.append('description', data.description);
  if (data.expiry_date) formData.append('expiry_date', data.expiry_date);
  if (data.notes) formData.append('notes', data.notes);

  const response = await apiClient.post<{ success: boolean; document: CollateralDocument }>(
    `/garantias/${collateralId}/documents/`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return unwrap<CollateralDocument>(response, 'document');
}

export async function verifyCollateralDocument(
  documentId: number,
  isValid: boolean,
  notes?: string
): Promise<CollateralDocument> {
  const response = await apiClient.post<{ success: boolean; document: CollateralDocument }>(
    `/garantias/documents/${documentId}/verify/`,
    { is_valid: isValid, notes }
  );
  return unwrap<CollateralDocument>(response, 'document');
}

export async function getCollateralValuations(
  collateralId: number,
  params: { page?: number; page_size?: number } = {}
): Promise<PaginatedResponse<CollateralValuation>> {
  return apiClient.get<PaginatedResponse<CollateralValuation>>(
    `/garantias/${collateralId}/valuations/`,
    {
      page: params.page || 1,
      page_size: params.page_size || 20,
    }
  );
}

export async function createCollateralValuation(
  collateralId: number,
  payload: CollateralValuationCreatePayload
): Promise<CollateralValuation> {
  const response = await apiClient.post<{ success: boolean; valuation: CollateralValuation }>(
    `/garantias/${collateralId}/valuations/`,
    payload
  );
  return unwrap<CollateralValuation>(response, 'valuation');
}

export async function approveCollateralValuation(valuationId: number): Promise<CollateralValuation> {
  const response = await apiClient.post<{ success: boolean; valuation: CollateralValuation }>(
    `/garantias/valuations/${valuationId}/approve/`,
    {}
  );
  return unwrap<CollateralValuation>(response, 'valuation');
}

export async function getGuarantors(
  filters: GuarantorFilters = {}
): Promise<PaginatedResponse<GuarantorListItem>> {
  const params: Record<string, string | number | boolean> = {
    page: filters.page || 1,
    page_size: filters.page_size || 20,
  };

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.loan_application !== undefined && filters.loan_application !== '') {
    params.loan_application = filters.loan_application;
  }

  return apiClient.get<PaginatedResponse<GuarantorListItem>>('/garantias/guarantors/', params);
}

export async function getGuarantorById(guarantorId: number): Promise<Guarantor> {
  const response = await apiClient.get<{ success: boolean; guarantor: Guarantor }>(
    `/garantias/guarantors/${guarantorId}/`
  );
  return unwrap<Guarantor>(response, 'guarantor');
}

export async function createGuarantor(payload: GuarantorCreatePayload): Promise<Guarantor> {
  const response = await apiClient.post<{ success: boolean; guarantor: Guarantor }>(
    '/garantias/guarantors/',
    payload
  );
  return unwrap<Guarantor>(response, 'guarantor');
}

export async function updateGuarantor(
  guarantorId: number,
  payload: GuarantorUpdatePayload
): Promise<Guarantor> {
  const response = await apiClient.patch<{ success: boolean; guarantor: Guarantor }>(
    `/garantias/guarantors/${guarantorId}/`,
    payload
  );
  return unwrap<Guarantor>(response, 'guarantor');
}

export async function deactivateGuarantor(guarantorId: number): Promise<void> {
  await apiClient.delete(`/garantias/guarantors/${guarantorId}/`);
}

export async function approveGuarantor(guarantorId: number): Promise<Guarantor> {
  const response = await apiClient.post<{ success: boolean; guarantor: Guarantor }>(
    `/garantias/guarantors/${guarantorId}/approve/`,
    {}
  );
  return unwrap<Guarantor>(response, 'guarantor');
}

export async function rejectGuarantor(guarantorId: number, reason: string): Promise<Guarantor> {
  const response = await apiClient.post<{ success: boolean; guarantor: Guarantor }>(
    `/garantias/guarantors/${guarantorId}/reject/`,
    { reason }
  );
  return unwrap<Guarantor>(response, 'guarantor');
}
