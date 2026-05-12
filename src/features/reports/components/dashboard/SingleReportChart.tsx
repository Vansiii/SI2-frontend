/**
 * Componente para mostrar un solo gráfico representativo por reporte
 * Usado en el dashboard principal para mostrar una vista simplificada
 * 
 * @module SingleReportChart
 */

import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ReportType, ChartData } from '../../types/manualReports.types';

interface Props {
  data: ChartData;
  reportType: ReportType;
}

// Paleta de colores
const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
];

/**
 * Componente que muestra un solo gráfico principal por tipo de reporte
 */
export function SingleReportChart({ data, reportType }: Props) {
  // Validar que hay datos
  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-700">No hay datos de gráficos disponibles</p>
      </div>
    );
  }

  const renderMainChart = () => {
    try {
      switch (reportType) {
        case 'applications':
          return renderApplicationsMainChart(data as any);
        case 'audit':
          return renderAuditMainChart(data as any);
        case 'clients':
          return renderClientsMainChart(data as any);
        case 'products':
          return renderProductsMainChart(data as any);
        case 'users':
          return renderUsersMainChart(data as any);
        case 'branches':
          return renderBranchesMainChart(data as any);
        default:
          return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600">Tipo de reporte no reconocido: {reportType}</p>
            </div>
          );
      }
    } catch (error) {
      console.error('Error al renderizar gráfico:', error);
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error al renderizar el gráfico</p>
          <p className="text-sm text-red-600 mt-1">{error instanceof Error ? error.message : 'Error desconocido'}</p>
        </div>
      );
    }
  };
  
  return <div className="w-full h-full">{renderMainChart()}</div>;
}

/**
 * Gráfico principal para Solicitudes: Solicitudes por Estado (Pie Chart)
 */
function renderApplicationsMainChart(data: any) {
  if (!data.by_status || data.by_status.length === 0) {
    return <NoDataMessage />;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data.by_status}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label={(entry) => `${entry.name}: ${entry.value}`}
        >
          {data.by_status.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * Gráfico principal para Auditoría: Eventos por Acción (Bar Chart)
 */
function renderAuditMainChart(data: any) {
  if (!data.by_action || data.by_action.length === 0) {
    return <NoDataMessage />;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data.by_action}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#3b82f6" name="Cantidad de Eventos" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Gráfico principal para Clientes: Clientes por Estado (Pie Chart)
 */
function renderClientsMainChart(data: any) {
  if (!data.by_status || data.by_status.length === 0) {
    return <NoDataMessage />;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data.by_status}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label={(entry) => `${entry.name}: ${entry.value}`}
        >
          {data.by_status.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * Gráfico principal para Productos: Productos por Tipo (Pie Chart)
 */
function renderProductsMainChart(data: any) {
  if (!data.by_type || data.by_type.length === 0) {
    return <NoDataMessage />;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data.by_type}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label={(entry) => `${entry.name}: ${entry.value}`}
        >
          {data.by_type.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * Gráfico principal para Usuarios: Usuarios por Rol (Pie Chart)
 */
function renderUsersMainChart(data: any) {
  if (!data.by_role || data.by_role.length === 0) {
    return <NoDataMessage />;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data.by_role}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label={(entry) => `${entry.name}: ${entry.value}`}
        >
          {data.by_role.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * Gráfico principal para Sucursales: Sucursales por Ciudad (Bar Chart)
 */
function renderBranchesMainChart(data: any) {
  if (!data.by_city || data.by_city.length === 0) {
    return <NoDataMessage />;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data.by_city}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#3b82f6" name="Cantidad de Sucursales" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Mensaje cuando no hay datos
 */
function NoDataMessage() {
  return (
    <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-gray-500">No hay datos disponibles para este gráfico</p>
    </div>
  );
}

export default SingleReportChart;
