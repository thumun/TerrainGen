import { useCallback } from 'react';
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

  const setNodeData = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (nodeId: string, dataUpdater: (a: any) => any) => {
      setNodes(
        nodes.map((node) => {
          if (node.id !== nodeId) return node;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          return { ...node, data: dataUpdater(node.data) };
        }),
      );
    },
    [nodes, setNodes],
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
    setNodeData,
  };
};

export type UseNodeGraphResult = ReturnType<typeof useNodeGraph>;
