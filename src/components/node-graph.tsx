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
  type NodeTypes,
} from 'reactflow';

import 'reactflow/dist/style.css';

import MathNode from '@/nodes/math-node';
import MixNode from '@/nodes/mix-node';
import NoiseNode from '@/nodes/noise-node';
import TerrainNode from '@/nodes/terrain-node';
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
    type: 'math',
    position: { x: 200, y: 50 },
    data: {
      value: 123,
    },
  },
  {
    id: '4',
    type: 'mix',
    position: { x: 300, y: 50 },
    data: {
      value: 123,
    },
  },
  {
    id: '5',
    type: 'terrain',
    position: { x: 400, y: 50 },
    data: {
      isOutput: true,
    },
  },
];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const nodeTypes: NodeTypes = {
  transform: TransformNode,
  noise: NoiseNode,
  math: MathNode,
  mix: MixNode,
  terrain: TerrainNode,
};

const initialEdges: Edge[] = [];

export default function NodeGraph() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const executePipeline = useCallback((pipeline: Node[]) => {
    console.log('Executing pipeline with steps:');
    pipeline.forEach((node, index) => {
      console.log(`Step ${index + 1}: ${node.type} (${node.id})`);
    });
  }, []);

  const getNodeGraph = (nodeId: string, nodes: Node[], edges: Edge[]): Node[] => {
    const visited = new Set<string>();
    const result: Node[] = [];

    const traverse = (currentNodeId: string) => {
      if (visited.has(currentNodeId)) {
        return;
      } else {
        visited.add(currentNodeId);
      }

      const currentNode = nodes.find((n) => n.id === currentNodeId);
      if (!currentNode) {
        return;
      }

      if (currentNodeId !== nodeId) {
        result.push(currentNode);
      }

      // this gets all the input edges for curr node
      const incomingEdges = edges.filter((edge) => edge.target === currentNodeId);

      incomingEdges.forEach((edge) => {
        traverse(edge.source);
      });
    };

    traverse(nodeId);
    return result.reverse();
  };

  const onOutputNodeConnected = useCallback((outputNode: Node, connectedNodes: Node[]) => {
    const pipeline = [...connectedNodes, outputNode];
    executePipeline(pipeline);
  }, []);

  // this gets called for every edge connection created
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => addEdge(params, eds));

      if (params.target) {
        // getting the node by using the handle (target)
        const targetNode = nodes.find((node) => node.id === params.target);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (targetNode?.data?.isOutput === true) {
          console.log('Connected to output node:', targetNode);

          // cycling backwards up graph
          const connectedNodes = getNodeGraph(targetNode.id, nodes, addEdge(params, edges));

          onOutputNodeConnected(targetNode, connectedNodes);
        }
      }
    },
    [setEdges, nodes, edges, onOutputNodeConnected],
  );

  const isValidConnection = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode || !connection.sourceHandle || !connection.targetHandle) {
        return false;
      }

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
