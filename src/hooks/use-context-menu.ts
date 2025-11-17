import { useCallback, useState } from 'react';

import type { MenuPosition } from '@/components/editor/type';

type UseContextMenuOptions = {
  reactFlowWrapper: React.RefObject<HTMLElement>;
};

/**
 * React hook responsible for managing context menu position and open/close state.
 *
 * Returns `onPaneContextMenu` and `onPaneClick` to be passed into a `<ReactFlow />`.
 */
export function useContextMenu({ reactFlowWrapper }: UseContextMenuOptions) {
  const [menu, setMenu] = useState<MenuPosition | null>(null);

  // logic for menu event
  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const pane = reactFlowWrapper.current.getBoundingClientRect();
      setMenu({
        id: '10',
        top: event.clientY < pane.height ? event.clientY : undefined,
        left: event.clientX < pane.width ? event.clientX : undefined,
        right: event.clientX >= pane.width ? pane.width - event.clientX : undefined,
        bottom: event.clientY >= pane.height ? pane.height - event.clientY : undefined,
      });
    },
    [reactFlowWrapper, setMenu],
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  return { onPaneContextMenu, onPaneClick, menu, setMenu };
}
