import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Edit2, Trash2, Eye, CheckCircle } from 'lucide-react';
import { fetchTemplates, deleteTemplate, setDefaultTemplate } from '../services/contractsApi';
import type { ContractTemplate } from '../types';
import { LoadingState } from '../../../components/ui/LoadingState';

export function ContractTemplatePage() {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await fetchTemplates();
      setTemplates(data);
      setError('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al cargar las plantillas');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta plantilla?')) return;
    try {
      await deleteTemplate(id);
      loadTemplates();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al eliminar la plantilla');
      }
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultTemplate(id);
      loadTemplates();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al establecer plantilla por defecto');
      }
    }
  };

  if (loading) {
    return <LoadingState message="Cargando plantillas..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Plantillas de Contratos
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Gestiona las plantillas HTML personalizables para generar contratos de crédito.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/contracts"
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all font-medium text-sm"
          >
            Ver Contratos
          </Link>
          <Link
            to="/contracts/templates/create"
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all font-medium text-sm"
          >
            <Plus className="h-4 w-4" />
            Nueva Plantilla
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Grid de Plantillas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm">
            No hay plantillas registradas. Crea tu primera plantilla para comenzar a generar contratos.
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${
                      template.is_active 
                        ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:scale-110' 
                        : 'bg-slate-100 text-slate-400'
                    } transition-all`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 leading-tight truncate">
                        {template.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Código: {template.code}
                      </p>
                    </div>
                  </div>
                  {template.is_default && (
                    <div className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                      Por Defecto
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {template.description || 'Sin descripción'}
                </p>

                <div className="space-y-3">
                  {/* Producto */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Producto:</span>
                    <span className="font-medium text-slate-900">
                      {template.product_name || 'General'}
                    </span>
                  </div>

                  {/* Versión */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Versión:</span>
                    <span className="font-medium text-slate-900">{template.version}</span>
                  </div>

                  {/* Contratos generados */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Contratos generados:</span>
                    <span className="font-medium text-slate-900">{template.contracts_count}</span>
                  </div>

                  {/* Requiere firma de garante */}
                  {template.requires_guarantor_signature && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                      <CheckCircle className="h-3 w-3" />
                      Requiere firma de garante
                    </div>
                  )}

                  {/* Estado */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                      template.is_active
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {template.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-1">
                {!template.is_default && template.is_active && (
                  <button
                    onClick={() => handleSetDefault(template.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors text-xs font-semibold"
                    title="Establecer como plantilla por defecto"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                )}
                <Link
                  to={`/contracts/templates/${template.id}/preview`}
                  className="flex-1 flex items-center justify-center gap-1.5 p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors text-xs font-semibold"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <div className="w-px h-6 bg-slate-200"></div>
                <Link
                  to={`/contracts/templates/${template.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1.5 p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-xs font-semibold"
                >
                  <Edit2 className="h-4 w-4" />
                </Link>
                {template.is_active && (
                  <>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-xs font-semibold"
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

      {/* Información sobre variables */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2 text-sm">Variables Disponibles</h3>
        <p className="text-xs text-blue-700 mb-3">
          Puedes usar las siguientes variables en tus plantillas HTML:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <code className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-800">
            {'{{institution_name}}'}
          </code>
          <code className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-800">
            {'{{borrower_name}}'}
          </code>
          <code className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-800">
            {'{{principal_amount}}'}
          </code>
          <code className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-800">
            {'{{interest_rate}}'}
          </code>
          <code className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-800">
            {'{{term_months}}'}
          </code>
          <code className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-800">
            {'{{monthly_payment}}'}
          </code>
          <code className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-800">
            {'{{contract_number}}'}
          </code>
          <code className="bg-white px-2 py-1 rounded border border-blue-200 text-blue-800">
            {'{{contract_date}}'}
          </code>
        </div>
      </div>
    </div>
  );
}
