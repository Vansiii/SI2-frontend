/**
 * React Query hooks para gestión de productos crediticios (REFACTORIZADO - Fase 2)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  getProducts, 
  getProductById,
  createProduct,
  updateProduct,
  deactivateProduct,
  getProductParameters,
  getProductWithParameters,
  getProductRanges,
  calculateProduct,
} from '../services/productsApi';
import type { 
  CreditProduct, 
  PaginatedResponse,
  CreateProductData,
  UpdateProductData,
  CreditProductParameter,
  CreditProductFull,
  ProductRanges,
  ProductCalculationRequest,
  ProductCalculationResponse,
} from '../types';

// ============================================================================
// QUERIES - LISTADO Y DETALLE
// ============================================================================

/**
 * Hook para obtener lista paginada de productos
 */
export const useProducts = (params?: { 
  page?: number; 
  page_size?: number; 
  is_active?: boolean;
  product_type_id?: number;
  rule_set_id?: number;
}) => {
  return useQuery<PaginatedResponse<CreditProduct>>({
    queryKey: ['products', params],
    queryFn: () => getProducts(params || {}),
    staleTime: 60000, // 1 minuto
  });
};

/**
 * Hook para obtener solo productos activos
 */
export const useActiveProducts = () => {
  return useQuery<PaginatedResponse<CreditProduct>>({
    queryKey: ['products', 'active'],
    queryFn: () => getProducts({ is_active: true, page_size: 100 }),
    staleTime: 60000,
  });
};

/**
 * Hook para obtener un producto por ID
 */
export const useProduct = (productId: number | undefined) => {
  return useQuery<CreditProduct>({
    queryKey: ['products', productId],
    queryFn: () => getProductById(productId!),
    enabled: !!productId,
    staleTime: 60000,
  });
};

// ============================================================================
// QUERIES - PARÁMETROS Y CONFIGURACIÓN
// ============================================================================

/**
 * Hook para obtener los parámetros activos de un producto
 */
export const useProductParameters = (productId: number | undefined) => {
  return useQuery<CreditProductParameter>({
    queryKey: ['products', productId, 'parameters'],
    queryFn: () => getProductParameters(productId!),
    enabled: !!productId,
    staleTime: 60000,
  });
};

/**
 * Hook para obtener producto completo con parámetros, documentos y workflow
 */
export const useProductWithParameters = (productId: number | undefined) => {
  return useQuery<CreditProductFull>({
    queryKey: ['products', productId, 'full'],
    queryFn: () => getProductWithParameters(productId!),
    enabled: !!productId,
    staleTime: 60000,
  });
};

/**
 * Hook para obtener rangos configurados del producto
 */
export const useProductRanges = (productId: number | undefined) => {
  return useQuery<ProductRanges>({
    queryKey: ['products', productId, 'ranges'],
    queryFn: () => getProductRanges(productId!),
    enabled: !!productId,
    staleTime: 60000,
  });
};

// ============================================================================
// MUTATIONS - CREAR, ACTUALIZAR, ELIMINAR
// ============================================================================

