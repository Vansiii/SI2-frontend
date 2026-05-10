import React, { useState, useEffect } from 'react';
import { FileText, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { useDocumentTypes } from '../hooks/useDocumentTypes';
import type { DocumentType, DocumentTypeWrite } from '../types';

interface DocumentTypeFormProps {
  open: boolean;
  onClose: () => void;
  documentType?: DocumentType;
}

export function DocumentTypeForm({ open, onClose, documentType }: DocumentTypeFormProps) {
  const { createDocumentType, updateDocumentType, isCreating, isUpdating } = useDocumentTypes();
  const isEditing = Boolean(documentType);

  const [formData, setFormData] = useState<DocumentTypeWrite>({
    code: '',
    name: '',
    description: '',
    category: 'OTHER',
    default_formats: ['PDF'],
    default_max_size_mb: 5,
    default_validity_days: null,
    is_active: true,
    display_order: 0,
    icon: 'file-text',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (documentType) {
      setFormData({
        code: documentType.code,
        name: documentType.name,
        description: documentType.description || '',
        category: documentType.category,
        default_formats: documentType.default_formats,
        default_max_size_mb: parseFloat(documentType.default_max_size_mb),
        default_validity_days: documentType.default_validity_days,
        is_active: documentType.is_active,
        display_order: documentType.display_order,
        icon: documentType.icon || 'file-text',
      });
    } else {
      // Reset form for new document type
      setFormData({
        code: '',
        name: '',
        description: '',
        category: 'OTHER',
        default_formats: ['PDF'],
        default_max_size_mb: 5,
        default_validity_days: null,
        is_active: true,
        display_order: 0,
        icon: 'file-text',
      });
    }
    setErrors({});
  }, [documentType, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.default_max_size_mb <= 0) {
      newErrors.default_max_size_mb = 'El tamaño máximo debe ser mayor a 0';
    }

    if (formData.default_formats.length === 0) {
      newErrors.default_formats = 'Debe seleccionar al menos un formato';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (isEditing && documentType) {
      updateDocumentType({ id: documentType.id, data: formData }, {
        onSuccess: () => onClose(),
      });
    } else {
      createDocumentType(formData, {
        onSuccess: () => onClose(),
      });
    }
  };

  const toggleFormat = (format: string) => {
    setFormData(prev => ({
      ...prev,
      default_formats: prev.default_formats.includes(format)
        ? prev.default_formats.filter(f => f !== format)
        : [...prev.default_formats, format],
    }));
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-0 shadow-2xl">
        <div className="relative overflow-hidden bg-(--tenant-primary) p-8 text-white">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <FileText className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
              <Settings className="h-3 w-3" />
              Catálogo de Documentos
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-white">
              {isEditing ? 'Editar Tipo de Documento' : 'Nuevo Tipo de Documento'}
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
                  placeholder="ID_DOCUMENT"
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
                  placeholder="Cédula de Identidad"
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
                placeholder="Descripción detallada del documento..."
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
                <option value="IDENTITY">Identificación</option>
                <option value="FINANCIAL">Financiero</option>
                <option value="LEGAL">Legal</option>
                <option value="COLLATERAL">Garantías</option>
                <option value="OTHER">Otros</option>
              </select>
            </div>
          </div>

          {/* Configuración de Archivo */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Configuración de Archivo</h3>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Formatos Permitidos *
              </Label>
              <div className="flex flex-wrap gap-2">
                {['PDF', 'JPG', 'PNG', 'DOCX', 'XLSX'].map(format => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => toggleFormat(format)}
                    disabled={isLoading}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-bold transition-all
                      ${formData.default_formats.includes(format)
                        ? 'bg-(--tenant-primary) text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {format}
                  </button>
                ))}
              </div>
              {errors.default_formats && (
                <p className="text-xs font-bold text-red-500">{errors.default_formats}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_size" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Tamaño Máximo (MB) *
                </Label>
                <Input
                  id="max_size"
                  type="number"
                  step="0.01"
                  value={formData.default_max_size_mb}
                  onChange={(e) => setFormData(prev => ({ ...prev, default_max_size_mb: parseFloat(e.target.value) || 0 }))}
                  disabled={isLoading}
                  error={errors.default_max_size_mb}
                  className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validity_days" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Validez (días)
                </Label>
                <Input
                  id="validity_days"
                  type="number"
                  value={formData.default_validity_days || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    default_validity_days: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  disabled={isLoading}
                  placeholder="Opcional"
                  className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
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
              <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Tipo de documento activo</span>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 font-bold shadow-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="flex-1 shadow-xl shadow-(--tenant-primary-soft) font-bold"
            >
              {isEditing ? 'Actualizar Tipo' : 'Crear Tipo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
