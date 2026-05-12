import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { ShieldCheck, Calendar, TrendingDown, CheckSquare, Layers, ChevronRight } from 'lucide-react';
import type { EligibilityRule, EligibilityRuleWrite } from '../types/eligibilityRule.types';
import { CIC_CATEGORIES } from '../types/eligibilityRule.types';
import { useRuleSets } from '../hooks/useRuleSets';
import type { TenantRuleSet } from '../types/ruleSet.types';

interface EligibilityRuleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EligibilityRuleWrite) => void;
  rule?: EligibilityRule;
  ruleSetId?: number;
  isLoading?: boolean;
}

export const EligibilityRuleForm: React.FC<EligibilityRuleFormProps> = ({
  open,
  onClose,
  onSubmit,
  rule,
  ruleSetId,
  isLoading = false,
}) => {
  const { data: ruleSetsData } = useRuleSets();
  const ruleSets: TenantRuleSet[] = Array.isArray(ruleSetsData) 
    ? ruleSetsData 
    : ((ruleSetsData as any)?.results || []);

  const [formData, setFormData] = useState<EligibilityRuleWrite>({
    rule_set: ruleSetId || 0,
    max_debt_to_income_ratio: 40,
    min_income_required: 0,
    min_employment_months: 6,
    max_arrears_allowed: 0,
    allowed_cic_categories: ['A', 'B'],
    min_collateral_coverage: 125,
    min_age: 18,
    max_age: 70,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (rule) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        rule_set: rule.rule_set,
        max_debt_to_income_ratio: parseFloat(rule.max_debt_to_income_ratio),
        min_income_required: parseFloat(rule.min_income_required),
        min_employment_months: rule.min_employment_months,
        max_arrears_allowed: parseFloat(rule.max_arrears_allowed),
        allowed_cic_categories: rule.allowed_cic_categories,
        min_collateral_coverage: parseFloat(rule.min_collateral_coverage),
        min_age: rule.min_age,
        max_age: rule.max_age,
      });
    }
  }, [rule]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.rule_set || formData.rule_set === 0) {
      newErrors.rule_set = 'Debe seleccionar un conjunto de reglas';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleCICToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      allowed_cic_categories: prev.allowed_cic_categories.includes(category)
        ? prev.allowed_cic_categories.filter((c) => c !== category)
        : [...prev.allowed_cic_categories, category],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-(--tenant-primary) p-6 text-(--tenant-on-primary) relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <ShieldCheck className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
              <ShieldCheck className="h-3 w-3" />
              Control de Riesgo
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-white">
              {rule ? 'Editar Criterios' : 'Nuevos Criterios de Elegibilidad'}
            </DialogTitle>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Rule Set Selector */}
          <div className="space-y-2">
            <Label htmlFor="rule_set" className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Layers className="h-3 w-3" />
              Conjunto de Reglas Vinculado
            </Label>
            <select
              id="rule_set"
              value={formData.rule_set}
              onChange={(e) => setFormData(prev => ({ ...prev, rule_set: parseInt(e.target.value) || 0 }))}
              disabled={isLoading || !!ruleSetId || !!rule}
              className={`
                w-full h-11 px-4 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-(--tenant-primary) transition-all
                ${errors.rule_set ? 'border-red-500 bg-red-50' : ''}
              `}
            >
              <option value={0}>Seleccionar conjunto...</option>
              {ruleSets.map(rs => (
                <option key={rs.id} value={rs.id}>
                  {rs.name} (v{rs.version}) - {rs.status}
                </option>
              ))}
            </select>
            {errors.rule_set && (
              <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.rule_set}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <TrendingDown className="h-3 w-3" />
                Límites Financieros
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max_debt_to_income_ratio" className="text-xs font-bold text-slate-600">RCI Máximo (%)</Label>
                  <Input
                    id="max_debt_to_income_ratio"
                    type="number"
                    step="0.01"
                    value={formData.max_debt_to_income_ratio}
                    onChange={(e) => setFormData({ ...formData, max_debt_to_income_ratio: parseFloat(e.target.value) })}
                    className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_income_required" className="text-xs font-bold text-slate-600">Ingreso Mínimo (Bs)</Label>
                  <Input
                    id="min_income_required"
                    type="number"
                    step="0.01"
                    value={formData.min_income_required}
                    onChange={(e) => setFormData({ ...formData, min_income_required: parseFloat(e.target.value) })}
                    className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_collateral_coverage" className="text-xs font-bold text-slate-600">Cobertura de Garantía (%)</Label>
                  <Input
                    id="min_collateral_coverage"
                    type="number"
                    step="0.01"
                    value={formData.min_collateral_coverage}
                    onChange={(e) => setFormData({ ...formData, min_collateral_coverage: parseFloat(e.target.value) })}
                    className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Perfil del Solicitante
              </h4>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_age" className="text-xs font-bold text-slate-600">Edad Min.</Label>
                    <Input
                      id="min_age"
                      type="number"
                      value={formData.min_age}
                      onChange={(e) => setFormData({ ...formData, min_age: parseInt(e.target.value) })}
                      className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_age" className="text-xs font-bold text-slate-600">Edad Max.</Label>
                    <Input
                      id="max_age"
                      type="number"
                      value={formData.max_age}
                      onChange={(e) => setFormData({ ...formData, max_age: parseInt(e.target.value) })}
                      className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_employment_months" className="text-xs font-bold text-slate-600">Antigüedad (Meses)</Label>
                  <Input
                    id="min_employment_months"
                    type="number"
                    value={formData.min_employment_months}
                    onChange={(e) => setFormData({ ...formData, min_employment_months: parseInt(e.target.value) })}
                    className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_arrears_allowed" className="text-xs font-bold text-slate-600">Mora Permitida (Bs)</Label>
                  <Input
                    id="max_arrears_allowed"
                    type="number"
                    step="0.01"
                    value={formData.max_arrears_allowed}
                    onChange={(e) => setFormData({ ...formData, max_arrears_allowed: parseFloat(e.target.value) })}
                    className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <CheckSquare className="h-3 w-3" />
              Categorías CIC Permitidas
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {CIC_CATEGORIES.map((cat) => {
                const isSelected = formData.allowed_cic_categories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCICToggle(cat.value)}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300
                      ${isSelected 
                        ? 'border-(--tenant-primary) bg-(--tenant-primary-soft) text-(--tenant-primary)' 
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }
                    `}
                  >
                    <span className="text-lg font-black">{cat.value}</span>
                    <span className="text-[8px] font-bold uppercase truncate w-full text-center">{cat.label.split(' - ')[0]}</span>
                  </button>
                );
              })}
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
              {rule ? 'Actualizar Regla' : 'Confirmar Parámetros'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

