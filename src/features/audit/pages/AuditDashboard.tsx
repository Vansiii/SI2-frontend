/**
 * Dashboard de Auditoría - Completamente Responsivo
 */
import { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  RefreshCw, 
  Filter, 
  Download,
  Eye,
  Calendar,
  User,
  Shield,
  AlertTriangle,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { auditService } from '../services/auditService';
import type { AuditLogList, AuditLog } from '../types';

export function AuditDashboard() {
  const [logs, setLogs] = useState<AuditLogList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    severity: '',
    date_from: '',
    date_to: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [page, searchTerm, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Cargando logs de auditoría...', { page, searchTerm, filters });

      const filterParams: any = {};
      if (searchTerm) filterParams.search = searchTerm;
      if (filters.action) filterParams.action = filters.action;
      if (filters.severity) filterParams.severity = filters.severity;
      if (filters.date_from) filterParams.date_from = filters.date_from;
      if (filters.date_to) filterParams.date_to = filters.date_to;

      const response = await auditService.getAuditLogs(page, filterParams);

      console.log('Respuesta de logs:', response);

      setLogs(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / 20));
    } catch (err: any) {
      console.error('Error al cargar logs:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          err.message || 
                          'Error al cargar logs de auditoría';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      const log = await auditService.getAuditLog(id);
      setSelectedLog(log);
      setDetailsOpen(true);
    } catch (err: any) {
      console.error('Error al cargar detalles:', err);
      setError(err.response?.data?.error || 'Error al cargar detalles');
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      severity: '',
      date_from: '',
      date_to: ''
    });
    setSearchTerm('');
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login': return 'bg-green-100 text-green-800 border-green-200';
      case 'logout': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'create': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'update': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delete': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando bitácora de auditoría...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4">
            <div className="flex items-center mb-4 sm:mb-0">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Bitácora de Auditoría
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {totalCount} registros encontrados
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </button>
              <button
                onClick={loadLogs}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtros */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Usuario, acción, recurso..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acción
                </label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todas las acciones</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="create">Crear</option>
                  <option value="update">Actualizar</option>
                  <option value="delete">Eliminar</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severidad
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todas las severidades</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={loadLogs}
              className="mt-3 text-sm text-red-600 hover:text-red-500 font-medium"
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {/* Tabla de logs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron logs
              </h3>
              <p className="text-gray-500">
                {searchTerm || Object.values(filters).some(f => f) 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay registros de auditoría disponibles'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Vista de escritorio */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recurso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severidad
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.user_email || 'Sistema'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getActionColor(log.action)}`}>
                            {log.action_display}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.resource_type}
                          {log.resource_id && ` #${log.resource_id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {log.ip_address || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(log.severity)}`}>
                            {log.severity_display}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleViewDetails(log.id)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista móvil */}
              <div className="lg:hidden">
                {logs.map((log) => (
                  <div key={log.id} className="border-b border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getActionColor(log.action)}`}>
                            {log.action_display}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(log.severity)}`}>
                            {log.severity_display}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.user_email || 'Sistema'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(log.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewDetails(log.id)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><span className="font-medium">Recurso:</span> {log.resource_type}{log.resource_id && ` #${log.resource_id}`}</p>
                      {log.ip_address && (
                        <p><span className="font-medium">IP:</span> <span className="font-mono">{log.ip_address}</span></p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-sm text-gray-700">
              Mostrando página {page} de {totalPages} ({totalCount} registros total)
            </div>
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </button>
              
              <div className="hidden sm:flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
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
                  );
                })}
              </div>
              
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {detailsOpen && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Detalles del Registro de Auditoría
              </h3>
              <button
                onClick={() => setDetailsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.user_email || 'Sistema'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha/Hora</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedLog.timestamp)}
                  </p>
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
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedLog.institution_name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">IP</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">
                    {selectedLog.ip_address || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Agent</label>
                  <p className="mt-1 text-xs text-gray-900 font-mono break-all">
                    {selectedLog.user_agent || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <p className="mt-1 text-sm text-gray-900">{selectedLog.description}</p>
              </div>
              
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Metadata</label>
                  <pre className="mt-1 text-xs bg-gray-100 p-3 rounded-md overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-4 mt-4 border-t">
              <button
                onClick={() => setDetailsOpen(false)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditDashboard;