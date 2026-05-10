/**
 * Formulario principal para crear/editar productos crediticios
 * 
 * Incluye:
 * - Información básica (nombre, código, descripción)
 * - Selección de tipo de producto
 * - Selección de conjunto de reglas
 * - Configuración de documentos requeridos
 * - Vista previa de parámetros y workflow
 */

import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Save, X } from 'lucide-react';
import { apiClient } from '../../../utils/apiClient';
import { RuleSetSelector } from './RuleSetSelector';
import { DocumentRequirementsConfig } from './DocumentRequirementsConfig';
import { WorkflowPreview } from './WorkflowPreview';
import { ParameterSelector } from './ParameterSelector';
import { EligibilityRulesSelector } from './EligibilityRulesSelector';
import { ThresholdSelector } from './ThresholdSelector';
import type { CreateProductData, UpdateProductData, ProductType } from '../types';

interface CreditProductFormProps {
  mode: 'create' | 'edit';
  initialData?: UpdateProductData & { id?: number };
  onSubmit: (data: CreateProductData | UpdateProductData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CreditProductForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: CreditProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProductData>({
    defaultValues: initialData || {
      name: '',
      code: '',
      description: '',
      is_active: true,
      display_order: 0,
      document_requirements: [],
    },
  });

  // Observar valores del formulario
  const ruleSetId = watch('rule_set');
  const documentRequirements = watch('document_requirements') || [];
  const selectedParameter = watch('selected_parameter');
  const selectedEligibilityRules = watch('selected_eligibility_rules') || [];
  const selectedThreshold = watch('selected_threshold');

  // Obtener tipos de producto
  const { data: productTypesResponse, isLoading: loadingProductTypes } = useQuery({
    queryKey: ['product-types', 'active'],
    queryFn: async () => {
      return await apiClient.get<ProductType[] | { results: ProductType[] }>(
        '/loans/catalogs/product-types/?is_active=true'
      );
    },
  });

  // Normalizar respuesta (puede ser array directo o paginado)
  const productTypes = Array.isArray(productTypesResponse) 
    ? productTypesResponse 
    : productTypesResponse?.results || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Información Básica */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Información Básica
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              {...register('name', { required: 'El nombre es requerido' })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Crédito Personal"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Código */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código *
            </label>
            <input
              type="text"
              {...register('code', { 
                required: 'El código es requerido',
                pattern: {
                  value: /^[A-Z0-9-]+$/,
                  message: 'Solo mayúsculas, números y guiones'
                }
              })}
              disabled={mode === 'edit'}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              } ${mode === 'edit' ? 'bg-gray-100' : ''}`}
              placeholder="Ej: PERS-001"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
            {mode === 'edit' && (
              <p className="mt-1 text-xs text-gray-500">
                El código no puede ser modificado
              </p>
            )}
          </div>

          {/* Tipo de Producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Producto *
            </label>
            <select
              {...register('product_type', { 
                required: 'El tipo de producto es requerido',
                valueAsNumber: true 
              })}
              disabled={loadingProductTypes}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.product_type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione un tipo</option>
              {productTypes?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.product_type && (
              <p className="mt-1 text-sm text-red-600">{errors.product_type.message}</p>
            )}
          </div>

          {/* Estado */}
          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              {...register('is_active')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Producto Activo
            </label>
          </div>
        </div>

        {/* Descripción */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            {...register('description', { required: 'La descripción es requerida' })}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe las características principales del producto..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Conjunto de Reglas */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configuración de Reglas
        </h3>
        
        <RuleSetSelector
          value={ruleSetId}
          onChange={(value) => setValue('rule_set', value)}
          error={errors.rule_set?.message}
        />
      </div>

      {/* Selección de Configuraciones del Conjunto de Reglas */}
      {ruleSetId && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Configuraciones Específicas
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Seleccione las configuraciones específicas del conjunto de reglas que aplicarán a este producto.
          </p>
          
          <div className="space-y-6">
            {/* Selector de Parámetros */}
            <ParameterSelector
              ruleSetId={ruleSetId}
              value={selectedParameter}
              onChange={(value) => setValue('selected_parameter', value)}
              error={errors.selected_parameter?.message}
            />

            {/* Selector de Reglas de Elegibilidad */}
            <EligibilityRulesSelector
              ruleSetId={ruleSetId}
              value={selectedEligibilityRules}
              onChange={(value) => setValue('selected_eligibility_rules', value)}
              error={errors.selected_eligibility_rules?.message}
            />

            {/* Selector de Umbral de Decisión */}
            <ThresholdSelector
              ruleSetId={ruleSetId}
              value={selectedThreshold}
              onChange={(value) => setValue('selected_threshold', value)}
              error={errors.selected_threshold?.message}
            />
          </div>
        </div>
      )}

      {/* Documentos Requeridos */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Documentos Requeridos
        </h3>
        
        <DocumentRequirementsConfig
          value={documentRequirements}
          onChange={(value) => setValue('document_requirements', value)}
        />
      </div>

      {/* Vista Previa de Workflow */}
      {ruleSetId && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Vista Previa de Workflow
          </h3>
          <WorkflowPreview ruleSetId={ruleSetId} />
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <X className="h-4 w-4 inline mr-1" />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Save className="h-4 w-4 inline mr-1" />
          {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Producto' : 'Actualizar Producto'}
        </button>
      </div>
    </form>
  );
}
