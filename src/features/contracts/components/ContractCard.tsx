/**
 * Card para mostrar un contrato en la lista
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ContractStatusBadge } from './ContractStatusBadge';
import type { Contract } from '../types';
import { FileText, Calendar, DollarSign, User, CheckCircle, Clock } from 'lucide-react';

interface Props {
  contract: Contract;
}

export const ContractCard: React.FC<Props> = ({ contract }) => {
  return (
    <Link
      to={`/contracts/${contract.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 p-4"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            {contract.contract_number}
          </h3>
        </div>
        <ContractStatusBadge status={contract.status} />
      </div>

      <div className="space-y-2 text-sm">
        {/* Cliente */}
        <div className="flex items-center text-gray-600">
          <User className="w-4 h-4 mr-2" />
          <span className="font-medium">Cliente:</span>
          <span className="ml-1">{contract.loan_application.client_name}</span>
        </div>

        {/* Monto */}
        <div className="flex items-center text-gray-600">
          <DollarSign className="w-4 h-4 mr-2" />
          <span className="font-medium">Monto:</span>
          <span className="ml-1">Bs. {parseFloat(contract.principal_amount).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
        </div>

        {/* Fecha */}
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="font-medium">Fecha:</span>
          <span className="ml-1">{new Date(contract.contract_date).toLocaleDateString('es-BO')}</span>
        </div>

        {/* Estado de firmas */}
        <div className="flex items-center text-gray-600">
          {contract.all_signatures_complete ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-green-600 font-medium">Todas las firmas completas</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 mr-2 text-yellow-500" />
              <span className="text-yellow-600 font-medium">
                {(contract.pending_signatures || []).length} firma(s) pendiente(s)
              </span>
            </>
          )}
        </div>
      </div>

      {/* Plazo y cuota */}
      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
        <span>{contract.term_months} meses</span>
        <span>Cuota: Bs. {parseFloat(contract.monthly_payment).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
      </div>
    </Link>
  );
};
