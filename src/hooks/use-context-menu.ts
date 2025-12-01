import { useCallback, useState } from 'react';

import type { ContextMenuState } from '@/components/editor/node-graph/context-menu';

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

  // logic for menu event
  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;
      const pane = reactFlowWrapper.current.getBoundingClientRect();
      if (event.clientY > pane.height || event.clientX > pane.width) return;

      setMenuState({
        show: true,
        left: event.clientX - pane.left,
        top: event.clientY - pane.top,
      });
    },
    [reactFlowWrapper],
  );

  const closeMenu = useCallback(() => {
    setMenuState({ show: false });
  }, []);

  return { onPaneContextMenu, menuState, closeMenu };
}
