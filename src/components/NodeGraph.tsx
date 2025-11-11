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

import AddNode from '@/nodes/AddNode';
import NoiseNode from '@/nodes/NoiseNode';
import TransformNode from '@/nodes/TransformNode';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'transform', // custom node type
    position: { x: 50, y: 50 },
    data: { value: 123 },
  },
  {
    id: '2',
    type: 'noise', // custom node type
    position: { x: 100, y: 50 },
    data: { value: 123 },
  },
  {
    id: '3',
    type: 'add', // custom node type
    position: { x: 200, y: 50 },
    data: { value: 123 },
  }
];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const nodeTypes = { transform: TransformNode, noise: NoiseNode, add: AddNode };

const initialEdges: Edge[] = [];

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