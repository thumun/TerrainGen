import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';

import * as nodeTypes from '@/lib/graph/node-types';

// referenced from here
// https://reactflow.dev/examples/interaction/context-menu

export type ContextMenuState = { show: false } | { show: true; left: number; top: number };

export type ContextMenuProps = {
  state: ContextMenuState;
  closeMenu?: () => void;
  reactFlowWrapper: React.RefObject<HTMLElement>;
  className?: string;
};

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

export default function ContextMenu({ state, closeMenu, reactFlowWrapper }: ContextMenuProps) {
  const { addNodes, screenToFlowPosition } = useReactFlow();

  const createNode = useCallback(
    (nodeType: nodeTypes.All['type']) => {
      if (!state.show) return;

      const pane = reactFlowWrapper.current.getBoundingClientRect();
      const position = screenToFlowPosition({
        x: (state.left ?? 0) + pane.left,
        y: (state.top ?? 0) + pane.top,
      });

      const baseNode = nodeTypes.NODE_PREFABS[nodeType];

      const customNode = {
        ...baseNode,
        // TODO: maybe some more unique id, uuid perhaps?
        id: `custom-node-${Date.now()}`,
        position,
      };

      addNodes(customNode);
    },
    [addNodes, reactFlowWrapper, screenToFlowPosition, state],
  );
  return (
    <DropdownMenu.Root open={state.show}>
      {/* hacky workaround: the trigger exists, but tiny as hell */}
      <DropdownMenu.Trigger
        className="absolute size-0 bg-red-400/20 select-none focus-visible:outline-none"
        // content will align with this element, so position it at the mouse
        style={{
          left: state.show ? `${state.left}px` : 0,
          top: state.show ? `${state.top}px` : 0,
        }}
        id="trigger"
      />
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-zinc-900 transition-opacity"
          onInteractOutside={closeMenu}
          onEscapeKeyDown={closeMenu}
          align="start"
        >
          <DropdownMenu.Group>
            <DropdownMenu.Item>Hello peter</DropdownMenu.Item>
            <DropdownMenu.Item>Hello peter 2</DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
