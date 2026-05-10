/**
 * Badge de estado del reporte
 */
import { Clock, Loader, CheckCircle, XCircle } from 'lucide-react';
import type { ReportStatus } from '../../types';

interface ReportStatusBadgeProps {
  status: ReportStatus;
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      label: 'Pendiente',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-800',
    },
    PROCESSING: {
      label: 'Procesando',
      icon: Loader,
      className: 'bg-blue-100 text-blue-800',
    },
    COMPLETED: {
      label: 'Completado',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800',
    },
    FAILED: {
      label: 'Fallido',
      icon: XCircle,
      className: 'bg-red-100 text-red-800',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </span>
  );
}
