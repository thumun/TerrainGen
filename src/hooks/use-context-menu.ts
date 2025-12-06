import { useCallback, useState } from 'react';

import type { ContextMenuState } from '@/components/editor/node-graph/context-menu';
import { useMousePos } from '@/hooks/use-mouse-pos';

export type UseContextMenuOptions = {
  reactFlowWrapper: React.RefObject<HTMLElement>;
};

/**
 * React hook responsible for managing context menu position and open/close state.
 *
 * Returns `onPaneContextMenu` to be passed into a `<ReactFlow />`.
 */
export function useContextMenu({ reactFlowWrapper }: UseContextMenuOptions) {
  const [menuState, setMenuState] = useState<ContextMenuState>({ show: false });
  const { getMousePos } = useMousePos();

  // logic for menu event
  const onPaneContextMenu = useCallback(
    (event?: React.MouseEvent) => {
      event?.preventDefault();

      const mousePos = getMousePos();

      if (!reactFlowWrapper.current) return;
      const pane = reactFlowWrapper.current.getBoundingClientRect();
      if (mousePos.y > pane.height || mousePos.x > pane.width) return;

      setMenuState({
        show: true,
        left: mousePos.x - pane.left,
        top: mousePos.y - pane.top,
      });
    },
    [getMousePos, reactFlowWrapper],
  );

  const closeMenu = useCallback(() => {
    setMenuState({ show: false });
  }, []);

  return { onPaneContextMenu, menuState, closeMenu };
}
