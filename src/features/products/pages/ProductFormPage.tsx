/**
 * Página de formulario de producto crediticio (ACTUALIZADA)
 * Usa el nuevo componente CreditProductForm con soporte para RuleSet y documentos
 */

import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Info } from 'lucide-react';
import { LoadingState } from '../../../components/ui/LoadingState';
import { CreditProductForm } from '../components';
import { useProduct, useCreateProduct, useUpdateProduct } from '../hooks/useProducts';
import type { CreateProductData, UpdateProductData } from '../types';

export function ProductFormPage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const isEditing = Boolean(productId);
  
  // Queries
  const { data: existingProduct, isLoading: loadingProduct } = useProduct(
    productId ? parseInt(productId) : undefined
  );
  
  // Mutations
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const handleSubmit = async (data: CreateProductData | UpdateProductData) => {
    try {
      if (isEditing && productId) {
        await updateMutation.mutateAsync({ 
          productId: parseInt(productId), 
          updateData: data as UpdateProductData
        });
      } else {
        await createMutation.mutateAsync(data as CreateProductData);
      }
      navigate('/products');
    } catch (err: unknown) {
      // Los errores se manejan en el componente del formulario
      console.error('Error al guardar producto:', err);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  if (loadingProduct) {
    return <LoadingState message="Cargando datos del producto..." fullScreen={true} />;
  }

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-900 text-sm">Nueva Arquitectura</h3>
            <p className="text-blue-700 text-sm mt-1">
              Ahora puedes configurar el <strong>Conjunto de Reglas</strong> y los <strong>Documentos Requeridos</strong> directamente desde el producto. Los parámetros, workflow y scoring se heredan del conjunto de reglas seleccionado.
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {isEditing
                ? 'Actualiza la información del producto y su configuración'
                : 'Crea un nuevo producto crediticio con su configuración completa'}
            </p>
          </div>
        </div>

        {/* Formulario */}
        <CreditProductForm
          mode={isEditing ? 'edit' : 'create'}
          initialData={existingProduct ? {
            ...existingProduct,
            document_requirements: existingProduct.document_requirements?.map(req => ({
              document_type: req.document_type,
              is_mandatory: req.is_mandatory,
              display_order: req.display_order,
              max_validity_days: req.max_validity_days,
              allowed_formats: req.allowed_formats,
              max_file_size_mb: req.max_file_size_mb,
            })) || [],
            // Incluir campos de selección
            selected_parameter: existingProduct.selected_parameter,
            selected_eligibility_rules: existingProduct.selected_eligibility_rules || [],
            selected_threshold: existingProduct.selected_threshold,
          } : undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
}
