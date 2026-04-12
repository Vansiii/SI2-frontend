import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { getProducts, deactivateProduct } from '../services/productsApi';
import type { CreditProduct, PaginatedResponse } from '../types';
import { LoadingState } from '../../../components/ui/LoadingState';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  User,
  Zap,
  Shield,
} from 'lucide-react';

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  PERSONAL: 'Personal',
  VEHICULAR: 'Vehicular',
  HIPOTECARIO: 'Hipotecario',
  VIVIENDA_SOCIAL: 'Vivienda Social',
  PYME: 'PYME',
  EMPRESARIAL: 'Empresarial',
  AGROPECUARIO: 'Agropecuario',
  MICROEMPRESA: 'Microempresa',
};

const PRODUCT_TYPE_COLORS: Record<string, string> = {
  PERSONAL: 'bg-blue-50 text-blue-700 border-blue-200',
  VEHICULAR: 'bg-purple-50 text-purple-700 border-purple-200',
  HIPOTECARIO: 'bg-green-50 text-green-700 border-green-200',
  VIVIENDA_SOCIAL: 'bg-teal-50 text-teal-700 border-teal-200',
  PYME: 'bg-orange-50 text-orange-700 border-orange-200',
  EMPRESARIAL: 'bg-red-50 text-red-700 border-red-200',
  AGROPECUARIO: 'bg-lime-50 text-lime-700 border-lime-200',
  MICROEMPRESA: 'bg-amber-50 text-amber-700 border-amber-200',
};

export function ProductListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [products, setProducts] = useState<CreditProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const canCreate = hasPermission('products.create');
  const canEdit = hasPermission('products.edit');
  const canDelete = hasPermission('products.delete');

  useEffect(() => {
    loadProducts(currentPage);
  }, [currentPage]);

  const loadProducts = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const data: PaginatedResponse<CreditProduct> = await getProducts({ page });
      setProducts(data.results);
      setTotalCount(data.count);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (err: unknown) {
      let errorMessage = 'Error al cargar productos';

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
          'No tienes permiso para ver productos. Si acabas de recibir nuevos permisos, ' +
            'cierra sesión y vuelve a iniciar sesión para actualizar tus permisos.'
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (productId: number) => {
    if (!confirm('¿Está seguro de desactivar este producto?')) {
      return;
    }

    try {
      await deactivateProduct(productId);
      await loadProducts(currentPage);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al desactivar producto');
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return <LoadingState message="Cargando productos..." fullScreen={true} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
              Productos Crediticios
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              {totalCount} {totalCount === 1 ? 'producto' : 'productos'} disponibles
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => navigate('/products/new')}
              className="flex items-center justify-center gap-2 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-sm w-full sm:w-auto"
            >
              <Plus className="h-5 w-5" />
              Nuevo Producto
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No hay productos crediticios registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-tight flex-1">
                      {product.name}
                    </h3>
                    <div
                      className={`shrink-0 h-2 w-2 rounded-full ${
                        product.is_active ? 'bg-green-500' : 'bg-slate-400'
                      }`}
                      title={product.is_active ? 'Activo' : 'Inactivo'}
                    />
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      PRODUCT_TYPE_COLORS[product.product_type] ||
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {PRODUCT_TYPE_LABELS[product.product_type]}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Description */}
                  <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                    {product.description}
                  </p>

                  {/* Financial Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4" />
                        Monto
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        Bs {parseFloat(product.min_amount).toLocaleString('es-BO', { maximumFractionDigits: 0 })} - Bs{' '}
                        {parseFloat(product.max_amount).toLocaleString('es-BO', { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4" />
                        Tasa
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {parseFloat(product.interest_rate).toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Plazo
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {product.min_term_months} - {product.max_term_months} meses
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-2">
                      {product.requires_guarantor ? (
                        <User className="h-4 w-4 text-orange-500" />
                      ) : (
                        <User className="h-4 w-4 text-slate-300" />
                      )}
                      <span className="text-xs text-slate-600">
                        {product.requires_guarantor ? 'Requiere garante' : 'Sin garante'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.auto_approval_enabled ? (
                        <Zap className="h-4 w-4 text-green-500" />
                      ) : (
                        <Shield className="h-4 w-4 text-slate-400" />
                      )}
                      <span className="text-xs text-slate-600">
                        {product.auto_approval_enabled ? 'Aprobación automática' : 'Aprobación manual'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                {(canEdit || canDelete) && (
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    {canEdit && (
                      <button
                        onClick={() => navigate(`/products/${product.id}/edit`)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                    )}
                    {canDelete && product.is_active && (
                      <button
                        onClick={() => handleDeactivate(product.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-600">
              Mostrando {products.length} de {totalCount} productos
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-slate-600 px-3">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
