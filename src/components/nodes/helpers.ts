import type { Node } from 'reactflow';

export function updateNodeData<TData>({
  id,
  setNodes,
  newData,
}: {
  id: string;
  setNodes: (payload: Node[] | ((nodes: Node[]) => Node[])) => void;
  newData: Partial<TData>;
}) {
  setNodes((nodes) =>
    nodes.map((node) => {
      if (node.id === id) {
        return {
          ...node,
          data: {
            ...(node.data as TData),
            ...newData,
          },
        };
      }
      return node;
    }),
  );
}
