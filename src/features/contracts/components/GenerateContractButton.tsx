/**
 * Botón para generar contrato desde solicitud aprobada
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2 } from 'lucide-react';
import { useGenerateContract } from '../hooks/useContract';
import type { ContractCreateRequest } from '../types';

interface Props {
  loanApplicationId: number;
  loanApplicationNumber: string;
  disabled?: boolean;
  className?: string;
}

export const GenerateContractButton: React.FC<Props> = ({
  loanApplicationId,
  loanApplicationNumber: _loanApplicationNumber,
  disabled = false,
  className = '',
}) => {
  const navigate = useNavigate();
  const { generateContract, loading, error } = useGenerateContract();
  const [showError, setShowError] = useState(false);

  const handleGenerate = async () => {
    setShowError(false);

    const data: ContractCreateRequest = {
      loan_application_id: loanApplicationId,
    };

    const contract = await generateContract(data);

    if (contract) {
      // Redirigir al detalle del contrato generado
      navigate(`/contracts/${contract.id}`);
    } else {
      setShowError(true);
    }
  };

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Generar Contrato
          </>
        )}
      </button>

      {showError && error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};
