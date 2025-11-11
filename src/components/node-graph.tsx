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
} from 'reactflow';

import 'reactflow/dist/style.css';

import AddNode from '@/nodes/math-node';
import NoiseNode from '@/nodes/noise-node';
import TransformNode from '@/nodes/transform-node';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'transform',
    position: { x: 50, y: 50 },
    data: {
      value: 123,
    },
  },
  {
    id: '2',
    type: 'noise',
    position: { x: 100, y: 50 },
    data: {
      value: 123,
    },
  },
  {
    id: '3',
    type: 'add',
    position: { x: 200, y: 50 },
    data: {
      value: 123,
    },
  },
];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const nodeTypes = { transform: TransformNode, noise: NoiseNode, add: AddNode };

const initialEdges: Edge[] = [];

export default function NodeGraph() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // checks if edge connection valid
  const isValidConnection = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode || !connection.sourceHandle || !connection.targetHandle) {
        return false;
      }

      // returns prefix (geo, vec3, etc.) or entire id otherwise
      const getHandlePrefix = (handleId: string): string => {
        const hyphenIndex = handleId.indexOf('-');
        if (hyphenIndex !== -1) {
          return handleId.substring(0, hyphenIndex);
        }
        return handleId;
      };

      const sourcePrefix = getHandlePrefix(connection.sourceHandle);
      const targetPrefix = getHandlePrefix(connection.targetHandle);

      return sourcePrefix === targetPrefix;
    },
    [nodes],
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
        isValidConnection={isValidConnection}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
