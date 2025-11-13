import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';

// referenced from here
// https://reactflow.dev/examples/interaction/context-menu

interface ContextMenuProps {
  id: string | null;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  onClick?: () => void;
  className?: string;
}

export default function ContextMenu({
  id,
  top,
  left,
  right,
  bottom,
  ...props
}: ContextMenuProps) {
  const { getNode, setNodes, addNodes, setEdges } = useReactFlow();

  const duplicateNode = useCallback(() => {
    if (!id) return;

    const node = getNode(id);
    if (!node) return;

    const position = {
      x: node.position.x + 50,
      y: node.position.y + 50,
    };

    addNodes({
      ...node,
      id: `${node.id}-copy`,
      position,
    });
  }, [id, getNode, addNodes]);

  const deleteNode = useCallback(() => {
    if (!id) return;

    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  }, [id, setNodes, setEdges]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className="context-menu absolute z-50 min-w-32 rounded-md border border-gray-300 bg-white shadow-lg"
      {...props}
    >
      <p className="m-2 text-xs text-gray-600">
        <small>node: {id}</small>
      </p>
      <button
        onClick={duplicateNode}
        className="w-full border-none px-3 py-2 text-left transition-colors hover:bg-gray-100"
      >
        duplicate
      </button>
      <button
        onClick={deleteNode}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        delete
      </button>
    </div>
  );
}
