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

type NodeData = {
  isOutput?: boolean;
  operationVal?: string;
  outputType?: string;
};

interface NodeType {
  type: string;
  data: NodeData;
}

const baseNodes: NodeType[] = [
  {
    type: 'transform', // 0
    data: { isOutput: false },
  },
  {
    type: 'noise', // 1
    data: { isOutput: false },
  },
  {
    type: 'mathVec3', // 2
    data: {
      isOutput: false,
      operationVal: 'add',
    },
  },
  {
    type: 'mixVec3', // 3
    data: { isOutput: false },
  },
  {
    type: 'terrain', // 4
    data: { isOutput: true },
  },
  {
    type: 'vector', // 5
    data: { isOutput: false },
  },
  {
    type: 'mathFloat', // 6
    data: {
      isOutput: false,
      operationVal: 'add',
    },
  },
  {
    type: 'mixFloat', // 7
    data: { isOutput: false },
  },
  {
    type: 'separate', // 8
    data: { isOutput: false },
  },
];

export default function ContextMenu({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id,
  top,
  left,
  right,
  bottom,
  ...props
}: ContextMenuProps) {
  const { addNodes } = useReactFlow();

  const duplicateNode = useCallback(
    (nodeNum: number) => {
      const position = {
        x: 50,
        y: 50,
      };

      const baseNode = baseNodes[nodeNum];
      if (!baseNode) return;

      const customNode = {
        id: `custom-node-${Date.now()}`,
        type: baseNode.type,
        position,
        data: baseNode.data,
      };

      addNodes(customNode);
    },
    [addNodes],
  );

  return (
    <div
      style={{ top, left, right, bottom }}
      className="context-menu absolute z-50 min-w-32 rounded-md border border-gray-300 bg-white shadow-lg"
      {...props}
    >
      <button
        onClick={() => duplicateNode(0)}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Transform
      </button>
      <button
        onClick={() => duplicateNode(1)}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Noise
      </button>
      <button
        onClick={() => duplicateNode(2)}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Math (Vec3)
      </button>
      <button
        onClick={() => duplicateNode(3)}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Mix (Vec3)
      </button>
      <button
        onClick={() => duplicateNode(4)}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Terrain
      </button>
      <button
        onClick={() => duplicateNode(5)}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Vector
      </button>
      <button
        onClick={() => duplicateNode(6)}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Math (Float)
      </button>
      <button
        onClick={() => duplicateNode(7)}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Mix (Float)
      </button>
      <button
        onClick={() => duplicateNode(8)}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Separate
      </button>
    </div>
  );
}
