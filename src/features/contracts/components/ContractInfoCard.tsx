/**
 * Card para mostrar información del contrato en la página de detalle de préstamo
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ContractStatusBadge } from './ContractStatusBadge';
import type { Contract } from '../types';

interface Props {
  contract: Contract;
  onDownloadPDF?: () => void;
}

export const ContractInfoCard: React.FC<Props> = ({ contract, onDownloadPDF }) => {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Contrato {contract.contract_number}
            </h3>
            <p className="text-sm text-gray-500">
              Generado el {new Date(contract.created_at).toLocaleDateString('es-BO')}
            </p>
          </div>
        </div>
        <ContractStatusBadge status={contract.status} />
      </div>

      {/* Información financiera */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Monto</p>
          <p className="text-sm font-semibold text-gray-900">
            Bs. {parseFloat(contract.principal_amount).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Plazo</p>
          <p className="text-sm font-semibold text-gray-900">
            {contract.term_months} meses
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Tasa</p>
          <p className="text-sm font-semibold text-gray-900">
            {contract.interest_rate}% anual
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Cuota Mensual</p>
          <p className="text-sm font-semibold text-gray-900">
            Bs. {parseFloat(contract.monthly_payment).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Estado de firmas */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Estado de Firmas</span>
          {contract.all_signatures_complete ? (
            <span className="inline-flex items-center text-xs text-green-700">
              <CheckCircle className="w-4 h-4 mr-1" />
              Completas
            </span>
          ) : (
            <span className="inline-flex items-center text-xs text-yellow-700">
              <Clock className="w-4 h-4 mr-1" />
              {contract.pending_signatures.length} pendiente(s)
            </span>
          )}
        </div>
        {contract.pending_signatures.length > 0 && (
          <div className="mt-2 space-y-1">
            {contract.pending_signatures.map((pending, index) => (
              <div key={index} className="text-xs text-gray-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1 text-yellow-500" />
                Pendiente: {pending.name} ({pending.type})
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex space-x-2">
        <Link
          to={`/contracts/${contract.id}`}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalle
        </Link>
        {contract.pdf_url && onDownloadPDF && (
          <button
            onClick={onDownloadPDF}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </button>
        )}
      </div>
    </div>
  );
};
