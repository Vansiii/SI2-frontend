import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Plus, Sliders, Edit, Trash2, DollarSign, Calendar, Percent, XCircle, CreditCard, ShieldCheck, Users } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { CardSkeleton } from '../../../components/ui/SkeletonLoader';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductParameterForm } from '../components/ProductParameterForm';
import { useProductParameters } from '../hooks/useProductParameters';

interface ProductParameterListPageProps {
  embedded?: boolean;
}

const ProductParameterListPage: React.FC<ProductParameterListPageProps> = ({ embedded = false }) => {
  const { parameters, isLoading, error, deleteParameter, createParameter, updateParameter, isCreating, isUpdating, isDeleting } = useProductParameters();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<any | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [paramToDelete, setParamToDelete] = useState<number | null>(null);

  const handleCreate = () => {
    setEditingParameter(null);
    setIsFormOpen(true);
  };

  const handleEdit = (parameter: any) => {
    setEditingParameter(parameter);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setParamToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (paramToDelete) {
      deleteParameter(paramToDelete, {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          setParamToDelete(null);
          toast.success('Parámetro eliminado correctamente');
        },
        onError: () => {
          setDeleteConfirmOpen(false);
          setParamToDelete(null);
        },
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingParameter(null);
    toast.success(editingParameter ? 'Parámetro actualizado' : 'Parámetro creado');
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="bg-red-50 border border-red-200 rounded-2xl p-12 text-center"
      >
        <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-900 mb-2">Error de carga</h3>
        <p className="text-red-700">Hubo un problema al cargar los parámetros de productos.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center ${embedded ? 'justify-end' : 'justify-between'} gap-4`}>
        {!embedded && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Parámetros de Crédito
            </h2>
            <p className="text-slate-500 text-sm">Límites, tasas y condiciones por producto bancario.</p>
          </div>
        )}

        <Button onClick={handleCreate} className="shadow-lg font-bold">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Parámetro
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {!parameters || parameters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center"
          >
            <Sliders className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sin configuraciones</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">Personaliza los rangos de monto, plazo y tasa de interés para cada tipo de crédito que ofreces.</p>
            <Button variant="secondary" onClick={handleCreate}>
              Crear parámetros
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parameters.map((param: any, index: number) => (
              <motion.div
                key={param.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group h-full border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Sliders className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 leading-tight">
                            {param.rule_set_name || 'Conjunto de Reglas'}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Parámetros de Crédito
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleEdit(param)} 
                          className="h-8 w-8 p-0 font-bold"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleDelete(param.id)} 
                          className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 border-transparent transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                          <DollarSign className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Rango Monto</span>
                        </div>
                        <p className="text-sm font-black text-slate-900">
                          <span className="text-[10px] text-slate-400">Bs</span> {parseInt(param.min_amount || 0).toLocaleString()} - {parseInt(param.max_amount || 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                          <Percent className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Tasa Interés</span>
                        </div>
                        <p className="text-sm font-black text-slate-900">
                          {param.min_interest_rate || 0}% - {param.max_interest_rate || 0}%
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                          <Calendar className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Plazos (Meses)</span>
                        </div>
                        <p className="text-sm font-black text-slate-900">
                          {param.min_term_months || 0} - {param.max_term_months || 0}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                          <ShieldCheck className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Financiamiento</span>
                        </div>
                        <p className="text-sm font-black text-slate-900">
                          Hasta {param.max_financing_percentage || 0}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <div className="flex flex-wrap gap-2">
                        {param.allowed_currencies && param.allowed_currencies.map((currency: string) => (
                          <Badge key={currency} variant="secondary" className="bg-blue-50 text-blue-600 border-none text-[10px] font-black uppercase">
                            {currency}
                          </Badge>
                        ))}
                        {param.payment_frequencies && param.payment_frequencies.map((freq: string) => (
                          <Badge key={freq} variant="secondary" className="bg-purple-50 text-purple-600 border-none text-[10px] font-black uppercase">
                            {freq}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {param.requires_guarantor && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                            <Users className="h-3 w-3" /> REQUIERE GARANTE
                          </div>
                        )}
                        {param.requires_collateral && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                            <ShieldCheck className="h-3 w-3" /> REQUIERE GARANTÍA
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Formulario */}
      <ProductParameterForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingParameter(null);
        }}
        onSubmit={(data) => {
          if (editingParameter) {
            updateParameter({ id: editingParameter.id, data }, {
              onSuccess: () => handleFormSuccess(),
            });
          } else {
            createParameter(data, {
              onSuccess: () => handleFormSuccess(),
            });
          }
        }}
        parameter={editingParameter || undefined}
        isLoading={isCreating || isUpdating}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Parámetro de Producto"
        message="¿Estás seguro? Esta acción eliminará los límites y tasas configurados para este producto bancario."
        confirmText="Sí, Eliminar Parámetro"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

// Named export para uso directo
export { ProductParameterListPage };

// Default export para lazy loading
export default ProductParameterListPage;
