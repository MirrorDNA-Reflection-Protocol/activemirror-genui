import { useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './SpatialNodes';

type ChatMessage = {
  role: string;
  content: string;
  id?: string;
};

type SpatialSurfaceNode = {
  id?: string;
  type?: string;
  title?: string;
  body?: string;
  agent_id?: string;
  severity?: string;
  [key: string]: unknown;
};

type SpatialSurfaceEdge = {
  source?: string;
  target?: string;
  label?: string;
};

type SpatialSurface = {
  new_nodes?: SpatialSurfaceNode[];
  new_edges?: SpatialSurfaceEdge[];
};

export default function SpatialCanvas({ 
  messages, 
  partialSurface,
  isLoading: _isLoading
}: { 
  messages: ChatMessage[],
  partialSurface?: SpatialSurface,
  isLoading: boolean
}) {
  void _isLoading;
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const nodesRef = useRef<Node[]>([]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Generate nodes from messages and surface
  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // 1. Map Chat Messages
    let lastUserNodeId: string | null = null;
    let yOffset = 50;

    messages.forEach((msg, idx) => {
      const nodeId = msg.id || `msg-${idx}`;
      if (msg.role === 'user') {
        lastUserNodeId = nodeId;
      }
      // Check if it already exists to preserve dragged positions
      const existingNode = nodesRef.current.find(n => n.id === nodeId);
      newNodes.push({
        id: nodeId,
        type: 'chat_node',
        position: existingNode ? existingNode.position : { x: 50, y: yOffset },
        data: { role: msg.role, content: msg.content },
      });
      yOffset += 120;
    });

    // 2. Map AI Generated Artifacts (from previous complete surfaces if we stored them in messages, 
    // but here we are mapping the *current* partial surface being generated).
    // In a full app, you'd store past surfaces in a history array. For now, we map the live surface.
    if (partialSurface && partialSurface.new_nodes) {
      partialSurface.new_nodes.forEach((n, idx) => {
        if (!n.id) return; // Skip if streaming hasn't filled id yet
        const existingNode = nodesRef.current.find(node => node.id === n.id);
        newNodes.push({
          id: n.id,
          type: n.type || 'artifact_node',
          // Position it to the right of the chat
          position: existingNode ? existingNode.position : { x: 600, y: 50 + (idx * 250) },
          data: { ...n },
        });

        // Auto-link to the last user message if no edge is specified
        if (lastUserNodeId) {
          const edgeId = `e-${lastUserNodeId}-${n.id}`;
          newEdges.push({
            id: edgeId,
            source: lastUserNodeId,
            target: n.id,
            animated: true,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
            style: { stroke: '#3b82f6', strokeWidth: 2 }
          });
        }
      });
    }

    if (partialSurface && partialSurface.new_edges) {
      partialSurface.new_edges.forEach((e) => {
        if (!e.source || !e.target) return;
        const edgeId = `e-${e.source}-${e.target}`;
        if (!newEdges.find(ne => ne.id === edgeId)) {
          newEdges.push({
             id: edgeId,
             source: e.source,
             target: e.target,
             animated: true,
             label: e.label,
             type: 'smoothstep',
             markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
             style: { stroke: '#3b82f6', strokeWidth: 2 }
          });
        }
      });
    }

    // Merge logic: preserve existing nodes that aren't in the new render (like past history)
    setNodes((nds) => {
      const merged = [...nds];
      newNodes.forEach(nn => {
        const idx = merged.findIndex(n => n.id === nn.id);
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], data: nn.data }; // Update data, keep position
        } else {
          merged.push(nn);
        }
      });
      return merged;
    });

    setEdges((eds) => {
      const merged = [...eds];
      newEdges.forEach(ne => {
        if (!merged.find(e => e.id === ne.id)) {
          merged.push(ne);
        }
      });
      return merged;
    });

  }, [messages, partialSurface, setEdges, setNodes]);

  return (
    <div style={{ width: '100%', height: '100%' }} className="bg-slate-50/50 rounded-xl overflow-hidden shadow-inner border border-slate-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
          style: { stroke: '#94a3b8', strokeWidth: 2 }
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#cbd5e1" />
        <Controls className="bg-white border-slate-200 shadow-sm" />
      </ReactFlow>
    </div>
  );
}
