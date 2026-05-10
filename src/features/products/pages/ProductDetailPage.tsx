/**
 * Página de detalle completo de un producto crediticio
 */

import { useNavigate, useParams } from 'react-router-dom';
import { CreditProductDetail } from '../components';
import type { CreditProductFull } from '../types';

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  if (!productId) {
    navigate('/products');
    return null;
  }

  const handleEdit = (product: CreditProductFull) => {
    navigate(`/products/${product.id}/edit`);
  };

  const handleBack = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <CreditProductDetail
          productId={parseInt(productId)}
          onEdit={handleEdit}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
