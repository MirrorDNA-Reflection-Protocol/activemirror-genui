"use client";

import React, { useMemo } from 'react';
import { X, Maximize2, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface MirrorGraphProps {
  title: string;
  content: string;  // markdown body — also used to derive nodes if none provided
  agentId: string;
  graphNodes?: { id: string; label: string; type?: string }[];
  graphEdges?: { id: string; source: string; target: string; label?: string }[];
  onClose?: () => void;
}

const nodeColors: Record<string, { bg: string; border: string; text: string }> = {
  agent: { bg: '#EDE9FE', border: '#8B5CF6', text: '#5B21B6' },
  service: { bg: '#DBEAFE', border: '#3B82F6', text: '#1D4ED8' },
  data: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
  security: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
  default: { bg: '#F3F4F6', border: '#6B7280', text: '#1F2937' },
};

function buildDefaultGraph(): { nodes: Node[]; edges: Edge[] } {
  const items = [
    { id: 'user', label: 'User', type: 'default' },
    { id: 'am', label: 'Active Mirror', type: 'agent' },
    { id: 'mg', label: 'MirrorGate', type: 'security' },
    { id: 'ch', label: 'Chetana', type: 'service' },
    { id: 'prod', label: 'MirrorProd', type: 'agent' },
    { id: 'proof', label: 'MirrorProof', type: 'data' },
  ];

  const nodes: Node[] = items.map((item, i) => {
    const cols = 3;
    const row = Math.floor(i / cols);
    const col = i % cols;
    const colors = nodeColors[item.type || 'default'] || nodeColors.default;
    return {
      id: item.id,
      position: { x: 80 + col * 220, y: 60 + row * 160 },
      data: { label: item.label },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '12px 20px',
        fontSize: '13px',
        fontWeight: 600,
        color: colors.text,
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
      },
    };
  });

  const edges: Edge[] = [
    { id: 'e1', source: 'user', target: 'am', animated: true, style: { stroke: '#8B5CF6' } },
    { id: 'e2', source: 'am', target: 'mg', label: 'gate', animated: true, style: { stroke: '#EF4444' } },
    { id: 'e3', source: 'am', target: 'ch', label: 'site shield', animated: true, style: { stroke: '#3B82F6' } },
    { id: 'e4', source: 'am', target: 'prod', label: 'market', animated: true, style: { stroke: '#8B5CF6' } },
    { id: 'e5', source: 'mg', target: 'proof', label: 'receipt', style: { stroke: '#EF4444', strokeDasharray: '6 3' } },
    { id: 'e6', source: 'ch', target: 'proof', label: 'signals', style: { stroke: '#10B981' } },
    { id: 'e7', source: 'prod', target: 'proof', label: 'claims', style: { stroke: '#8B5CF6' } },
  ];

  return { nodes, edges };
}

function buildFromData(
  graphNodes: { id: string; label: string; type?: string }[],
  graphEdges: { id: string; source: string; target: string; label?: string }[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = graphNodes.map((n, i) => {
    const cols = 3;
    const row = Math.floor(i / cols);
    const col = i % cols;
    const colors = nodeColors[n.type || 'default'] || nodeColors.default;
    return {
      id: n.id,
      position: { x: 80 + col * 220, y: 60 + row * 160 },
      data: { label: n.label },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '12px 20px',
        fontSize: '13px',
        fontWeight: 600,
        color: colors.text,
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
      },
    };
  });

  const edges: Edge[] = graphEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label || undefined,
    animated: true,
    style: { stroke: '#8B5CF6' },
  }));

  return { nodes, edges };
}

export default function MirrorGraph({ title, content, agentId, graphNodes, graphEdges, onClose }: MirrorGraphProps) {
  const { nodes, edges } = useMemo(() => {
    if (graphNodes && graphNodes.length > 0 && graphEdges) {
      return buildFromData(graphNodes, graphEdges);
    }
    return buildDefaultGraph();
  }, [graphNodes, graphEdges]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, filter: 'blur(16px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
      transition={{ type: 'spring', damping: 25, stiffness: 180 }}
      className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden flex flex-col h-full animate-surface-enter"
    >
      {/* Graph Chrome */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <Network className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 leading-tight">{title || 'System Graph'}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{agentId} / interactive</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          style={{ background: '#FAFBFC' }}
        >
          <Background color="#E5E7EB" gap={20} size={1} />
          <Controls
            position="bottom-right"
            showInteractive={false}
            style={{ borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}
          />
          <MiniMap
            nodeStrokeWidth={3}
            position="top-right"
            style={{ borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}
          />
        </ReactFlow>
      </div>
    </motion.div>
  );
}
