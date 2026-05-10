import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Settings, Info, Layers, ChevronRight, FileText } from 'lucide-react';
import type { TenantRuleSet, TenantRuleSetWrite } from '../types/ruleSet.types';

interface RuleSetFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TenantRuleSetWrite) => void;
  ruleSet?: TenantRuleSet;
  isLoading?: boolean;
}

export function RuleSetForm({ open, onClose, onSubmit, ruleSet, isLoading = false }: RuleSetFormProps) {
  const [formData, setFormData] = useState<TenantRuleSetWrite>({
    name: '',
    version: '1.0',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (ruleSet) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: ruleSet.name,
        version: ruleSet.version,
        description: ruleSet.description || '',
      });
    } else {
      setFormData({
        name: '',
        version: '1.0',
        description: '',
      });
    }
    setErrors({});
  }, [ruleSet, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'La versión es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData);
  };

  const handleChange = (field: keyof TenantRuleSetWrite, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-(--tenant-primary) p-8 text-(--tenant-on-primary) relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Settings className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
              <Layers className="h-3 w-3" />
              Administración de Reglas
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-white">
              {ruleSet ? 'Editar Configuración' : 'Nuevo Conjunto de Reglas'}
            </DialogTitle>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FileText className="h-3 w-3" /> Datos Generales
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Nombre del Conjunto
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ej: Reglas de Crédito Personal"
                  disabled={isLoading}
                  error={errors.name}
                  className="w-full h-11 bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Versión
                </Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => handleChange('version', e.target.value)}
                  placeholder="1.0"
                  disabled={isLoading}
                  error={errors.version}
                  className="w-full h-11 bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all text-center font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Descripción del Negocio
              </Label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Explica el propósito de este conjunto de reglas..."
                rows={4}
                disabled={isLoading}
                className={`
                  w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl resize-none text-sm transition-all
                  focus:outline-none focus:bg-white focus:border-(--tenant-primary) focus:ring-0
                  ${errors.description ? 'border-red-500 bg-red-50' : ''}
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              />
              <div className="flex justify-end">
                <span className={`text-[10px] font-bold ${(formData.description?.length || 0) > 500 ? 'text-red-500' : 'text-slate-400'}`}>
                  {formData.description?.length || 0}/500
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800/80">
              <strong>Estrategia de Despliegue:</strong> Las nuevas reglas se crean como <strong>Borrador</strong>. 
              Deberás completar la configuración de elegibilidad, scoring y documentos antes de activarlas en producción.
            </p>
          </div>

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
              className="flex-1 shadow-xl font-bold"
            >
              {ruleSet ? 'Guardar Cambios' : 'Crear Estrategia'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

