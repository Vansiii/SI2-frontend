/**
 * Tarjeta de producto crediticio para visualización en lista
 */

import { Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import type { CreditProduct } from '../types';

interface CreditProductCardProps {
  product: CreditProduct;
  onView?: (product: CreditProduct) => void;
  onEdit?: (product: CreditProduct) => void;
  onDelete?: (product: CreditProduct) => void;
}

export function CreditProductCard({ 
  product, 
  onView, 
  onEdit, 
  onDelete 
}: CreditProductCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {product.name}
            </h3>
            {product.is_active ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Activo
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                <XCircle className="h-3 w-3 mr-1" />
                Inactivo
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Código: {product.code}
          </p>
        </div>

        {/* Icono del producto */}
        {product.icon && (
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: product.color || '#3B82F6' }}
          >
            {product.icon}
          </div>
        )}
      </div>

      {/* Descripción */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {product.description}
      </p>

      {/* Información adicional */}
      <div className="space-y-2 mb-4">
        {product.product_type_detail && (
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-24">Tipo:</span>
            <span className="font-medium text-gray-900">
              {product.product_type_detail.name}
            </span>
          </div>
        )}

        {product.rule_set_detail && (
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-24">Configuración:</span>
            <span className="font-medium text-gray-900">
              {product.rule_set_detail.name} (v{product.rule_set_detail.version})
            </span>
          </div>
        )}

        {product.document_requirements && product.document_requirements.length > 0 && (
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-24">Documentos:</span>
            <span className="font-medium text-gray-900">
              {product.document_requirements.length} requeridos
            </span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        {onView && (
          <button
            onClick={() => onView(product)}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </button>
        )}

        {onEdit && (
          <button
            onClick={() => onEdit(product)}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(product)}
            className="inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
