import { createContext, useCallback, useContext } from 'react';
import type { Node, XYPosition } from 'reactflow';

import * as nodeTypes from '@/lib/graph/node-types';

const GraphGlobalsContext = createContext<{
  createNode: (nodeType: nodeTypes.All['type'], position: XYPosition) => void;
  setUniform: (key: string, value: number | [number, number, number]) => void;
  triggerNodePipelineUpdate: (nodeId: string) => void;
}>({
  createNode: () => {},
  setUniform: () => {},
  triggerNodePipelineUpdate: () => {},
});

export type GraphGlobalsProviderProps = {
  children: React.ReactNode;
  onAddNode: (node: Node) => void;
  onUniformUpdate: (key: string, value: number | [number, number, number]) => void;
  onNodePipelineUpdate: (nodeId: string) => void;
};

export function GraphGlobalsProvider({
  children,
  onAddNode,
  onUniformUpdate,
  onNodePipelineUpdate,
}: GraphGlobalsProviderProps) {
  const createNode = useCallback(
    (nodeType: nodeTypes.All['type'], position: XYPosition) => {
      const baseNode = nodeTypes.NODE_PREFABS[nodeType];

      const customNode = {
        ...baseNode,
        // TODO: maybe some more unique id, uuid perhaps?
        id: `custom-node-${Date.now()}`,
        position,
      };

      onAddNode(customNode);
    },
    [onAddNode],
  );

  return (
    <GraphGlobalsContext.Provider
      value={{
        createNode,
        setUniform: onUniformUpdate,
        triggerNodePipelineUpdate: onNodePipelineUpdate,
      }}
    >
      {children}
    </GraphGlobalsContext.Provider>
  );
}

export function useGraphGlobals() {
  const graphGlobalCallbacks = useContext(GraphGlobalsContext);

  return graphGlobalCallbacks;
}
