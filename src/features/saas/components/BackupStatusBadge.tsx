/**
 * Componente Badge para mostrar el estado de un backup
 */

import { Chip } from '@mui/material';
import {
  CheckCircle,
  Clock,
  Loader,
  XCircle,
  Archive,
} from 'lucide-react';
import type { BackupStatus } from '../types/backup.types';

interface BackupStatusBadgeProps {
  status: BackupStatus;
  size?: 'small' | 'medium';
}

const statusConfig: Record<
  BackupStatus,
  {
    label: string;
    color: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    icon: React.ReactNode;
  }
> = {
  pending: {
    label: 'Pendiente',
    color: 'default',
    icon: <Clock size={16} />,
  },
  running: {
    label: 'Ejecutando',
    color: 'primary',
    icon: <Loader size={16} className="animate-spin" />,
  },
  completed: {
    label: 'Completado',
    color: 'success',
    icon: <CheckCircle size={16} />,
  },
  failed: {
    label: 'Fallido',
    color: 'error',
    icon: <XCircle size={16} />,
  },
  expired: {
    label: 'Expirado',
    color: 'warning',
    icon: <Archive size={16} />,
  },
};

export function BackupStatusBadge({ status, size = 'small' }: BackupStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={config.icon as React.ReactElement}
      sx={{
        fontWeight: 500,
        '& .MuiChip-icon': {
          marginLeft: '8px',
        },
      }}
    />
  );
}
