/**
 * Tabla de amortización del contrato
 */

import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { AmortizationScheduleItem } from '../types';

interface Props {
  schedule: AmortizationScheduleItem[];
}

export const AmortizationTable: React.FC<Props> = ({ schedule }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha Venc.
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Capital
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Interés
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cuota Total
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Saldo
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {schedule.map((item) => (
            <tr
              key={item.id}
              className={`
                ${item.is_paid ? 'bg-green-50' : ''}
                ${item.is_overdue ? 'bg-red-50' : ''}
                hover:bg-gray-50 transition-colors
              `}
            >
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.payment_number}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                {new Date(item.due_date).toLocaleDateString('es-BO')}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                Bs. {parseFloat(item.principal_amount).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                Bs. {parseFloat(item.interest_amount).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                Bs. {parseFloat(item.total_payment).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                Bs. {parseFloat(item.remaining_balance).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center">
                {item.is_paid ? (
                  <span className="inline-flex items-center text-xs text-green-700">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Pagado
                  </span>
                ) : item.is_overdue ? (
                  <span className="inline-flex items-center text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Vencido ({item.days_overdue}d)
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    Pendiente
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
