import { useEffect, type RefObject } from 'react';
import { useReactFlow } from 'reactflow';

import { useGraphGlobals } from '@/hooks/use-graph-globals';
import { useMousePos } from '@/hooks/use-mouse-pos';

export type KeyboardShortcutsProps = {
  reactFlowWrapperRef: RefObject<HTMLElement>;
  onOpenContextMenu: () => void;
};

export default function KeyboardShortcuts({
  reactFlowWrapperRef,
  onOpenContextMenu,
}: KeyboardShortcutsProps) {
  const { getMousePos } = useMousePos();
  const { createNode } = useGraphGlobals();
  const { screenToFlowPosition } = useReactFlow();

  // Attach keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (evt: KeyboardEvent) => {
      const mousePos = getMousePos();
      const graphBounds = reactFlowWrapperRef.current.getBoundingClientRect();

      if (
        mousePos.x < graphBounds.left ||
        mousePos.y >= graphBounds.right ||
        mousePos.x >= graphBounds.right ||
        mousePos.y >= graphBounds.bottom
      ) {
        return;
      }

      evt.preventDefault();
      evt.stopPropagation();

      const position = screenToFlowPosition(mousePos);

      if (evt.key === 'v') {
        createNode('vector', position);
      } else if (evt.key === 'f') {
        createNode('float', position);
      } else if (evt.key === 'u') {
        createNode('unsignedInt', position);
      } else if (evt.key === 's') {
        createNode('separate', position);
      } else if (evt.key === 'c') {
        createNode('combine', position);
      } else if (evt.key === 'A') {
        onOpenContextMenu();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [createNode, getMousePos, onOpenContextMenu, reactFlowWrapperRef, screenToFlowPosition]);

  return null;
}
