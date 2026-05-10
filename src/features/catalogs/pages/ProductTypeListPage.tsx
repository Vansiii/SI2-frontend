import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Plus, Package, Edit, Trash2, XCircle } from 'lucide-react';
import { useProductTypes } from '../hooks/useProductTypes';
import { Badge } from '../../../components/ui/Badge';
import { ProductTypeForm } from '../components/ProductTypeForm';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { CardSkeleton } from '../../../components/ui/SkeletonLoader';
import type { ProductType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_LABELS = {
  CONSUMER: 'Consumo',
  COMMERCIAL: 'Comercial',
  MORTGAGE: 'Hipotecario',
  AGRICULTURAL: 'Agropecuario',
};

const CATEGORY_COLORS = {
  CONSUMER: 'bg-blue-50 text-blue-700 border-blue-200',
  COMMERCIAL: 'bg-green-50 text-green-700 border-green-200',
  MORTGAGE: 'bg-purple-50 text-purple-700 border-purple-200',
  AGRICULTURAL: 'bg-orange-50 text-orange-700 border-orange-200',
};

interface ProductTypeListPageProps {
  embedded?: boolean;
}

export const ProductTypeListPage: React.FC<ProductTypeListPageProps> = ({ embedded = false }) => {
  const { productTypes, isLoading, error, deleteProductType, isDeleting } = useProductTypes();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<ProductType | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<number | null>(null);

  const handleCreate = () => {
    setEditingType(null);
    setIsFormOpen(true);
  };

  const handleEdit = (type: ProductType) => {
    setEditingType(type);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setTypeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (typeToDelete) {
      deleteProductType(typeToDelete, {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          setTypeToDelete(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <p className="text-red-700">Hubo un problema al cargar los tipos de producto.</p>
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
              <Package className="h-5 w-5 text-(--tenant-primary)" />
              Tipos de Producto
            </h2>
            <p className="text-slate-500 text-sm">Categorías de productos crediticios disponibles.</p>
          </div>
        )}

        <Button onClick={handleCreate} className="shadow-lg font-bold">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Tipo
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {!productTypes || productTypes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center"
          >
            <Package className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sin tipos de producto</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              Crea categorías de productos que luego podrás usar al crear productos crediticios.
            </p>
            <Button variant="secondary" onClick={handleCreate}>
              Crear primer tipo
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group h-full border-slate-200 hover:border-(--tenant-primary-soft) hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: type.color ? `${type.color}20` : 'var(--tenant-primary-soft)' }}
                        >
                          <Package className="h-5 w-5" style={{ color: type.color || 'var(--tenant-primary)' }} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 leading-tight">
                            {type.name}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {type.code}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleEdit(type)} 
                          className="h-8 w-8 p-0 font-bold"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleDelete(type.id)} 
                          className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 border-transparent transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {type.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {type.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <Badge 
                        variant="secondary" 
                        className={`${CATEGORY_COLORS[type.category]} border text-[10px] font-black uppercase`}
                      >
                        {CATEGORY_LABELS[type.category]}
                      </Badge>
                      <Badge variant={type.is_active ? 'success' : 'secondary'} className="text-[10px] font-black uppercase">
                        {type.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <ProductTypeForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingType(null);
        }}
        productType={editingType || undefined}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Tipo de Producto"
        message="¿Estás seguro? Esta acción eliminará el tipo de producto del catálogo."
        confirmText="Sí, Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
