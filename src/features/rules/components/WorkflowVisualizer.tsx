import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { WorkflowStageNode } from './WorkflowStageNode';
import type { WorkflowStageDefinition } from '../types/workflowStage.types';
import { Maximize2, ZoomIn, ZoomOut, Minimize2 } from 'lucide-react';

interface WorkflowVisualizerProps {
  stages: WorkflowStageDefinition[];
  onEditStage?: (stage: WorkflowStageDefinition) => void;
  onDeleteStage?: (id: number) => void;
}

// Extender los tipos de @xyflow/react con nuestros datos
interface StageNodeData {
  stage: WorkflowStageDefinition;
  onEdit?: (stage: WorkflowStageDefinition) => void;
  onDelete?: (id: number) => void;
}

type FlowNode = Node<StageNodeData>;
type FlowEdge = Edge;

const nodeTypes = {
  stageNode: WorkflowStageNode,
};

// Configuración de Dagre para auto-layout
const getLayoutedElements = (nodes: FlowNode[], edges: FlowEdge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: 'LR', // Left to Right
    nodesep: 80,
    ranksep: 150,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 120 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 125,
        y: nodeWithPosition.y - 60,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  stages,
  onEditStage,
  onDeleteStage,
}) => {
  // Convertir stages a nodos y edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: FlowNode[] = stages.map((stage) => ({
      id: stage.id.toString(),
      type: 'stageNode',
      position: { x: 0, y: 0 }, // Se calculará con dagre
      data: {
        stage,
        onEdit: onEditStage,
        onDelete: onDeleteStage,
      },
    }));

    const edges: FlowEdge[] = [];

    // Crear edges basados en las conexiones
    stages.forEach((stage) => {
      // Edge de éxito (verde)
      if (stage.next_stage_on_success) {
        const targetStage = stages.find(s => s.stage_code === stage.next_stage_on_success);
        if (targetStage) {
          edges.push({
            id: `${stage.id}-success-${targetStage.id}`,
            source: stage.id.toString(),
            target: targetStage.id.toString(),
            sourceHandle: 'success',
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: '#10b981', 
              strokeWidth: 2.5,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#10b981',
              width: 20,
              height: 20,
            },
            label: '✓ Éxito',
            labelStyle: { 
              fill: '#10b981', 
              fontWeight: 600,
              fontSize: 11,
            },
            labelBgStyle: { 
              fill: '#d1fae5', 
              fillOpacity: 0.9,
            },
          });
        }
      }

      // Edge de fallo (rojo)
      if (stage.next_stage_on_failure) {
        const targetStage = stages.find(s => s.stage_code === stage.next_stage_on_failure);
        if (targetStage) {
          edges.push({
            id: `${stage.id}-failure-${targetStage.id}`,
            source: stage.id.toString(),
            target: targetStage.id.toString(),
            sourceHandle: 'failure',
            type: 'smoothstep',
            animated: false,
            style: { 
              stroke: '#ef4444', 
              strokeWidth: 2,
              strokeDasharray: '5,5',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#ef4444',
              width: 18,
              height: 18,
            },
            label: '✗ Fallo',
            labelStyle: { 
              fill: '#ef4444', 
              fontWeight: 600,
              fontSize: 11,
            },
            labelBgStyle: { 
              fill: '#fee2e2', 
              fillOpacity: 0.9,
            },
          });
        }
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [stages, onEditStage, onDeleteStage]);

  // Aplicar layout automático
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    [initialNodes, initialEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Actualizar cuando cambien las etapas
  React.useEffect(() => {
    const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = 
      getLayoutedElements(initialNodes, initialEdges);
    setNodes(newLayoutedNodes);
    setEdges(newLayoutedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (stages.length === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
        <div className="text-center">
          <div className="text-6xl mb-4">🌿</div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">
            No hay etapas en este workflow
          </h3>
          <p className="text-sm text-slate-500">
            Crea tu primera etapa para comenzar a diseñar el flujo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={16} 
          size={1}
          color="#cbd5e1"
        />
        <Controls 
          showInteractive={false}
          className="!bg-white !border-2 !border-slate-200 !shadow-lg"
        />
        
        {/* Panel de información */}
        <Panel position="top-left" className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl border-2 border-slate-200 shadow-lg">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="font-semibold text-slate-700">Éxito</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="font-semibold text-slate-700">Fallo</span>
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <span className="text-slate-600">
              <span className="font-bold text-slate-900">{stages.length}</span> etapas
            </span>
          </div>
        </Panel>

        {/* Panel de ayuda */}
        <Panel position="bottom-right" className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl border-2 border-slate-200 shadow-lg">
          <div className="text-[10px] text-slate-600 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Click</span>
              <span>en un nodo para editar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Scroll</span>
              <span>para hacer zoom</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Drag</span>
              <span>para mover el canvas</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};
