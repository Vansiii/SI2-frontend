import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ variant = 'info', children, onClose, className = '' }: AlertProps) {
  const variantConfig = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      icon: <Info className="h-5 w-5 text-blue-600" />,
    },
  };

  const config = variantConfig[variant];

  return (
    <div
      className={`rounded-lg border ${config.borderColor} ${config.bgColor} px-4 py-3 ${className}`}
      role="alert"
    >
      <div className="flex">
        <div className="shrink-0">{config.icon}</div>
        <div className={`ml-3 flex-1 ${config.textColor} text-sm`}>{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 shrink-0 ${config.textColor} hover:opacity-75 transition-opacity`}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
