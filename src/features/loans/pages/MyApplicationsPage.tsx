import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ApplicationStatus } from '../components/ApplicationStatus';
import { useMyApplications } from '../hooks/useTimeline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Clock,
  AlertCircle,
  ArrowRight,
  Plus
} from 'lucide-react';

export const MyApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: applications, isLoading, error } = useMyApplications();

  // Debug: mostrar en consola
  console.log('MyApplicationsPage:', { applications, isLoading, error });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState message="Cargando tus solicitudes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-2xl mx-auto">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Error al cargar solicitudes
          </h3>
          <p className="text-red-700 mb-4">
            {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
          </p>
          <div className="space-y-2 text-sm text-red-600 mb-4">
            <p>Posibles causas:</p>
            <ul className="list-disc list-inside text-left max-w-md mx-auto">
              <li>El backend no está corriendo</li>
              <li>No tienes un perfil de cliente asociado</li>
              <li>Problemas de conexión</li>
            </ul>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reintentar
            </button>
            <button
              onClick={() => navigate('/home')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Ir al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Asegurar que applications sea un array
  const applicationsList = applications || [];

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mis Solicitudes de Crédito
          </h1>
          <p className="text-gray-600">
            Gestiona y da seguimiento a tus solicitudes de crédito
          </p>
        </div>

        <button
          onClick={() => navigate('/client/loans/new')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
          style={{
            backgroundColor: 'var(--tenant-primary, #2563EB)',
            color: 'var(--tenant-on-primary, #FFFFFF)',
          }}
        >
          <Plus className="h-5 w-5" />
          Nueva Solicitud
        </button>
      </div>

      {/* Lista de solicitudes */}
      {applicationsList.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tienes solicitudes aún
                </h3>
                <p className="text-gray-600 mb-6">
                  Comienza tu solicitud de crédito ahora
                </p>
                <button
                  onClick={() => navigate('/client/loans/new')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundColor: 'var(--tenant-primary, #2563EB)',
                    color: 'var(--tenant-on-primary, #FFFFFF)',
                  }}
                >
                  <Plus className="h-5 w-5" />
                  Crear Solicitud
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applicationsList.map((application, index) => (
            <Card
              key={application.id}
              hover
              onClick={() => navigate(`/client/loans/${application.id}`)}
              className="cursor-pointer animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Información principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.product_name}
                      </h3>
                      <ApplicationStatus
                        status={application.status}
                        statusDisplay={application.status_display}
                        size="sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      {/* Número de solicitud */}
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="text-gray-600">Solicitud</p>
                          <p className="font-medium text-gray-900">
                            #{application.application_number}
                          </p>
                        </div>
                      </div>

                      {/* Monto */}
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="text-gray-600">Monto</p>
                          <p className="font-medium text-gray-900">
                            Bs {parseFloat(application.requested_amount).toLocaleString('es-BO')}
                          </p>
                        </div>
                      </div>

                      {/* Plazo */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="text-gray-600">Plazo</p>
                          <p className="font-medium text-gray-900">
                            {application.term_months} meses
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mensaje de estado actual */}
                    {application.current_stage.message && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                        <Clock className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          {application.current_stage.message}
                        </p>
                      </div>
                    )}

                    {/* Acciones pendientes */}
                    {application.pending_actions_count > 0 && (
                      <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-yellow-800">
                          Tienes {application.pending_actions_count} acción
                          {application.pending_actions_count > 1 ? 'es' : ''} pendiente
                          {application.pending_actions_count > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Fecha y acción */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {application.submitted_at
                          ? `Enviada el ${format(new Date(application.submitted_at), "d 'de' MMM, yyyy", { locale: es })}`
                          : `Creada el ${format(new Date(application.created_at), "d 'de' MMM, yyyy", { locale: es })}`
                        }
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/client/loans/${application.id}`);
                      }}
                      className="inline-flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
                      style={{
                        backgroundColor: 'var(--tenant-primary-soft, rgba(37, 99, 235, 0.12))',
                        color: 'var(--tenant-primary, #2563EB)',
                      }}
                    >
                      Ver detalles
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
