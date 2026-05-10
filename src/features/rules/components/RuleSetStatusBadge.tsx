import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { CheckCircle, FileText, Archive } from 'lucide-react';

interface RuleSetStatusBadgeProps {
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const STATUS_CONFIG = {
  DRAFT: {
    variant: 'warning' as const,
    icon: FileText,
    label: 'Borrador',
  },
  ACTIVE: {
    variant: 'success' as const,
    icon: CheckCircle,
    label: 'Activa',
  },
  ARCHIVED: {
    variant: 'secondary' as const,
    icon: Archive,
    label: 'Archivada',
  },
};

export const RuleSetStatusBadge: React.FC<RuleSetStatusBadgeProps> = ({
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
