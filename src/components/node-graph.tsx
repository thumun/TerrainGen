/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

import type * as instructions from '@/lib/shaders/jit/types/instructions';
import type * as shaders from '@/lib/shaders/jit/types/shaders';
import type * as util from '@/lib/shaders/jit/types/util';
import MathNode from '@/nodes/math-node';
import MixNode from '@/nodes/mix-node';
import NoiseNode from '@/nodes/noise-node';
import TerrainNode from '@/nodes/terrain-node';
import TransformNode from '@/nodes/transform-node';
import VectorNode from '@/nodes/vector-node';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'transform',
    position: { x: 50, y: 50 },
    data: { isOutput: false },
  },
  {
    id: '2',
    type: 'noise',
    position: { x: 100, y: 50 },
    data: { isOutput: false },
  },
  {
    id: '3',
    type: 'math',
    position: { x: 200, y: 50 },
    data: {
      isOutput: false,
      operationVal: 'add',
    },
  },
  {
    id: '4',
    type: 'mix',
    position: { x: 300, y: 50 },
    data: { isOutput: false },
  },
  {
    id: '5',
    type: 'terrain',
    position: { x: 400, y: 50 },
    data: { isOutput: true },
  },
  {
    id: '6',
    type: 'noise',
    position: { x: 100, y: 50 },
    data: { isOutput: false },
  },
  {
    id: '7',
    type: 'vector',
    position: { x: 100, y: 50 },
    data: { isOutput: false },
  },
  {
    id: '8',
    type: 'vector',
    position: { x: 100, y: 50 },
    data: { isOutput: false },
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
  vector: VectorNode,
};

const initialEdges: Edge[] = [];

export default function NodeGraph() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const mapNodeToInstruction = (node: Node): instructions.All | null => {
    const { type, data } = node;

    switch (type) {
      case 'math':
        return {
          type: 'math',
          operation: data.operationVal,
          references: {
            readA: `${node.id}_a`,
            readB: `${node.id}_b`,
            write: `${node.id}_result`,
          },
        };

      case 'vector':
        return {
          type: 'separate-xyz',
          references: {
            read: `${node.id}_input`,
            writeX: data.outputX ? `${node.id}_x` : undefined,
            writeY: data.outputY ? `${node.id}_y` : undefined,
            writeZ: data.outputZ ? `${node.id}_z` : undefined,
          },
        };

      // Add cases for other node types
      default:
        return null;
    }
  };

  const generateReferenceKey = (nodeId: string, suffix: string): util.ReferenceKey => {
    return `${nodeId}_${suffix}`;
  };

  const getFinalOutputKey = useCallback((pipeline: Node[]): util.ReferenceKey => {
    const lastNode = pipeline[pipeline.length - 1];

    // Determine output key based on last node type
    switch (lastNode.type) {
      case 'math':
        return generateReferenceKey(lastNode.id, 'result');
      case 'separate-xyz':
        return generateReferenceKey(lastNode.id, 'y'); // Assuming we want Y component
      case 'terrain':
        return generateReferenceKey(lastNode.id, 'height');
      default:
        return generateReferenceKey(lastNode.id, 'output');
    }
  }, []);

  const executePipeline = useCallback(
    (pipeline: Node[]) => {
      console.log('Executing pipeline with steps:');
      // pipeline.forEach((node, index) => {
      //   console.log(`Step ${index + 1}: ${node.type} (${node.id})`);
      // });

      // Collect all instructions and uniforms
      const instructionSet: instructions.All[] = [];
      const uniforms: util.Uniform[] = [];
      const uniformBindings = new Map<string, { group: number; binding: number }>();

      const currentGroup = 1;
      let currentBinding = 0;

      // First pass: identify all input nodes that need uniforms
      pipeline.forEach((node) => {
        if (node.type === 'vector' || node.type === 'noise') {
          // These are input nodes that should create uniforms
          const uniformKey = generateReferenceKey(node.id, 'value');

          if (!uniformBindings.has(uniformKey)) {
            uniforms.push({
              key: uniformKey,
              type: 'vec3f', // or determine type based on node
              group: currentGroup,
              binding: currentBinding,
            });
            uniformBindings.set(uniformKey, { group: currentGroup, binding: currentBinding });
            currentBinding++;
          }
        }
      });

      // Second pass: create instructions
      pipeline.forEach((node, index) => {
        console.log(`Step ${index + 1}: ${node.type} (${node.id})`);

        const instruction = mapNodeToInstruction(node);
        if (instruction) {
          instructionSet.push(instruction);
        }
      });

      // Create the final shader config
      const shaderConfig: shaders.VertexShaderConfig = {
        type: 'vertex',
        uniforms,
        instructionSet,
        outputs: {
          height: getFinalOutputKey(pipeline), // You need to determine the final output key
        },
      };

      console.log('Generated shader config:', shaderConfig);
    },
    [getFinalOutputKey],
  );

  const getNodeGraph = (nodeId: string, nodes: Node[], edges: Edge[]): Node[] => {
    const visited = new Set<string>();
    const result: Node[] = [];

    const traverse = (currentNodeId: string) => {
      if (visited.has(currentNodeId)) {
        return;
      }

      visited.add(currentNodeId);

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

  const onOutputNodeConnected = useCallback(
    (outputNode: Node, connectedNodes: Node[]) => {
      const pipeline = [...connectedNodes, outputNode];
      executePipeline(pipeline);
    },
    [executePipeline],
  );

  // this gets called for every edge connection created
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => addEdge(params, eds));

      if (params.target) {
        // getting the node by using the handle (target)
        const targetNode = nodes.find((node) => node.id === params.target);

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
