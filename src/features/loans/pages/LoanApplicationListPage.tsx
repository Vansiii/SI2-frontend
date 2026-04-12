/**
 * Página de lista de solicitudes de crédito
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getLoanApplications,
  getStatusColor,
  getRiskLevelColor,
  formatApplicationNumber,
  type LoanApplication,
  type LoanApplicationFilters,
} from '../services/loansApi';
import { getClients } from '@/features/clients/services/clientsApi';
import { getProducts } from '@/features/products/services/productsApi';
import type { Client } from '@/features/clients/types';
import type { CreditProduct } from '@/features/products/types';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'SUBMITTED', label: 'Enviada' },
  { value: 'UNDER_REVIEW', label: 'En Revisión' },
  { value: 'APPROVED', label: 'Aprobada' },
  { value: 'REJECTED', label: 'Rechazada' },
  { value: 'DISBURSED', label: 'Desembolsada' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

const RISK_LEVEL_OPTIONS = [
  { value: '', label: 'Todos los niveles' },
  { value: 'LOW', label: 'Bajo' },
  { value: 'MEDIUM', label: 'Medio' },
  { value: 'HIGH', label: 'Alto' },
  { value: 'VERY_HIGH', label: 'Muy Alto' },
];

export default function LoanApplicationListPage() {
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<CreditProduct[]>([]);
  
  // Filtros
  const [filters, setFilters] = useState<LoanApplicationFilters>({
    page: 1,
    page_size: 20,
  });
  
  // Paginación
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [clientsData, productsData] = await Promise.all([
        getClients({ page_size: 100 }),
        getProducts({ page_size: 100, is_active: true }),
      ]);
      
      setClients(clientsData.results || clientsData);
      setProducts(productsData.results || productsData);
    } catch (err: unknown) {
      console.error('Error loading initial data:', err);
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getLoanApplications(filters);
      
      setApplications(response.results);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / (filters.page_size || 20)));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof LoanApplicationFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getStatusBadge = (status: string, statusDisplay: string) => {
    const color = getStatusColor(status);
    const colorClasses: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      emerald: 'bg-emerald-100 text-emerald-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[color] || colorClasses.gray}`}>
        {statusDisplay}
      </span>
    );
  };

  const getRiskBadge = (riskLevel: string | undefined, riskLevelDisplay: string | undefined) => {
    if (!riskLevel || !riskLevelDisplay) return null;
    
    const color = getRiskLevelColor(riskLevel);
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.gray}`}>
        {riskLevelDisplay}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Crédito</h1>
            <p className="text-gray-600 mt-2">Gestiona las solicitudes de crédito de tu institución</p>
          </div>
          <button
            onClick={() => navigate('/loans/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Solicitud
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            <select
              value={filters.client || ''}
              onChange={(e) => handleFilterChange('client', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los clientes</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
            <select
              value={filters.product || ''}
              onChange={(e) => handleFilterChange('product', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los productos</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nivel de Riesgo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Riesgo</label>
            <select
              value={filters.risk_level || ''}
              onChange={(e) => handleFilterChange('risk_level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {RISK_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando solicitudes...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Tabla */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solicitud
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Riesgo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes</p>
                          <p className="text-gray-500 mb-4">Comienza creando tu primera solicitud de crédito</p>
                          <button
                            onClick={() => navigate('/loans/new')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Nueva Solicitud
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    applications.map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatApplicationNumber(application.application_number)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.credit_score && (
                                <span>Score: {application.credit_score}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {application.client_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {application.product_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${parseFloat(application.requested_amount).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.term_months} meses
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(application.status, application.status_display)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRiskBadge(application.risk_level, application.risk_level_display)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(application.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/loans/${application.id}`)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Ver
                          </button>
                          {application.can_be_edited && (
                            <button
                              onClick={() => navigate(`/loans/${application.id}/edit`)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Editar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {((filters.page || 1) - 1) * (filters.page_size || 20) + 1} a{' '}
                {Math.min((filters.page || 1) * (filters.page_size || 20), totalCount)} de {totalCount} solicitudes
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange((filters.page || 1) - 1)}
                  disabled={filters.page === 1}
                  className="px-3 py-2 border border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 border rounded-lg ${
                        filters.page === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                  disabled={filters.page === totalPages}
                  className="px-3 py-2 border border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}