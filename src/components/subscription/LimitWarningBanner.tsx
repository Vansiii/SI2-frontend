/**
 * Banner de advertencia cuando se está cerca del límite de un recurso
 */

import { useNavigate } from 'react-router-dom';

interface LimitWarningBannerProps {
  resourceType: string;
  currentUsage: number;
  maxLimit: number;
  usagePercentage: number;
  onClose?: () => void;
}

export function LimitWarningBanner({
  resourceType,
  currentUsage,
  maxLimit,
  usagePercentage,
  onClose,
}: LimitWarningBannerProps) {
  const navigate = useNavigate();

  const getColorClasses = () => {
    if (usagePercentage >= 100) {
      return 'bg-red-50 border-red-200 text-red-900';
    }
    if (usagePercentage >= 90) {
      return 'bg-orange-50 border-orange-200 text-orange-900';
    }
    return 'bg-yellow-50 border-yellow-200 text-yellow-900';
  };

  const getIcon = () => {
    if (usagePercentage >= 100) {
      return (
        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  const getMessage = () => {
    if (usagePercentage >= 100) {
      return `Has alcanzado el límite de ${resourceType} (${maxLimit}). Actualiza tu plan para continuar.`;
    }
    if (usagePercentage >= 90) {
      return `Estás muy cerca del límite de ${resourceType} (${currentUsage}/${maxLimit}). Actualiza tu plan pronto.`;
    }
    return `Estás acercándote al límite de ${resourceType} (${currentUsage}/${maxLimit}).`;
  };

  return (
    <div className={`border rounded-lg p-4 mb-6 ${getColorClasses()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{getMessage()}</p>
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => navigate('/subscription/plans')}
              className="text-sm font-medium underline hover:no-underline"
            >
              Ver Planes
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-sm font-medium underline hover:no-underline"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
