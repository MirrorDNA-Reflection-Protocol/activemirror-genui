import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { motion } from 'motion/react';
import { FileText, Globe, AlertTriangle, ShieldAlert, BarChart3, Bot, User } from 'lucide-react';

type SpatialNodeData = Record<string, unknown> & {
  role?: string;
  content?: string;
  title?: string;
  body?: string;
  agent_id?: string;
  severity?: string;
};

type SpatialNode = Node<SpatialNodeData>;

function asText(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function ChatNodeView({ data }: NodeProps<SpatialNode>) {
  const isUser = data.role === 'user';
  return (
    <div className={`px-4 py-3 rounded-2xl max-w-sm shadow-md border ${isUser ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-800 border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-1 opacity-80 text-xs uppercase tracking-wider">
        {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
        {isUser ? 'You' : 'Active Mirror'}
      </div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap">{asText(data.content)}</div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-2 border-white" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-white" />
    </div>
  );
}

const AgentBadge = ({ agentId }: { agentId?: string }) => {
  if (!agentId) return null;
  let color = 'bg-gray-100 text-gray-600 border-gray-200';
  let icon = <Bot className="w-3 h-3" />;
  if (agentId === 'MirrorGate') { color = 'bg-red-100 text-red-700 border-red-200'; icon = <ShieldAlert className="w-3 h-3" />; }
  if (agentId === 'Chetana') { color = 'bg-blue-100 text-blue-700 border-blue-200'; icon = <BarChart3 className="w-3 h-3" />; }
  if (agentId === 'MirrorProof') { color = 'bg-emerald-100 text-emerald-700 border-emerald-200'; icon = <FileText className="w-3 h-3" />; }
  if (agentId === 'MirrorBrain') { color = 'bg-purple-100 text-purple-700 border-purple-200'; icon = <Globe className="w-3 h-3" />; }
  
  return (
    <div className={`absolute -top-3 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border shadow-sm ${color}`}>
      {icon} {agentId}
    </div>
  );
};

function ArtifactNodeView({ data }: NodeProps<SpatialNode>) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-xl border border-gray-200 w-80 overflow-visible relative"
    >
      <AgentBadge agentId={asText(data.agent_id)} />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500 border-2 border-white" />
      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex items-center gap-2 text-indigo-700">
        <FileText className="w-5 h-5" />
        <span className="font-semibold text-sm">Document Artifact</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2">{asText(data.title)}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{asText(data.body)}</p>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500 border-2 border-white" />
    </motion.div>
  );
}

function BrowserNodeView({ data }: NodeProps<SpatialNode>) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-xl border border-gray-200 w-[500px] overflow-visible relative"
    >
      <AgentBadge agentId={asText(data.agent_id)} />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-emerald-500 border-2 border-white" />
      <div className="bg-zinc-800 px-4 py-2 flex items-center gap-2 text-white">
        <div className="flex gap-1.5 mr-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <Globe className="w-4 h-4 text-emerald-400" />
        <div className="bg-zinc-700 rounded text-xs px-2 py-1 flex-1 font-mono text-center">
          {asText(data.title) || "active-mirror.net/search"}
        </div>
      </div>
      <div className="p-6 bg-gray-50 min-h-[200px]">
        <h3 className="font-bold text-xl text-gray-900 mb-4">{asText(data.title)}</h3>
        <div className="text-sm text-gray-700 space-y-4 whitespace-pre-wrap">{asText(data.body)}</div>
      </div>
    </motion.div>
  );
}

function GovernanceNodeView({ data }: NodeProps<SpatialNode>) {
  const isBlocked = data.severity === 'blocked';
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-xl shadow-xl border w-80 overflow-visible relative ${isBlocked ? 'border-red-500 shadow-red-500/20' : 'border-amber-500 shadow-amber-500/20'}`}
    >
      <AgentBadge agentId={asText(data.agent_id)} />
      <Handle type="target" position={Position.Left} className={`w-3 h-3 border-2 border-white ${isBlocked ? 'bg-red-500' : 'bg-amber-500'}`} />
      <div className={`px-4 py-3 border-b flex items-center gap-2 text-white ${isBlocked ? 'bg-red-600 border-red-700' : 'bg-amber-500 border-amber-600'}`}>
        {isBlocked ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        <span className="font-bold text-sm tracking-widest">{isBlocked ? 'GOVERNANCE LOCK' : 'POLICY WARNING'}</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2">{asText(data.title)}</h3>
        <p className="text-sm text-gray-700 leading-relaxed font-mono">{asText(data.body)}</p>
      </div>
    </motion.div>
  );
}

function ChartNodeView({ data }: NodeProps<SpatialNode>) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-xl border border-gray-200 w-80 overflow-visible relative"
    >
      <AgentBadge agentId={asText(data.agent_id)} />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-white" />
      <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center gap-2 text-blue-700">
        <BarChart3 className="w-5 h-5" />
        <span className="font-semibold text-sm">Data Visualization</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2">{asText(data.title)}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{asText(data.body)}</p>
        <div className="mt-4 h-32 bg-gray-100 rounded-lg flex flex-col justify-end p-2 gap-2">
           <div className="w-full bg-blue-200 h-1/4 rounded"></div>
           <div className="w-full bg-blue-400 h-2/4 rounded"></div>
           <div className="w-full bg-blue-600 h-3/4 rounded"></div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-2 border-white" />
    </motion.div>
  );
}

export const ChatNode = memo(ChatNodeView);
export const ArtifactNode = memo(ArtifactNodeView);
export const BrowserNode = memo(BrowserNodeView);
export const GovernanceNode = memo(GovernanceNodeView);
export const ChartNode = memo(ChartNodeView);

export const nodeTypes = {
  chat_node: ChatNode,
  artifact_node: ArtifactNode,
  browser_node: BrowserNode,
  governance_node: GovernanceNode,
  chart_node: ChartNode
};
