/**
 * Página de logs de auditoría
 */
import { useState, useEffect } from 'react';
import { Search, FileText } from 'lucide-react';
import { AuditLogTable } from '../components/AuditLogTable';
import { LoadingState } from '../../../components/ui/LoadingState';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { auditService } from '../services/auditService';
import type { AuditLogList, AuditLog, AuditFilters } from '../types';

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogList[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [filters, setFilters] = useState<AuditFilters>({
    search: '',
    action: '',
    severity: '',
    resource_type: '',
  });

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await auditService.getAuditLogs(page, filters);
      setLogs(response.results);
      setTotalPages(Math.ceil(response.count / 10));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadLogs();
  };

  const handleViewDetails = async (id: number) => {
    try {
      const log = await auditService.getAuditLog(id);
      setSelectedLog(log);
      setDetailsOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar detalles');
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedLog(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <FileText className="h-8 w-8 mr-3 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">Logs de Auditoría</h1>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
              Acción
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.action}
              onChange={(e) =>
                setFilters({ ...filters, action: e.target.value })
              }
            >
              <option value="">Todas</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="create">Crear</option>
              <option value="update">Actualizar</option>
              <option value="delete">Eliminar</option>
              <option value="permission_change">Cambio de Permisos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severidad
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.severity}
              onChange={(e) =>
                setFilters({ ...filters, severity: e.target.value })
              }
            >
              <option value="">Todas</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Recurso
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.resource_type}
              onChange={(e) =>
                setFilters({ ...filters, resource_type: e.target.value })
              }
            />
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

      {/* Tabla de logs */}
      {error && (
        <Alert type="error" className="mb-6">
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingState />
      ) : (
        <>
          <AuditLogTable logs={logs} onViewDetails={handleViewDetails} />

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
        title="Detalles del Log de Auditoría"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Usuario</label>
                <p className="mt-1 text-sm text-gray-900">{selectedLog.user_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{selectedLog.user_email || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Acción</label>
                <p className="mt-1 text-sm text-gray-900">{selectedLog.action_display}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Severidad</label>
                <p className="mt-1 text-sm text-gray-900">{selectedLog.severity_display}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Recurso</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedLog.resource_type}
                  {selectedLog.resource_id && ` #${selectedLog.resource_id}`}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Institución</label>
                <p className="mt-1 text-sm text-gray-900">{selectedLog.institution_name || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IP</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.ip_address || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha/Hora</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedLog.timestamp).toLocaleString('es-BO')}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <p className="mt-1 text-sm text-gray-900">{selectedLog.description}</p>
            </div>
            
            {selectedLog.user_agent && (
              <div>
                <label className="block text-sm font-medium text-gray-700">User Agent</label>
                <p className="mt-1 text-xs text-gray-900 font-mono break-all">
                  {selectedLog.user_agent}
                </p>
              </div>
            )}
            
            {Object.keys(selectedLog.metadata).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Metadata</label>
                <pre className="mt-1 text-xs bg-gray-100 p-3 rounded-md overflow-auto">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleCloseDetails}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
export default AuditLogsPage;