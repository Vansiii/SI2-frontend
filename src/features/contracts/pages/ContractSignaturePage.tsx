/**
 * Página dedicada para firmar un contrato
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, CheckCircle } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { useSignContract } from '../hooks/useContractSignature';
import { ContractViewer } from '../components/ContractViewer';
import { LoadingState } from '../../../components/ui/LoadingState';

export function ContractSignaturePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contract, loading, error } = useContract(id ? parseInt(id) : undefined);
  const { signContract, loading: signing, error: signError } = useSignContract();

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [_pin, _setPin] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const getDeviceInfo = () => {
    return {
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen_resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
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
    if (!contract || !acceptedTerms) return;

    const deviceInfo = getDeviceInfo();
    const position = await getGeolocation();
    const geolocation = position
      ? {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }
      : undefined;

    const success = await signContract(contract.id, {
      signature_method: 'DIGITAL',
      signature_data: 'acepto_firmar_este_contrato',
      device_info: deviceInfo,
      geolocation,
      verification_method: 'identity_verified',
    });

    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate(`/contracts/${contract.id}`);
      }, 2000);
    }
  };

  if (loading) {
    return <LoadingState message="Cargando contrato..." fullScreen={true} />;
  }

  if (error || !contract) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
          {error || 'Contrato no encontrado'}
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Contrato Firmado Exitosamente!
          </h2>
          <p className="text-gray-600">
            Redirigiendo al detalle del contrato...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/contracts/${contract.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al contrato
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Firmar Contrato {contract.contract_number}
          </h1>
          <p className="text-gray-600 mt-2">
            Por favor, revise cuidadosamente el contrato antes de firmarlo
          </p>
        </div>

        {/* Visor del contrato */}
        <div className="mb-6">
          <ContractViewer contract={contract} />
        </div>

        {/* Sección de firma */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="flex items-start space-x-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Información de Seguridad
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Su firma será registrada con fecha y hora exacta</li>
                <li>• Se registrará su dirección IP y dispositivo</li>
                <li>• Esta acción no puede ser revertida</li>
                <li>• El documento quedará legalmente vinculante</li>
              </ul>
            </div>
          </div>

          {/* Términos y condiciones */}
          <div className="space-y-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={signing}
              />
              <span className="text-sm text-gray-700">
                He leído y acepto los términos y condiciones de este contrato.
                Entiendo que al firmar digitalmente estoy aceptando todos los
                términos establecidos y que esta firma tiene validez legal.
              </span>
            </label>
          </div>

          {/* Error */}
          {signError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{signError}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Link
              to={`/contracts/${contract.id}`}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </Link>
            <button
              onClick={handleSign}
              disabled={!acceptedTerms || signing}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {signing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Firmando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Firmar Contrato</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
