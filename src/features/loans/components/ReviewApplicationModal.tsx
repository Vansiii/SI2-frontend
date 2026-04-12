/**
 * Modal para revisar y evaluar solicitud de crédito
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { reviewLoanApplication, calculateLoanScore, type ReviewLoanApplicationData } from '../services/loansApi';

interface FormData {
  credit_score?: number;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  debt_to_income_ratio?: string;
  notes?: string;
}

interface ReviewApplicationModalProps {
  applicationId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewApplicationModal({ applicationId, onClose, onSuccess }: ReviewApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [calculatingScore, setCalculatingScore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>();

  const watchedValues = watch();

  const handleCalculateScore = async () => {
    try {
      setCalculatingScore(true);
      setError(null);
      
      const result = await calculateLoanScore(applicationId);
      
      if (result.credit_score) {
        setValue('credit_score', result.credit_score);
      }
      if (result.risk_level) {
        setValue('risk_level', result.risk_level as 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH');
      }
      if (result.debt_to_income_ratio) {
        setValue('debt_to_income_ratio', result.debt_to_income_ratio.toString());
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al calcular el score');
    } finally {
      setCalculatingScore(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Filtrar campos vacíos
      const reviewData: ReviewLoanApplicationData = {};
      if (data.credit_score !== undefined) reviewData.credit_score = data.credit_score;
      if (data.risk_level) reviewData.risk_level = data.risk_level;
      if (data.debt_to_income_ratio) reviewData.debt_to_income_ratio = data.debt_to_income_ratio;
      if (data.notes) reviewData.notes = data.notes;
      
      await reviewLoanApplication(applicationId, reviewData);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al revisar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Revisar Solicitud</h3>
              <p className="text-sm text-gray-500">Evalúa la solicitud y actualiza la información de riesgo</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Cálculo Automático */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-purple-900">Cálculo Automático de Score</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Calcula automáticamente el score crediticio y nivel de riesgo
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCalculateScore}
                  disabled={calculatingScore}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
                >
                  {calculatingScore ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculando...
                    </>
                  ) : (
                    'Calcular Score'
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Crediticio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score Crediticio
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  {...register('credit_score', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="0 - 1000"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Puntaje de 0 a 1000 puntos
                </p>
                {errors.credit_score && (
                  <p className="mt-1 text-sm text-red-600">{errors.credit_score.message}</p>
                )}
              </div>

              {/* Nivel de Riesgo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de Riesgo
                </label>
                <select
                  {...register('risk_level')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="">Seleccionar nivel</option>
                  <option value="LOW">Bajo</option>
                  <option value="MEDIUM">Medio</option>
                  <option value="HIGH">Alto</option>
                  <option value="VERY_HIGH">Muy Alto</option>
                </select>
                {errors.risk_level && (
                  <p className="mt-1 text-sm text-red-600">{errors.risk_level.message}</p>
                )}
              </div>
            </div>

            {/* Ratio Deuda/Ingreso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ratio Deuda/Ingreso (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                {...register('debt_to_income_ratio')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="0.0"
              />
              <p className="mt-1 text-xs text-gray-500">
                Porcentaje de ingresos comprometidos con deudas
              </p>
              {errors.debt_to_income_ratio && (
                <p className="mt-1 text-sm text-red-600">{errors.debt_to_income_ratio.message}</p>
              )}
            </div>

            {/* Notas de Evaluación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas de Evaluación
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Observaciones sobre la evaluación de la solicitud..."
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>

            {/* Resumen de Evaluación */}
            {(watchedValues.credit_score || watchedValues.risk_level) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Resumen de Evaluación</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {watchedValues.credit_score && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {watchedValues.credit_score}
                      </div>
                      <div className="text-sm text-gray-500">Score</div>
                    </div>
                  )}
                  
                  {watchedValues.risk_level && (
                    <div className="text-center">
                      <div className={`text-lg font-medium ${
                        watchedValues.risk_level === 'LOW' ? 'text-green-600' :
                        watchedValues.risk_level === 'MEDIUM' ? 'text-yellow-600' :
                        watchedValues.risk_level === 'HIGH' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {watchedValues.risk_level === 'LOW' ? 'Bajo' :
                         watchedValues.risk_level === 'MEDIUM' ? 'Medio' :
                         watchedValues.risk_level === 'HIGH' ? 'Alto' : 'Muy Alto'}
                      </div>
                      <div className="text-sm text-gray-500">Riesgo</div>
                    </div>
                  )}
                  
                  {watchedValues.debt_to_income_ratio && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {parseFloat(watchedValues.debt_to_income_ratio).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">Deuda/Ingreso</div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar Evaluación'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}