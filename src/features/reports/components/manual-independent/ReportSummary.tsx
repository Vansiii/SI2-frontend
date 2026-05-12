/**
 * Resumen Estadístico del Reporte
 * 
 * Muestra métricas clave en tarjetas visuales.
 */

import React from 'react';
import { Users, CheckCircle, XCircle, TrendingUp, DollarSign, Clock } from 'lucide-react';
import type { ReportType, ReportSummary as ReportSummaryType } from '../../types/manualReports.types';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/manualReportFormatters';

interface MetricCard {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface Props {
  summary: ReportSummaryType;
  reportType: ReportType;
}

function getMetricsForReportType(summary: ReportSummaryType, reportType: ReportType): MetricCard[] {
  switch (reportType) {
    case 'clients':
      const clientSummary = summary as any;
      return [
        {
          label: 'Total Clientes',
          value: formatNumber(clientSummary.total),
          icon: Users,
          color: 'blue',
        },
        {
          label: 'Clientes Activos',
          value: formatNumber(clientSummary.active),
          icon: CheckCircle,
          color: 'green',
        },
        {
          label: 'Clientes Inactivos',
          value: formatNumber(clientSummary.inactive),
          icon: XCircle,
          color: 'red',
        },
        {
          label: 'KYC Verificados',
          value: formatNumber(clientSummary.verified),
          icon: CheckCircle,
          color: 'purple',
        },
        {
          label: 'Ingreso Promedio',
          value: formatCurrency(clientSummary.avg_income),
          icon: DollarSign,
          color: 'yellow',
        },
      ];
    
    case 'products':
      const productSummary = summary as any;
      return [
        {
          label: 'Total Productos',
          value: formatNumber(productSummary.total),
          icon: Users,
          color: 'blue',
        },
        {
          label: 'Productos Activos',
          value: formatNumber(productSummary.active),
          icon: CheckCircle,
          color: 'green',
        },
        {
          label: 'Productos Inactivos',
          value: formatNumber(productSummary.inactive),
          icon: XCircle,
          color: 'red',
        },
      ];
    
    case 'applications':
      const appSummary = summary as any;
      return [
        {
          label: 'Total Solicitudes',
          value: formatNumber(appSummary.total),
          icon: Users,
          color: 'blue',
        },
        {
          label: 'Tasa de Aprobación',
          value: formatPercentage(appSummary.approval_rate),
          icon: TrendingUp,
          color: 'green',
        },
        {
          label: 'Monto Solicitado',
          value: formatCurrency(appSummary.total_requested),
          icon: DollarSign,
          color: 'yellow',
        },
        {
          label: 'Monto Aprobado',
          value: formatCurrency(appSummary.total_approved),
          icon: CheckCircle,
          color: 'green',
        },
        {
          label: 'Tiempo Promedio',
          value: `${appSummary.avg_processing_days} días`,
          icon: Clock,
          color: 'purple',
        },
      ];
    
    case 'audit':
      const auditSummary = summary as any;
      return [
        {
          label: 'Total Eventos',
          value: formatNumber(auditSummary.total),
          icon: Users,
          color: 'blue',
        },
      ];
    
    case 'users':
      const userSummary = summary as any;
      return [
        {
          label: 'Total Usuarios',
          value: formatNumber(userSummary.total),
          icon: Users,
          color: 'blue',
        },
        {
          label: 'Usuarios Activos',
          value: formatNumber(userSummary.active),
          icon: CheckCircle,
          color: 'green',
        },
        {
          label: 'Usuarios Inactivos',
          value: formatNumber(userSummary.inactive),
          icon: XCircle,
          color: 'red',
        },
      ];
    
    case 'branches':
      const branchSummary = summary as any;
      return [
        {
          label: 'Total Sucursales',
          value: formatNumber(branchSummary.total),
          icon: Users,
          color: 'blue',
        },
        {
          label: 'Sucursales Activas',
          value: formatNumber(branchSummary.active),
          icon: CheckCircle,
          color: 'green',
        },
        {
          label: 'Sucursales Inactivas',
          value: formatNumber(branchSummary.inactive),
          icon: XCircle,
          color: 'red',
        },
      ];
    
    default:
      return [];
  }
}

function getColorClasses(color: string) {
  const colors: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-900', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-900', icon: 'text-green-600' },
    red: { bg: 'bg-red-50', text: 'text-red-900', icon: 'text-red-600' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-900', icon: 'text-yellow-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-900', icon: 'text-purple-600' },
  };
  
  return colors[color] || colors.blue;
}

export function ReportSummary({ summary, reportType }: Props) {
  const metrics = getMetricsForReportType(summary, reportType);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const colors = getColorClasses(metric.color);
        
        return (
          <div
            key={index}
            className={`${colors.bg} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-white">
                <Icon className={`h-6 w-6 ${colors.icon}`} />
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
              <p className={`text-2xl font-bold ${colors.text}`}>
                {metric.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ReportSummary;
