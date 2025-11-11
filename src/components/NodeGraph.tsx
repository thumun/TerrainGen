import { useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type FitViewOptions, 
  type Node, 
  type Edge,
  type Connection, 
//   type Connection 
} from 'reactflow';

import 'reactflow/dist/style.css';

import TransformNode from '../nodes/TransformNode';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'transform', // custom node type
    position: { x: 50, y: 50 },
    data: { value: 123 },
  }
];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const nodeTypes = { transform: TransformNode };

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: 'Edge' },
];

export default function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={fitViewOptions}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}