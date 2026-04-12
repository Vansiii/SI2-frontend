import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { getClients, deactivateClient } from '../services/clientsApi';
import type { Client, PaginatedResponse } from '../types';
import { LoadingState } from '../../../components/ui/LoadingState';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CI: 'CI',
  NIT: 'NIT',
  PASSPORT: 'Pasaporte',
  OTHER: 'Otro',
};

const EMPLOYMENT_STATUS_LABELS: Record<string, string> = {
  EMPLOYED: 'Empleado',
  SELF_EMPLOYED: 'Independiente',
  UNEMPLOYED: 'Desempleado',
  RETIRED: 'Jubilado',
};

export function ClientListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const canCreate = hasPermission('clients.create');
  const canEdit = hasPermission('clients.edit');
  const canDelete = hasPermission('clients.delete');

  useEffect(() => {
    loadClients(currentPage);
  }, [currentPage]);

  const loadClients = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const data: PaginatedResponse<Client> = await getClients({ page });
      setClients(data.results);
      setTotalCount(data.count);
      setTotalPages(Math.ceil(data.count / 10)); // Asumiendo 10 items por página
    } catch (err: unknown) {
      let errorMessage = 'Error al cargar clientes';

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      if (
        typeof err === 'object' &&
        err !== null &&
        'status' in err &&
        ((err as any).status === 403 || errorMessage.includes('permiso'))
      ) {
        setError(
          'No tienes permiso para ver clientes. Si acabas de recibir nuevos permisos, ' +
            'cierra sesión y vuelve a iniciar sesión para actualizar tus permisos.'
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (clientId: number) => {
    if (!confirm('¿Está seguro de desactivar este cliente?')) {
      return;
    }

    try {
      await deactivateClient(clientId);
      await loadClients(currentPage);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al desactivar cliente');
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return <LoadingState message="Cargando clientes..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Gestión de Clientes
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Administra el directorio de clientes y prestatarios.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('/clients/new')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all font-medium text-sm w-full md:w-auto"
          >
            <UserPlus className="h-4 w-4" />
            Nuevo Cliente
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm">
            No hay clientes registrados en el sistema.
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-3">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600 font-bold text-lg border-2 border-white shadow-sm shrink-0">
                    {client.first_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3
                      className="font-bold text-slate-900 truncate"
                      title={`${client.first_name} ${client.last_name}`}
                    >
                      {client.first_name} {client.last_name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {DOCUMENT_TYPE_LABELS[client.document_type]}: {client.document_number}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full border ${
                    client.is_active
                      ? 'bg-green-50/50 border-green-200 text-green-600'
                      : 'bg-slate-50/50 border-slate-200 text-slate-400'
                  }`}
                  title={client.is_active ? 'Cliente Activo' : 'Cliente Inactivo'}
                >
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${client.is_active ? 'bg-green-500' : 'bg-slate-400'}`}
                  ></div>
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col gap-3">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {client.city}, {client.country}
                    </span>
                  </div>
                </div>

                {/* Employment Info */}
                <div className="mt-auto pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-600">
                      {EMPLOYMENT_STATUS_LABELS[client.employment_status]}
                    </span>
                  </div>
                  {client.employer_name && (
                    <p className="text-xs text-slate-500 ml-6 mt-1 truncate">
                      {client.employer_name}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 ml-6 mt-1">
                    Ingreso: Bs {parseFloat(client.monthly_income).toLocaleString('es-BO')}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-1">
                {canEdit && (
                  <button
                    onClick={() => navigate(`/clients/${client.id}/edit`)}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-xs font-semibold whitespace-nowrap"
                    title="Editar Cliente"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                {canDelete && client.is_active && (
                  <>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <button
                      onClick={() => handleDeactivate(client.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-xs font-semibold whitespace-nowrap"
                      title="Desactivar Cliente"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-600">
            Mostrando {clients.length} de {totalCount} clientes
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-slate-600">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
