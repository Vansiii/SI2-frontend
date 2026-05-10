/**
 * Servicio API para gestión de productos crediticios (REFACTORIZADO - Fase 2)
 * 
 * Endpoints disponibles:
 * - GET /api/products/ - Lista productos
 * - POST /api/products/ - Crea producto (con documentos requeridos)
 * - GET /api/products/{id}/ - Detalle producto
 * - PATCH /api/products/{id}/ - Actualiza producto (con documentos requeridos)
 * - DELETE /api/products/{id}/ - Desactiva producto
 * - GET /api/products/{id}/parameters/ - Obtiene parámetros activos
 * - GET /api/products/{id}/full/ - Producto completo con parámetros, documentos y workflow
 * - GET /api/products/{id}/ranges/ - Rangos configurados
 * - POST /api/products/{id}/calculate/ - Calcula costos
 */

import { apiClient } from '../../../utils/apiClient';
import type {
  CreditProduct,
  CreateProductData,
  UpdateProductData,
  PaginatedResponse,
  CreditProductParameter,
  CreditProductWithParameters,
  CreditProductFull,
  ProductRanges,
  ProductCalculationRequest,
  ProductCalculationResponse,
} from '../types';

// ============================================================================
// GESTIÓN BÁSICA DE PRODUCTOS
// ============================================================================

/**
 * Obtiene la lista paginada de productos crediticios
 */
export async function getProducts(params: { 
  page?: number; 
  page_size?: number; 
  is_active?: boolean;
  product_type_id?: number;
  rule_set_id?: number;
} = {}): Promise<PaginatedResponse<CreditProduct>> {
  const { page = 1, page_size = 20, is_active, product_type_id, rule_set_id } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    page_size: page_size.toString(),
  });
  
  if (is_active !== undefined) {
    queryParams.append('is_active', is_active.toString());
  }
  
  if (product_type_id !== undefined) {
    queryParams.append('product_type_id', product_type_id.toString());
  }
  
  if (rule_set_id !== undefined) {
    queryParams.append('rule_set_id', rule_set_id.toString());
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
 * Desactiva un producto (soft delete)
 */
export async function deactivateProduct(productId: number): Promise<void> {
  await apiClient.delete<{ success: boolean; message: string }>(`/products/${productId}/`);
}

// ============================================================================
// PARÁMETROS Y CONFIGURACIÓN
// ============================================================================

/**
 * Obtiene los parámetros activos de un producto
 * Los parámetros vienen del RuleSet asignado al producto
 */
export async function getProductParameters(productId: number): Promise<CreditProductParameter> {
  const response = await apiClient.get<{ 
    success: boolean; 
    parameters: CreditProductParameter 
  }>(`/products/${productId}/parameters/`);
  return response.parameters;
}

/**
 * Obtiene producto completo con sus parámetros, documentos y workflow incluidos
 */
export async function getProductWithParameters(productId: number): Promise<CreditProductFull> {
  const response = await apiClient.get<{ 
    success: boolean; 
    product: CreditProductFull 
  }>(`/products/${productId}/full/`);
  return response.product;
}

/**
 * Obtiene los rangos configurados del producto
 * (montos, plazos, tasas, comisiones, seguros)
 */
export async function getProductRanges(productId: number): Promise<ProductRanges> {
  const response = await apiClient.get<{ 
    success: boolean; 
    ranges: ProductRanges 
  }>(`/products/${productId}/ranges/`);
  return response.ranges;
}

// ============================================================================
// CÁLCULOS
// ============================================================================

/**
 * Calcula la cuota mensual y costos totales para un producto
 * 
 * @param productId - ID del producto
 * @param data - Datos para el cálculo (monto, plazo, tasas opcionales)
 * @returns Cálculo detallado con cuota mensual, intereses, comisiones, etc.
 */
export async function calculateProduct(
  productId: number,
  data: ProductCalculationRequest
): Promise<ProductCalculationResponse> {
  const response = await apiClient.post<{ 
    success: boolean; 
    calculation: ProductCalculationResponse 
  }>(`/products/${productId}/calculate/`, data);
  return response.calculation;
}
