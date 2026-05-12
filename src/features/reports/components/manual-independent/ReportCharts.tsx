/**
 * Gráficos Interactivos para Reportes
 * 
 * Renderiza gráficos dinámicos usando Recharts según el tipo de reporte.
 * 
 * @module ReportCharts
 */


import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
 * Componente de gráficos de reporte
 */
export function ReportCharts({ data, reportType }: Props) {
  // Validar que hay datos
  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-700">No hay datos de gráficos disponibles</p>
      </div>
    );
  }

  const renderChartsForType = () => {
    try {
      switch (reportType) {
        case 'clients':
          return renderClientCharts(data as any);
        case 'products':
          return renderProductCharts(data as any);
        case 'applications':
          return renderApplicationCharts(data as any);
        case 'audit':
          return renderAuditCharts(data as any);
        case 'users':
          return renderUserCharts(data as any);
        case 'branches':
          return renderBranchCharts(data as any);
        default:
          return (
            <div className="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600">Tipo de reporte no reconocido: {reportType}</p>
            </div>
          );
      }
    } catch (error) {
      console.error('Error al renderizar gráficos:', error);
      return (
        <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error al renderizar los gráficos</p>
          <p className="text-sm text-red-600 mt-1">{error instanceof Error ? error.message : 'Error desconocido'}</p>
        </div>
      );
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {renderChartsForType()}
    </div>
  );
}

/**
 * Gráficos para reporte de clientes
 */
function renderClientCharts(data: any) {
  if (!data) return null;
  
  return (
    <>
      {/* Clientes por Estado */}
      {data.by_status && data.by_status.length > 0 && (
        <ChartCard title="Clientes por Estado">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.by_status}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.by_status?.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
      
      {/* Clientes por Estado KYC */}
      {data.by_kyc_status && data.by_kyc_status.length > 0 && (
        <ChartCard title="Estado KYC">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.by_kyc_status}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
      
      {/* Clientes por Mes */}
      {data.by_month && data.by_month.length > 0 && (
        <ChartCard title="Registro de Clientes por Mes">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.by_month}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
      
      {/* Clientes por Nivel de Riesgo */}
      {data.by_risk_level && data.by_risk_level.length > 0 && (
        <ChartCard title="Distribución por Nivel de Riesgo">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.by_risk_level}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
      
      {/* Top 10 Ciudades */}
      {data.by_city && data.by_city.length > 0 && (
        <ChartCard title="Top 10 Ciudades">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.by_city} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </>
  );
}

/**
 * Gráficos para reporte de productos
 */
function renderProductCharts(data: any) {
  return (
    <>
      {/* Productos por Tipo */}
      <ChartCard title="Productos por Tipo">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.by_type}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.by_type?.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      
      {/* Productos por Estado */}
      <ChartCard title="Productos por Estado">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.by_status}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      
      {/* Comparación de Tasas de Interés */}
      {data.interest_rate_comparison && data.interest_rate_comparison.length > 0 && (
        <ChartCard title="Comparación de Tasas de Interés">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.interest_rate_comparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
      
      {/* Distribución de Montos */}
      {data.amount_distribution && data.amount_distribution.length > 0 && (
        <ChartCard title="Distribución de Montos">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.amount_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="min_amount" fill="#3b82f6" name="Monto Mínimo" />
              <Bar dataKey="max_amount" fill="#10b981" name="Monto Máximo" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </>
  );
}

/**
 * Gráficos para reporte de solicitudes
 */
function renderApplicationCharts(data: any) {
  return (
    <>
      {/* Solicitudes por Estado */}
      <ChartCard title="Solicitudes por Estado">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.by_status}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.by_status?.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      
      {/* Solicitudes por Mes */}
      <ChartCard title="Solicitudes por Mes">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.by_month}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      
      {/* Tasa de Aprobación por Mes */}
      {data.approval_rate_by_month && data.approval_rate_by_month.length > 0 && (
        <ChartCard title="Tasa de Aprobación por Mes">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.approval_rate_by_month}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="approval_rate" stroke="#10b981" strokeWidth={2} name="Tasa de Aprobación (%)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
      
      {/* Comparación de Montos */}
      {data.amounts_comparison && data.amounts_comparison.length > 0 && (
        <ChartCard title="Montos Solicitados vs Aprobados">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.amounts_comparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="requested" fill="#f59e0b" name="Solicitado" />
              <Bar dataKey="approved" fill="#10b981" name="Aprobado" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
      
      {/* Solicitudes por Producto */}
      {data.by_product && data.by_product.length > 0 && (
        <ChartCard title="Solicitudes por Producto">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.by_product} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
      
      {/* Solicitudes por Sucursal */}
      {data.by_branch && data.by_branch.length > 0 && (
        <ChartCard title="Solicitudes por Sucursal">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.by_branch}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </>
  );
}

/**
 * Gráficos para reporte de auditoría
 */
function renderAuditCharts(data: any) {
  return (
    <>
      {/* Eventos por Acción */}
      <ChartCard title="Eventos por Acción">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.by_action}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      
      {/* Eventos por Severidad */}
      <ChartCard title="Eventos por Severidad">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.by_severity}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.by_severity?.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      
      {/* Top 10 Usuarios */}
      {data.by_user_top10 && data.by_user_top10.length > 0 && (
        <ChartCard title="Top 10 Usuarios Más Activos">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.by_user_top10} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
      
      {/* Eventos por Día */}
      <ChartCard title="Eventos por Día">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.by_day}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
}

/**
 * Gráficos para reporte de usuarios
 */
function renderUserCharts(data: any) {
  return (
    <>
      {/* Usuarios por Rol */}
      <ChartCard title="Usuarios por Rol">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.by_role}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.by_role?.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      
      {/* Usuarios por Estado */}
      <ChartCard title="Usuarios por Estado">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.by_status}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      
      {/* Registro de Usuarios por Mes */}
      <ChartCard title="Registro de Usuarios por Mes">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.by_month}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
}

/**
 * Gráficos para reporte de sucursales
 */
function renderBranchCharts(data: any) {
  return (
    <>
      {/* Sucursales por Ciudad */}
      <ChartCard title="Sucursales por Ciudad">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.by_city}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      
      {/* Sucursales por Estado */}
      <ChartCard title="Sucursales por Estado">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.by_status}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.by_status?.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      
      {/* Solicitudes por Sucursal */}
      {data.applications_by_branch && data.applications_by_branch.length > 0 && (
        <ChartCard title="Solicitudes por Sucursal">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.applications_by_branch} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </>
  );
}

/**
 * Componente de tarjeta para gráfico
 */
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
      {children}
    </div>
  );
}

export default ReportCharts;
