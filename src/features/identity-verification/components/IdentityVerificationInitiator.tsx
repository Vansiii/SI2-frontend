/**
 * Componente para iniciar verificación de identidad
 */

import { useState, useCallback } from 'react';
import type { StartVerificationRequest } from '../types/identityVerification';
import { useIdentityVerification, useIdentityVerificationPolling } from '../hooks/useIdentityVerification';

interface IdentityVerificationInitiatorProps {
  creditApplicationId?: number | null;
  branchId?: number | null;
  returnUrl?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * Componente que maneja la iniciación y flujo de verificación
 */
export function IdentityVerificationInitiator({
  creditApplicationId = null,
  branchId = null,
  returnUrl = typeof window !== 'undefined' ? window.location.href : undefined,
  onSuccess,
  onError,
  className = '',
}: IdentityVerificationInitiatorProps) {
  const { startVerification, refreshVerification, loading: baseLoading } =
    useIdentityVerification();
  const [isStarting, setIsStarting] = useState(false);
  const [verificationId, setVerificationId] = useState<number | null>(null);
  const { isPolling, startPolling, stopPolling, verification: polledVerification } =
    useIdentityVerificationPolling(verificationId, 5000, 60);

  /**
   * Iniciar el proceso de verificación
   */
  const handleStartVerification = useCallback(async () => {
    setIsStarting(true);
    try {
      const request: StartVerificationRequest = {
        credit_application_id: creditApplicationId || undefined,
        branch_id: branchId || undefined,
        return_url: returnUrl,
      };

      const result = await startVerification(request);

      if (!result) {
        onError?.('No se pudo iniciar la verificación');
        return;
      }

      setVerificationId(result.id);

      // Abrir el URL de Didit en una nueva ventana/pestaña
      if (result.verification_url) {
        window.open(result.verification_url, '_blank');
        // Comenzar a hacer polling del estado
        startPolling();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      onError?.(`Error: ${message}`);
      console.error('Error starting verification:', error);
    } finally {
      setIsStarting(false);
    }
  }, [creditApplicationId, branchId, returnUrl, startVerification, onError, startPolling]);

  /**
   * Refrescar manualmente el estado
   */
  const handleRefresh = useCallback(async () => {
    if (verificationId) {
      try {
        await refreshVerification();
        
        // Si ya está completado, detener polling
        if (polledVerification?.status !== 'PENDING' && polledVerification?.status !== 'IN_PROGRESS') {
          stopPolling();
          if (polledVerification?.status === 'APPROVED') {
            onSuccess?.();
          }
        }
      } catch (error) {
        console.error('Error refreshing verification:', error);
      }
    }
  }, [verificationId, refreshVerification, polledVerification, stopPolling, onSuccess]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Botón para iniciar */}
      {!verificationId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Verificación de Identidad</h3>
          <p className="text-blue-800 text-sm mb-4">
            Es necesario verificar tu identidad para continuar. Haz clic en el botón para iniciar el
            proceso.
          </p>
          <button
            onClick={handleStartVerification}
            disabled={isStarting || baseLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isStarting || baseLoading ? (
              <>
                <svg
                  className="inline w-4 h-4 mr-2 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Iniciando...
              </>
            ) : (
              'Iniciar Verificación'
            )}
          </button>
        </div>
      )}

      {/* Verificación en progreso */}
      {verificationId && isPolling && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Verificación en Progreso</h3>
          <p className="text-yellow-800 text-sm mb-4">
            Hemos abierto Didit en una nueva pestaña. Por favor, completa el proceso y regresa cuando
            hayas terminado.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="bg-yellow-600 text-white px-4 py-2 rounded font-medium hover:bg-yellow-700 transition"
            >
              Ya Completé
            </button>
            <button
              onClick={() => stopPolling()}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default IdentityVerificationInitiator;
