import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Plus, Edit, Trash2, Shield, UserCheck, Briefcase, Calendar, TrendingDown, CheckSquare, XCircle } from 'lucide-react';
import { useEligibilityRules } from '../hooks/useEligibilityRules';
import { EligibilityRuleForm } from '../components/EligibilityRuleForm';
import { CardSkeleton } from '../../../components/ui/SkeletonLoader';
import type { EligibilityRule } from '../types/eligibilityRule.types';
import { motion, AnimatePresence } from 'framer-motion';

interface EligibilityRuleListPageProps {
  embedded?: boolean;
}

export const EligibilityRuleListPage: React.FC<EligibilityRuleListPageProps> = ({ embedded = false }) => {
  const { rules, isLoading, error, createRule, updateRule, deleteRule, isDeleting } = useEligibilityRules();
  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<EligibilityRule | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<number | null>(null);

  const handleCreate = () => {
    setEditingRule(undefined);
    setFormOpen(true);
  };

  const handleEdit = (rule: EligibilityRule) => {
    setEditingRule(rule);
    setFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setRuleToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (ruleToDelete) {
      deleteRule(ruleToDelete, {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          setRuleToDelete(null);
        },
      });
    }
  };

  const handleSubmit = (data: any) => {
    if (editingRule) {
      updateRule(
        { id: editingRule.id, data },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditingRule(undefined);
          },
        }
      );
    } else {
      createRule(data, {
        onSuccess: () => {
          setFormOpen(false);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
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
        <h3 className="text-lg font-bold text-red-900 mb-2">Error de carga</h3>
        <p className="text-red-700">No pudimos obtener las reglas de elegibilidad.</p>
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
              <UserCheck className="h-5 w-5 text-(--tenant-primary)" />
              Criterios de Elegibilidad
            </h2>
            <p className="text-slate-500 text-sm">Reglas automáticas para el filtrado inicial de prestatarios.</p>
          </div>
        )}

        <Button onClick={handleCreate} className="shadow-xl shadow-(--tenant-primary-soft) font-bold">
          <Plus className="h-5 w-5 mr-2" />
          Nueva Regla
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {!rules || rules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center"
          >
            <Shield className="h-16 w-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sin reglas definidas</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">Crea criterios de elegibilidad para automatizar el rechazo de perfiles que no cumplen con los requisitos mínimos.</p>
            <Button variant="secondary" onClick={handleCreate}>
              Comenzar configuración
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.map((rule: EligibilityRule, index: number) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group border-slate-200 hover:border-(--tenant-primary-soft) hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-(--tenant-primary-soft) flex items-center justify-center">
                          <Shield className="h-5 w-5 text-(--tenant-primary)" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{rule.rule_set_name || 'Conjunto de Reglas'}</h3>
                          <span className="text-xs text-slate-400 font-medium">ID: #{rule.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button variant="secondary" size="sm" onClick={() => handleEdit(rule)} className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleDelete(rule.id)} className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 border-transparent">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RCI Máximo</span>
                        </div>
                        <p className="text-lg font-black text-slate-900">{rule.max_debt_to_income_ratio}%</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-3.5 w-3.5 text-purple-500" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Edad Permitida</span>
                        </div>
                        <p className="text-lg font-black text-slate-900">{rule.min_age} - {rule.max_age}</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Antigüedad</span>
                        </div>
                        <p className="text-lg font-black text-slate-900">{rule.min_employment_months} <span className="text-xs font-medium text-slate-400">meses</span></p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ingreso Mín.</span>
                        </div>
                        <p className="text-lg font-black text-slate-900"><span className="text-xs text-slate-400">Bs</span> {parseInt(rule.min_income_required).toLocaleString()}</p>
                      </div>
                    </div>

                    {rule.allowed_cic_categories.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckSquare className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categorías CIC Permitidas</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {rule.allowed_cic_categories.map((cat: string) => (
                            <Badge key={cat} variant="secondary" className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 border-none">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <EligibilityRuleForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingRule(undefined);
        }}
        onSubmit={handleSubmit}
        rule={editingRule}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Regla"
        message="¿Estás seguro? Esta acción afectará la evaluación automática de los nuevos créditos."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

