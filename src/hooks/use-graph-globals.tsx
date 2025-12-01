import { createContext, useContext } from 'react';

const GraphGlobalsContext = createContext<{
  setDisplacePipelineUniform: (key: string, value: number | [number, number, number]) => void;
}>({ setDisplacePipelineUniform: () => {} });

export const GraphGlobalsProvider = GraphGlobalsContext.Provider;

export function useGraphGlobals() {
  const graphGlobalCallbacks = useContext(GraphGlobalsContext);

  return graphGlobalCallbacks;
}