/**
 * Hook para crear un nuevo producto
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CreditProduct, Error, CreateProductData>({
    mutationFn: createProduct,
    onSuccess: () => {
      // Invalidar cache de productos
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto creado correctamente', {
        duration: 3000,
        position: 'top-right',
      });
    },
    onError: (error: any) => {
      console.error('Error creating product:', error);
      
      // Extraer mensaje de error del backend con múltiples formatos
      let errorMessage = 'Error al crear el producto';
      
      if (error?.response?.data) {
        const data = error.response.data;
        
        // Formato 1: { success: false, message: "...", errors: {...} }
        if (data.message && data.errors) {
          // Extraer el primer error de validación
          const errors = data.errors;
          const firstKey = Object.keys(errors)[0];
          if (firstKey) {
            const fieldError = errors[firstKey];
            if (Array.isArray(fieldError) && fieldError.length > 0) {
              errorMessage = `${firstKey}: ${fieldError[0]}`;
            } else if (typeof fieldError === 'string') {
              errorMessage = `${firstKey}: ${fieldError}`;
            } else {
              errorMessage = data.message;
            }
          } else {
            errorMessage = data.message;
          }
        }
        // Formato 2: { message: "..." }
        else if (data.message) {
          errorMessage = data.message;
        }
        // Formato 3: { error: "..." }
        else if (data.error) {
          errorMessage = data.error;
        }
        // Formato 4: { code: ["..."] }
        else if (data.code && Array.isArray(data.code) && data.code.length > 0) {
          errorMessage = data.code[0];
        }
        // Formato 5: { detail: "..." }
        else if (data.detail) {
          errorMessage = data.detail;
        }
        // Formato 6: { field_name: ["error1", "error2"] } - errores de validación por campo
        else if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          if (firstKey && Array.isArray(data[firstKey])) {
            errorMessage = `${firstKey}: ${data[firstKey][0]}`;
          } else if (firstKey && typeof data[firstKey] === 'string') {
            errorMessage = `${firstKey}: ${data[firstKey]}`;
          }
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-right',
      });
    },
  });
};

/**
 * Hook para actualizar un producto
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CreditProduct, Error, { productId: number; updateData: UpdateProductData }>({
    mutationFn: updateProduct,
    onSuccess: (data, variables) => {
      // Invalidar cache del producto específico y lista
      queryClient.invalidateQueries({ queryKey: ['products', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto actualizado correctamente', {
        duration: 3000,
        position: 'top-right',
      });
    },
    onError: (error: any) => {
      console.error('Error updating product:', error);
      
      // Extraer mensaje de error del backend con múltiples formatos
      let errorMessage = 'Error al actualizar el producto';
      
      if (error?.response?.data) {
        const data = error.response.data;
        
        // Formato 1: { success: false, message: "...", errors: {...} }
        if (data.message && data.errors) {
          // Extraer el primer error de validación
          const errors = data.errors;
          const firstKey = Object.keys(errors)[0];
          if (firstKey) {
            const fieldError = errors[firstKey];
            if (Array.isArray(fieldError) && fieldError.length > 0) {
              errorMessage = `${firstKey}: ${fieldError[0]}`;
            } else if (typeof fieldError === 'string') {
              errorMessage = `${firstKey}: ${fieldError}`;
            } else {
              errorMessage = data.message;
            }
          } else {
            errorMessage = data.message;
          }
        }
        // Formato 2: { message: "..." }
        else if (data.message) {
          errorMessage = data.message;
        }
        // Formato 3: { error: "..." }
        else if (data.error) {
          errorMessage = data.error;
        }
        // Formato 4: { code: ["..."] }
        else if (data.code && Array.isArray(data.code) && data.code.length > 0) {
          errorMessage = data.code[0];
        }
        // Formato 5: { detail: "..." }
        else if (data.detail) {
          errorMessage = data.detail;
        }
        // Formato 6: { field_name: ["error1", "error2"] } - errores de validación por campo
        else if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          if (firstKey && Array.isArray(data[firstKey])) {
            errorMessage = `${firstKey}: ${data[firstKey][0]}`;
          } else if (firstKey && typeof data[firstKey] === 'string') {
            errorMessage = `${firstKey}: ${data[firstKey]}`;
          }
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-right',
      });
    },
  });
};

/**
 * Hook para desactivar un producto
 */
export const useDeactivateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: deactivateProduct,
    onSuccess: (_, productId) => {
      // Invalidar cache del producto específico y lista
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto desactivado correctamente', {
        duration: 3000,
        position: 'top-right',
      });
    },
    onError: (error: any) => {
      console.error('Error deactivating product:', error);
      
      // Extraer mensaje de error del backend con múltiples formatos
      let errorMessage = 'Error al desactivar el producto';
      
      if (error?.response?.data) {
        const data = error.response.data;
        
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          if (firstKey && Array.isArray(data[firstKey])) {
            errorMessage = `${firstKey}: ${data[firstKey][0]}`;
          } else if (firstKey && typeof data[firstKey] === 'string') {
            errorMessage = `${firstKey}: ${data[firstKey]}`;
          }
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-right',
      });
    },
  });
};

// ============================================================================
// MUTATIONS - CÁLCULOS
// ============================================================================

/**
 * Hook para calcular costos de un producto
 * No invalida cache porque es una operación de solo lectura
 */
export const useCalculateProduct = () => {
  return useMutation<
    ProductCalculationResponse, 
    Error, 
    { productId: number; data: ProductCalculationRequest }
  >({
    mutationFn: ({ productId, data }) => calculateProduct(productId, data),
  });
};