/**
 * Modal para firmar un contrato digitalmente
 */

import React, { useState } from 'react';
import { X, AlertCircle, Lock, CheckCircle } from 'lucide-react';
import { contractsApi } from '../services/contractsApi';
import type { Contract } from '../types';

interface Props {
  contract: Contract;
  onClose: () => void;
  onSuccess: () => void;
}

export const ContractSignatureModal: React.FC<Props> = ({
  contract,
  onClose,
  onSuccess,
}) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDeviceInfo = () => {
    return {
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen_resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      browser: getBrowserInfo(),
    };
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const getGeolocation = (): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  };

  const handleSign = async () => {
    if (!acceptedTerms) {
      setError('Debe aceptar los términos y condiciones para continuar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Capturar información del dispositivo
      const deviceInfo = getDeviceInfo();

      // Intentar obtener geolocalización (opcional)
      const position = await getGeolocation();
      const geolocation = position
        ? {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }
        : undefined;

      // Firmar contrato
      await contractsApi.sign(contract.id, {
        signature_method: 'DIGITAL',
        signature_data: 'acepto_firmar_este_contrato',
        device_info: deviceInfo,
        geolocation,
        verification_method: 'identity_verified',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al firmar el contrato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Firmar Contrato</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información del contrato */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              Contrato No. {contract.contract_number}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Cliente:</span>{' '}
                {contract.loan_application.client_name}
              </div>
              <div>
                <span className="font-medium">Monto:</span> Bs.{' '}
                {parseFloat(contract.principal_amount).toLocaleString('es-BO')}
              </div>
              <div>
                <span className="font-medium">Plazo:</span> {contract.term_months}{' '}
                meses
              </div>
              <div>
                <span className="font-medium">Tasa:</span> {contract.interest_rate}%
              </div>
            </div>
          </div>

          {/* Vista previa del PDF */}
          {contract.pdf_url && (
            <div className="border rounded-lg overflow-hidden">
              <iframe
                src={contract.pdf_url}
                className="w-full h-96"
                title="Vista previa del contrato"
              />
            </div>
          )}

          {/* Términos y condiciones */}
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">
                He leído y acepto los términos y condiciones de este contrato.
                Entiendo que al firmar digitalmente estoy aceptando todos los
                términos establecidos y que esta firma tiene validez legal.
              </span>
            </label>
          </div>

          {/* Información de seguridad */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Información de seguridad
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Su firma será registrada con fecha y hora exacta</li>
                  <li>• Se registrará su dirección IP y dispositivo</li>
                  <li>• Esta acción no puede ser revertida</li>
                  <li>• El documento quedará legalmente vinculante</li>
                  <li>• Se generará un hash de integridad del documento</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSign}
            disabled={!acceptedTerms || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Firmando...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Firmar Contrato</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
