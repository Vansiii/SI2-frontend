/**
 * Tabla de Resultados de Reporte
 * 
 * Muestra los datos del reporte en formato tabular.
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReportType, ReportRow, Pagination } from '../../types/manualReports.types';
import { formatCurrency, formatDate, formatBoolean, getBadgeColor } from '../../utils/manualReportFormatters';

interface TableColumn {
  key: string;
  label: string;
  format?: 'text' | 'number' | 'currency' | 'date' | 'datetime' | 'boolean';
}

interface Props {
  rows: ReportRow[];
  reportType: ReportType;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
}

function getColumnsForReportType(reportType: ReportType): TableColumn[] {
  switch (reportType) {
    case 'clients':
      return [
        { key: 'full_name', label: 'Nombre Completo' },
        { key: 'document_number', label: 'Documento' },
        { key: 'email', label: 'Email' },
        { key: 'status', label: 'Estado' },
        { key: 'kyc_status', label: 'KYC' },
        { key: 'monthly_income', label: 'Ingreso Mensual', format: 'currency' },
        { key: 'created_at', label: 'Fecha Registro', format: 'date' },
      ];
    
    case 'products':
      return [
        { key: 'name', label: 'Nombre' },
        { key: 'code', label: 'Código' },
        { key: 'product_type', label: 'Tipo' },
        { key: 'status', label: 'Estado' },
        { key: 'min_amount', label: 'Monto Mín.', format: 'currency' },
        { key: 'max_amount', label: 'Monto Máx.', format: 'currency' },
        { key: 'interest_rate', label: 'Tasa (%)', format: 'number' },
      ];
    
    case 'applications':
      return [
        { key: 'application_number', label: 'Número' },
        { key: 'client_name', label: 'Cliente' },
        { key: 'product_name', label: 'Producto' },
        { key: 'status', label: 'Estado' },
        { key: 'requested_amount', label: 'Monto Solicitado', format: 'currency' },
        { key: 'created_at', label: 'Fecha', format: 'date' },
      ];
    
    case 'audit':
      return [
        { key: 'user', label: 'Usuario' },
        { key: 'action', label: 'Acción' },
        { key: 'resource_type', label: 'Recurso' },
        { key: 'severity', label: 'Severidad' },
        { key: 'timestamp', label: 'Fecha/Hora', format: 'datetime' },
      ];
    
    case 'users':
      return [
        { key: 'full_name', label: 'Nombre' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Rol' },
        { key: 'is_active', label: 'Activo', format: 'boolean' },
        { key: 'date_joined', label: 'Fecha Registro', format: 'date' },
      ];
    
    case 'branches':
      return [
        { key: 'name', label: 'Nombre' },
        { key: 'code', label: 'Código' },
        { key: 'city', label: 'Ciudad' },
        { key: 'department', label: 'Departamento' },
        { key: 'is_active', label: 'Activo', format: 'boolean' },
        { key: 'applications_count', label: 'Solicitudes', format: 'number' },
      ];
    
    default:
      return [];
  }
}

function formatCellValue(value: any, format?: string): string {
  if (value === null || value === undefined) {
    return '-';
  }
  
  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'date':
      return formatDate(value);
    case 'datetime':
      return formatDate(value, true);
    case 'boolean':
      return formatBoolean(value);
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : value;
    default:
      return String(value);
  }
}

export function ReportTable({ rows, reportType, pagination, onPageChange }: Props) {
  const columns = getColumnsForReportType(reportType);
  
  const handlePreviousPage = () => {
    if (pagination && pagination.page > 1 && onPageChange) {
      onPageChange(pagination.page - 1);
    }
  };
  
  const handleNextPage = () => {
    if (pagination && pagination.page < pagination.total_pages && onPageChange) {
      onPageChange(pagination.page + 1);
    }
  };
  
  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No hay datos para mostrar</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => {
                  const value = (row as any)[column.key];
                  const formattedValue = formatCellValue(value, column.format);
                  const isStatusField = ['status', 'kyc_status', 'risk_level', 'severity'].includes(column.key);
                  
                  return (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {isStatusField && typeof value === 'string' ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(value)}`}>
                          {formattedValue}
                        </span>
                      ) : (
                        formattedValue
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{rows.length}</span> de{' '}
              <span className="font-medium">{pagination.total_count.toLocaleString()}</span> registros
            </div>
            
            {pagination.total_pages > 1 && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">
                  Página <span className="font-medium">{pagination.page}</span> de{' '}
                  <span className="font-medium">{pagination.total_pages}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={pagination.page === 1}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </button>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={pagination.page === pagination.total_pages}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportTable;
