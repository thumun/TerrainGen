import { createContext, useContext } from 'react';

const GraphGlobalsContext = createContext<{
  setUniform: (key: string, value: number | [number, number, number]) => void;
}>({ setUniform: () => {} });

export const GraphGlobalsProvider = GraphGlobalsContext.Provider;

export function useGraphGlobals() {
  const graphGlobalCallbacks = useContext(GraphGlobalsContext);

  return graphGlobalCallbacks;
}
