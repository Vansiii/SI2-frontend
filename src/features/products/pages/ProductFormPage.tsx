import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, createProduct, updateProduct } from '../services/productsApi';
import type { CreateProductData } from '../types';
import { LoadingState } from '../../../components/ui/LoadingState';
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  TrendingUp,
  Settings,
} from 'lucide-react';

export function ProductFormPage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const isEditing = Boolean(productId);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    product_type: 'PERSONAL',
    min_amount: '',
    max_amount: '',
    interest_rate: '',
    interest_type: 'FIXED',
    min_term_months: 12,
    max_term_months: 60,
    commission_rate: '0',
    insurance_rate: '0',
    amortization_system: 'FRENCH',
    requires_guarantor: false,
    required_documents: [],
    min_credit_score: null,
    auto_approval_enabled: false,
    display_order: 0,
  });

  useEffect(() => {
    if (isEditing && productId) {
      loadProduct(parseInt(productId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isEditing]);

  const loadProduct = async (id: number) => {
    try {
      setLoading(true);
      const product = await getProductById(id);
      setFormData({
        name: product.name,
        description: product.description,
        product_type: product.product_type,
        min_amount: product.min_amount,
        max_amount: product.max_amount,
        interest_rate: product.interest_rate,
        interest_type: product.interest_type,
        min_term_months: product.min_term_months,
        max_term_months: product.max_term_months,
        commission_rate: product.commission_rate,
        insurance_rate: product.insurance_rate,
        amortization_system: product.amortization_system,
        requires_guarantor: product.requires_guarantor,
        required_documents: product.required_documents || [],
        min_credit_score: product.min_credit_score,
        auto_approval_enabled: product.auto_approval_enabled,
        display_order: product.display_order,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al cargar producto');
      }
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      if (isEditing && productId) {
        await updateProduct({ productId: parseInt(productId), updateData: formData });
      } else {
        await createProduct(formData);
      }
      navigate('/products');
    } catch (err: unknown) {
      if (err instanceof Error && 'fieldErrors' in err) {
        setErrors((err as Record<string, unknown>).fieldErrors as Record<string, string> || {});
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al guardar producto');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Cargando datos del producto..." fullScreen={true} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
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
              ? 'Actualiza la configuración del producto crediticio'
              : 'Configura un nuevo producto crediticio'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Información Básica
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tipo de Producto *
              </label>
              <select
                name="product_type"
                value={formData.product_type}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.product_type ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              >
                <option value="PERSONAL">Personal</option>
                <option value="VEHICULAR">Vehicular</option>
                <option value="HIPOTECARIO">Hipotecario</option>
                <option value="VIVIENDA_SOCIAL">Vivienda Social</option>
                <option value="PYME">PYME</option>
                <option value="EMPRESARIAL">Empresarial</option>
                <option value="AGROPECUARIO">Agropecuario</option>
                <option value="MICROEMPRESA">Microempresa</option>
              </select>
              {errors.product_type && (
                <p className="text-red-600 text-xs mt-1">{errors.product_type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.description ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.description && (
                <p className="text-red-600 text-xs mt-1">{errors.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Montos y Plazos */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Montos y Plazos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Monto Mínimo (Bs) *
              </label>
              <input
                type="number"
                name="min_amount"
                value={formData.min_amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.min_amount ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.min_amount && (
                <p className="text-red-600 text-xs mt-1">{errors.min_amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Monto Máximo (Bs) *
              </label>
              <input
                type="number"
                name="max_amount"
                value={formData.max_amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.max_amount ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.max_amount && (
                <p className="text-red-600 text-xs mt-1">{errors.max_amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Plazo Mínimo (meses) *
              </label>
              <input
                type="number"
                name="min_term_months"
                value={formData.min_term_months}
                onChange={handleChange}
                min="1"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.min_term_months ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.min_term_months && (
                <p className="text-red-600 text-xs mt-1">{errors.min_term_months}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Plazo Máximo (meses) *
              </label>
              <input
                type="number"
                name="max_term_months"
                value={formData.max_term_months}
                onChange={handleChange}
                min="1"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.max_term_months ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.max_term_months && (
                <p className="text-red-600 text-xs mt-1">{errors.max_term_months}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tasas e Intereses */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Tasas e Intereses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tasa de Interés (%) *
              </label>
              <input
                type="number"
                name="interest_rate"
                value={formData.interest_rate}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.interest_rate ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.interest_rate && (
                <p className="text-red-600 text-xs mt-1">{errors.interest_rate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tipo de Tasa *
              </label>
              <select
                name="interest_type"
                value={formData.interest_type}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.interest_type ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              >
                <option value="FIXED">Fija</option>
                <option value="VARIABLE">Variable</option>
                <option value="MIXED">Mixta</option>
              </select>
              {errors.interest_type && (
                <p className="text-red-600 text-xs mt-1">{errors.interest_type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tasa de Comisión (%) *
              </label>
              <input
                type="number"
                name="commission_rate"
                value={formData.commission_rate}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.commission_rate ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.commission_rate && (
                <p className="text-red-600 text-xs mt-1">{errors.commission_rate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tasa de Seguro (%) *
              </label>
              <input
                type="number"
                name="insurance_rate"
                value={formData.insurance_rate}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.insurance_rate ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              />
              {errors.insurance_rate && (
                <p className="text-red-600 text-xs mt-1">{errors.insurance_rate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Configuración Adicional */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Configuración Adicional
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sistema de Amortización *
              </label>
              <select
                name="amortization_system"
                value={formData.amortization_system}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.amortization_system ? 'border-red-300' : 'border-slate-300'
                }`}
                required
              >
                <option value="FRENCH">Francés (Cuota Fija)</option>
                <option value="GERMAN">Alemán (Capital Fijo)</option>
                <option value="AMERICAN">Americano (Pago al Final)</option>
              </select>
              {errors.amortization_system && (
                <p className="text-red-600 text-xs mt-1">{errors.amortization_system}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Score Mínimo Requerido
              </label>
              <input
                type="number"
                name="min_credit_score"
                value={formData.min_credit_score || ''}
                onChange={handleChange}
                min="0"
                max="100"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.min_credit_score ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.min_credit_score && (
                <p className="text-red-600 text-xs mt-1">{errors.min_credit_score}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Orden de Visualización
              </label>
              <input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.display_order ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.display_order && (
                <p className="text-red-600 text-xs mt-1">{errors.display_order}</p>
              )}
            </div>

            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="requires_guarantor"
                  checked={formData.requires_guarantor}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Requiere Garante</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="auto_approval_enabled"
                  checked={formData.auto_approval_enabled}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Aprobación Automática</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-[0_0_20px_rgba(37,99,235,0.2)]"
          >
            <Save className="h-4 w-4" />
            {submitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}
