import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Plus, Gauge, Edit, Trash2, CheckCircle, AlertCircle, XCircle, DollarSign, TrendingUp, Info, Shield, ChevronRight } from 'lucide-react';
import { useDecisionThresholds } from '../hooks/useDecisionThresholds';
import { Badge } from '../../../components/ui/Badge';
import { DecisionThresholdForm } from '../components/DecisionThresholdForm';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { CardSkeleton } from '../../../components/ui/SkeletonLoader';
import type { DecisionThreshold } from '../types/decisionThreshold.types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface DecisionThresholdListPageProps {
  embedded?: boolean;
}

export const DecisionThresholdListPage: React.FC<DecisionThresholdListPageProps> = ({ embedded = false }) => {
  const { thresholds, loading, error, deleteThreshold, createThreshold, updateThreshold, isCreating, isUpdating, isDeleting } = useDecisionThresholds();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState<DecisionThreshold | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [thresholdToDelete, setThresholdToDelete] = useState<number | null>(null);

  const isLoading = loading || isCreating || isUpdating || isDeleting;

  const handleCreate = () => {
    setEditingThreshold(null);
    setIsFormOpen(true);
  };

  const handleEdit = (threshold: DecisionThreshold) => {
    setEditingThreshold(threshold);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setThresholdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (thresholdToDelete) {
      deleteThreshold(thresholdToDelete, {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          setThresholdToDelete(null);
          toast.success('Umbrales eliminados correctamente');
        },
        onError: () => {
          setDeleteConfirmOpen(false);
          setThresholdToDelete(null);
        },
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingThreshold(null);
    toast.success(editingThreshold ? 'Umbrales actualizados' : 'Umbrales creados');
  };

  const formatAmount = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'No configurado';
    return new Intl.NumberFormat('es-BO', { 
      style: 'currency', 
      currency: 'BOB',
      maximumFractionDigits: 0 
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1, 2].map(i => <CardSkeleton key={i} />)}
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
        <div className="bg-red-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-red-900 mb-2">Error de conexión</h3>
        <p className="text-red-700 max-w-xs mx-auto">No pudimos cargar los umbrales de decisión. Por favor, intenta de nuevo más tarde.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center ${embedded ? 'justify-end' : 'justify-between'} gap-4`}>
        {!embedded && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-(--tenant-primary)" />
              Matriz de Scoring
            </h2>
            <p className="text-slate-500 text-sm">Configuración de niveles de riesgo y automatización.</p>
          </div>
        )}

        <Button onClick={handleCreate} className="shadow-xl shadow-(--tenant-primary-soft) font-bold">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Umbral
        </Button>
      </div>

      {/* Lista de umbrales */}
      <AnimatePresence mode="popLayout">
        {!thresholds || thresholds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 text-center"
          >
            <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gauge className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sin umbrales activos</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">Define los puntos de corte para que la IA pueda tomar decisiones automáticas precisas.</p>
            <Button variant="secondary" onClick={handleCreate}>
              <Plus className="h-5 w-5 mr-2" />
              Configurar primer umbral
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {thresholds.map((threshold, index) => (
              <motion.div
                key={threshold.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden border-slate-200 hover:border-(--tenant-primary-soft) hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-(--tenant-primary) opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-(--tenant-primary-soft) flex items-center justify-center">
                            <Gauge className="h-5 w-5 text-(--tenant-primary)" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">Configuración de Scoring</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {threshold.rule_set_name ? (
                                <Badge variant="secondary" className="font-semibold">{threshold.rule_set_name}</Badge>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Sin conjunto asignado</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Threshold Visualizer */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-green-600 uppercase tracking-tighter">Auto-Aprobación</span>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-slate-900">{threshold.min_score_auto_approval}</span>
                              <span className="text-slate-400 font-medium">+ pts</span>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-amber-600 uppercase tracking-tighter">Revisión Manual</span>
                              <span className="p-1 bg-amber-50 rounded text-amber-500"><Info className="h-3 w-3" /></span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-slate-900">{threshold.min_score_manual_review}</span>
                              <span className="text-slate-400 font-medium">pts</span>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-rose-600 uppercase tracking-tighter">Auto-Rechazo</span>
                              <XCircle className="h-4 w-4 text-rose-500" />
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-slate-900">{threshold.max_score_auto_rejection}</span>
                              <span className="text-slate-400 font-medium">- pts</span>
                            </div>
                          </div>
                        </div>

                        {/* Money Rules */}
                        <div className="flex flex-wrap gap-6 pt-2">
                          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                            <DollarSign className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">Auto-aprobación hasta </span>
                            <span className="text-sm font-bold text-slate-900">{formatAmount(threshold.max_amount_auto_approval)}</span>
                          </div>
                          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                            <Shield className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">Requiere Gerencia desde </span>
                            <span className="text-sm font-bold text-slate-900">{formatAmount(threshold.requires_manager_approval_amount)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row lg:flex-col gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEdit(threshold)}
                          disabled={isLoading}
                          className="flex-1 lg:flex-none justify-center font-bold"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Configurar
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDelete(threshold.id)}
                          disabled={isLoading}
                          className="flex-1 lg:flex-none justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-transparent transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <DecisionThresholdForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingThreshold(null);
        }}
        onSubmit={async (data) => {
          if (editingThreshold) {
            await updateThreshold({ id: editingThreshold.id, data });
          } else {
            await createThreshold(data);
          }
          handleFormSuccess();
        }}
        threshold={editingThreshold || undefined}
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Umbrales de Scoring"
        message="¿Estás seguro? Esta acción eliminará la configuración de puntos de corte para la evaluación automática."
        confirmText="Sí, Eliminar Matriz"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};