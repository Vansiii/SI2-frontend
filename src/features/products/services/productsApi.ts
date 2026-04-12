/**
 * Servicio API para gestión de productos crediticios
 */

import { apiClient } from '../../../utils/apiClient';
import type {
  CreditProduct,
  CreateProductData,
  UpdateProductData,
  PaginatedResponse,
} from '../types';

/**
 * Obtiene la lista paginada de productos crediticios
 */
export async function getProducts(params: { page?: number; page_size?: number; is_active?: boolean } = {}): Promise<PaginatedResponse<CreditProduct>> {
  const { page = 1, page_size = 20, is_active } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    page_size: page_size.toString(),
  });
  
  if (is_active !== undefined) {
    queryParams.append('is_active', is_active.toString());
  }
  
  return apiClient.get<PaginatedResponse<CreditProduct>>(`/products/?${queryParams}`);
}

/**
 * Obtiene un producto por ID
 */
export async function getProductById(productId: number): Promise<CreditProduct> {
  const response = await apiClient.get<{ success: boolean; product: CreditProduct }>(`/products/${productId}/`);
  return response.product;
}

/**
 * Crea un nuevo producto crediticio
 */
export async function createProduct(data: CreateProductData): Promise<CreditProduct> {
  const response = await apiClient.post<{ success: boolean; message: string; product: CreditProduct }>('/products/', data);
  return response.product;
}

/**
 * Actualiza un producto existente
 */
export async function updateProduct(
  data: { productId: number; updateData: UpdateProductData }
): Promise<CreditProduct> {
  const response = await apiClient.patch<{ success: boolean; message: string; product: CreditProduct }>(`/products/${data.productId}/`, data.updateData);
  return response.product;
}

/**
 * Desactiva un producto
 */
export async function deactivateProduct(productId: number): Promise<void> {
  return apiClient.delete<void>(`/products/${productId}/`);
}
