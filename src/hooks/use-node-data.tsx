import { createContext, useContext } from 'react';

const NodeDataContext = createContext<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setNodeData: (nodeId: string, dataUpdater: (data: any) => any) => void;
}>({ setNodeData: () => {} });

export const NodeDataProvider = NodeDataContext.Provider;

export function useNodeData() {
  const { setNodeData } = useContext(NodeDataContext);

  return { setNodeData };
}
