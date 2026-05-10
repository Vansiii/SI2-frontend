import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Plus, GitBranch, Edit, Trash2, Clock, Users, Zap, AlertTriangle, CheckCircle, XCircle, ArrowRight, ChevronRight } from 'lucide-react';
import { useWorkflowStages } from '../hooks/useWorkflowStages';
import { Badge } from '../../../components/ui/Badge';
import { WorkflowStageForm } from '../components/WorkflowStageForm';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { CardSkeleton } from '../../../components/ui/SkeletonLoader';
import type { WorkflowStageDefinition } from '../types/workflowStage.types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkflowStageListPageProps {
  embedded?: boolean;
}

export const WorkflowStageListPage: React.FC<WorkflowStageListPageProps> = ({ embedded = false }) => {
  const { stages, loading, error, deleteStage, createStage, updateStage, isCreating, isUpdating, isDeleting } = useWorkflowStages();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<WorkflowStageDefinition | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<number | null>(null);

  const isLoading = loading || isCreating || isUpdating || isDeleting;

  const handleCreate = () => {
    setEditingStage(null);
    setIsFormOpen(true);
  };

  const handleEdit = (stage: WorkflowStageDefinition) => {
    setEditingStage(stage);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setStageToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (stageToDelete) {
      deleteStage(stageToDelete, {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          setStageToDelete(null);
          toast.success('Etapa eliminada correctamente');
        },
        onError: () => {
          setDeleteConfirmOpen(false);
          setStageToDelete(null);
        },
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingStage(null);
    toast.success(editingStage ? 'Etapa actualizada' : 'Etapa creada');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
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
        <h3 className="text-lg font-bold text-red-900 mb-2">Error de sistema</h3>
        <p className="text-red-700">No pudimos sincronizar las etapas del workflow.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center ${embedded ? 'justify-end' : 'justify-between'} gap-4`}>
        {!embedded && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-(--tenant-primary)" />
              Flujo de Procesamiento
            </h2>
            <p className="text-slate-500 text-sm">Secuencia de estados y responsabilidades del crédito.</p>
          </div>
        )}

        <Button onClick={handleCreate} className="shadow-xl shadow-(--tenant-primary-soft) font-bold">
          <Plus className="h-5 w-5 mr-2" />
          Nueva Etapa
        </Button>
      </div>

      {/* Lista de etapas */}
      <AnimatePresence mode="popLayout">
        {!stages || stages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 text-center"
          >
            <GitBranch className="h-20 w-20 text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Workflow vacío</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">Define la ruta que seguirán las solicitudes desde la recepción hasta el desembolso o rechazo final.</p>
            <Button variant="secondary" onClick={handleCreate}>
              Diseñar primera etapa
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4 relative">
            <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-slate-100 hidden md:block" />

            {stages.sort((a,b) => a.stage_order - b.stage_order).map((stage, index) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative z-10"
              >
                <Card className="group border-slate-200 hover:border-(--tenant-primary-soft) hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch">
                      <div className="bg-slate-50 md:w-20 flex flex-col items-center justify-center py-6 border-b md:border-b-0 md:border-r border-slate-100 group-hover:bg-(--tenant-primary-soft) group-hover:border-(--tenant-primary-soft) transition-colors">
                        <span className="text-xs font-bold text-slate-400 group-hover:text-(--tenant-primary) uppercase tracking-tighter mb-1">Paso</span>
                        <span className="text-3xl font-black text-slate-900 group-hover:text-(--tenant-primary)">{stage.stage_order}</span>
                      </div>

                      <div className="flex-1 p-6 lg:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-slate-900">{stage.stage_name}</h3>
                              <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-bold text-[10px] uppercase">{stage.stage_code}</Badge>
                              {stage.is_final_stage && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-tighter border border-emerald-100">
                                  <CheckCircle className="h-3 w-3" />
                                  Estado Final
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-6">
                              {stage.responsible_role_name && (
                                <div className="flex items-center gap-2 text-slate-500">
                                  <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-slate-400" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Responsable</span>
                                    <span className="text-sm font-semibold text-slate-700">{stage.responsible_role_name}</span>
                                  </div>
                                </div>
                              )}

                              {stage.time_limit_hours && (
                                <div className="flex items-center gap-2 text-slate-500">
                                  <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">SLA Límite</span>
                                    <span className="text-sm font-semibold text-slate-700">{stage.time_limit_hours} horas</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                              {stage.is_automated && (
                                <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 py-1 text-[10px] font-bold uppercase">
                                  <Zap className="h-3 w-3 mr-1.5 fill-current" />
                                  Motor IA Activo
                                </Badge>
                              )}
                              {stage.auto_advance_enabled && (
                                <Badge className="bg-blue-100 text-blue-700 border-none px-3 py-1 text-[10px] font-bold uppercase">
                                  Avance Automático
                                </Badge>
                              )}
                              {stage.escalation_enabled && (
                                <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 text-[10px] font-bold uppercase">
                                  <AlertTriangle className="h-3 w-3 mr-1.5" />
                                  Escalamiento habilitado
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-row lg:flex-col gap-2 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-8 border-slate-100">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEdit(stage)}
                              className="flex-1 lg:flex-none justify-center hover:bg-slate-100 transition-colors font-bold"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Configurar
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleDelete(stage.id)}
                              className="flex-1 lg:flex-none justify-center text-rose-500 hover:bg-rose-50 hover:text-rose-600 border-transparent transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {index < stages.length - 1 && (
                  <div className="flex justify-center md:justify-start md:ml-20 py-2">
                    <ArrowRight className="h-4 w-4 text-slate-200 rotate-90 md:rotate-0" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <WorkflowStageForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStage(null);
        }}
        onSubmit={async (data) => {
          if (editingStage) {
            await updateStage({ id: editingStage.id, data });
          } else {
            await createStage(data);
          }
          handleFormSuccess();
        }}
        stage={editingStage || undefined}
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Etapa del Flujo"
        message="¿Estás seguro? Eliminar esta etapa puede romper la secuencia del workflow actual."
        confirmText="Sí, Eliminar Etapa"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
