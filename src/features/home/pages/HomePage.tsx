import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { useAuth } from '../../auth/hooks/useAuth';
import { Building2, User, Shield } from 'lucide-react';

/**
 * Página principal del dashboard (Home)
 * Muestra información básica del usuario y su institución
 */
export function HomePage() {
  const { user, institution, role } = useAuth();

  return (
    <DashboardLayout>
      {/* Mensaje de bienvenida */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Bienvenido, {user?.first_name}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Has iniciado sesión correctamente en el sistema
        </p>
      </div>

      {/* Cards de información */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de Usuario */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Información Personal
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Nombre Completo</p>
              <p className="text-base text-gray-900 mt-1">
                {user?.first_name} {user?.last_name}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-base text-gray-900 mt-1">{user?.email}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">Rol</p>
              <div className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Institución */}
        {institution && (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Institución Financiera
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Nombre</p>
                <p className="text-base text-gray-900 mt-1">{institution.name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Tipo</p>
                <p className="text-base text-gray-900 mt-1 capitalize">
                  {institution.institution_type === 'banking' && 'Banco'}
                  {institution.institution_type === 'microfinance' && 'Microfinanciera'}
                  {institution.institution_type === 'cooperative' && 'Cooperativa'}
                  {institution.institution_type === 'fintech' && 'Fintech'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Identificador</p>
                <p className="text-sm text-gray-600 mt-1 font-mono">
                  {institution.slug}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mensaje temporal */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-blue-900">
              Dashboard en Construcción
            </h3>
            <p className="mt-2 text-sm text-blue-700">
              Esta es una vista temporal que confirma que has iniciado sesión correctamente.
              Los módulos de gestión de créditos, clientes y reportes estarán disponibles próximamente.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
