import { User, Mail, Building2, Shield, Calendar } from 'lucide-react';
import type { User as UserType, Institution } from '../../../types';
import { TwoFactorSettings } from './TwoFactorSettings';

interface ProfilePanelProps {
  user: UserType;
  institution: Institution | null;
  role: string | null;
}

export function ProfilePanel({ user, institution, role }: ProfilePanelProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No disponible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'No disponible';
    }
  };

  const getRoleLabel = (roleValue: string | null) => {
    if (!roleValue) return 'No disponible';
    
    const roleLabels: Record<string, string> = {
      admin: 'Administrador',
      analyst: 'Analista',
      officer: 'Oficial de Crédito',
      manager: 'Gerente',
    };
    
    return roleLabels[roleValue] || roleValue;
  };

  return (
    <div className="space-y-6">
      {/* Card de Información Personal */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Información Personal
        </h2>

        <div className="space-y-4">
          {/* Nombre Completo */}
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
            <p className="mt-1 text-base text-gray-900">
              {user.first_name} {user.last_name}
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Correo Electrónico
            </label>
            <p className="mt-1 text-base text-gray-900">{user.email}</p>
          </div>

          {/* Rol */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Rol
            </label>
            <p className="mt-1 text-base text-gray-900">{getRoleLabel(role)}</p>
          </div>

          {/* Fecha de Registro */}
          {user.created_at && (
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha de Registro
              </label>
              <p className="mt-1 text-base text-gray-900">{formatDate(user.created_at)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Card de Información de Institución */}
      {institution && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Institución
          </h2>

          <div className="space-y-4">
            {/* Nombre de Institución */}
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre</label>
              <p className="mt-1 text-base text-gray-900">{institution.name}</p>
            </div>

            {/* Tipo de Institución */}
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <p className="mt-1 text-base text-gray-900 capitalize">
                {institution.institution_type === 'banking' && 'Banco'}
                {institution.institution_type === 'microfinance' && 'Microfinanzas'}
                {institution.institution_type === 'cooperative' && 'Cooperativa'}
                {institution.institution_type === 'fintech' && 'Fintech'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Card de Seguridad - 2FA */}
      <TwoFactorSettings />
    </div>
  );
}
