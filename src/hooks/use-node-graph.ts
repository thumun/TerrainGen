import { useNodesState, useEdgesState } from 'reactflow';
import type { Node, Edge } from 'reactflow';

// node graph setup / handler
export const useNodeGraph = (
  opts: {
    initialNodes?: Node[];
    initialEdges?: Edge[];
  } = {},
) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(opts.initialNodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(opts.initialEdges ?? []);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
  };
};

export type UseNodeGraphResult = ReturnType<typeof useNodeGraph>;
