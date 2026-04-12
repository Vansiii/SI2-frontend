/**
 * Página de formulario para crear/editar solicitud de crédito
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  createLoanApplication,
  updateLoanApplication,
  getLoanApplication,
  calculateMonthlyPayment,
  type CreateLoanApplicationData,
  type UpdateLoanApplicationData,
} from '../services/loansApi';
import { getClients } from '@/features/clients/services/clientsApi';
import { getProducts } from '@/features/products/services/productsApi';
import { checkResourceLimit } from '@/utils/subscriptionLimits';
import type { Client } from '@/features/clients/types';
import type { CreditProduct } from '@/features/products/types';
import { LimitWarningBanner } from '@/components/subscription/LimitWarningBanner';

interface FormData {
  client: number;
  product: number;
  requested_amount: string;
  term_months: number;
  purpose?: string;
}
export default function LoanApplicationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<CreditProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CreditProduct | null>(null);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [limitWarning, setLimitWarning] = useState<{ allowed: boolean; shouldWarn: boolean; message?: string; currentUsage: number; maxLimit: number; usagePercentage: number } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>();

  const watchedValues = watch();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      loadLoanApplication();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, id]);

  useEffect(() => {
    // Calcular cuota mensual cuando cambien los valores
    if (watchedValues.requested_amount && watchedValues.term_months && selectedProduct) {
      const amount = parseFloat(watchedValues.requested_amount);
      const months = watchedValues.term_months;
      const rate = parseFloat(selectedProduct.interest_rate);
      
      if (!isNaN(amount) && !isNaN(months) && !isNaN(rate)) {
        const payment = calculateMonthlyPayment(amount, months, rate);
        setMonthlyPayment(payment);
      }
    } else {
      setMonthlyPayment(null);
    }
  }, [watchedValues.requested_amount, watchedValues.term_months, selectedProduct]);

  useEffect(() => {
    // Verificar límites cuando se selecciona un producto
    if (watchedValues.product && !isEditing) {
      checkLimits();
    }
  }, [watchedValues.product, isEditing]);

  const loadInitialData = async () => {
    try {
      const [clientsData, productsData] = await Promise.all([
        getClients({ page_size: 100 }),
        getProducts({ page_size: 100, is_active: true }),
      ]);
      
      setClients(clientsData.results || clientsData);
      setProducts(productsData.results || productsData);
    } catch (_err: unknown) {
      setError('Error al cargar datos iniciales');
    }
  };

  const loadLoanApplication = async () => {
    try {
      setInitialLoading(true);
      const application = await getLoanApplication(parseInt(id!));
      
      // Solo permitir edición si está en borrador
      if (!application.can_be_edited) {
        setError('Esta solicitud no puede ser editada');
        return;
      }
      
      // Llenar el formulario
      reset({
        client: application.client,
        product: application.product,
        requested_amount: application.requested_amount,
        term_months: application.term_months,
        purpose: application.purpose,
      });
      
      // Encontrar el producto seleccionado
      const product = products.find(p => p.id === application.product);
      setSelectedProduct(product || null);
      
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al cargar la solicitud');
    } finally {
      setInitialLoading(false);
    }
  };

  const checkLimits = async () => {
    try {
      const limitCheck = await checkResourceLimit('loans');
      
      if (!limitCheck.allowed || limitCheck.shouldWarn) {
        setLimitWarning(limitCheck);
      } else {
        setLimitWarning(null);
      }
    } catch (err) {
      console.error('Error checking limits:', err);
    }
  };

  const handleProductChange = (productId: number) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    
    // Validar monto y plazo según el producto
    if (product && watchedValues.requested_amount) {
      const amount = parseFloat(watchedValues.requested_amount);
      if (amount < parseFloat(product.min_amount)) {
        setValue('requested_amount', product.min_amount);
      } else if (amount > parseFloat(product.max_amount)) {
        setValue('requested_amount', product.max_amount);
      }
    }
    
    if (product && watchedValues.term_months) {
      const months = watchedValues.term_months;
      if (months < product.min_term_months) {
        setValue('term_months', product.min_term_months);
      } else if (months > product.max_term_months) {
        setValue('term_months', product.max_term_months);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    // Verificar límites antes de crear
    if (!isEditing) {
      const limitCheck = await checkResourceLimit('loans');
      if (!limitCheck.allowed) {
        setError(limitCheck.message || 'Has excedido el límite de solicitudes');
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditing) {
        await updateLoanApplication(parseInt(id!), data as UpdateLoanApplicationData);
      } else {
        await createLoanApplication(data as CreateLoanApplicationData);
      }

      navigate('/loans');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Error al guardar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando solicitud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/loans')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Solicitudes
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Solicitud' : 'Nueva Solicitud de Crédito'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing ? 'Modifica los datos de la solicitud' : 'Completa los datos para crear una nueva solicitud'}
        </p>
      </div>

      {/* Limit Warning */}
      {limitWarning && (
        <LimitWarningBanner
          resourceType="solicitudes"
          currentUsage={limitWarning.currentUsage}
          maxLimit={limitWarning.maxLimit}
          usagePercentage={limitWarning.usagePercentage}
          onClose={() => setLimitWarning(null)}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Información Básica</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                {...register('client', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name} - {client.document_number}
                  </option>
                ))}
              </select>
              {errors.client && (
                <p className="mt-1 text-sm text-red-600">{errors.client.message}</p>
              )}
            </div>

            {/* Producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producto Crediticio *
              </label>
              <select
                {...register('product', { 
                  valueAsNumber: true,
                  onChange: (e) => handleProductChange(parseInt(e.target.value))
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.product_type}
                  </option>
                ))}
              </select>
              {errors.product && (
                <p className="mt-1 text-sm text-red-600">{errors.product.message}</p>
              )}
            </div>
          </div>

          {/* Información del Producto Seleccionado */}
          {selectedProduct && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Información del Producto</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Monto:</span>
                  <p className="font-medium text-blue-900">
                    ${selectedProduct.min_amount} - ${selectedProduct.max_amount}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Plazo:</span>
                  <p className="font-medium text-blue-900">
                    {selectedProduct.min_term_months} - {selectedProduct.max_term_months} meses
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Tasa:</span>
                  <p className="font-medium text-blue-900">
                    {selectedProduct.interest_rate}% anual
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Tipo:</span>
                  <p className="font-medium text-blue-900">
                    {selectedProduct.interest_type}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Monto Solicitado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto Solicitado *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min={selectedProduct?.min_amount || 0}
                  max={selectedProduct?.max_amount || 999999999}
                  {...register('requested_amount')}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              {selectedProduct && (
                <p className="mt-1 text-xs text-gray-500">
                  Rango: ${selectedProduct.min_amount} - ${selectedProduct.max_amount}
                </p>
              )}
              {errors.requested_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.requested_amount.message}</p>
              )}
            </div>

            {/* Plazo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plazo (meses) *
              </label>
              <input
                type="number"
                min={selectedProduct?.min_term_months || 1}
                max={selectedProduct?.max_term_months || 360}
                {...register('term_months', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="12"
              />
              {selectedProduct && (
                <p className="mt-1 text-xs text-gray-500">
                  Rango: {selectedProduct.min_term_months} - {selectedProduct.max_term_months} meses
                </p>
              )}
              {errors.term_months && (
                <p className="mt-1 text-sm text-red-600">{errors.term_months.message}</p>
              )}
            </div>
          </div>

          {/* Cuota Mensual Estimada */}
          {monthlyPayment && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Cuota Mensual Estimada</h3>
              <p className="text-2xl font-bold text-green-900">
                ${monthlyPayment.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-green-700 mt-1">
                * Cálculo estimado con tasa del {selectedProduct?.interest_rate}% anual
              </p>
            </div>
          )}

          {/* Propósito */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Propósito del Crédito
            </label>
            <textarea
              {...register('purpose')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe el propósito del crédito..."
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/loans')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || (limitWarning?.allowed === false)}
            className={`px-6 py-2 rounded-lg font-medium ${
              loading || (limitWarning?.allowed === false)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : (
              isEditing ? 'Actualizar Solicitud' : 'Crear Solicitud'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}