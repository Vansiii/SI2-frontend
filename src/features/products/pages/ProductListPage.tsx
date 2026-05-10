/**
 * Página de lista de productos crediticios (ACTUALIZADA)
 * Usa los nuevos componentes de visualización
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { CreditProductList } from '../components';
import { useDeactivateProduct } from '../hooks/useProducts';
import type { CreditProduct } from '../types';

export function ProductListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const deactivateMutation = useDeactivateProduct();

  const canCreate = hasPermission('products.create');
  const canEdit = hasPermission('products.edit');
  const canDelete = hasPermission('products.delete');

  const handleView = (product: CreditProduct) => {
    navigate(`/products/${product.id}`);
  };

  const handleEdit = (product: CreditProduct) => {
    navigate(`/products/${product.id}/edit`);
  };

  const handleDelete = async (product: CreditProduct) => {
    if (!confirm(`¿Está seguro de desactivar el producto "${product.name}"?`)) {
      return;
    }

    try {
      await deactivateMutation.mutateAsync(product.id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al desactivar producto');
      }
    }
  };

  const handleCreate = () => {
    navigate('/products/new');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <CreditProductList
          onView={handleView}
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={canDelete ? handleDelete : undefined}
          onCreate={canCreate ? handleCreate : undefined}
        />
      </div>
    </div>
  );
}
