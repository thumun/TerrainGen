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
      if (closeMenu) closeMenu();
    },
    [addNodes, closeMenu, reactFlowWrapper, screenToFlowPosition, state],
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
          className="rounded-lg border border-zinc-600 bg-zinc-900 p-1"
          onInteractOutside={closeMenu}
          onEscapeKeyDown={closeMenu}
          align="start"
        >
          <ContextMenuSub>
            <ContextMenuSubTrigger>Utility</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onSelect={() => createNode('vector')} underConstruction>
                Vector
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => createNode('float')} underConstruction>
                Float
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => createNode('separate')}>
                Separate XYZ
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => createNode('combine')}>
                Combine XYZ
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSub>
            <ContextMenuSubTrigger>Operators</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuSub>
                <ContextMenuSubTrigger>Math</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem onSelect={() => createNode('mathVec3')}>
                    Vector
                  </ContextMenuItem>
                  <ContextMenuItem onSelect={() => createNode('mathFloat')}>
                    Float
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>

              <ContextMenuSub>
                <ContextMenuSubTrigger>Mix</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem onSelect={() => createNode('mixVec3')}>
                    Vector
                  </ContextMenuItem>
                  <ContextMenuItem onSelect={() => createNode('mixFloat')}>
                    Float
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>

              <ContextMenuSub>
                <ContextMenuSubTrigger>Trigonometry</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem onSelect={() => createNode('trigMathFloat')}>
                    Float
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>

              <ContextMenuItem onSelect={() => createNode('noise')} underConstruction>
                Noise
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSub>
            <ContextMenuSubTrigger underConstruction>Geometry</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onSelect={() => createNode('transform')}>
                Transform
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSub>
            <ContextMenuSubTrigger>Input/Output</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onSelect={() => createNode('vertexData')}>
                Vertex Info (Input)
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => createNode('terrain')}>
                Terrain (Output)
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

type ContextMenuSubProps = { children?: React.ReactNode };

function ContextMenuSub({ children }: ContextMenuSubProps) {
  return <DropdownMenu.Sub>{children}</DropdownMenu.Sub>;
}

type ContextMenuSubTriggerProps = { children?: React.ReactNode; underConstruction?: boolean };

function ContextMenuSubTrigger({ children, underConstruction }: ContextMenuSubTriggerProps) {
  return (
    <DropdownMenu.SubTrigger
      disabled={underConstruction}
      className="radix-highlighted:bg-zinc-800 radix-disabled:text-zinc-400 radix-state-open:bg-zinc-800 radix-disabled:grayscale flex cursor-default justify-between gap-x-4 rounded-sm py-1 pr-2 pl-3 focus-visible:outline-none"
    >
      <span>
        {underConstruction && '🏗️ '}
        {children}
      </span>
      <span>›</span>
    </DropdownMenu.SubTrigger>
  );
}

type ContextMenuSubContentProps = { children?: React.ReactNode };

function ContextMenuSubContent({ children }: ContextMenuSubContentProps) {
  return (
    <DropdownMenu.SubContent
      className="rounded-lg border border-zinc-600 bg-zinc-900 p-1"
      alignOffset={-5}
      sideOffset={4}
    >
      {children}
    </DropdownMenu.SubContent>
  );
}

type ContextMenuItemProps = {
  children?: React.ReactNode;
  onSelect?: () => void;
  underConstruction?: boolean;
  className?: string;
};

function ContextMenuItem({
  children,
  onSelect,
  underConstruction,
  className,
}: ContextMenuItemProps) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      disabled={underConstruction}
      className={`radix-highlighted:bg-linear-to-r radix-state-open:bg-zinc-800 radix-disabled:text-zinc-400 radix-disabled:grayscale radix-disabled:cursor-default cursor-pointer rounded-sm from-violet-600 to-indigo-600 px-3 py-1 focus-visible:outline-none ${className}`}
    >
      {underConstruction && '🏗️ '}
      {children}
    </DropdownMenu.Item>
  );
}
