import { useEffect } from 'react';
import { useReactFlow } from 'reactflow';

import { useGraphGlobals } from '@/hooks/use-graph-globals';
import { useMousePos } from '@/hooks/use-mouse-pos';

export default function KeyboardShortcuts() {
  const { getMousePos } = useMousePos();
  const { createNode } = useGraphGlobals();
  const { screenToFlowPosition } = useReactFlow();

  // Attach keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (evt: KeyboardEvent) => {
      const mousePos = getMousePos();
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
      } else {
        return;
      }
      evt.preventDefault();
      evt.stopPropagation();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [createNode, getMousePos, screenToFlowPosition]);

  return null;
}
