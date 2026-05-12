import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { FileText, FileType, HardDrive, Clock, ChevronRight, Layers } from 'lucide-react';
import type { DocumentRequirement, DocumentRequirementWrite } from '../types/documentRequirement.types';
import { useActiveProducts } from '../../products/hooks';
import { useRuleSets } from '../hooks/useRuleSets';
import type { CreditProduct } from '../../products/types';
import type { TenantRuleSet } from '../types/ruleSet.types';

interface DocumentRequirementFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentRequirementWrite) => void;
  requirement?: DocumentRequirement;
  isLoading?: boolean;
}

const DOCUMENT_TYPES = [
  { value: 'ID_DOCUMENT', label: 'Documento de Identidad' },
  { value: 'INCOME_PROOF', label: 'Comprobante de Ingresos' },
  { value: 'BANK_STATEMENT', label: 'Extracto Bancario' },
  { value: 'EMPLOYMENT_LETTER', label: 'Carta de Trabajo' },
  { value: 'TAX_RETURN', label: 'Declaración de Impuestos' },
  { value: 'UTILITY_BILL', label: 'Factura de Servicios' },
  { value: 'PROPERTY_DEED', label: 'Escritura de Propiedad' },
  { value: 'OTHER', label: 'Otro' },
];

const FILE_FORMATS = [
  { value: 'application/pdf', label: 'PDF' },
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/jpg', label: 'JPG' },
];

export function DocumentRequirementForm({ 
  open, 
  onClose, 
  onSubmit, 
  requirement, 
  isLoading = false 
}: DocumentRequirementFormProps) {
  const { data: productsData } = useActiveProducts();
  const { data: ruleSetsData } = useRuleSets();
  
  const products: CreditProduct[] = (productsData as any)?.results || [];
  const ruleSets: TenantRuleSet[] = Array.isArray(ruleSetsData) 
    ? ruleSetsData 
    : ((ruleSetsData as any)?.results || []);

  const [formData, setFormData] = useState<DocumentRequirementWrite>({
    rule_set: 0,
    product: 0,
    document_type: 'ID_DOCUMENT',
    document_name: '',
    is_mandatory: true,
    max_validity_days: 90,
    allowed_formats: ['application/pdf', 'image/jpeg', 'image/png'],
    max_file_size_mb: 5,
    display_order: 1,
    description: '',
    requires_manual_review: true,
  });

  const [, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (requirement) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        rule_set: requirement.rule_set,
        product: requirement.product,
        document_type: requirement.document_type,
        document_name: requirement.document_name,
        is_mandatory: requirement.is_mandatory,
        max_validity_days: requirement.max_validity_days || 90,
        allowed_formats: requirement.allowed_formats,
        max_file_size_mb: parseFloat(requirement.max_file_size_mb),
        display_order: requirement.display_order,
        description: requirement.description || '',
        requires_manual_review: requirement.requires_manual_review,
      });
    }
    setErrors({});
  }, [requirement, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.rule_set) newErrors.rule_set = 'Requerido';
    if (!formData.product) newErrors.product = 'Requerido';
    if (!formData.document_name) newErrors.document_name = 'Requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData);
  };

  const handleFormatToggle = (format: string) => {
    setFormData(prev => ({
      ...prev,
      allowed_formats: prev.allowed_formats.includes(format)
        ? prev.allowed_formats.filter(f => f !== format)
        : [...prev.allowed_formats, format],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-(--tenant-primary) p-6 text-(--tenant-on-primary) relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <FileText className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
              <FileType className="h-3 w-3" />
              Expediente Digital
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-white">
              {requirement ? 'Editar Requisito' : 'Nuevo Documento Requerido'}
            </DialogTitle>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            {/* Seccion 1: Clasificación */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Layers className="h-3 w-3" /> Clasificación y Destino
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule_set" className="text-xs font-bold text-slate-600">Conjunto de Reglas</Label>
                  <select
                    id="rule_set"
                    value={formData.rule_set}
                    onChange={(e) => setFormData(prev => ({ ...prev, rule_set: parseInt(e.target.value) || 0 }))}
                    className="w-full h-10 px-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-(--tenant-primary) transition-all"
                  >
                    <option value={0}>Seleccionar conjunto...</option>
                    {ruleSets.map(rs => (
                      <option key={rs.id} value={rs.id}>{rs.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product" className="text-xs font-bold text-slate-600">Producto Crediticio</Label>
                  <select
                    id="product"
                    value={formData.product}
                    onChange={(e) => setFormData(prev => ({ ...prev, product: parseInt(e.target.value) || 0 }))}
                    className="w-full h-10 px-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-(--tenant-primary) transition-all"
                  >
                    <option value={0}>Seleccionar producto...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Seccion 2: Identificación */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FileText className="h-3 w-3" /> Detalle del Documento
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="document_type" className="text-xs font-bold text-slate-600">Categoría</Label>
                  <select
                    id="document_type"
                    value={formData.document_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, document_type: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-(--tenant-primary) transition-all"
                  >
                    {DOCUMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document_name" className="text-xs font-bold text-slate-600">Nombre Público</Label>
                  <Input
                    id="document_name"
                    value={formData.document_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, document_name: e.target.value }))}
                    placeholder="Ej: Cédula de Identidad"
                    className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold text-slate-600">Instrucciones para el cliente</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Explica cómo debe ser cargado el documento..."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl resize-none text-sm focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
              </div>
            </div>

            {/* Seccion 3: Restricciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <HardDrive className="h-3 w-3" /> Especificaciones Técnicas
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_file_size_mb" className="text-xs font-bold text-slate-600">Tamaño (MB)</Label>
                    <Input
                      id="max_file_size_mb"
                      type="number"
                      value={formData.max_file_size_mb}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_file_size_mb: parseFloat(e.target.value) }))}
                      className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_order" className="text-xs font-bold text-slate-600">Prioridad</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                      className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 mb-2 block">Formatos Permitidos</Label>
                  <div className="flex flex-wrap gap-2">
                    {FILE_FORMATS.map(f => {
                      const isSelected = formData.allowed_formats.includes(f.value);
                      return (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => handleFormatToggle(f.value)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter border-2 transition-all ${isSelected ? 'border-(--tenant-primary) bg-(--tenant-primary-soft) text-(--tenant-primary)' : 'border-slate-100 text-slate-400'}`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Control de Validez
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="max_validity_days" className="text-xs font-bold text-slate-600">Vigencia (Días)</Label>
                  <Input
                    id="max_validity_days"
                    type="number"
                    value={formData.max_validity_days || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_validity_days: parseInt(e.target.value) || null }))}
                    placeholder="Ej: 90"
                    className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                  />
                </div>
                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.is_mandatory}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-(--tenant-primary) focus:ring-(--tenant-primary)"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-700 uppercase tracking-tighter">Obligatorio</span>
                      <span className="block text-[10px] text-slate-400 font-medium">Bloquea el avance sin carga</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.requires_manual_review}
                      onChange={(e) => setFormData(prev => ({ ...prev, requires_manual_review: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-(--tenant-primary) focus:ring-(--tenant-primary)"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-700 uppercase tracking-tighter">Revisión Manual</span>
                      <span className="block text-[10px] text-slate-400 font-medium">Requiere firma de analista</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1 font-bold shadow-sm">
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="flex-1 shadow-xl shadow-(--tenant-primary-soft) font-bold"
            >
              {requirement ? 'Actualizar Documento' : 'Añadir al Expediente'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

