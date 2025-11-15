import { useCallback, useRef, useState } from 'react';
import { useNodesState, useEdgesState } from 'reactflow';
import type { Node, Edge } from 'reactflow';

import type { MenuPosition, NodeGraphHook } from './type';

// nodes on start up
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'transform',
    position: { x: 50, y: 50 },
    data: { isOutput: false },
  },
  {
    id: '2',
    type: 'noise',
    position: { x: 100, y: 50 },
    data: { isOutput: false },
  },
  {
    id: '3',
    type: 'mathVec3',
    position: { x: 200, y: 50 },
    data: {
      isOutput: false,
      operationVal: 'add',
      outputType: 'vec3',
    },
  },
  {
    id: '4',
    type: 'mixVec3',
    position: { x: 300, y: 50 },
    data: { isOutput: false, outputType: 'vec3' },
  },
  {
    id: '5',
    type: 'terrain',
    position: { x: 400, y: 50 },
    data: { isOutput: true },
  },
  {
    id: '6',
    type: 'noise',
    position: { x: 100, y: 50 },
    data: { isOutput: false },
  },
  {
    id: '7',
    type: 'vector',
    position: { x: 100, y: 50 },
    data: { isOutput: false },
  },
  {
    id: '8',
    type: 'vector',
    position: { x: 100, y: 50 },
    data: { isOutput: false },
  },
  {
    id: '9',
    type: 'mathFloat',
    position: { x: 300, y: 50 },
    data: { isOutput: false, outputType: 'vec3' },
  },
  {
    id: '10',
    type: 'mixFloat',
    position: { x: 300, y: 50 },
    data: { isOutput: false, outputType: 'float' },
  },
];

// edges on start up
const initialEdges: Edge[] = [];

// node graph setup / handler
export const useNodeGraph = (): NodeGraphHook => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [menu, setMenu] = useState<MenuPosition | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

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
    [setMenu],
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  return {
    nodes,
    edges,
    menu,
    onNodesChange,
    onEdgesChange,
    setEdges,
    setMenu,
    reactFlowWrapper,
    onPaneContextMenu,
    onPaneClick,
  };
};
