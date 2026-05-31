import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  Users, 
  FileText,
  AlertCircle,
  Package,
  Send,
  Folder,
  Shield,
  BarChart3,
  Eye,
  Sparkles
} from 'lucide-react';
import type { WorkflowStageDefinition } from '../types/workflowStage.types';

interface StageNodeData extends Record<string, unknown> {
  stage: WorkflowStageDefinition;
  onEdit?: (stage: WorkflowStageDefinition) => void;
  onDelete?: (id: number) => void;
}

type StageNodeType = import('@xyflow/react').Node<StageNodeData>;
type StageNodeProps = NodeProps<StageNodeType>;

const STAGE_ICONS: Record<string, React.ElementType> = {
  DRAFT: FileText,
  SUBMITTED: Send,
  DOCUMENTS: Folder,
  KYC: Shield,
  SCORING: BarChart3,
  REVIEW: Eye,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  DISBURSED: Package,
  CANCELLED: AlertCircle,
};

const STAGE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  DRAFT: { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-700' },
  SUBMITTED: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
  DOCUMENTS: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
  KYC: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
  SCORING: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
  REVIEW: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700' },
  APPROVED: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700' },
  REJECTED: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-700' },
  DISBURSED: { bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-700' },
  CANCELLED: { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-700' },
};

export const WorkflowStageNode = memo(({ data }: StageNodeProps) => {
  const { stage, onEdit } = data;
  const Icon = STAGE_ICONS[stage.stage_code] || Package;
  const colors = STAGE_COLORS[stage.stage_code] || STAGE_COLORS.DRAFT;

  // Detectar si es etapa inicial (sin conexiones entrantes)
  const isInitial = stage.stage_order === 1;
  const isTerminal = stage.is_final_stage;

  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 shadow-lg
        ${colors.bg} ${colors.border}
        min-w-[220px] max-w-[280px]
        transition-all duration-200
        hover:shadow-xl hover:scale-105
        cursor-pointer
      `}
      onClick={() => onEdit?.(stage)}
    >
      {/* Handle superior (entrada) */}
      {!isInitial && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-slate-400 !border-2 !border-white"
        />
      )}

      {/* Contenido del nodo */}
      <div className="space-y-2">
        {/* Header con icono y orden */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${colors.bg} border ${colors.border}`}>
              <Icon className={`h-4 w-4 ${colors.text}`} />
            </div>
            <span className="text-xs font-bold text-slate-500">
              #{stage.stage_order}
            </span>
          </div>
          
          {/* Badges */}
          <div className="flex gap-1">
            {isInitial && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 rounded">
                INICIAL
              </span>
            )}
            {isTerminal && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-purple-100 text-purple-700 rounded">
                FINAL
              </span>
            )}
          </div>
        </div>

        {/* Nombre de la etapa */}
        <div>
          <h4 className={`text-sm font-bold ${colors.text} leading-tight`}>
            {stage.stage_name}
          </h4>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            {stage.stage_code}
          </p>
        </div>

        {/* Características */}
        <div className="flex flex-wrap gap-1">
          {stage.is_automated && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 rounded text-[9px] text-emerald-700">
              <Zap className="h-2.5 w-2.5" />
              <span className="font-semibold">IA</span>
            </div>
          )}
          {stage.requires_manual_approval && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 rounded text-[9px] text-blue-700">
              <Users className="h-2.5 w-2.5" />
              <span className="font-semibold">Manual</span>
            </div>
          )}
          {stage.time_limit_hours && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 rounded text-[9px] text-amber-700">
              <Clock className="h-2.5 w-2.5" />
              <span className="font-semibold">{stage.time_limit_hours}h</span>
            </div>
          )}
          {stage.auto_advance_enabled && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 rounded text-[9px] text-indigo-700">
              <Sparkles className="h-2.5 w-2.5" />
              <span className="font-semibold">Auto</span>
            </div>
          )}
        </div>
      </div>

      {/* Handle inferior (salida) - solo si no es terminal */}
      {!isTerminal && (
        <>
          {/* Handle para éxito (derecha) */}
          <Handle
            type="source"
            position={Position.Right}
            id="success"
            className="w-3 h-3 !bg-emerald-500 !border-2 !border-white"
            style={{ top: '50%' }}
          />
          
          {/* Handle para fallo (abajo) */}
          {stage.next_stage_on_failure && (
            <Handle
              type="source"
              position={Position.Bottom}
              id="failure"
              className="w-3 h-3 !bg-red-500 !border-2 !border-white"
            />
          )}
        </>
      )}
    </div>
  );
});

WorkflowStageNode.displayName = 'WorkflowStageNode';
