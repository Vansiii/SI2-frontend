import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { RuleSetCard } from '../components/RuleSetCard';
import { RuleSetForm } from '../components/RuleSetForm';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '../../../components/ui/Dialog';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { 
  useRuleSets, 
  useActivateRuleSet, 
  useCloneRuleSet,
  useDeleteRuleSet,
  useCreateRuleSet,
  useUpdateRuleSet,
} from '../hooks/useRuleSets';
import { 
  Plus, 
  Layers,
  Search,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { CardSkeleton } from '../../../components/ui/SkeletonLoader';
import type { TenantRuleSet, TenantRuleSetWrite } from '../types/ruleSet.types';
import { motion, AnimatePresence } from 'framer-motion';

type FilterType = 'all' | 'active' | 'draft' | 'archived';

interface RuleSetListPageProps {
  embedded?: boolean;
}

export const RuleSetListPage: React.FC<RuleSetListPageProps> = ({}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingRuleSet, setEditingRuleSet] = useState<TenantRuleSet | undefined>();

  const { data: ruleSets, isLoading, error } = useRuleSets();
  const activateMutation = useActivateRuleSet();
  const cloneMutation = useCloneRuleSet();
  const deleteMutation = useDeleteRuleSet();
  const createMutation = useCreateRuleSet();
  const updateMutation = useUpdateRuleSet();

  // Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [cloneName, setCloneName] = useState('');

  const handleCreate = () => {
    setEditingRuleSet(undefined);
    setFormOpen(true);
  };

  const handleEdit = (id: number) => {
    const allRuleSets = Array.isArray(ruleSets) ? ruleSets : (ruleSets as any)?.results || [];
    const ruleSet = allRuleSets.find((r: any) => r.id === id);
    if (ruleSet) {
      setEditingRuleSet(ruleSet);
      setFormOpen(true);
    }
  };

  const handleSubmit = (data: TenantRuleSetWrite) => {
    if (editingRuleSet) {
      updateMutation.mutate(
        { id: editingRuleSet.id, data },
        { onSuccess: () => { setFormOpen(false); setEditingRuleSet(undefined); } }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => setFormOpen(false) });
    }
  };

  const onActivateClick = (id: number) => {
    setTargetId(id);
    setActivateDialogOpen(true);
  };

  const onCloneClick = (id: number) => {
    setTargetId(id);
    setCloneName('');
    setCloneDialogOpen(true);
  };

  const onDeleteClick = (id: number) => {
    setTargetId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmActivate = () => {
    if (targetId) {
      activateMutation.mutate(targetId, { onSuccess: () => setActivateDialogOpen(false) });
    }
  };

  const handleConfirmClone = () => {
    if (targetId && cloneName.trim()) {
      cloneMutation.mutate({ id: targetId, data: { name: cloneName } }, { onSuccess: () => setCloneDialogOpen(false) });
    }
  };

  const handleConfirmDelete = () => {
    if (targetId) {
      deleteMutation.mutate(targetId, { onSuccess: () => setDeleteDialogOpen(false) });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-rose-50 border border-rose-200 rounded-2xl p-12 text-center"
      >
        <XCircle className="h-12 w-12 text-rose-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-rose-900 mb-2">Error al cargar datos</h3>
        <p className="text-rose-700">No pudimos obtener la lista de conjuntos de reglas.</p>
      </motion.div>
    );
  }

  const allRuleSets = Array.isArray(ruleSets) ? ruleSets : (ruleSets as any)?.results || [];
  
  const stats = {
    total: allRuleSets.length,
    active: allRuleSets.filter((r: any) => r.status === 'ACTIVE').length,
    draft: allRuleSets.filter((r: any) => r.status === 'DRAFT').length,
    archived: allRuleSets.filter((r: any) => r.status === 'ARCHIVED').length,
  };

  const filteredRuleSets = allRuleSets.filter((ruleSet: any) => {
    if (filter === 'all') return true;
    return ruleSet.status === filter.toUpperCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-slate-200 shadow-sm overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'all', label: 'Todos', count: stats.total, color: 'bg-slate-900' },
            { id: 'active', label: 'Activos', count: stats.active, color: 'bg-emerald-600' },
            { id: 'draft', label: 'Borradores', count: stats.draft, color: 'bg-amber-500' },
            { id: 'archived', label: 'Archivados', count: stats.archived, color: 'bg-slate-400' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as FilterType)}
              className={`
                px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap
                ${filter === f.id ? `${f.color} text-white shadow-md` : 'text-slate-500 hover:bg-slate-50'}
              `}
            >
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filter === f.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <Button onClick={handleCreate} className="w-full md:w-auto shadow-xl shadow-(--tenant-primary-soft) font-bold">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Conjunto
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {filteredRuleSets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-20 text-center"
          >
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Search className="h-8 w-8" />
            </div>
            <p className="text-slate-500 font-medium">No se encontraron conjuntos de reglas.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRuleSets.map((ruleSet: any, index: number) => (
              <motion.div
                key={ruleSet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <RuleSetCard
                  ruleSet={ruleSet}
                  onEdit={handleEdit}
                  onActivate={onActivateClick}
                  onClone={onCloneClick}
                  onDelete={onDeleteClick}
                  onViewAudit={(id) => navigate(`/admin/rules/${id}/audit`)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <RuleSetForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingRuleSet(undefined); }}
        onSubmit={handleSubmit}
        ruleSet={editingRuleSet}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={activateDialogOpen}
        onClose={() => setActivateDialogOpen(false)}
        onConfirm={handleConfirmActivate}
        title="Activar Conjunto"
        message="¿Estás seguro? Al activar esta estrategia, la anterior se archivará."
        confirmText="Confirmar Activación"
        variant="warning"
        isLoading={activateMutation.isPending}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Conjunto"
        message="¿Estás seguro? Esta acción eliminará permanentemente la configuración."
        confirmText="Sí, Eliminar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <DialogContent className="p-0 overflow-hidden border-none shadow-2xl max-w-md">
          <div className="bg-(--tenant-primary) p-6 text-white relative">
            <Layers className="absolute top-0 right-0 h-20 w-20 opacity-10" />
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Clonar Estrategia</DialogTitle>
          </div>
          <div className="p-6 bg-white space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Nombre del nuevo conjunto</Label>
              <Input
                value={cloneName}
                onChange={(e) => setCloneName(e.target.value)}
                placeholder="Copia de..."
                className="bg-slate-50 border-transparent focus:bg-white focus:border-(--tenant-primary)"
              />
            </div>
            <DialogFooter className="pt-4 border-t gap-2">
              <Button variant="secondary" onClick={() => setCloneDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleConfirmClone} isLoading={cloneMutation.isPending} disabled={!cloneName.trim()} className="font-bold">
                Clonar Ahora
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
