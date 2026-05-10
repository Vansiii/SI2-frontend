import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  UserCheck,
  TrendingUp,
  Eye,
  DollarSign
} from 'lucide-react';

interface ApplicationStatusProps {
  status: string;
  statusDisplay?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const STATUS_CONFIG = {
  DRAFT: {
    variant: 'secondary' as const,
    icon: FileText,
    label: 'Borrador',
  },
  SUBMITTED: {
    variant: 'info' as const,
    icon: Clock,
    label: 'Enviada',
  },
  DOCUMENTS: {
    variant: 'warning' as const,
    icon: FileText,
    label: 'Documentación',
  },
  KYC: {
    variant: 'warning' as const,
    icon: UserCheck,
    label: 'Verificación',
  },
  SCORING: {
    variant: 'info' as const,
    icon: TrendingUp,
    label: 'Evaluación',
  },
  REVIEW: {
    variant: 'warning' as const,
    icon: Eye,
    label: 'Revisión',
  },
  APPROVED: {
    variant: 'success' as const,
    icon: CheckCircle,
    label: 'Aprobada',
  },
  REJECTED: {
    variant: 'error' as const,
    icon: XCircle,
    label: 'Rechazada',
  },
  DISBURSED: {
    variant: 'success' as const,
    icon: DollarSign,
    label: 'Desembolsada',
  },
  DEFAULT: {
    variant: 'default' as const,
    icon: AlertCircle,
    label: 'Desconocido',
  },
};

export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({
  status,
  statusDisplay,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.DEFAULT;
  const Icon = config.icon;
  const label = statusDisplay || config.label;

  return (
    <Badge variant={config.variant} size={size} className={className}>
      <span className="inline-flex items-center gap-1.5">
        {showIcon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
    </Badge>
  );
};

interface ApplicationStatusCardProps {
  status: string;
  statusDisplay?: string;
  message?: string;
  requiresAction?: boolean;
  className?: string;
}

export const ApplicationStatusCard: React.FC<ApplicationStatusCardProps> = ({
  status,
  statusDisplay,
  message,
  requiresAction = false,
  className = '',
}) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.DEFAULT;
  const Icon = config.icon;
  const label = statusDisplay || config.label;

  const getBackgroundColor = () => {
    switch (config.variant) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconColor = () => {
    switch (config.variant) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getBackgroundColor()} ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          <Icon className="h-6 w-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{label}</h3>
            {requiresAction && (
              <Badge variant="warning" size="sm">
                Acción requerida
              </Badge>
            )}
          </div>
          
          {message && (
            <p className="text-sm text-gray-700">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};
