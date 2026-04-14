/**
 * Página de eventos de seguridad
 */
import { useState, useEffect } from 'react';
import { Search, Shield, AlertTriangle } from 'lucide-react';
import { SecurityEventTable } from '../components/SecurityEventTable';
import { LoadingState } from '../../../components/ui/LoadingState';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { auditService } from '../services/auditService';
import type {
  SecurityEventList,
  SecurityEvent,
  SecurityEventFilters,
} from '../types';

export function SecurityEventsPage() {
  const [events, setEvents] = useState<SecurityEventList[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');

  const [filters, setFilters] = useState<SecurityEventFilters>({
    search: '',
    event_type: '',
    resolved: undefined,
  });

  useEffect(() => {
    loadEvents();
  }, [page]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await auditService.getSecurityEvents(page, filters);
      setEvents(response.results);
      setTotalPages(Math.ceil(response.count / 10));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadEvents();
  };

  const handleViewDetails = async (id: number) => {
    try {
      const event = await auditService.getSecurityEvent(id);
      setSelectedEvent(event);
      setDetailsOpen(true);
      setResolveNotes('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar detalles');
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await auditService.resolveSecurityEvent(id);
      setSuccess('Evento marcado como resuelto');
      loadEvents();
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Error al resolver evento'
      );
    }
  };

  const handleResolveWithNotes = async () => {
    if (!selectedEvent) return;

    try {
      await auditService.resolveSecurityEvent(selectedEvent.id, resolveNotes);
      setSuccess('Evento marcado como resuelto');
      setDetailsOpen(false);
      setSelectedEvent(null);
      loadEvents();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al resolver evento');
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedEvent(null);
    setResolveNotes('');
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Shield className="h-8 w-8 mr-3 text-red-600" />
        <h1 className="text-3xl font-bold text-gray-900">Eventos de Seguridad</h1>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Email, IP, descripción..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Evento
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.event_type}
              onChange={(e) =>
                setFilters({ ...filters, event_type: e.target.value })
              }
            >
              <option value="">Todos</option>
              <option value="failed_login">Login Fallido</option>
              <option value="unauthorized_access">Acceso No Autorizado</option>
              <option value="rate_limit_exceeded">Rate Limit Excedido</option>
              <option value="suspicious_activity">Actividad Sospechosa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.resolved === undefined ? '' : filters.resolved.toString()}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  resolved: e.target.value === '' ? undefined : e.target.value === 'true',
                })
              }
            >
              <option value="">Todos</option>
              <option value="false">Pendientes</option>
              <option value="true">Resueltos</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              className="w-full flex items-center justify-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <Alert type="error" className="mb-6">
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" className="mb-6">
          {success}
        </Alert>
      )}

      {/* Tabla de eventos */}
      {loading ? (
        <LoadingState />
      ) : (
        <>
          <SecurityEventTable
            events={events}
            onViewDetails={handleViewDetails}
            onResolve={handleResolve}
          />

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pageNum
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Modal de detalles */}
      <Modal
        isOpen={detailsOpen}
        onClose={handleCloseDetails}
        title={
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <span>Detalles del Evento de Seguridad</span>
          </div>
        }
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                selectedEvent.resolved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {selectedEvent.resolved ? 'Resuelto' : 'Pendiente'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Evento</label>
                <p className="mt-1 text-sm text-gray-900">{selectedEvent.event_type_display}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha/Hora</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedEvent.timestamp).toLocaleString('es-BO')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Usuario</label>
                <p className="mt-1 text-sm text-gray-900">{selectedEvent.user_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedEvent.user_email || selectedEvent.email || '-'}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">IP</label>
              <p className="mt-1 text-sm text-gray-900 font-mono">{selectedEvent.ip_address}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <p className="mt-1 text-sm text-gray-900">{selectedEvent.description}</p>
            </div>
            
            {selectedEvent.user_agent && (
              <div>
                <label className="block text-sm font-medium text-gray-700">User Agent</label>
                <p className="mt-1 text-xs text-gray-900 font-mono break-all">
                  {selectedEvent.user_agent}
                </p>
              </div>
            )}
            
            {selectedEvent.resolved && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resuelto por</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvent.resolved_by_email || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de resolución</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedEvent.resolved_at
                      ? new Date(selectedEvent.resolved_at).toLocaleString('es-BO')
                      : '-'}
                  </p>
                </div>
              </div>
            )}
            
            {Object.keys(selectedEvent.metadata).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Metadata</label>
                <pre className="mt-1 text-xs bg-gray-100 p-3 rounded-md overflow-auto">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            )}
            
            {!selectedEvent.resolved && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notas de resolución (opcional)
                </label>
                <textarea
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Agregar notas sobre la resolución del evento..."
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button onClick={handleCloseDetails} variant="secondary">
                Cerrar
              </Button>
              {selectedEvent && !selectedEvent.resolved && (
                <Button onClick={handleResolveWithNotes}>
                  Marcar como Resuelto
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
export default SecurityEventsPage;