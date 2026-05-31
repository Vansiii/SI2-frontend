/**
 * Visor principal del contrato con PDF embebido
 */

import React, { useState, useEffect } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { contractsApi } from '../services/contractsApi';
import type { Contract } from '../types';

interface Props {
  contract: Contract;
  onSignClick?: () => void;
  showSignButton?: boolean;
}

export const ContractViewer: React.FC<Props> = ({
  contract,
  onSignClick,
  showSignButton = false,
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true);
      setError(null);

      try {
        const html = await contractsApi.preview(contract.id);
        setHtmlContent(html);
      } catch (err) {
        setError('Error al cargar la vista previa del contrato');
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [contract.id]);

  const handleDownload = async () => {
    try {
      const blob = await contractsApi.downloadPDF(contract.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrato-${contract.contract_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error al descargar el PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <div className="text-center">
          <FileText className="w-12 h-12 text-red-400 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Barra de acciones */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Contrato {contract.contract_number}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </button>
          {showSignButton && onSignClick && (
            <button
              onClick={onSignClick}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Firmar Contrato
            </button>
          )}
        </div>
      </div>

      {/* Contenido del contrato */}
      <div className="p-6 max-h-[800px] overflow-y-auto">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};
