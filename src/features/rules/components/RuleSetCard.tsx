import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { RuleSetStatusBadge } from './RuleSetStatusBadge';
import { 
  Edit, 
  Copy, 
  CheckCircle, 
  Trash2,
  Eye,
  Layers,
  FileCheck,
  Zap,
  Calendar,
  History,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TenantRuleSet } from '../types/ruleSet.types';
import { motion } from 'framer-motion';

interface RuleSetCardProps {
  ruleSet: TenantRuleSet;
  onEdit?: (id: number) => void;
  onActivate?: (id: number) => void;
  onClone?: (id: number) => void;
  onDelete?: (id: number) => void;
  onViewAudit?: (id: number) => void;
  className?: string;
}

export const RuleSetCard: React.FC<RuleSetCardProps> = ({
  ruleSet,
  onEdit,
  onActivate,
  onClone,
  onDelete,
  onViewAudit,
  className = '',
}) => {
  const isDraft = ruleSet.status === 'DRAFT';
  const isActive = ruleSet.status === 'ACTIVE';

  return (
    <Card className={`group relative overflow-hidden transition-all duration-500 hover:shadow-2xl border-slate-200 hover:border-(--tenant-primary-soft) ${className}`}>
      {/* Active Indicator Glow */}
      {isActive && (
        <div className="absolute top-0 right-0 h-32 w-32 bg-(--tenant-primary) opacity-5 blur-[80px] -z-10" />
      )}
      
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Main Info Section */}
          <div className="flex-1 p-8 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                    {ruleSet.name}
                  </h3>
                  <RuleSetStatusBadge status={ruleSet.status} />
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-medium text-xs uppercase tracking-widest">
                  <History className="h-3 w-3" />
                  Versión {ruleSet.version} • {format(new Date(ruleSet.created_at), "d 'de' MMM, yyyy", { locale: es })}
                </div>
              </div>

              {isActive && (
                <div className="flex items-center gap-2 px-3 py-1 bg-(--tenant-primary) rounded-full shadow-lg shadow-(--tenant-primary-soft)">
                  <Zap className="h-3 w-3 text-(--tenant-on-primary) fill-current" />
                  <span className="text-[10px] font-black text-(--tenant-on-primary) uppercase tracking-tighter">En Producción</span>
                </div>
              )}
            </div>

            {ruleSet.description && (
              <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                {ruleSet.description}
              </p>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <Layers className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase">Productos</span>
                </div>
                <p className="text-xl font-black text-slate-900">{ruleSet.product_parameters?.length || 0}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <FileCheck className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase">Docs</span>
                </div>
                <p className="text-xl font-black text-slate-900">{ruleSet.document_requirements?.length || 0}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <Zap className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase">Etapas</span>
                </div>
                <p className="text-xl font-black text-slate-900">{ruleSet.workflow_stages?.length || 0}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <Shield className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase">IA Rules</span>
                </div>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${ruleSet.eligibility_rule ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                  {ruleSet.eligibility_rule ? <CheckCircle className="h-4 w-4" /> : <History className="h-4 w-4" />}
                </div>
              </div>
            </div>

            {isActive && ruleSet.activated_at && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-3 py-1.5 rounded-lg border border-emerald-100">
                <Calendar className="h-3 w-3" />
                SISTEMA OPERATIVO DESDE EL {format(new Date(ruleSet.activated_at), "dd/MM/yyyy HH:mm", { locale: es })}
              </div>
            )}
          </div>

          {/* Action Sidebar */}
          <div className="lg:w-48 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-100 p-6 flex flex-row lg:flex-col gap-2 justify-center">
            {isDraft && onEdit && (
              <button
                onClick={() => onEdit(ruleSet.id)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 bg-white border border-slate-200 text-slate-700 hover:border-(--tenant-primary) hover:text-(--tenant-primary) hover:shadow-md"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>
            )}

            {isDraft && onActivate && (
              <button
                onClick={() => onActivate(ruleSet.id)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-lg hover:shadow-xl shadow-(--tenant-primary-soft)"
                style={{
                  backgroundColor: 'var(--tenant-primary)',
                  color: 'var(--tenant-on-primary)',
                }}
              >
                <Zap className="h-4 w-4" />
                Activar
              </button>
            )}

            {!isDraft && onClone && (
              <button
                onClick={() => onClone(ruleSet.id)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                <Copy className="h-4 w-4" />
                Clonar
              </button>
            )}

            {onViewAudit && (
              <button
                onClick={() => onViewAudit(ruleSet.id)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                <Eye className="h-4 w-4" />
                Auditoría
              </button>
            )}

            {isDraft && onDelete && (
              <button
                onClick={() => onDelete(ruleSet.id)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 bg-rose-50 border border-transparent text-rose-600 hover:bg-rose-100 hover:border-rose-200"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

