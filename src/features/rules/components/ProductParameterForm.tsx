import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { CreditCard, Sliders, DollarSign, Calendar, Percent, ShieldCheck, ChevronRight, Layers, CheckSquare } from 'lucide-react';
import type { CreditProductParameterWrite, CreditProductParameter } from '../types/productParameter.types';
import { useRuleSets } from '../hooks/useRuleSets';
import { useAllCatalogs } from '../hooks/useCatalogs';
import { CatalogMultiSelect } from './CatalogMultiSelect';
import type { TenantRuleSet } from '../types/ruleSet.types';

interface ProductParameterFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreditProductParameterWrite) => void;
  parameter?: CreditProductParameter;
  isLoading?: boolean;
}

export function ProductParameterForm({
  open,
  onClose,
  onSubmit,
  parameter,
  isLoading = false,
}: ProductParameterFormProps) {
  const { data: ruleSetsData } = useRuleSets();
  const ruleSets: TenantRuleSet[] = Array.isArray(ruleSetsData) 
    ? ruleSetsData 
    : ((ruleSetsData as any)?.results || []);

  const catalogs = useAllCatalogs();

  const [formData, setFormData] = useState<CreditProductParameterWrite>({
    rule_set: 0,
    product: 0,
    min_amount: 0,
    max_amount: 100000,
    min_term_months: 1,
    max_term_months: 60,
    min_interest_rate: 10,
    max_interest_rate: 24,
    interest_type: 'FIXED',
    commission_rate_min: 0,
    commission_rate_max: 2,
    insurance_rate_min: 0,
    insurance_rate_max: 1.5,
    additional_insurance_rate: 0,
    grace_period_months_min: 0,
    grace_period_months_max: 3,
    allows_early_payment: true,
    early_payment_penalty_min: 0,
    early_payment_penalty_max: 0,
    allowed_currencies: [],
    allowed_payment_frequencies: [],
    allowed_amortization_systems: [],
    max_financing_percentage: 100,
    requires_guarantor: false,
    requires_collateral: false,
    auto_approval_enabled: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (parameter) {
      setFormData({
        rule_set: parameter.rule_set,
        product: parameter.product,
        min_amount: parseFloat(parameter.min_amount) || 0,
        max_amount: parseFloat(parameter.max_amount) || 0,
        min_term_months: parameter.min_term_months,
        max_term_months: parameter.max_term_months,
        min_interest_rate: parseFloat(parameter.min_interest_rate) || 0,
        max_interest_rate: parseFloat(parameter.max_interest_rate) || 0,
        interest_type: parameter.interest_type,
        commission_rate_min: parseFloat(parameter.commission_rate_min) || 0,
        commission_rate_max: parseFloat(parameter.commission_rate_max) || 0,
        insurance_rate_min: parseFloat(parameter.insurance_rate_min) || 0,
        insurance_rate_max: parseFloat(parameter.insurance_rate_max) || 0,
        additional_insurance_rate: parseFloat(parameter.additional_insurance_rate) || 0,
        grace_period_months_min: parameter.grace_period_months_min,
        grace_period_months_max: parameter.grace_period_months_max,
        allows_early_payment: parameter.allows_early_payment,
        early_payment_penalty_min: parseFloat(parameter.early_payment_penalty_min) || 0,
        early_payment_penalty_max: parseFloat(parameter.early_payment_penalty_max) || 0,
        allowed_currencies: parameter.allowed_currencies || [],
        allowed_payment_frequencies: parameter.allowed_payment_frequencies || [],
        allowed_amortization_systems: parameter.allowed_amortization_systems || [],
        max_financing_percentage: parseFloat(parameter.max_financing_percentage) || 100,
        requires_guarantor: parameter.requires_guarantor,
        requires_collateral: parameter.requires_collateral,
        auto_approval_enabled: parameter.auto_approval_enabled,
      });
    } else {
      setFormData({
        rule_set: 0,
        product: 0,
        min_amount: 0,
        max_amount: 100000,
        min_term_months: 1,
        max_term_months: 60,
        min_interest_rate: 10,
        max_interest_rate: 24,
        interest_type: 'FIXED',
        commission_rate_min: 0,
        commission_rate_max: 2,
        insurance_rate_min: 0,
        insurance_rate_max: 1.5,
        additional_insurance_rate: 0,
        grace_period_months_min: 0,
        grace_period_months_max: 3,
        allows_early_payment: true,
        early_payment_penalty_min: 0,
        early_payment_penalty_max: 0,
        allowed_currencies: [],
        allowed_payment_frequencies: [],
        allowed_amortization_systems: [],
        max_financing_percentage: 100,
        requires_guarantor: false,
        requires_collateral: false,
        auto_approval_enabled: false,
      });
    }
    setErrors({});
  }, [parameter, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.rule_set) newErrors.rule_set = 'Requerido';
    if (!formData.product) newErrors.product = 'Requerido';
    
    if (formData.min_amount > formData.max_amount) {
      newErrors.max_amount = 'Debe ser mayor al mínimo';
    }
    if (formData.min_term_months > formData.max_term_months) {
      newErrors.max_term_months = 'Debe ser mayor al mínimo';
    }
    if (formData.min_interest_rate > formData.max_interest_rate) {
      newErrors.max_interest_rate = 'Debe ser mayor al mínimo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const handleChange = (field: keyof CreditProductParameterWrite, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-(--tenant-primary) p-6 text-(--tenant-on-primary) relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Sliders className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
              <CreditCard className="h-3 w-3" />
              Parámetros de Producto
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-white">
              {parameter ? 'Editar Parámetros' : 'Nuevos Parámetros'}
            </DialogTitle>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="rule_set" className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Layers className="h-3 w-3" /> Conjunto de Reglas
              </Label>
              <select
                id="rule_set"
                value={formData.rule_set || ''}
                onChange={(e) => handleChange('rule_set', parseInt(e.target.value))}
                className="w-full h-11 px-4 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-(--tenant-primary) transition-all"
              >
                <option value="">Seleccionar conjunto...</option>
                {ruleSets.map(rs => (
                  <option key={rs.id} value={rs.id}>{rs.name} (v{rs.version})</option>
                ))}
              </select>
              {errors.rule_set && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.rule_set}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product" className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <CreditCard className="h-3 w-3" /> Producto Base
              </Label>
              <select
                id="product"
                value={formData.product || ''}
                onChange={(e) => handleChange('product', parseInt(e.target.value))}
                className="w-full h-11 px-4 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-(--tenant-primary) transition-all"
              >
                <option value="">Seleccionar producto...</option>
                {catalogs.productTypes.data?.map(pt => (
                  <option key={pt.id} value={pt.id}>{pt.name}</option>
                ))}
              </select>
              {errors.product && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.product}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Montos */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <DollarSign className="h-3 w-3" /> Montos (Bs)
              </h4>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600">Mínimo</Label>
                <Input
                  type="number"
                  value={formData.min_amount}
                  onChange={(e) => handleChange('min_amount', parseFloat(e.target.value))}
                  className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600">Máximo</Label>
                <Input
                  type="number"
                  value={formData.max_amount}
                  onChange={(e) => handleChange('max_amount', parseFloat(e.target.value))}
                  className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
                {errors.max_amount && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.max_amount}</p>}
              </div>
            </div>

            {/* Plazos */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Plazos (Meses)
              </h4>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600">Mínimo</Label>
                <Input
                  type="number"
                  value={formData.min_term_months}
                  onChange={(e) => handleChange('min_term_months', parseInt(e.target.value))}
                  className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600">Máximo</Label>
                <Input
                  type="number"
                  value={formData.max_term_months}
                  onChange={(e) => handleChange('max_term_months', parseInt(e.target.value))}
                  className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
                {errors.max_term_months && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.max_term_months}</p>}
              </div>
            </div>

            {/* Tasas */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Percent className="h-3 w-3" /> Tasas (%)
              </h4>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600">Mínimo</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.min_interest_rate}
                  onChange={(e) => handleChange('min_interest_rate', parseFloat(e.target.value))}
                  className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600">Máximo</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.max_interest_rate}
                  onChange={(e) => handleChange('max_interest_rate', parseFloat(e.target.value))}
                  className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
                {errors.max_interest_rate && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.max_interest_rate}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <CheckSquare className="h-3 w-3" /> Catálogos Permitidos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CatalogMultiSelect
                label="Monedas"
                items={catalogs.currencies.data || []}
                selectedIds={formData.allowed_currencies}
                onChange={(ids) => handleChange('allowed_currencies', ids)}
                isLoading={catalogs.currencies.isLoading}
              />
              <CatalogMultiSelect
                label="Frecuencias de Pago"
                items={catalogs.paymentFrequencies.data || []}
                selectedIds={formData.allowed_payment_frequencies}
                onChange={(ids) => handleChange('allowed_payment_frequencies', ids)}
                isLoading={catalogs.paymentFrequencies.isLoading}
              />
              <CatalogMultiSelect
                label="Sistemas de Amortización"
                items={catalogs.amortizationSystems.data || []}
                selectedIds={formData.allowed_amortization_systems}
                onChange={(ids) => handleChange('allowed_amortization_systems', ids)}
                isLoading={catalogs.amortizationSystems.isLoading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <ShieldCheck className="h-3 w-3" /> Requisitos
            </h4>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.requires_guarantor}
                  onChange={(e) => handleChange('requires_guarantor', e.target.checked)}
                  className="rounded text-(--tenant-primary) focus:ring-(--tenant-primary) h-4 w-4"
                />
                <span className="text-sm font-bold text-slate-700">Requiere Garante</span>
              </label>
              <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.requires_collateral}
                  onChange={(e) => handleChange('requires_collateral', e.target.checked)}
                  className="rounded text-(--tenant-primary) focus:ring-(--tenant-primary) h-4 w-4"
                />
                <span className="text-sm font-bold text-slate-700">Requiere Garantía (Colateral)</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1 font-bold shadow-sm">
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="flex-1 shadow-xl shadow-(--tenant-primary-soft) font-bold"
            >
              {parameter ? 'Actualizar Parámetros' : 'Guardar Parámetros'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Named export was used in list page: import { ProductParameterForm } from '../components/ProductParameterForm';
