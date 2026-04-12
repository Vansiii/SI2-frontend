/**
 * Modal para aprobar solicitud de crédito
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { approveLoanApplication, calculateMonthlyPayment, type ApproveLoanApplicationData, type LoanApplication } from '../services/loansApi';

interface FormData {
  approved_amount: string;
  approved_term_months: number;
  approved_interest_rate: string;
  notes?: string;
}

interface ApproveApplicationModalProps {
  applicationId: number;
  application: LoanApplication;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApproveApplicationModal({ applicationId, application, onClose, onSuccess }: ApproveApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      approved_amount: application.requested_amount,
      approved_term_months: application.term_months,
      approved_interest_rate: application.product_detail?.interest_rate || '',
    },
  });

  const watchedValues = watch();

  // Calcular cuota mensual estimada
  const calculateEstimatedPayment = () => {
    if (watchedValues.approved_amount && watchedValues.approved_term_months && watchedValues.approved_interest_rate) {
      const amount = parseFloat(watchedValues.approved_amount);
      const months = watchedValues.approved_term_months;
      const rate = parseFloat(watchedValues.approved_interest_rate);
      
      if (!isNaN(amount) && !isNaN(months) && !isNaN(rate)) {
        return calculateMonthlyPayment(amount, months, rate);
      }
    }
    return null;
  };

  const estimatedPayment = calculateEstimatedPayment();

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const approveData: ApproveLoanApplicationData = {
        approved_amount: data.approved_amount,
        approved_term_months: data.approved_term_months,
        approved_interest_rate: data.approved_interest_rate,
        notes: data.notes,
      };
      
      await approveLoanApplication(applicationId, approveData);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al aprobar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Aprobar Solicitud</h3>
              <p className="text-sm text-gray-500">Define los términos finales de aprobación</p>
            </div>
          </div>

          {/* Información de la Solicitud */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Información de la Solicitud</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Cliente:</span>
                <p className="font-medium text-blue-900">{application.client_detail?.full_name}</p>
              </div>
              <div>
                <span className="text-blue-700">Producto:</span>
                <p className="font-medium text-blue-900">{application.product_detail?.name}</p>
              </div>
              <div>
                <span className="text-blue-700">Monto Solicitado:</span>
                <p className="font-medium text-blue-900">
                  ${parseFloat(application.requested_amount).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-blue-700">Plazo Solicitado:</span>
                <p className="font-medium text-blue-900">{application.term_months} meses</p>
              </div>
              {application.credit_score && (
                <div>
                  <span className="text-blue-700">Score:</span>
                  <p className="font-medium text-blue-900">{application.credit_score}</p>
                </div>
              )}
              {application.risk_level_display && (
                <div>
                  <span className="text-blue-700">Riesgo:</span>
                  <p className="font-medium text-blue-900">{application.risk_level_display}</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monto Aprobado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Aprobado *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    {...register('approved_amount')}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                  />
                </div>
                {application.product_detail && (
                  <p className="mt-1 text-xs text-gray-500">
                    Rango del producto: ${application.product_detail.min_amount} - ${application.product_detail.max_amount}
                  </p>
                )}
                {errors.approved_amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.approved_amount.message}</p>
                )}
              </div>

              {/* Plazo Aprobado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plazo Aprobado (meses) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="360"
                  {...register('approved_term_months', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="12"
                />
                {application.product_detail && (
                  <p className="mt-1 text-xs text-gray-500">
                    Rango del producto: {application.product_detail.min_term_months} - {application.product_detail.max_term_months} meses
                  </p>
                )}
                {errors.approved_term_months && (
                  <p className="mt-1 text-sm text-red-600">{errors.approved_term_months.message}</p>
                )}
              </div>
            </div>

            {/* Tasa de Interés Aprobada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tasa de Interés Aprobada (% anual) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register('approved_interest_rate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0.00"
              />
              {application.product_detail && (
                <p className="mt-1 text-xs text-gray-500">
                  Tasa del producto: {application.product_detail.interest_rate}% anual
                </p>
              )}
              {errors.approved_interest_rate && (
                <p className="mt-1 text-sm text-red-600">{errors.approved_interest_rate.message}</p>
              )}
            </div>

            {/* Cuota Mensual Estimada */}
            {estimatedPayment && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Cuota Mensual Estimada</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-900">
                    ${estimatedPayment.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Cuota mensual con los términos aprobados
                  </p>
                </div>
              </div>
            )}

            {/* Notas de Aprobación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas de Aprobación
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Condiciones especiales, observaciones o términos adicionales..."
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>

            {/* Advertencia */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Confirmación de Aprobación</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Una vez aprobada, la solicitud pasará a estado "Aprobada" y estará lista para desembolso.
                    Verifica que todos los términos sean correctos antes de continuar.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Aprobando...
                  </>
                ) : (
                  'Aprobar Solicitud'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}