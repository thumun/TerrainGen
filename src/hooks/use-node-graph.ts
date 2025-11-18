import { useNodesState, useEdgesState } from 'reactflow';
import type { Node, Edge } from 'reactflow';

// nodes on start up
const initialNodes: Node[] = [
  // {
  //   id: '1',
  //   type: 'transform',
  //   position: { x: 50, y: 50 },
  //   data: { isOutput: false },
  // },
  // {
  //   id: '2',
  //   type: 'noise',
  //   position: { x: 100, y: 50 },
  //   data: { isOutput: false },
  // },
  {
    id: '3',
    type: 'mathVec3',
    position: { x: 200, y: 50 },
    data: {
      isOutput: false,
      operationVal: 'add',
    },
  },
  // {
  //   id: '4',
  //   type: 'mixVec3',
  //   position: { x: 300, y: 50 },
  //   data: { isOutput: false },
  // },
  {
    id: '5',
    type: 'terrain',
    position: { x: 400, y: 50 },
    data: { isOutput: true },
  },
  // {
  //   id: '6',
  //   type: 'noise',
  //   position: { x: 100, y: 50 },
  //   data: { isOutput: false },
  // },
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

// edges on start up
const initialEdges: Edge[] = [];

// node graph setup / handler
export const useNodeGraph = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setEdges,
  };
};
