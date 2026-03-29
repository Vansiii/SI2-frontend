import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { ProfilePanel } from '../components/ProfilePanel';
import { LoadingState } from '../../../components/ui/LoadingState';
import { useAuth } from '../../auth/hooks/useAuth';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, institution, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState />
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">No se pudo cargar la información del perfil.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Botón Volver */}
        <button
          onClick={() => navigate('/home')}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="mt-2 text-sm text-gray-600">
            Visualiza y gestiona tu información personal
          </p>
        </div>

        {/* Profile Panel */}
        <ProfilePanel user={user} institution={institution} role={role} />
      </div>
    </DashboardLayout>
  );
}
