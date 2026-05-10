import React, { useState, useEffect } from 'react';
import { Package, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { useProductTypes } from '../hooks/useProductTypes';
import type { ProductType } from '../types';

interface ProductTypeFormProps {
  open: boolean;
  onClose: () => void;
  productType?: ProductType;
}

const COLOR_OPTIONS = [
  { value: '#3B82F6', label: 'Azul' },
  { value: '#10B981', label: 'Verde' },
  { value: '#8B5CF6', label: 'Púrpura' },
  { value: '#F59E0B', label: 'Naranja' },
  { value: '#EF4444', label: 'Rojo' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#6366F1', label: 'Índigo' },
];

export function ProductTypeForm({ open, onClose, productType }: ProductTypeFormProps) {
  const { createProductType, updateProductType, isCreating, isUpdating } = useProductTypes();
  const isEditing = Boolean(productType);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: 'CONSUMER' as 'CONSUMER' | 'COMMERCIAL' | 'MORTGAGE' | 'AGRICULTURAL',
    icon: 'package',
    color: '#3B82F6',
    is_active: true,
    display_order: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productType) {
      setFormData({
        code: productType.code,
        name: productType.name,
        description: productType.description || '',
        category: productType.category,
        icon: productType.icon || 'package',
        color: productType.color || '#3B82F6',
        is_active: productType.is_active,
        display_order: productType.display_order,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        category: 'CONSUMER',
        icon: 'package',
        color: '#3B82F6',
        is_active: true,
        display_order: 0,
      });
    }
    setErrors({});
  }, [productType, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (isEditing && productType) {
      updateProductType({ id: productType.id, data: formData }, {
        onSuccess: () => onClose(),
      });
    } else {
      createProductType(formData, {
        onSuccess: () => onClose(),
      });
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 shadow-2xl">
        <div className="relative overflow-hidden bg-(--tenant-primary) p-8 text-white">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Package className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
              <Settings className="h-3 w-3" />
              Catálogo de Productos
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-white">
              {isEditing ? 'Editar Tipo de Producto' : 'Nuevo Tipo de Producto'}
            </DialogTitle>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white max-h-[calc(90vh-180px)] overflow-y-auto custom-scrollbar">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Información Básica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Código *
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  disabled={isLoading || isEditing}
                  error={errors.code}
                  placeholder="PERSONAL"
                  className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
                {isEditing && (
                  <p className="text-xs text-slate-500">El código no puede ser modificado</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Nombre *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isLoading}
                  error={errors.name}
                  placeholder="Crédito Personal"
                  className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Descripción
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={isLoading}
                rows={3}
                placeholder="Descripción del tipo de producto..."
                className="w-full px-4 py-2 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-(--tenant-primary) transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Categoría *
              </Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                disabled={isLoading}
                className="w-full h-11 px-4 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-(--tenant-primary) transition-all"
              >
                <option value="CONSUMER">Consumo</option>
                <option value="COMMERCIAL">Comercial</option>
                <option value="MORTGAGE">Hipotecario</option>
                <option value="AGRICULTURAL">Agropecuario</option>
              </select>
            </div>
          </div>

          {/* Apariencia */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Apariencia</h3>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: option.value }))}
                    disabled={isLoading}
                    className={`
                      relative w-12 h-12 rounded-lg transition-all
                      ${formData.color === option.value ? 'ring-2 ring-offset-2 ring-(--tenant-primary) scale-110' : 'hover:scale-105'}
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    style={{ backgroundColor: option.value }}
                    title={option.label}
                  >
                    {formData.color === option.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer group p-4 bg-slate-50 rounded-xl">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                disabled={isLoading}
                className="w-5 h-5 text-(--tenant-primary) border-slate-300 rounded focus:ring-(--tenant-primary)"
              />
              <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Tipo de producto activo</span>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="pt-6 mt-8 border-t border-slate-100 flex items-center gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 shadow-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="flex-1 shadow-lg"
            >
              {isEditing ? 'Actualizar Tipo' : 'Crear Tipo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
