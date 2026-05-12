import { Package } from 'lucide-react';
import { ProductTypeListPage } from './ProductTypeListPage';

interface CatalogsManagementPageProps {
  embedded?: boolean;
}

export function CatalogsManagementPage({ embedded = false }: CatalogsManagementPageProps) {
  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-6 w-6 text-(--tenant-primary)" />
            <h1 className="text-2xl font-bold text-slate-900">Tipos de Producto</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Categorías de productos crediticios disponibles en el sistema.
          </p>
        </div>
      )}

      {/* Content Area */}
      <ProductTypeListPage embedded />
    </div>
  );
}
