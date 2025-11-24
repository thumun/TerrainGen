import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';

import * as nodeTypes from '@/lib/graph/node-types';

// referenced from here
// https://reactflow.dev/examples/interaction/context-menu

interface ContextMenuProps {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  onClick?: () => void;
  className?: string;
}

type ContextMenuItem = {
  nodeType: nodeTypes.All['type'];
  label: string;
};

const contextMenuItems: ContextMenuItem[] = [
  { nodeType: 'transform', label: 'Transform' },
  { nodeType: 'noise', label: 'Noise' },
  { nodeType: 'mathVec3', label: 'Math (Vec3)' },
  { nodeType: 'mixVec3', label: 'Mix (Vec3)' },
  { nodeType: 'terrain', label: 'Terrain' },
  { nodeType: 'vertexData', label: 'Vertex Data (Input)' },
  { nodeType: 'vector', label: 'Vector' },
  { nodeType: 'mathFloat', label: 'Math (Float)' },
  { nodeType: 'trigMathFloat', label: 'Trig Math (Float)' },
  { nodeType: 'mixFloat', label: 'Mix (Float)' },
  { nodeType: 'separate', label: 'Separate' },
  { nodeType: 'combine', label: 'Combine' },
  { nodeType: 'float', label: 'Float' },
];

export default function ContextMenu({ top, left, right, bottom, ...props }: ContextMenuProps) {
  const { addNodes } = useReactFlow();

  const duplicateNode = useCallback(
    (nodeType: nodeTypes.All['type']) => {
      const position = {
        x: 50,
        y: 50,
      };

      const baseNode = nodeTypes.NODE_PREFABS[nodeType];

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
      {contextMenuItems.map(({ nodeType, label }) => (
        <button
          key={nodeType}
          onClick={() => duplicateNode(nodeType)}
          className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
