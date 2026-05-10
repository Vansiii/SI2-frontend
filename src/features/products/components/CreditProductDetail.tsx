/**
 * Componente de detalle completo de un producto crediticio
 * Muestra toda la información del producto incluyendo parámetros, documentos y workflow
 */

import { Loader2, AlertCircle, Edit, ArrowLeft, CheckCircle, XCircle, FileText, Settings, Workflow } from 'lucide-react';
import { useProductWithParameters } from '../hooks/useProducts';
import { ProductConfigurationDisplay } from './ProductConfigurationDisplay';
import type { CreditProductFull } from '../types';

interface CreditProductDetailProps {
  productId: number;
  onEdit?: (product: CreditProductFull) => void;
  onBack?: () => void;
}

export function CreditProductDetail({ productId, onEdit, onBack }: CreditProductDetailProps) {
  const { data: product, isLoading, error } = useProductWithParameters(productId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Cargando producto...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error al cargar producto
        </h3>
        <p className="text-sm text-gray-600">
          {error instanceof Error ? error.message : 'Producto no encontrado'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">
                {product.name}
              </h1>
              {product.is_active ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activo
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactivo
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Código: {product.code}
            </p>
            <p className="text-gray-700">
              {product.description}
            </p>
          </div>

          {onEdit && (
            <button
              onClick={() => onEdit(product)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>
          )}
        </div>

        {/* Información básica */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {product.product_type_detail && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Tipo de Producto</dt>
              <dd className="mt-1 text-sm text-gray-900">{product.product_type_detail.name}</dd>
            </div>
          )}

          {product.rule_set_detail && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Configuración</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.rule_set_detail.name} (v{product.rule_set_detail.version})
              </dd>
            </div>
          )}

          <div>
            <dt className="text-sm font-medium text-gray-500">Orden de Visualización</dt>
            <dd className="mt-1 text-sm text-gray-900">{product.display_order}</dd>
          </div>
        </div>
      </div>

      {/* Configuraciones Seleccionadas */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Settings className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            Configuraciones Específicas
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Configuraciones del conjunto de reglas aplicadas a este producto
        </p>
        <ProductConfigurationDisplay product={product} />
      </div>

      {/* Documentos Requeridos */}
      {product.document_requirements && product.document_requirements.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Documentos Requeridos
            </h2>
          </div>

          <div className="space-y-3">
            {product.document_requirements.map((req) => (
              <div
                key={req.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {req.document_type_detail?.name || 'Documento'}
                    </h4>
                    {req.document_type_detail?.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {req.document_type_detail.description}
                      </p>
                    )}
                  </div>
                  {req.is_mandatory && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Obligatorio
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                  {req.allowed_formats && req.allowed_formats.length > 0 && (
                    <div>
                      <span className="text-gray-500">Formatos:</span>
                      <span className="ml-1 text-gray-900">
                        {req.allowed_formats.join(', ')}
                      </span>
                    </div>
                  )}
                  {req.max_file_size_mb && (
                    <div>
                      <span className="text-gray-500">Tamaño máx:</span>
                      <span className="ml-1 text-gray-900">
                        {req.max_file_size_mb} MB
                      </span>
                    </div>
                  )}
                  {req.max_validity_days && (
                    <div>
                      <span className="text-gray-500">Vigencia:</span>
                      <span className="ml-1 text-gray-900">
                        {req.max_validity_days} días
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow */}
      {product.workflow_stages && product.workflow_stages.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Workflow className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Flujo de Trabajo
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-300" />

            <div className="space-y-4">
              {product.workflow_stages.map((stage) => (
                <div key={stage.id} className="relative flex items-start">
                  <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium">
                    {stage.stage_order}
                  </div>

                  <div className="ml-4 flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {stage.stage_name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Código: {stage.stage_code}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {stage.is_automated && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Automática
                          </span>
                        )}
                        {stage.time_limit_hours && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            {stage.time_limit_hours}h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
