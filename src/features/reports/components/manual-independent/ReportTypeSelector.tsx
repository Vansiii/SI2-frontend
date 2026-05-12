/**
 * Selector de Tipo de Reporte
 * 
 * Permite al usuario seleccionar el tipo de reporte que desea generar.
 */

import React from 'react';
import { Users, Package, FileText, Shield, UserCheck, Building } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { REPORT_TYPE_LABELS } from '../../types/manualReports.types';
import type { ReportType } from '../../types/manualReports.types';

interface ReportTypeOption {
  type: ReportType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const REPORT_TYPES: ReportTypeOption[] = [
  {
    type: 'clients',
    label: 'Clientes',
    description: 'Información de clientes y KYC',
    icon: Users,
    color: 'blue',
  },
  {
    type: 'products',
    label: 'Productos',
    description: 'Productos crediticios disponibles',
    icon: Package,
    color: 'green',
  },
  {
    type: 'applications',
    label: 'Solicitudes',
    description: 'Solicitudes de crédito',
    icon: FileText,
    color: 'purple',
  },
  {
    type: 'audit',
    label: 'Auditoría',
    description: 'Bitácora de eventos del sistema',
    icon: Shield,
    color: 'red',
  },
  {
    type: 'users',
    label: 'Usuarios',
    description: 'Usuarios del sistema',
    icon: UserCheck,
    color: 'yellow',
  },
  {
    type: 'branches',
    label: 'Sucursales',
    description: 'Sucursales y ubicaciones',
    icon: Building,
    color: 'indigo',
  },
];

interface Props {
  value: ReportType | null;
  onChange: (type: ReportType) => void;
  availableTypes?: ReportType[];
}

export function ReportTypeSelector({ value, onChange, availableTypes }: Props) {
  // Filtrar tipos de reportes disponibles
  const filteredReportTypes = availableTypes 
    ? REPORT_TYPES.filter(rt => availableTypes.includes(rt.type))
    : REPORT_TYPES;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredReportTypes.map((reportType) => {
        const Icon = reportType.icon;
        const isSelected = value === reportType.type;
        
        return (
          <button
            key={reportType.type}
            onClick={() => onChange(reportType.type)}
            className={`
              relative p-6 rounded-lg border-2 transition-all duration-200
              hover:shadow-lg hover:scale-105
              ${isSelected 
                ? `border-${reportType.color}-500 bg-${reportType.color}-50 shadow-md` 
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            {isSelected && (
              <div className={`absolute top-3 right-3 w-3 h-3 rounded-full bg-${reportType.color}-500`} />
            )}
            
            <div className={`
              flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full
              ${isSelected ? `bg-${reportType.color}-100` : 'bg-gray-100'}
            `}>
              <Icon className={`h-8 w-8 ${isSelected ? `text-${reportType.color}-600` : 'text-gray-600'}`} />
            </div>
            
            <div className="text-center">
              <h3 className={`text-lg font-semibold mb-1 ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                {reportType.label}
              </h3>
              <p className="text-sm text-gray-500">
                {reportType.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ReportTypeSelector;
