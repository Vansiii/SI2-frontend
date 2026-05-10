/**
 * Componente de alerta de éxito
 */
import { CheckCircle, X } from 'lucide-react';

interface SuccessAlertProps {
  message: string;
  onDismiss?: () => void;
}

export function SuccessAlert({ message, onDismiss }: SuccessAlertProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-green-800">Éxito</h3>
          <p className="mt-1 text-sm text-green-700">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 flex-shrink-0 text-green-600 hover:text-green-800"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
