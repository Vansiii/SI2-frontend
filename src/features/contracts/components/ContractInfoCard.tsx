/**
 * Card para mostrar información resumida del contrato en la página de préstamo
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { ContractSummary } from '../../loans/types/loan.types';
import { formatCurrency } from '../../../utils/formatters';

interface ContractInfoCardProps {
  contract: ContractSummary;
  onDownloadPDF?: () => void;
}

export const ContractInfoCard: React.FC<ContractInfoCardProps> = ({
  contract,
  onDownloadPDF,
}) => {
  const getStatusIcon = () => {
    switch (contract.status) {
      case 'DRAFT':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'PENDING_SIGNATURE':
      case 'PARTIALLY_SIGNED':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'ACTIVE':
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (contract.status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING_SIGNATURE':
      case 'PARTIALLY_SIGNED':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
      case 'DEFAULTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h4 className="font-semibold text-gray-900">
              Contrato {contract.contract_number}
            </h4>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor()}`}>
              {contract.status_display}
            </span>
          </div>
        </div>
      </div>

      {/* Información Financiera */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Monto Principal</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(parseFloat(contract.principal_amount))}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Cuota Mensual</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(parseFloat(contract.monthly_payment))}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Tasa de Interés</p>
          <p className="text-base font-semibold text-gray-900">
            {contract.interest_rate}% anual
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Plazo</p>
          <p className="text-base font-semibold text-gray-900">
            {contract.term_months} meses
          </p>
        </div>
      </div>

      {/* Estado de Firmas */}
      <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          {contract.all_signatures_complete ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Todas las firmas completas
              </span>
            </>
          ) : contract.is_signed_by_borrower ? (
            <>
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">
                Firmado por el prestatario - Pendiente de otras firmas
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">
                Pendiente de firma del prestatario
              </span>
            </>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <Link
          to={`/contracts/${contract.id}`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Eye className="w-4 h-4" />
          Ver Detalle
        </Link>
        
        {onDownloadPDF && (
          <button
            onClick={onDownloadPDF}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default ContractInfoCard;
