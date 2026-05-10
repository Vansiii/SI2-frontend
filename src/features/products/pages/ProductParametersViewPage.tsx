/**
 * Página de Visualización de Parámetros del Producto
 * 
 * Muestra los parámetros técnicos heredados del RuleSet asignado.
 * Los parámetros NO se editan aquí - se configuran en "Reglas de Crédito".
 */

import { useParams, useNavigate } from 'react-router-dom';
import { LoadingState } from '../../../components/ui/LoadingState';
import { useProduct, useProductParameters } from '../hooks';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  TrendingUp,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings,
  Info,
} from 'lucide-react';

export function ProductParametersViewPage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  
  const { data: product, isLoading: loadingProduct } = useProduct(
    productId ? parseInt(productId) : undefined
  );
  const { data: parameters, isLoading: loadingParameters, error } = useProductParameters(
    productId ? parseInt(productId) : undefined
  );

  if (loadingProduct || loadingParameters) {
    return <LoadingState message="Cargando parámetros del producto..." fullScreen={true} />;
  }

  if (!product) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700">Producto no encontrado</p>
        </div>
      </div>
    );
  }

  const hasParameters = !error && parameters;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600" />
            Parámetros del Producto
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {product.name}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-blue-900 text-sm">Parámetros Heredados del RuleSet</h3>
          <p className="text-blue-700 text-sm mt-1">
            Estos parámetros se configuran en <strong>Reglas de Crédito → Parámetros de Producto</strong> y son heredados por el producto. Para modificarlos, ve a la sección de Reglas de Crédito.
          </p>
        </div>
      </div>

      {/* Sin Parámetros */}
      {!hasParameters && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 text-lg">No hay parámetros configurados</h3>
            <p className="text-amber-700 mt-2">
              Este producto aún no tiene parámetros técnicos asignados. Para configurarlos:
            </p>
            <ol className="list-decimal list-inside text-amber-700 mt-2 space-y-1">
              <li>Ve a <strong>Reglas de Crédito → Parámetros de Producto</strong></li>
              <li>Crea o edita un conjunto de parámetros</li>
              <li>Asigna el RuleSet a este producto</li>
            </ol>
          </div>
        </div>
      )}

      {/* Con Parámetros */}
      {hasParameters && (
        <>
          {/* Montos */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Montos y Financiamiento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Monto Mínimo</p>
                <p className="text-2xl font-bold text-slate-900">
                  Bs {parseFloat(parameters.min_amount).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Monto Máximo</p>
                <p className="text-2xl font-bold text-slate-900">
                  Bs {parseFloat(parameters.max_amount).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">% Máximo de Financiamiento</p>
                <p className="text-2xl font-bold text-slate-900">
                  {parseFloat(parameters.max_financing_percentage).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Plazos */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Plazos y Período de Gracia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Plazo Mínimo</p>
                <p className="text-2xl font-bold text-slate-900">
                  {parameters.min_term_months} meses
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Plazo Máximo</p>
                <p className="text-2xl font-bold text-slate-900">
                  {parameters.max_term_months} meses
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Período de Gracia Mínimo</p>
                <p className="text-2xl font-bold text-slate-900">
                  {parameters.grace_period_months_min} meses
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Período de Gracia Máximo</p>
                <p className="text-2xl font-bold text-slate-900">
                  {parameters.grace_period_months_max} meses
                </p>
              </div>
            </div>
          </div>

          {/* Tasas */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Tasas de Interés, Comisiones y Seguros
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">Tasa de Interés</p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Mínima</p>
                    <p className="text-xl font-bold text-slate-900">
                      {parseFloat(parameters.min_interest_rate).toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-slate-400">→</div>
                  <div>
                    <p className="text-xs text-slate-500">Máxima</p>
                    <p className="text-xl font-bold text-slate-900">
                      {parseFloat(parameters.max_interest_rate).toFixed(2)}%
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {parameters.interest_type === 'FIXED' ? 'Fija' : parameters.interest_type === 'VARIABLE' ? 'Variable' : 'Mixta'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-2">Comisión</p>
                  <p className="text-lg font-bold text-slate-900">
                    {parseFloat(parameters.commission_rate_min).toFixed(2)}% - {parseFloat(parameters.commission_rate_max).toFixed(2)}%
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-2">Seguro</p>
                  <p className="text-lg font-bold text-slate-900">
                    {parseFloat(parameters.insurance_rate_min).toFixed(2)}% - {parseFloat(parameters.insurance_rate_max).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pago Anticipado */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Pago Anticipado
            </h2>
            <div className="flex items-center gap-3 mb-4">
              {parameters.allows_early_payment ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-slate-700">Permite pago anticipado</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-slate-700">No permite pago anticipado</span>
                </>
              )}
            </div>
            {parameters.allows_early_payment && (
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Penalidad por Pago Anticipado</p>
                <p className="text-lg font-bold text-slate-900">
                  {parseFloat(parameters.early_payment_penalty_min).toFixed(2)}% - {parseFloat(parameters.early_payment_penalty_max).toFixed(2)}%
                </p>
              </div>
            )}
          </div>

          {/* Elegibilidad */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              Requisitos de Elegibilidad
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parameters.min_income_required && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Ingreso Mínimo Requerido</p>
                  <p className="text-lg font-bold text-slate-900">
                    Bs {parseFloat(parameters.min_income_required).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              {parameters.max_debt_to_income_ratio && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Ratio Deuda/Ingreso Máximo</p>
                  <p className="text-lg font-bold text-slate-900">
                    {parseFloat(parameters.max_debt_to_income_ratio).toFixed(2)}%
                  </p>
                </div>
              )}
              {parameters.min_employment_months && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Meses Mínimos de Empleo</p>
                  <p className="text-lg font-bold text-slate-900">
                    {parameters.min_employment_months} meses
                  </p>
                </div>
              )}
              {parameters.min_credit_score_required && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Score Mínimo Requerido</p>
                  <p className="text-lg font-bold text-slate-900">
                    {parameters.min_credit_score_required}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Garantías */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Garantías
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {parameters.requires_guarantor ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-slate-700">Requiere garante</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-500">No requiere garante</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                {parameters.requires_collateral ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-slate-700">Requiere garantía colateral</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-500">No requiere garantía colateral</span>
                  </>
                )}
              </div>
              {parameters.min_collateral_coverage && (
                <div className="bg-slate-50 rounded-lg p-4 mt-3">
                  <p className="text-sm text-slate-600 mb-1">Cobertura Mínima de Garantía</p>
                  <p className="text-lg font-bold text-slate-900">
                    {parseFloat(parameters.min_collateral_coverage).toFixed(2)}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Aprobación Automática */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Aprobación Automática
            </h2>
            <div className="flex items-center gap-3 mb-4">
              {parameters.auto_approval_enabled ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-slate-700">Aprobación automática habilitada</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-slate-700">Aprobación automática deshabilitada</span>
                </>
              )}
            </div>
            {parameters.auto_approval_enabled && parameters.max_auto_approval_amount && (
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Monto Máximo para Aprobación Automática</p>
                <p className="text-lg font-bold text-slate-900">
                  Bs {parseFloat(parameters.max_auto_approval_amount).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>

          {/* Catálogos Permitidos */}
          {(parameters.allowed_currencies_detail || parameters.allowed_payment_frequencies_detail || parameters.allowed_amortization_systems_detail) && (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Opciones Permitidas</h2>
              <div className="space-y-4">
                {parameters.allowed_currencies_detail && parameters.allowed_currencies_detail.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Monedas</p>
                    <div className="flex flex-wrap gap-2">
                      {parameters.allowed_currencies_detail.map((currency) => (
                        <span key={currency.id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {currency.code} - {currency.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {parameters.allowed_payment_frequencies_detail && parameters.allowed_payment_frequencies_detail.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Frecuencias de Pago</p>
                    <div className="flex flex-wrap gap-2">
                      {parameters.allowed_payment_frequencies_detail.map((freq) => (
                        <span key={freq.id} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {freq.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {parameters.allowed_amortization_systems_detail && parameters.allowed_amortization_systems_detail.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Sistemas de Amortización</p>
                    <div className="flex flex-wrap gap-2">
                      {parameters.allowed_amortization_systems_detail.map((system) => (
                        <span key={system.id} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {system.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
        >
          Volver a Productos
        </button>
        {!hasParameters && (
          <button
            onClick={() => navigate('/rules')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Ir a Reglas de Crédito
          </button>
        )}
      </div>
    </div>
  );
}
