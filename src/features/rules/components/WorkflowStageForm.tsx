import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { GitBranch, Clock, Users, Zap, ChevronRight, Layers, MessageSquare, ArrowRight, AlertCircle, CheckCircle2, Package } from 'lucide-react';
import type { WorkflowStageDefinition, WorkflowStageWrite } from '../types/workflowStage.types';
import { useRuleSets } from '../hooks/useRuleSets';
import type { TenantRuleSet } from '../types/ruleSet.types';
import { useQuery } from '@tanstack/react-query';
import { fetchRoles } from '../../roles/services/rolesApi';
import { Badge } from '../../../components/ui/Badge';

interface WorkflowStageFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: WorkflowStageWrite) => void;
  stage?: WorkflowStageDefinition;
  isLoading?: boolean;
  preselectedRuleSetId?: number | null;
  existingStages?: WorkflowStageDefinition[];
}

// Configuración de sugerencias por tipo de etapa
const STAGE_TYPE_CONFIG: Record<string, {
  suggestMotorIA: boolean;
  suggestAutoAvance: boolean;
  suggestManualApproval: boolean;
  suggestClientAction: boolean;
  defaultClientActionDescription?: string;
  defaultClientActionURL?: string;
  isFinalStage?: boolean;
}> = {
  DRAFT: {
    suggestMotorIA: false,
    suggestAutoAvance: false,
    suggestManualApproval: true,
    suggestClientAction: false,
  },
  SUBMITTED: {
    suggestMotorIA: false,
    suggestAutoAvance: true,
    suggestManualApproval: true,
    suggestClientAction: false,
  },
  DOCUMENTS: {
    suggestMotorIA: false,
    suggestAutoAvance: true,
    suggestManualApproval: true,
    suggestClientAction: true,
    defaultClientActionDescription: 'Subir documentos requeridos',
    defaultClientActionURL: '/portal/documents',
  },
  KYC: {
    suggestMotorIA: true,
    suggestAutoAvance: true,
    suggestManualApproval: false,
    suggestClientAction: false,
  },
  SCORING: {
    suggestMotorIA: true,
    suggestAutoAvance: true,
    suggestManualApproval: false,
    suggestClientAction: false,
  },
  REVIEW: {
    suggestMotorIA: false,
    suggestAutoAvance: false,
    suggestManualApproval: true,
    suggestClientAction: false,
  },
  APPROVED: {
    suggestMotorIA: false,
    suggestAutoAvance: false,
    suggestManualApproval: true,
    suggestClientAction: false,
    isFinalStage: true,
  },
  REJECTED: {
    suggestMotorIA: false,
    suggestAutoAvance: false,
    suggestManualApproval: true,
    suggestClientAction: false,
    isFinalStage: true,
  },
  DISBURSED: {
    suggestMotorIA: false,
    suggestAutoAvance: false,
    suggestManualApproval: true,
    suggestClientAction: false,
    isFinalStage: true,
  },
  CANCELLED: {
    suggestMotorIA: false,
    suggestAutoAvance: false,
    suggestManualApproval: true,
    suggestClientAction: false,
    isFinalStage: true,
  },
};

