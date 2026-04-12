/**
 * Modal para desembolsar solicitud de crédito aprobada
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { disburseLoanApplication, type DisburseLoanApplicationData, type LoanApplication } from '../services/loansApi';

interface FormData {
  notes?: string;
}

interface DisburseApplicationModalProps {
  applicationId: number;
  application: LoanApplication;
  onClose: () => void;
  onSuccess: () => void;
}

export function DisburseApplicationModal({ applicationId, application, onClose, onSuccess }: DisburseApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const disburseData: DisburseLoanApplicationData = {
        notes: data.notes,
      };
      
      await disburseLoanApplication(applicationId, disburseData);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al desembolsar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Desembolsar Crédito</h3>
              <p className="text-sm text-gray-500">Confirma el desembolso del crédito aprobado</p>
            </div>
          </div>

          {/* Resumen del Crédito Aprobado */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
            <h4 className="font-medium text-emerald-900 mb-4">Resumen del Crédito Aprobado</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-emerald-800 mb-3">Información del Cliente</h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-emerald-700">Nombre:</span>
                    <p className="font-medium text-emerald-900">{application.client_detail?.full_name}</p>
                  </div>
                  <div>
                    <span className="text-emerald-700">Documento:</span>
                    <p className="font-medium text-emerald-900">{application.client_detail?.document_number}</p>
                  </div>
                  <div>
                    <span className="text-emerald-700">Email:</span>
                    <p className="font-medium text-emerald-900">{application.client_detail?.email}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-emerald-800 mb-3">Términos Aprobados</h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-emerald-700">Monto:</span>
                    <p className="font-medium text-emerald-900">
                      ${parseFloat(application.approved_amount || application.requested_amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-emerald-700">Plazo:</span>
                    <p className="font-medium text-emerald-900">
                      {application.approved_term_months || application.term_months} meses
                    </p>
                  </div>
                  <div>
                    <span className="text-emerald-700">Tasa:</span>
                    <p className="font-medium text-emerald-900">
                      {application.approved_interest_rate || application.product_detail?.interest_rate}% anual
                    </p>
                  </div>
                  {application.monthly_payment && (
                    <div>
                      <span className="text-emerald-700">Cuota Mensual:</span>
                      <p className="font-medium text-emerald-900">
                        ${parseFloat(application.monthly_payment).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Checklist de Verificación */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Checklist de Verificación</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" required className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-blue-800">
                    Documentación completa y verificada
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" required className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-blue-800">
                    Términos y condiciones aceptados por el cliente
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" required className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-blue-800">
                    Cuenta bancaria del cliente verificada
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" required className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-blue-800">
                    Aprobaciones internas completadas
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" required className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-blue-800">
                    Sistema de pagos configurado
                  </span>
                </label>
              </div>
            </div>

            {/* Información de Desembolso */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Información de Desembolso</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Fecha de Desembolso:</span>
                  <p className="font-medium text-gray-900">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Método:</span>
                  <p className="font-medium text-gray-900">
                    Transferencia Bancaria
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Tiempo Estimado:</span>
                  <p className="font-medium text-gray-900">
                    24-48 horas hábiles
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Estado:</span>
                  <p className="font-medium text-emerald-600">
                    Listo para Desembolso
                  </p>
                </div>
              </div>
            </div>

            {/* Notas de Desembolso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas de Desembolso (Opcional)
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Observaciones sobre el desembolso, instrucciones especiales, etc..."
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>

            {/* Advertencia Final */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Confirmación Final</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Una vez confirmado el desembolso, se iniciará el proceso de transferencia y 
                    la solicitud pasará a estado "Desembolsada". Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>

            {/* Impacto del Desembolso */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-medium text-emerald-900 mb-2">Después del Desembolso</h4>
              <ul className="text-sm text-emerald-800 space-y-1">
                <li>• Se iniciará el cronograma de pagos</li>
                <li>• El cliente recibirá confirmación del desembolso</li>
                <li>• Se generará el contrato de crédito</li>
                <li>• Se activará el seguimiento de pagos</li>
                <li>• Se registrará en el historial crediticio</li>
              </ul>
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
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  'Confirmar Desembolso'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}