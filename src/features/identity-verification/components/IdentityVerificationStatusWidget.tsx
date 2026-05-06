/**
 * Widget para mostrar el estado de la verificación de identidad
 */

import type {
  IdentityVerification,
} from '../types/identityVerification';
import {
  mapStatusToDisplay,
  getStatusColor,
  isVerificationActive,
  isVerificationApproved,
  isVerificationDeclined,
} from '../types/identityVerification';

interface IdentityVerificationStatusWidgetProps {
  verification: IdentityVerification | null | undefined;
  loading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Widget para mostrar el estado de verificación
 */
export function IdentityVerificationStatusWidget({
  verification,
  loading = false,
  onRefresh,
  className = '',
}: IdentityVerificationStatusWidgetProps) {
  if (!verification) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <p className="text-gray-600 text-sm">No hay verificación de identidad iniciada</p>
      </div>
    );
  }

  const statusDisplay = mapStatusToDisplay(verification.status);
  const statusColor = getStatusColor(verification.status);
  const isActive = isVerificationActive(verification.status);
  const isApproved = isVerificationApproved(verification.status, verification.decision);
  const isDeclined = isVerificationDeclined(verification.status, verification.decision);

  const statusColorMap = {
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    red: 'bg-red-100 text-red-800 border-red-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
  };

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Verificación de Identidad</h3>
        {onRefresh && !loading && (
          <button
            onClick={onRefresh}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Actualizar
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Estado */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-sm font-medium">Estado:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${
              statusColorMap[statusColor]
            }`}
          >
            {statusDisplay}
          </span>
        </div>

        {/* Información de documento */}
        {verification.document_number && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm font-medium">Documento:</span>
            <span className="text-gray-900 text-sm">
              {verification.document_type} - {verification.document_number}
            </span>
          </div>
        )}

        {/* Fecha de inicio */}
        {verification.started_at && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm font-medium">Iniciado:</span>
            <span className="text-gray-900 text-sm">
              {new Date(verification.started_at).toLocaleDateString('es-ES')}
            </span>
          </div>
        )}

        {/* Fecha de finalización */}
        {verification.completed_at && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm font-medium">Completado:</span>
            <span className="text-gray-900 text-sm">
              {new Date(verification.completed_at).toLocaleDateString('es-ES')}
            </span>
          </div>
        )}

        {/* Mensaje de error */}
        {verification.error_message && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-800 text-sm">{verification.error_message}</p>
          </div>
        )}

        {/* Información de resultado */}
        {isApproved && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-green-800 text-sm font-medium">✓ Tu identidad ha sido verificada</p>
          </div>
        )}

        {isDeclined && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-800 text-sm font-medium">✗ Tu identidad no pudo ser verificada</p>
            <p className="text-red-700 text-xs mt-1">
              Por favor, contacta con soporte para más información
            </p>
          </div>
        )}

        {isActive && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-blue-800 text-sm">
              Tu verificación está en progreso. Por favor, completa el proceso en Didit.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center p-3">
            <div className="animate-spin">
              <svg
                className="w-5 h-5 text-blue-600"
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
            </div>
            <span className="ml-2 text-gray-600 text-sm">Actualizando...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default IdentityVerificationStatusWidget;
