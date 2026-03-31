import { useState, useEffect } from 'react';
import { PieChart, Info, Key, Shield, UserCheck, Activity, Target } from 'lucide-react';
import { getPermissionCoverage } from '../services/permissionsApi';
import type { PermissionCoverageReport } from '../types';
import { LoadingState } from '../../../components/ui/LoadingState';

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

  if (loading) return <LoadingState message="Cargando..." fullScreen={true} />;
  if (error) return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
        {error}
      </div>
    </div>
  );
  if (!report) return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="rounded-xl bg-slate-50 p-8 border border-slate-200 text-slate-500 text-center text-sm">
        No hay datos disponibles en el reporte.
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <PieChart className="h-6 w-6 text-blue-600" />
          Reporte de Cobertura de Permisos
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Análisis de la distribución y cobertura global de permisos en la plataforma.
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Permisos */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Permisos</h3>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {report.total_permissions}
            </p>
          </div>
        </div>

        {/* Permisos Activos */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Permisos Activos</h3>
            <p className="mt-1 text-3xl font-bold text-green-600">
              {report.active_permissions}
            </p>
          </div>
        </div>

        {/* Permisos Inactivos */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Permisos Inactivos</h3>
            <p className="mt-1 text-3xl font-bold text-red-600">
              {report.inactive_permissions}
            </p>
          </div>
        </div>

        {/* Roles Admin Cobertura */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4 transition-all hover:shadow-md lg:col-span-2">
          <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <UserCheck className="h-6 w-6" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Roles Admin con Todos los Permisos
              </h3>
              <p className="mt-1 text-3xl font-bold text-blue-600">
                {report.admin_roles_with_all_permissions}
                <span className="text-sm font-medium text-slate-400 ml-2">
                  / {report.total_admin_roles} roles
                </span>
              </p>
            </div>
            {/* Progress bar visual */}
            <div className="hidden sm:block w-32 md:w-48">
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${(report.admin_roles_with_all_permissions / (report.total_admin_roles || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cobertura Porcentaje */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cobertura General
            </h3>
            <p className="mt-1 text-3xl font-bold text-purple-600">
              {(report.coverage_percentage ?? 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Permisos por Módulo */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-slate-400" />
            Distribución por Módulo
          </h2>
          {report.permissions_by_module && Object.keys(report.permissions_by_module).length > 0 ? (
            <div className="space-y-5">
              {Object.entries(report.permissions_by_module)
                .sort(([, a], [, b]) => b - a)
                .map(([module, count]) => (
                  <div key={module} className="flex items-center gap-4">
                    <span className="w-32 lg:w-40 font-medium text-sm text-slate-700 truncate" title={module}>
                      {module}
                    </span>
                    <div className="flex-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                        style={{
                          width: `${((count / (report.total_permissions || 1)) * 100).toFixed(1)}%`,
                        }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm font-bold text-slate-900">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm bg-slate-50/50 rounded-xl">
              No hay datos de módulos disponibles
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-6 flex flex-col items-start gap-4">
          <div className="p-3 bg-blue-100/50 text-blue-600 rounded-xl">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-2">Información de Cobertura</h3>
            <ul className="space-y-3 text-sm text-blue-800/80">
              <li className="flex items-start gap-2">
                <span className="block mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                La cobertura indica el porcentaje de roles de administrador que tienen todos los permisos activos del sistema.
              </li>
              <li className="flex items-start gap-2">
                <span className="block mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                Los permisos inactivos no se contabilizan ni se asignan automáticamente a nuevos roles.
              </li>
              <li className="flex items-start gap-2">
                <span className="block mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                Use la función <span className="font-semibold text-blue-900">Sincronizar con Admins</span> en la vista anterior para actualizar roles existentes.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}






