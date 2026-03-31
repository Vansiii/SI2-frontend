import { useState, useEffect } from 'react';
import { getPermissionCoverage } from '../services/permissionsApi';
import type { PermissionCoverageReport } from '../types';

export default function PermissionCoveragePage() {
  const [report, setReport] = useState<PermissionCoverageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await getPermissionCoverage();
      setReport(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar reporte');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Cargando reporte...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!report) return <div className="p-6">No hay datos disponibles</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reporte de Cobertura de Permisos</h1>
        <p className="mt-2 text-gray-600">
          Análisis de la distribución y cobertura de permisos en la plataforma
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Permisos</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {report.total_permissions}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Permisos Activos</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {report.active_permissions}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Permisos Inactivos</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {report.inactive_permissions}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Roles Admin con Todos los Permisos
          </h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {report.admin_roles_with_all_permissions}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            de {report.total_admin_roles} roles admin
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Cobertura de Permisos
          </h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">
            {(report.coverage_percentage ?? 0).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold">Permisos por Módulo</h2>
        {report.permissions_by_module && Object.keys(report.permissions_by_module).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(report.permissions_by_module)
              .sort(([, a], [, b]) => b - a)
              .map(([module, count]) => (
                <div key={module} className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{module}</span>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-48 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-blue-600"
                        style={{
                          width: `${((count / (report.total_permissions || 1)) * 100).toFixed(1)}%`,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm font-semibold text-gray-900">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay datos de módulos disponibles</p>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-semibold text-blue-900">Información</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
          <li>
            La cobertura indica el porcentaje de roles de administrador que tienen
            todos los permisos activos
          </li>
          <li>
            Los permisos inactivos no se asignan automáticamente a nuevos roles
          </li>
          <li>
            Use la función "Sincronizar con Admins" para actualizar roles existentes
          </li>
        </ul>
      </div>
    </div>
  );
}
