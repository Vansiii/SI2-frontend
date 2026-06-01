/**
 * Botón para generar contrato desde solicitud de préstamo aprobada
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2 } from 'lucide-react';
import { contractsApi } from '../services/contractsApi';
import { toast } from 'react-hot-toast';

interface GenerateContractButtonProps {
  loanApplicationId: number;
  loanApplicationNumber: string;
  className?: string;
  onSuccess?: () => void;
}

export const GenerateContractButton: React.FC<GenerateContractButtonProps> = ({
  loanApplicationId,
<<<<<<< HEAD
  loanApplicationNumber: _loanApplicationNumber,
  disabled = false,
=======
  loanApplicationNumber,
>>>>>>> 4f5d03d (fixer)
  className = '',
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      const contract = await contractsApi.generateFromApplication({
        loan_application_id: loanApplicationId,
      });

      toast.success('Contrato generado exitosamente');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Redirigir a la página de detalle del contrato
      navigate(`/contracts/${contract.id}`);
    } catch (error: any) {
      console.error('Error al generar contrato:', error);
      toast.error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Error al generar el contrato'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-blue-600 text-white rounded-lg
        hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-colors font-medium
        ${className}
      `}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Generando contrato...
        </>
      ) : (
        <>
          <FileText className="w-5 h-5" />
          Generar Contrato
        </>
      )}
    </button>
  );
};

export default GenerateContractButton;
