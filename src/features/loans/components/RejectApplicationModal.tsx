/**
 * Modal para rechazar solicitud de crédito
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { rejectLoanApplication, type RejectLoanApplicationData } from '../services/loansApi';

interface FormData {
  rejection_reason: string;
}

interface RejectApplicationModalProps {
  applicationId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_REJECTION_REASONS = [
  'Ingresos insuficientes para el monto solicitado',
  'Historial crediticio negativo',
  'Documentación incompleta o inconsistente',
  'Ratio deuda/ingreso muy alto',
  'No cumple con las políticas de crédito',
  'Información falsa o fraudulenta',
  'Cliente en centrales de riesgo',
  'Capacidad de pago insuficiente',
  'Garantías inadecuadas',
  'Otro motivo (especificar)',
];

export function RejectApplicationModal({ applicationId, onClose, onSuccess }: RejectApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>();

  const watchedReason = watch('rejection_reason');

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    if (reason !== 'Otro motivo (especificar)') {
      setValue('rejection_reason', reason);
    } else {
      setValue('rejection_reason', '');
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const rejectData: RejectLoanApplicationData = {
        rejection_reason: data.rejection_reason,
      };
      
      await rejectLoanApplication(applicationId, rejectData);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al rechazar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Rechazar Solicitud</h3>
              <p className="text-sm text-gray-500">Especifica el motivo del rechazo</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Motivos Comunes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Motivos Comunes de Rechazo
              </label>
              <div className="space-y-2">
                {COMMON_REJECTION_REASONS.map((reason, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleReasonSelect(reason)}
                    className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${
                      selectedReason === reason
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        selectedReason === reason
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedReason === reason && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                      <span className="text-sm">{reason}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Motivo Detallado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de Rechazo Detallado *
              </label>
              <textarea
                {...register('rejection_reason')}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={
                  selectedReason === 'Otro motivo (especificar)'
                    ? 'Especifica el motivo del rechazo...'
                    : 'Puedes agregar detalles adicionales al motivo seleccionado...'
                }
              />
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 10 caracteres. Sé específico para ayudar al cliente a entender el rechazo.
              </p>
              {errors.rejection_reason && (
                <p className="mt-1 text-sm text-red-600">{errors.rejection_reason.message}</p>
              )}
            </div>

            {/* Vista previa del motivo */}
            {watchedReason && watchedReason.length >= 10 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Vista Previa del Motivo</h4>
                <p className="text-sm text-red-800 bg-white rounded p-3 border">
                  {watchedReason}
                </p>
              </div>
            )}

            {/* Advertencia */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Confirmación de Rechazo</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Una vez rechazada, la solicitud pasará a estado "Rechazada" y el cliente será notificado.
                    Esta acción no se puede deshacer fácilmente.
                  </p>
                </div>
              </div>
            </div>

            {/* Impacto del Rechazo */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Impacto del Rechazo</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• La solicitud se marcará como "Rechazada"</li>
                <li>• El cliente recibirá una notificación con el motivo</li>
                <li>• Se registrará en el historial del cliente</li>
                <li>• El cliente podrá presentar una nueva solicitud en el futuro</li>
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
                disabled={loading || !watchedReason || watchedReason.length < 10}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Rechazando...
                  </>
                ) : (
                  'Rechazar Solicitud'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}