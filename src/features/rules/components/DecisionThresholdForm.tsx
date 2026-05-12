import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Gauge, TrendingUp, DollarSign, CheckCircle, AlertCircle, XCircle, ChevronRight, Info } from 'lucide-react';
import type { DecisionThreshold, DecisionThresholdWrite } from '../types/decisionThreshold.types';
import { useRuleSets } from '../hooks/useRuleSets';
import type { TenantRuleSet } from '../types/ruleSet.types';

interface DecisionThresholdFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DecisionThresholdWrite) => void;
  threshold?: DecisionThreshold;
  isLoading?: boolean;
}

export function DecisionThresholdForm({ 
  open, 
  onClose, 
  onSubmit, 
  threshold, 
  isLoading = false 
}: DecisionThresholdFormProps) {
  const { data: ruleSetsData } = useRuleSets();
  const ruleSets: TenantRuleSet[] = Array.isArray(ruleSetsData) 
    ? ruleSetsData 
    : ((ruleSetsData as any)?.results || []);
  
  const [formData, setFormData] = useState<DecisionThresholdWrite>({
    rule_set: 0,
    min_score_auto_approval: 70,
    min_score_manual_review: 50,
    max_score_auto_rejection: 49,
    max_amount_auto_approval: null,
    requires_manager_approval_amount: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (threshold) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        rule_set: threshold.rule_set,
        min_score_auto_approval: threshold.min_score_auto_approval,
        min_score_manual_review: threshold.min_score_manual_review,
        max_score_auto_rejection: threshold.max_score_auto_rejection,
        max_amount_auto_approval: threshold.max_amount_auto_approval,
        requires_manager_approval_amount: threshold.requires_manager_approval_amount,
      });
    }
    setErrors({});
  }, [threshold, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.rule_set) newErrors.rule_set = 'Requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const handleChange = (field: keyof DecisionThresholdWrite, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const parseNumber = (val: string | number | null | undefined, allowNull = true): number | null => {
    if (val === null || val === undefined || val === '') return allowNull ? null : 0;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? (allowNull ? null : 0) : num;
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-(--tenant-primary) p-6 text-(--tenant-on-primary) relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Gauge className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
              <TrendingUp className="h-3 w-3" />
              Matriz de Decisiones
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-white">
              {threshold ? 'Ajustar Umbrales' : 'Configurar Nueva Matriz'}
            </DialogTitle>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <Label htmlFor="rule_set" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conjunto de Reglas Vinculado</Label>
            <select
              id="rule_set"
              value={formData.rule_set?.toString() || ''}
              onChange={(e) => handleChange('rule_set', parseInt(e.target.value))}
              className="w-full h-11 px-4 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-(--tenant-primary) transition-all"
            >
              <option value="">Seleccionar conjunto...</option>
              {ruleSets.map((rs: TenantRuleSet) => (
                <option key={rs.id} value={rs.id.toString()}>{rs.name} (v{rs.version})</option>
              ))}
            </select>
            {errors.rule_set && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.rule_set}</p>}
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Gauge className="h-3 w-3" /> Rangos de Scoring (0-100)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="min_score_auto_approval" className="text-xs font-bold text-slate-600">Aprobación</Label>
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                </div>
                <Input
                  id="min_score_auto_approval"
                  type="number"
                  value={formData.min_score_auto_approval ?? ''}
                  onChange={(e) => handleChange('min_score_auto_approval', parseNumber(e.target.value, false))}
                  className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
                <span className="text-[9px] text-slate-400 font-medium leading-none block">Mínimo para aprobación directa</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="min_score_manual_review" className="text-xs font-bold text-slate-600">Revisión</Label>
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                </div>
                <Input
                  id="min_score_manual_review"
                  type="number"
                  value={formData.min_score_manual_review ?? ''}
                  onChange={(e) => handleChange('min_score_manual_review', parseNumber(e.target.value, false))}
                  className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
                <span className="text-[9px] text-slate-400 font-medium leading-none block">Mínimo para enviar a analista</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max_score_auto_rejection" className="text-xs font-bold text-slate-600">Rechazo</Label>
                  <XCircle className="h-3 w-3 text-rose-500" />
                </div>
                <Input
                  id="max_score_auto_rejection"
                  type="number"
                  value={formData.max_score_auto_rejection ?? ''}
                  onChange={(e) => handleChange('max_score_auto_rejection', parseNumber(e.target.value, false))}
                  className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
                <span className="text-[9px] text-slate-400 font-medium leading-none block">Máximo para rechazo directo</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <DollarSign className="h-3 w-3" /> Límites de Autonomía (Bs)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="max_amount_auto_approval" className="text-xs font-bold text-slate-600">Límite Aprobación Auto.</Label>
                <div className="relative">
                  <Input
                    id="max_amount_auto_approval"
                    type="number"
                    value={formData.max_amount_auto_approval ?? ''}
                    onChange={(e) => handleChange('max_amount_auto_approval', parseNumber(e.target.value))}
                    className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all pl-8"
                  />
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requires_manager_approval_amount" className="text-xs font-bold text-slate-600">Límite Aprobación Gerencial</Label>
                <div className="relative">
                  <Input
                    id="requires_manager_approval_amount"
                    type="number"
                    value={formData.requires_manager_approval_amount ?? ''}
                    onChange={(e) => handleChange('requires_manager_approval_amount', parseNumber(e.target.value))}
                    className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all pl-8"
                  />
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-slate-600">
              <strong>Impacto en Operaciones:</strong> Los cambios en estos umbrales afectan inmediatamente a todas las solicitudes que pasen por el motor de evaluación. Asegúrese de realizar pruebas de impacto antes de confirmar.
            </p>
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
              {threshold ? 'Actualizar Matriz' : 'Guardar Configuración'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}