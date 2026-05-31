import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Filter } from 'lucide-react';
import { fetchContracts } from '../services/contractsApi';
import type { Contract, ContractStatus } from '../types';
import { ContractCard } from '../components/ContractCard';
import { LoadingState } from '../../../components/ui/LoadingState';

export function ContractListPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const data = await fetchContracts(params);
      setContracts(data || []);
    } catch (err: unknown) {
      console.error('Error loading contracts:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al cargar los contratos');
      }
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, [statusFilter, searchTerm]);

  const filteredContracts = (contracts || []).filter(contract => {
    const matchesStatus = statusFilter === 'ALL' || contract.status === statusFilter;
    const matchesSearch = !searchTerm || 
      contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.loan_application.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <LoadingState message="Cargando contratos..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Contratos de Crédito
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Gestiona los contratos generados, firmas digitales y documentación legal.
          </p>
        </div>
        <Link
          to="/contracts/templates"
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all font-medium text-sm w-full md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Gestionar Plantillas
        </Link>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por número de contrato o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
            />
          </div>

          {/* Filtro de Estado */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ContractStatus | 'ALL')}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
            >
              <option value="ALL">Todos los estados</option>
              <option value="DRAFT">Borrador</option>
              <option value="PENDING_SIGNATURE">Pendiente de Firma</option>
              <option value="PARTIALLY_SIGNED">Parcialmente Firmado</option>
              <option value="ACTIVE">Activo</option>
              <option value="COMPLETED">Completado</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="DEFAULTED">En Mora</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Contratos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContracts.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'No se encontraron contratos con los filtros aplicados.'
              : 'No hay contratos registrados en esta institución.'}
          </div>
        ) : (
          filteredContracts.map((contract) => (
            <ContractCard key={contract.id} contract={contract} />
          ))
        )}
      </div>

      {/* Estadísticas rápidas */}
      {contracts && contracts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">
              {(contracts || []).filter(c => c.status === 'ACTIVE').length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Contratos Activos</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {(contracts || []).filter(c => c.status === 'PENDING_SIGNATURE' || c.status === 'PARTIALLY_SIGNED').length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Pendientes de Firma</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-purple-600">
              {(contracts || []).filter(c => c.status === 'COMPLETED').length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Completados</div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-red-600">
              {(contracts || []).filter(c => c.status === 'DEFAULTED').length}
            </div>
            <div className="text-xs text-slate-500 mt-1">En Mora</div>
          </div>
        </div>
      )}
    </div>
  );
}
