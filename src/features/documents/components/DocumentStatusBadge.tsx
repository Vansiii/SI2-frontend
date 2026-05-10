import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { CheckCircle, XCircle, Clock, Upload, Eye } from 'lucide-react';

interface DocumentStatusBadgeProps {
  status: 'PENDING' | 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const STATUS_CONFIG = {
  PENDING: {
    variant: 'secondary' as const,
    icon: Upload,
    label: 'Pendiente',
  },
  UPLOADED: {
    variant: 'info' as const,
    icon: Clock,
    label: 'Cargado',
  },
  UNDER_REVIEW: {
    variant: 'warning' as const,
    icon: Eye,
    label: 'En Revisión',
  },
  APPROVED: {
    variant: 'success' as const,
    icon: CheckCircle,
    label: 'Aprobado',
  },
  REJECTED: {
    variant: 'error' as const,
    icon: XCircle,
    label: 'Rechazado',
  },
};

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} size={size} className={className}>
      <span className="inline-flex items-center gap-1.5">
        {showIcon && <Icon className="h-3.5 w-3.5" />}
        {config.label}
      </span>
    </Badge>
  );
};
