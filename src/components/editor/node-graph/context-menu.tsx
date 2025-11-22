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
      {/* TODO: generate these using a type-guarded map from node types to full names */}
      <button
        onClick={() => duplicateNode('transform')}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Transform
      </button>
      <button
        onClick={() => duplicateNode('noise')}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Noise
      </button>
      <button
        onClick={() => duplicateNode('mathVec3')}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Math (Vec3)
      </button>
      <button
        onClick={() => duplicateNode('mixVec3')}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Mix (Vec3)
      </button>
      <button
        onClick={() => duplicateNode('terrain')}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Terrain
      </button>
      <button
        onClick={() => duplicateNode('vector')}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Vector
      </button>
      <button
        onClick={() => duplicateNode('mathFloat')}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Math (Float)
      </button>
      <button
        onClick={() => duplicateNode('trigMathFloat')}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Trig Math (Float)
      </button>
      <button
        onClick={() => duplicateNode('mixFloat')}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Mix (Float)
      </button>
      <button
        onClick={() => duplicateNode('separate')}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Separate
      </button>
      <button
        onClick={() => duplicateNode('combine')}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Combine
      </button>
      <button
        onClick={() => duplicateNode('float')}
        className="w-full border-none px-3 py-2 text-left text-red-600 transition-colors hover:bg-gray-100"
      >
        Float
      </button>
    </div>
  );
}