export function WorkflowStageForm({
  open,
  onClose,
  onSubmit,
  stage,
  isLoading = false,
  preselectedRuleSetId,
  existingStages = [],
}: WorkflowStageFormProps) {
  const { data: ruleSetsData } = useRuleSets();
  const ruleSets: TenantRuleSet[] = Array.isArray(ruleSetsData)
    ? ruleSetsData
    : ((ruleSetsData as any)?.results || []);

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => fetchRoles(false),
  });
  const roles = Array.isArray(rolesData) ? rolesData : [];

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
    rule_set: preselectedRuleSetId || 0,
    stage_name: '',
    stage_code: 'SUBMITTED',
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

  const [isInitialStage, setIsInitialStage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Obtener el Rule Set seleccionado
  const selectedRuleSet = useMemo(() => {
    return ruleSets.find(rs => rs.id === formData.rule_set);
  }, [ruleSets, formData.rule_set]);

  // Obtener configuración del tipo de etapa actual
  const stageConfig = useMemo(() => {
    return STAGE_TYPE_CONFIG[formData.stage_code] || STAGE_TYPE_CONFIG.SUBMITTED;
  }, [formData.stage_code]);

  useEffect(() => {
    if (stage) {
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
      // Detectar si es etapa inicial (no tiene etapas anteriores que apunten a ella)
      const hasIncomingStages = existingStages.some(s => 
        s.next_stage_on_success === stage.stage_code || 
        s.next_stage_on_failure === stage.stage_code
      );
      setIsInitialStage(!hasIncomingStages && stage.stage_order === 1);
    } else if (preselectedRuleSetId) {
      setFormData(prev => ({ ...prev, rule_set: preselectedRuleSetId }));
      // Si no hay etapas, esta será la inicial
      setIsInitialStage(existingStages.length === 0);
    }
    setErrors({});
  }, [stage, open, preselectedRuleSetId, existingStages]);

  // Aplicar sugerencias cuando cambia el tipo de etapa
  useEffect(() => {
    if (!stage && stageConfig) {
      setFormData(prev => ({
        ...prev,
        is_automated: stageConfig.suggestMotorIA,
        auto_advance_enabled: stageConfig.suggestAutoAvance,
        requires_manual_approval: stageConfig.suggestManualApproval,
        requires_client_action: stageConfig.suggestClientAction,
        client_action_description: stageConfig.defaultClientActionDescription || prev.client_action_description,
        client_action_url: stageConfig.defaultClientActionURL || prev.client_action_url,
        is_final_stage: stageConfig.isFinalStage || false,
      }));
    }
  }, [formData.stage_code, stage, stageConfig]);

  // Actualizar stage_order cuando cambian las conexiones o el estado de etapa inicial/terminal
  useEffect(() => {
    if (!stage) { // Solo para nuevas etapas
      let newOrder = formData.stage_order;

      if (isInitialStage) {
        newOrder = 1;
      } else if (formData.is_final_stage) {
        // Para etapas terminales, usar el siguiente orden disponible
        if (existingStages.length > 0) {
          const maxExistingOrder = Math.max(...existingStages.map(s => s.stage_order));
          newOrder = maxExistingOrder + 1;
        } else {
          newOrder = 2; // Si no hay etapas, la terminal sería la segunda
        }
      } else {
        // Calcular basado en las conexiones existentes
        const incomingStages = existingStages.filter(s => 
          s.next_stage_on_success === formData.stage_code || 
          s.next_stage_on_failure === formData.stage_code
        );

        if (incomingStages.length > 0) {
          const maxOrder = Math.max(...incomingStages.map(s => s.stage_order));
          newOrder = maxOrder + 1;
        } else if (existingStages.length > 0) {
          const maxExistingOrder = Math.max(...existingStages.map(s => s.stage_order));
          newOrder = maxExistingOrder + 1;
        }
      }

      if (newOrder !== formData.stage_order) {
        setFormData(prev => ({ ...prev, stage_order: newOrder }));
      }
    }
  }, [isInitialStage, formData.is_final_stage, formData.stage_code, existingStages, stage]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.rule_set) newErrors.rule_set = 'Requerido';
    if (!formData.stage_name.trim()) newErrors.stage_name = 'Requerido';
    
    // Validar que Motor IA y Aprobación Manual no estén ambos activos
    if (formData.is_automated && formData.requires_manual_approval) {
      newErrors.is_automated = 'Motor IA y Aprobación Manual son incompatibles';
      newErrors.requires_manual_approval = 'Motor IA y Aprobación Manual son incompatibles';
    }

    // Validar que solo haya una etapa inicial
    if (isInitialStage) {
      const hasOtherInitialStage = existingStages.some(s => {
        // Una etapa es inicial si no tiene etapas anteriores que apunten a ella
        const hasIncomingStages = existingStages.some(other => 
          other.id !== s.id && (
            other.next_stage_on_success === s.stage_code || 
            other.next_stage_on_failure === s.stage_code
          )
        );
        return !hasIncomingStages && s.stage_order === 1 && s.id !== stage?.id;
      });
      
      if (hasOtherInitialStage) {
        newErrors.isInitialStage = 'Ya existe una etapa inicial en este workflow. Solo puede haber una etapa inicial.';
      }
    }

    // Validar que no haya múltiples etapas terminales del mismo tipo
    if (formData.is_final_stage) {
      const sameTypeTerminalStage = existingStages.find(s => 
        s.is_final_stage && 
        s.stage_code === formData.stage_code && 
        s.id !== stage?.id
      );
      
      if (sameTypeTerminalStage) {
        newErrors.is_final_stage = `Ya existe una etapa terminal de tipo "${STAGE_CODES.find(c => c.value === formData.stage_code)?.label}". No puede haber duplicados.`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calcular el stage_order automáticamente basado en las conexiones
  const calculateStageOrder = (): number => {
    // Si es etapa inicial, siempre es orden 1
    if (isInitialStage) {
      return 1;
    }

    // Si es etapa terminal, asignar el siguiente orden disponible
    if (formData.is_final_stage) {
      if (existingStages.length > 0) {
        const maxExistingOrder = Math.max(...existingStages.map(s => s.stage_order));
        return maxExistingOrder + 1;
      }
      return 2; // Si no hay etapas, la terminal sería la segunda
    }

    // Buscar qué etapas apuntan a esta etapa
    const incomingStages = existingStages.filter(s => 
      s.next_stage_on_success === formData.stage_code || 
      s.next_stage_on_failure === formData.stage_code
    );

    // Si hay etapas que apuntan a esta, tomar el máximo orden + 1
    if (incomingStages.length > 0) {
      const maxOrder = Math.max(...incomingStages.map(s => s.stage_order));
      return maxOrder + 1;
    }

    // Si no hay conexiones, asignar el siguiente orden disponible
    if (existingStages.length > 0) {
      const maxExistingOrder = Math.max(...existingStages.map(s => s.stage_order));
      return maxExistingOrder + 1;
    }

    // Si no hay etapas, esta es la primera
    return 1;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      // Calcular el stage_order automáticamente
      const calculatedOrder = calculateStageOrder();
      const dataToSubmit = {
        ...formData,
        stage_order: calculatedOrder,
      };
      onSubmit(dataToSubmit);
    }
  };

  const handleChange = (field: keyof WorkflowStageWrite, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleConditionChange = (condition: string, checked: boolean) => {
    setFormData(prev => {
      const currentConditions = { ...(prev.auto_advance_conditions || {}) } as Record<string, boolean>;
      if (checked) {
        currentConditions[condition] = true;
      } else {
        delete currentConditions[condition];
      }
      return { ...prev, auto_advance_conditions: currentConditions };
    });
  };

  // Manejar cambio de Motor IA (desactiva Aprobación Manual)
  const handleMotorIAChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_automated: checked,
      requires_manual_approval: checked ? false : prev.requires_manual_approval,
    }));
    if (errors.is_automated) setErrors(prev => ({ ...prev, is_automated: '', requires_manual_approval: '' }));
  };

  // Manejar cambio de Aprobación Manual (desactiva Motor IA)
  const handleManualApprovalChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      requires_manual_approval: checked,
      is_automated: checked ? false : prev.is_automated,
    }));
    if (errors.requires_manual_approval) setErrors(prev => ({ ...prev, is_automated: '', requires_manual_approval: '' }));
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
              {/* Rule Set (solo informativo si está pre-seleccionado) */}
              {preselectedRuleSetId && selectedRuleSet ? (
                <div className="p-4 bg-gradient-to-r from-(--tenant-primary-soft) to-blue-50 rounded-xl border border-(--tenant-primary-soft)">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-(--tenant-primary) text-white flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                        Conjunto de Reglas
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{selectedRuleSet.name}</span>
                        <Badge className="text-[10px]">v{selectedRuleSet.version}</Badge>
                      </div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-(--tenant-primary)" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="rule_set" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Estrategia Vinculada
                  </Label>
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
                  {errors.rule_set && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.rule_set}
                    </p>
                  )}
                </div>
              )}

              {/* Checkbox Etapa Inicial */}
              <div className={`p-4 rounded-xl border-2 transition-all ${
                isInitialStage 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-slate-50 border-slate-200'
              } ${errors.isInitialStage ? 'border-red-500' : ''}`}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInitialStage}
                    onChange={(e) => {
                      setIsInitialStage(e.target.checked);
                      if (errors.isInitialStage) {
                        setErrors(prev => ({ ...prev, isInitialStage: '' }));
                      }
                    }}
                    className="w-5 h-5 rounded text-emerald-600"
                  />
                  <div className="flex flex-col flex-1">
                    <span className={`text-sm font-bold uppercase tracking-tighter ${
                      isInitialStage ? 'text-emerald-900' : 'text-slate-700'
                    }`}>
                      ✨ Etapa Inicial del Workflow
                    </span>
                    <span className={`text-xs ${
                      isInitialStage ? 'text-emerald-700' : 'text-slate-500'
                    }`}>
                      Esta es la primera etapa por donde ingresan las solicitudes
                    </span>
                  </div>
                  {isInitialStage && (
                    <Badge className="bg-emerald-600 text-white text-xs">
                      Orden: 1
                    </Badge>
                  )}
                </label>
                {errors.isInitialStage && (
                  <div className="mt-2 p-2 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.isInitialStage}
                    </p>
                  </div>
                )}
              </div>

              {/* Indicador de Orden Automático */}
              {!stage && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-semibold">
                      Orden de secuencia: {formData.stage_order}
                    </span>
                    <span className="text-blue-600">
                      (calculado automáticamente)
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage_code" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Tipo de Estado
                  </Label>
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

                <div className="space-y-2">
                  <Label htmlFor="stage_name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Nombre Descriptivo
                  </Label>
                  <Input
                    id="stage_name"
                    value={formData.stage_name}
                    onChange={(e) => handleChange('stage_name', e.target.value)}
                    placeholder="Ej: Análisis de Comité Riesgos"
                    className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                  />
                  {errors.stage_name && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.stage_name}
                    </p>
                  )}
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
                
                {/* Motor IA con sugerencia */}
                <div className="space-y-2">
                  <label className={`flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    formData.is_automated 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  } ${errors.is_automated ? 'border-red-500' : ''}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={formData.is_automated} 
                        onChange={(e) => handleMotorIAChange(e.target.checked)} 
                      />
                      <Zap className={`h-5 w-5 ${formData.is_automated ? 'fill-emerald-500 text-emerald-500' : 'text-slate-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black uppercase tracking-tighter ${
                            formData.is_automated ? 'text-emerald-700' : 'text-slate-600'
                          }`}>
                            Motor IA
                          </span>
                          {stageConfig.suggestMotorIA && (
                            <Badge className="bg-blue-100 text-blue-700 text-[9px] border-none">
                              Recomendado
                            </Badge>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 font-medium">
                          Ejecución automática por inteligencia artificial
                        </span>
                      </div>
                    </div>
                  </label>
                  {errors.is_automated && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.is_automated}
                    </p>
                  )}
                </div>

                {/* Auto-Avance con sugerencia */}
                <div className="space-y-2">
                  <label className={`flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    formData.auto_advance_enabled 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={formData.auto_advance_enabled} 
                        onChange={(e) => handleChange('auto_advance_enabled', e.target.checked)} 
                      />
                      <ArrowRight className={`h-5 w-5 ${formData.auto_advance_enabled ? 'text-blue-500' : 'text-slate-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black uppercase tracking-tighter ${
                            formData.auto_advance_enabled ? 'text-blue-700' : 'text-slate-600'
                          }`}>
                            Auto-Avance
                          </span>
                          {stageConfig.suggestAutoAvance && (
                            <Badge className="bg-blue-100 text-blue-700 text-[9px] border-none">
                              Recomendado
                            </Badge>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 font-medium">
                          Avanza automáticamente al cumplir condiciones
                        </span>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Condiciones de Auto-Avance */}
                {formData.auto_advance_enabled && (
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                    <h5 className="text-[9px] font-black uppercase tracking-widest text-blue-600">Condiciones de Auto-Avance</h5>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!formData.auto_advance_conditions?.kyc_approved}
                          onChange={(e) => handleConditionChange('kyc_approved', e.target.checked)}
                          className="rounded text-blue-600 w-4 h-4"
                        />
                        Verificación de Identidad KYC Aprobada
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!formData.auto_advance_conditions?.documents_complete}
                          onChange={(e) => handleConditionChange('documents_complete', e.target.checked)}
                          className="rounded text-blue-600 w-4 h-4"
                        />
                        Documentación Obligatoria Completa
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!formData.auto_advance_conditions?.score_calculated}
                          onChange={(e) => handleConditionChange('score_calculated', e.target.checked)}
                          className="rounded text-blue-600 w-4 h-4"
                        />
                        Score Crediticio Calculado
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Users className="h-3 w-3" /> Control Humano y Roles
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="responsible_role" className="text-xs font-bold text-slate-600">Rol Responsable del Trámite</Label>
                    <select
                      id="responsible_role"
                      value={formData.responsible_role?.toString() || ''}
                      onChange={(e) => handleChange('responsible_role', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full h-11 px-4 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-(--tenant-primary) transition-all"
                    >
                      <option value="">Cualquier Analista / Motor Automático</option>
                      {roles.map((r: any) => (
                        <option key={r.id} value={r.id.toString()}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Aprobación Manual con sugerencia */}
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.requires_manual_approval
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-50/50 border-slate-100'
                  } ${errors.requires_manual_approval ? 'border-red-500' : ''} hover:bg-slate-100`}>
                    <input 
                      type="checkbox" 
                      checked={formData.requires_manual_approval} 
                      onChange={(e) => handleManualApprovalChange(e.target.checked)} 
                      className="w-4 h-4 rounded text-(--tenant-primary)" 
                    />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">
                          Aprobación Manual
                        </span>
                        {stageConfig.suggestManualApproval && (
                          <Badge className="bg-blue-100 text-blue-700 text-[9px] border-none">
                            Recomendado
                          </Badge>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium">Requiere intervención de un usuario</span>
                    </div>
                  </label>
                  {errors.requires_manual_approval && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.requires_manual_approval}
                    </p>
                  )}

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

            {/* Seccion 3: Transiciones del Workflow */}
            <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <GitBranch className="h-3 w-3" /> Transiciones y Direccionamiento
              </h4>
              
              {!isInitialStage && existingStages.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Esta etapa recibirá solicitudes de otras etapas que la seleccionen como destino
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="next_stage_on_success" className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    Siguiente Etapa en Caso de ÉXITO
                    <span className="text-emerald-600">✓</span>
                  </Label>
                  <select
                    id="next_stage_on_success"
                    value={formData.next_stage_on_success || ''}
                    onChange={(e) => handleChange('next_stage_on_success', e.target.value || null)}
                    className="w-full h-11 px-4 bg-white border-slate-200 rounded-xl text-sm focus:border-(--tenant-primary) transition-all"
                    disabled={formData.is_final_stage}
                  >
                    <option value="">Seleccionar etapa...</option>
                    <optgroup label="Etapas Existentes">
                      {existingStages
                        .filter(s => s.id !== stage?.id)
                        .map((s) => (
                          <option key={s.stage_code} value={s.stage_code}>
                            {s.stage_name} ({s.stage_code})
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Nuevas Etapas">
                      {STAGE_CODES.filter(code => 
                        !existingStages.some(s => s.stage_code === code.value) && 
                        code.value !== stage?.stage_code
                      ).map((code) => (
                        <option key={code.value} value={code.value}>
                          {code.label} (nueva)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  {formData.is_final_stage && (
                    <p className="text-xs text-slate-500 italic">
                      Deshabilitado (etapa terminal)
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="next_stage_on_failure" className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    Siguiente Etapa en Caso de FALLO
                    <span className="text-red-600">✗</span>
                  </Label>
                  <select
                    id="next_stage_on_failure"
                    value={formData.next_stage_on_failure || ''}
                    onChange={(e) => handleChange('next_stage_on_failure', e.target.value || null)}
                    className="w-full h-11 px-4 bg-white border-slate-200 rounded-xl text-sm focus:border-(--tenant-primary) transition-all"
                    disabled={formData.is_final_stage}
                  >
                    <option value="">Fin del proceso (Rechazo)</option>
                    <optgroup label="Etapas Existentes">
                      {existingStages
                        .filter(s => s.id !== stage?.id)
                        .map((s) => (
                          <option key={s.stage_code} value={s.stage_code}>
                            {s.stage_name} ({s.stage_code})
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Nuevas Etapas">
                      {STAGE_CODES.filter(code => 
                        !existingStages.some(s => s.stage_code === code.value) && 
                        code.value !== stage?.stage_code
                      ).map((code) => (
                        <option key={code.value} value={code.value}>
                          {code.label} (nueva)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  {formData.is_final_stage && (
                    <p className="text-xs text-slate-500 italic">
                      Deshabilitado (etapa terminal)
                    </p>
                  )}
                </div>
              </div>

              {/* Visualización simple del flujo */}
              {(formData.next_stage_on_success || formData.next_stage_on_failure) && !formData.is_final_stage && (
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    Vista Previa del Flujo
                  </h5>
                  <div className="space-y-2 text-xs">
                    {formData.next_stage_on_success && (
                      <div className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-semibold">{formData.stage_name || 'Esta etapa'}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>{STAGE_CODES.find(c => c.value === formData.next_stage_on_success)?.label || formData.next_stage_on_success}</span>
                      </div>
                    )}
                    {formData.next_stage_on_failure && (
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-semibold">{formData.stage_name || 'Esta etapa'}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>{STAGE_CODES.find(c => c.value === formData.next_stage_on_failure)?.label || formData.next_stage_on_failure}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Seccion 4: Comunicación y Canales */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <MessageSquare className="h-3 w-3" /> Canales de Comunicación y Acción del Cliente
              </h4>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="client_message_template" className="text-xs font-bold text-slate-600">Mensaje de Estado para el Cliente</Label>
                  <Input
                    id="client_message_template"
                    value={formData.client_message_template || ''}
                    onChange={(e) => handleChange('client_message_template', e.target.value || null)}
                    placeholder="Ej: Su solicitud está en etapa de revisión de documentos por un analista..."
                    className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary) transition-all"
                  />
                </div>

                {/* Acción del Cliente con sugerencia */}
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requires_client_action}
                      onChange={(e) => handleChange('requires_client_action', e.target.checked)}
                      className="w-4 h-4 rounded text-(--tenant-primary)"
                    />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">
                          Acción del Cliente Bloqueante
                        </span>
                        {stageConfig.suggestClientAction && (
                          <Badge className="bg-blue-100 text-blue-700 text-[9px] border-none">
                            Recomendado
                          </Badge>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium">Bloquea el flujo hasta que el cliente complete la acción</span>
                    </div>
                  </label>

                  {formData.requires_client_action && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <Label htmlFor="client_action_description" className="text-xs font-bold text-slate-600">Descripción de la Tarea Cliente</Label>
                        <Input
                          id="client_action_description"
                          value={formData.client_action_description || ''}
                          onChange={(e) => handleChange('client_action_description', e.target.value || null)}
                          placeholder={stageConfig.defaultClientActionDescription || "Ej: Cargar comprobante de domicilio reciente"}
                          className="bg-white border-slate-200 focus:border-(--tenant-primary) transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="client_action_url" className="text-xs font-bold text-slate-600">URL Relativa de Acción</Label>
                        <Input
                          id="client_action_url"
                          value={formData.client_action_url || ''}
                          onChange={(e) => handleChange('client_action_url', e.target.value || null)}
                          placeholder={stageConfig.defaultClientActionURL || "Ej: /portal/documents"}
                          className="bg-white border-slate-200 focus:border-(--tenant-primary) transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Etapa Terminal con sugerencia */}
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.is_final_stage
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                  } ${errors.is_final_stage ? 'border-red-500' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={formData.is_final_stage} 
                      onChange={(e) => {
                        handleChange('is_final_stage', e.target.checked);
                        if (errors.is_final_stage) {
                          setErrors(prev => ({ ...prev, is_final_stage: '' }));
                        }
                      }}
                      className="w-4 h-4 rounded text-(--tenant-primary)" 
                    />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-tighter ${
                          formData.is_final_stage ? 'text-purple-700' : 'text-slate-700'
                        }`}>
                          Etapa Terminal de Proceso
                        </span>
                        {stageConfig.isFinalStage && (
                          <Badge className="bg-purple-100 text-purple-700 text-[9px] border-none">
                            Recomendado
                          </Badge>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium">
                        Finaliza el ciclo de vida de la solicitud (Aprobada/Rechazada)
                      </span>
                    </div>
                  </label>
                  {errors.is_final_stage && (
                    <div className="p-2 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.is_final_stage}
                      </p>
                    </div>
                  )}
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
              {stage ? 'Guardar Cambios' : 'Crear Etapa'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

