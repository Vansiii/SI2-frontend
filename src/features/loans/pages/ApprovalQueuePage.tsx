/**
 * Página de Bandeja de Trabajo para Aprobaciones
 * SP3-99: Aprobación o Rechazo de Créditos
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getApprovalQueue,
  type ApprovalQueueResponse,
  type WorkflowStageExecution,
  type ApprovalQueueFilters,
} from '../services/loansApi';

type PriorityFilter = 'all' | 'urgent' | 'normal' | 'low';
type SortBy = 'sla' | 'amount' | 'date';

export function ApprovalQueuePage() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queueData, setQueueData] = useState<ApprovalQueueResponse | null>(null);
  
  // Filtros
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('sla');

  // Cargar cola de aprobaciones
  const loadQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: ApprovalQueueFilters = {};
      
      if (priorityFilter !== 'all') {
        filters.priority = priorityFilter;
      }
      
      const data = await getApprovalQueue(filters);
      setQueueData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la cola de aprobaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [priorityFilter]);

  // Filtrar y ordenar resultados
  const getFilteredAndSortedResults = (): WorkflowStageExecution[] => {
    if (!queueData) return [];
    
    let results = [...queueData.results];
    
    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(item => 
        item.loan_application.application_number.toLowerCase().includes(term) ||
        item.loan_application.client.full_name?.toLowerCase().includes(term) ||
        item.loan_application.product.name?.toLowerCase().includes(term)
      );
    }
    
    // Ordenar
    results.sort((a, b) => {
      switch (sortBy) {
        case 'sla':
          // Vencidas primero, luego por tiempo restante
          if (a.is_overdue && !b.is_overdue) return -1;
          if (!a.is_overdue && b.is_overdue) return 1;
          if (a.time_remaining_hours === null) return 1;
          if (b.time_remaining_hours === null) return -1;
          return a.time_remaining_hours - b.time_remaining_hours;
        
        case 'amount':
          return parseFloat(b.loan_application.requested_amount) - parseFloat(a.loan_application.requested_amount);
        
        case 'date':
          return new Date(a.entered_at).getTime() - new Date(b.entered_at).getTime();
        
        default:
          return 0;
      }
    });
    
    return results;
  };

  const filteredResults = getFilteredAndSortedResults();

  // Función para obtener el badge de prioridad
  const getPriorityBadge = (item: WorkflowStageExecution) => {
    if (item.is_overdue) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Vencida
        </span>
      );
    }
    
    if (item.time_remaining_hours !== null) {
      const timeLimit = item.stage_definition.time_limit_hours || 0;
      const timePercentage = (item.time_remaining_hours / timeLimit) * 100;
      
      if (timePercentage < 25) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Urgente
          </span>
        );
      } else if (timePercentage < 75) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Normal
          </span>
        );
      }
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Baja Prioridad
      </span>
    );
  };

  // Función para formatear tiempo restante
  const formatTimeRemaining = (hours: number | null): string => {
    if (hours === null) return 'Sin límite';
    if (hours < 0) return 'Vencida';
    
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    } else if (hours < 24) {
      return `${Math.round(hours)} h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return `${days}d ${remainingHours}h`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Cargando cola de aprobaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bandeja de Trabajo</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gestiona las solicitudes de crédito pendientes de aprobación
        </p>
      </div>

      {/* Métricas */}
      {queueData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Pendientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{queueData.metrics.total_pending}</p>
              </div>
            </div>
          </div>

          {/* Vencidas */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vencidas (SLA)</p>
                <p className="text-2xl font-bold text-red-600">{queueData.metrics.overdue_count}</p>
              </div>
            </div>
          </div>

          {/* Tasa de Aprobación */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasa de Aprobación</p>
                <p className="text-2xl font-bold text-green-600">{queueData.metrics.approval_rate}%</p>
              </div>
            </div>
          </div>

          {/* Tiempo Promedio */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-purple-600">{queueData.metrics.avg_decision_time_hours}h</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cliente, número, producto..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filtro de Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas</option>
              <option value="urgent">Urgentes</option>
              <option value="normal">Normales</option>
              <option value="low">Baja Prioridad</option>
            </select>
          </div>

          {/* Ordenar Por */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar Por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="sla">SLA (Más urgente primero)</option>
              <option value="amount">Monto (Mayor primero)</option>
              <option value="date">Fecha (Más antigua primero)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs de Prioridad */}
      {queueData && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setPriorityFilter('all')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  priorityFilter === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Todas ({queueData.total_count})
              </button>
              <button
                onClick={() => setPriorityFilter('urgent')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  priorityFilter === 'urgent'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Urgentes ({queueData.urgent_count})
              </button>
              <button
                onClick={() => setPriorityFilter('normal')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  priorityFilter === 'normal'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Normales ({queueData.normal_count})
              </button>
              <button
                onClick={() => setPriorityFilter('low')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  priorityFilter === 'low'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Baja Prioridad ({queueData.low_priority_count})
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Lista de Solicitudes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay solicitudes pendientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Tu cola de aprobaciones está vacía'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredResults.map((item) => (
              <div
                key={item.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/loans/applications/${item.loan_application.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center mb-2">
                      {getPriorityBadge(item)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {item.loan_application.application_number}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        • {item.stage_definition.stage_name}
                      </span>
                    </div>

                    {/* Cliente y Producto */}
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.loan_application.client.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.loan_application.product.name}
                      </p>
                    </div>

                    {/* Detalles */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Monto:</span>
                        <p className="font-medium text-gray-900">
                          ${parseFloat(item.loan_application.requested_amount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Plazo:</span>
                        <p className="font-medium text-gray-900">
                          {item.loan_application.term_months} meses
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Tiempo Restante:</span>
                        <p className={`font-medium ${
                          item.is_overdue ? 'text-red-600' : 
                          item.time_remaining_hours !== null && item.time_remaining_hours < 24 ? 'text-orange-600' : 
                          'text-gray-900'
                        }`}>
                          {formatTimeRemaining(item.time_remaining_hours)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Score:</span>
                        <p className="font-medium text-gray-900">
                          {item.loan_application.credit_score || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="ml-6 flex flex-col space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/loans/applications/${item.loan_application.id}`);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ver Expediente
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resultados */}
      {filteredResults.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Mostrando {filteredResults.length} de {queueData?.total_count || 0} solicitudes
        </div>
      )}
    </div>
  );
}
