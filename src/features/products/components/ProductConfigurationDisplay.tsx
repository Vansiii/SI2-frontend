/**
 * Componente para mostrar las configuraciones seleccionadas de un producto
 * 
 * Muestra badges y cards con la configuración activa del producto:
 * - Parámetro seleccionado
 * - Reglas de elegibilidad
 * - Umbral de decisión
 */

import { Settings, CheckCircle2, Target, Users } from 'lucide-react';
import type { CreditProduct } from '../types';

interface ProductConfigurationDisplayProps {
  product: CreditProduct;
}

export function ProductConfigurationDisplay({ product }: ProductConfigurationDisplayProps) {
  const hasConfiguration = 
    product.selected_parameter_detail || 
    (product.selected_eligibility_rules_detail && product.selected_eligibility_rules_detail.length > 0) ||
    product.selected_threshold_detail;

  if (!hasConfiguration) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          No hay configuraciones específicas seleccionadas para este producto
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Parámetro Seleccionado */}
      {product.selected_parameter_detail && (
        <div className="bg-white border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Parámetro del Producto
            </h3>
            <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Activo
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <dt className="text-xs text-gray-500 font-medium">Monto</dt>
              <dd className="text-sm text-gray-900 mt-1 font-semibold">
                Bs. {Number(product.selected_parameter_detail.min_amount).toLocaleString()} - 
                Bs. {Number(product.selected_parameter_detail.max_amount).toLocaleString()}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500 font-medium">Plazo</dt>
              <dd className="text-sm text-gray-900 mt-1 font-semibold">
                {product.selected_parameter_detail.min_term_months} - 
                {product.selected_parameter_detail.max_term_months} meses
              </dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500 font-medium">Tasa de Interés</dt>
              <dd className="text-sm text-gray-900 mt-1 font-semibold">
                {product.selected_parameter_detail.min_interest_rate}% - 
                {product.selected_parameter_detail.max_interest_rate}%
              </dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500 font-medium">Tipo</dt>
              <dd className="text-sm text-gray-900 mt-1 font-semibold">
                {product.selected_parameter_detail.interest_type === 'FIXED' && 'Fija'}
                {product.selected_parameter_detail.interest_type === 'VARIABLE' && 'Variable'}
                {product.selected_parameter_detail.interest_type === 'MIXED' && 'Mixta'}
              </dd>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {product.selected_parameter_detail.requires_guarantor && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Requiere Garante
                </span>
              )}
              {product.selected_parameter_detail.requires_collateral && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Requiere Garantía Real
                </span>
              )}
              {product.selected_parameter_detail.allows_early_payment && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Permite Pago Anticipado
                </span>
              )}
              {product.selected_parameter_detail.auto_approval_enabled && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Auto-aprobación Habilitada
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reglas de Elegibilidad */}
      {product.selected_eligibility_rules_detail && product.selected_eligibility_rules_detail.length > 0 && (
        <div className="bg-white border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Reglas de Elegibilidad
            </h3>
            <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {product.selected_eligibility_rules_detail.length} regla{product.selected_eligibility_rules_detail.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3">
            {product.selected_eligibility_rules_detail.map((rule, index) => (
              <div key={rule.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Regla #{index + 1}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      {rule.min_income_required && (
                        <div>
                          <span className="text-gray-600">Ingreso mínimo:</span>
                          <span className="ml-1 font-semibold text-gray-900">
                            Bs. {Number(rule.min_income_required).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {rule.max_debt_to_income_ratio && (
                        <div>
                          <span className="text-gray-600">DTI máximo:</span>
                          <span className="ml-1 font-semibold text-gray-900">
                            {rule.max_debt_to_income_ratio}%
                          </span>
                        </div>
                      )}
                      {rule.min_employment_months && (
                        <div>
                          <span className="text-gray-600">Empleo mínimo:</span>
                          <span className="ml-1 font-semibold text-gray-900">
                            {rule.min_employment_months} meses
                          </span>
                        </div>
                      )}
                      {rule.min_age && rule.max_age && (
                        <div>
                          <span className="text-gray-600">Edad:</span>
                          <span className="ml-1 font-semibold text-gray-900">
                            {rule.min_age} - {rule.max_age} años
                          </span>
                        </div>
                      )}
                      {rule.min_collateral_coverage && (
                        <div>
                          <span className="text-gray-600">Cobertura garantía:</span>
                          <span className="ml-1 font-semibold text-gray-900">
                            {rule.min_collateral_coverage}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Umbral de Decisión */}
      {product.selected_threshold_detail && (
        <div className="bg-white border border-amber-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Umbral de Decisión (Scoring)
            </h3>
            <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              Activo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {product.selected_threshold_detail.min_score_auto_approval && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <dt className="text-xs text-green-700 font-medium mb-1">Auto-aprobación</dt>
                <dd className="text-2xl font-bold text-green-900">
                  ≥ {product.selected_threshold_detail.min_score_auto_approval}
                </dd>
                <p className="text-xs text-green-600 mt-1">puntos</p>
              </div>
            )}

            {product.selected_threshold_detail.min_score_manual_review && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <dt className="text-xs text-yellow-700 font-medium mb-1">Revisión Manual</dt>
                <dd className="text-2xl font-bold text-yellow-900">
                  ≥ {product.selected_threshold_detail.min_score_manual_review}
                </dd>
                <p className="text-xs text-yellow-600 mt-1">puntos</p>
              </div>
            )}

            {product.selected_threshold_detail.max_score_auto_rejection && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <dt className="text-xs text-red-700 font-medium mb-1">Auto-rechazo</dt>
                <dd className="text-2xl font-bold text-red-900">
                  ≤ {product.selected_threshold_detail.max_score_auto_rejection}
                </dd>
                <p className="text-xs text-red-600 mt-1">puntos</p>
              </div>
            )}
          </div>

          {/* Montos */}
          {(product.selected_threshold_detail.max_amount_auto_approval || 
            product.selected_threshold_detail.requires_manager_approval_amount) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {product.selected_threshold_detail.max_amount_auto_approval && (
                  <div>
                    <span className="text-gray-600">Monto máximo auto-aprobación:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      Bs. {Number(product.selected_threshold_detail.max_amount_auto_approval).toLocaleString()}
                    </span>
                  </div>
                )}
                {product.selected_threshold_detail.requires_manager_approval_amount && (
                  <div>
                    <span className="text-gray-600">Requiere aprobación gerente:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      ≥ Bs. {Number(product.selected_threshold_detail.requires_manager_approval_amount).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
