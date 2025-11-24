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
  className?: string;
};

const contextMenuItems: ContextMenuItem[] = [
  { nodeType: 'vector', label: 'Vector', className: 'text-green-800' },
  { nodeType: 'mathVec3', label: 'Math (Vec3)', className: 'text-green-800' },
  { nodeType: 'mixVec3', label: 'Mix (Vec3)', className: 'text-green-800' },
  { nodeType: 'float', label: 'Float', className: 'text-blue-800' },
  { nodeType: 'unsignedInt', label: 'Unsigned Int', className: 'text-orange-800' },
  { nodeType: 'mathFloat', label: 'Math (Float)', className: 'text-blue-800' },
  { nodeType: 'trigMathFloat', label: 'Trig Math (Float)', className: 'text-blue-800' },
  { nodeType: 'mixFloat', label: 'Mix (Float)', className: 'text-blue-800' },
  { nodeType: 'separate', label: 'Separate', className: 'text-green-800' },
  { nodeType: 'combine', label: 'Combine', className: 'text-green-800' },
  { nodeType: 'noise', label: 'Noise', className: 'text-blue-800' },
  { nodeType: 'transform', label: 'Transform', className: 'text-teal-800' },
  { nodeType: 'vertexData', label: 'Vertex Data (Input)', className: 'text-black' },
  { nodeType: 'terrain', label: 'Terrain (Output)', className: 'text-black' },
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
      className="context-menu absolute z-50 w-60 rounded-md border border-gray-300 bg-white shadow-lg"
      {...props}
    >
      {contextMenuItems.map(({ nodeType, label, className }) => (
        <button
          key={nodeType}
          onClick={() => duplicateNode(nodeType)}
          className={`w-full border-none px-2 py-1 text-left text-sm hover:bg-gray-200 ${className}`}
        >
          + {label}
        </button>
      ))}
    </div>
  );
}
