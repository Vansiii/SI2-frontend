import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { GitBranch, Clock, Users, Zap, AlertTriangle, CheckCircle, ChevronRight, Info, Layers, ArrowRight, MessageSquare } from 'lucide-react';
import type { WorkflowStageDefinition, WorkflowStageWrite } from '../types/workflowStage.types';
import { useRuleSets } from '../hooks/useRuleSets';
import type { TenantRuleSet } from '../types/ruleSet.types';

interface WorkflowStageFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: WorkflowStageWrite) => void;
  stage?: WorkflowStageDefinition;
  isLoading?: boolean;
}

export function WorkflowStageForm({ 
  open, 
  onClose, 
  onSubmit, 
  stage, 
  isLoading = false 
}: WorkflowStageFormProps) {
  const { data: ruleSetsData } = useRuleSets();
  const ruleSets: TenantRuleSet[] = Array.isArray(ruleSetsData) 
    ? ruleSetsData 
    : ((ruleSetsData as any)?.results || []);
  
  const STAGE_CODES = [
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'SUBMITTED', label: 'Enviada' },
    { value: 'DOCUMENTS', label: 'Documentos' },
    { value: 'KYC', label: 'Verificación de Identidad' },
    { value: 'SCORING', label: 'Evaluación Crediticia' },
    { value: 'REVIEW', label: 'Revisión Manual' },
    { value: 'APPROVED', label: 'Aprobada' },
    { value: 'REJECTED', label: 'Rechazada' },
    { value: 'DISBURSED', label: 'Desembolsada' },
    { value: 'CANCELLED', label: 'Cancelada' },
  ];

  const [formData, setFormData] = useState<WorkflowStageWrite>({
    rule_set: 0,
    stage_name: '',
    stage_code: 'DRAFT',
    stage_order: 1,
    responsible_role: null,
    time_limit_hours: null,
    is_automated: false,
    auto_advance_enabled: false,
    auto_advance_conditions: {},
    next_stage_on_success: null,
    next_stage_on_failure: null,
    requires_manual_approval: true,
    escalation_enabled: false,
    escalation_rules: {},
    notification_template: null,
    client_message_template: null,
    requires_client_action: false,
    client_action_description: null,
    client_action_url: null,
    is_final_stage: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (stage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        rule_set: stage.rule_set,
        stage_name: stage.stage_name,
        stage_code: stage.stage_code,
        stage_order: stage.stage_order,
        responsible_role: stage.responsible_role,
        time_limit_hours: stage.time_limit_hours,
        is_automated: stage.is_automated,
        auto_advance_enabled: stage.auto_advance_enabled,
        auto_advance_conditions: stage.auto_advance_conditions,
        next_stage_on_success: stage.next_stage_on_success,
        next_stage_on_failure: stage.next_stage_on_failure,
        requires_manual_approval: stage.requires_manual_approval,
        escalation_enabled: stage.escalation_enabled,
        escalation_rules: stage.escalation_rules,
        notification_template: stage.notification_template,
        client_message_template: stage.client_message_template,
        requires_client_action: stage.requires_client_action,
        client_action_description: stage.client_action_description,
        client_action_url: stage.client_action_url,
        is_final_stage: stage.is_final_stage,
      });
    }
    setErrors({});
  }, [stage, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.rule_set) newErrors.rule_set = 'Requerido';
    if (!formData.stage_name.trim()) newErrors.stage_name = 'Requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const handleChange = (field: keyof WorkflowStageWrite, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-(--tenant-primary) p-6 text-(--tenant-on-primary) relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <GitBranch className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
              <Layers className="h-3 w-3" />
              Diseño de Procesos
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-white">
              {stage ? 'Configurar Etapa' : 'Definir Nueva Etapa de Workflow'}
            </DialogTitle>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            {/* Seccion 1: Identidad */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule_set" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estrategia Vinculada</Label>
                  <select
                    id="rule_set"
                    value={formData.rule_set?.toString() || ''}
                    onChange={(e) => handleChange('rule_set', parseInt(e.target.value))}
                    className="w-full h-11 px-4 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-(--tenant-primary) transition-all"
                  >
                    <option value="">Seleccionar conjunto...</option>
                    {ruleSets.map((rs: TenantRuleSet) => (
                      <option key={rs.id} value={rs.id.toString()}>{rs.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage_code" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Estado</Label>
                  <select
                    id="stage_code"
                    value={formData.stage_code}
                    onChange={(e) => handleChange('stage_code', e.target.value)}
                    className="w-full h-11 px-4 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-(--tenant-primary) transition-all"
                  >
                    {STAGE_CODES.map((code) => (
                      <option key={code.value} value={code.value}>{code.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="stage_name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre Descriptivo</Label>
                  <Input
                    id="stage_name"
                    value={formData.stage_name}
                    onChange={(e) => handleChange('stage_name', e.target.value)}
                    placeholder="Ej: Análisis de Comité Riesgos"
                    className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage_order" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nº Secuencia</Label>
                  <Input
                    id="stage_order"
                    type="number"
                    value={formData.stage_order}
                    onChange={(e) => handleChange('stage_order', parseInt(e.target.value) || 1)}
                    className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Seccion 2: Responsabilidad y SLA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Clock className="h-3 w-3" /> SLA y Rendimiento
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="time_limit_hours" className="text-xs font-bold text-slate-600">Tiempo Límite (Horas)</Label>
                  <Input
                    id="time_limit_hours"
                    type="number"
                    value={formData.time_limit_hours || ''}
                    onChange={(e) => handleChange('time_limit_hours', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Ej: 24"
                    className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${formData.is_automated ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                    <input type="checkbox" className="hidden" checked={formData.is_automated} onChange={(e) => handleChange('is_automated', e.target.checked)} />
                    <Zap className={`h-5 w-5 ${formData.is_automated ? 'fill-emerald-500' : ''}`} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Motor IA</span>
                  </label>
                  <label className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${formData.auto_advance_enabled ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                    <input type="checkbox" className="hidden" checked={formData.auto_advance_enabled} onChange={(e) => handleChange('auto_advance_enabled', e.target.checked)} />
                    <ArrowRight className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Auto-Avance</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Users className="h-3 w-3" /> Control Humano
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                    <input type="checkbox" checked={formData.requires_manual_approval} onChange={(e) => handleChange('requires_manual_approval', e.target.checked)} className="w-4 h-4 rounded text-(--tenant-primary)" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">Aprobación Manual</span>
                      <span className="text-[9px] text-slate-400 font-medium">Requiere intervención de un usuario</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                    <input type="checkbox" checked={formData.escalation_enabled} onChange={(e) => handleChange('escalation_enabled', e.target.checked)} className="w-4 h-4 rounded text-(--tenant-primary)" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">Escalamiento Activo</span>
                      <span className="text-[9px] text-slate-400 font-medium">Alerta a supervisores tras vencimiento</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Seccion 3: Comunicación */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <MessageSquare className="h-3 w-3" /> Canales de Comunicación
              </h4>
              <div className="space-y-3">
                <Input
                  value={formData.client_message_template || ''}
                  onChange={(e) => handleChange('client_message_template', e.target.value || null)}
                  placeholder="Mensaje de estado para el cliente..."
                  className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                />
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                  <input type="checkbox" checked={formData.is_final_stage} onChange={(e) => handleChange('is_final_stage', e.target.checked)} className="w-4 h-4 rounded text-(--tenant-primary)" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">Etapa Terminal de Proceso</span>
                    <span className="text-[9px] text-slate-400 font-medium">Finaliza el ciclo de vida de la solicitud</span>
                  </div>
                </label>
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
              {stage ? 'Guardar Cambios' : 'Activar Etapa'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

