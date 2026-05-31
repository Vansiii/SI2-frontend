/**
 * Card con resumen de pagos del contrato
 */

import React from 'react';
import { CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import type { PaymentSummary } from '../types';

interface Props {
  summary: PaymentSummary;
}

export const PaymentSummaryCard: React.FC<Props> = ({ summary }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Pagos</h3>

      {/* Progreso */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progreso de Pagos</span>
          <span className="font-medium">{summary.completion_percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all"
            style={{ width: `${summary.completion_percentage}%` }}
          />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Pagados</p>
              <p className="text-2xl font-bold text-green-700">{summary.paid_payments}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">
            Bs. {parseFloat(summary.total_paid).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-700">{summary.pending_payments}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-xs text-yellow-600 mt-2">
            Bs. {parseFloat(summary.total_pending).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {summary.overdue_payments > 0 && (
          <div className="bg-red-50 rounded-lg p-4 col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Vencidos</p>
                <p className="text-2xl font-bold text-red-700">{summary.overdue_payments}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        )}
      </div>

      {/* Próximo pago */}
      {summary.next_payment_date && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Próximo Pago</p>
              <p className="text-sm text-gray-600">
                Cuota #{summary.next_payment_number} -{' '}
                {new Date(summary.next_payment_date).toLocaleDateString('es-BO')}
              </p>
              <p className="text-lg font-bold text-blue-600 mt-1">
                Bs. {parseFloat(summary.next_payment_amount || '0').toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Total de cuotas */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total de Cuotas</span>
          <span className="font-medium text-gray-900">{summary.total_payments}</span>
        </div>
      </div>
    </div>
  );
};
