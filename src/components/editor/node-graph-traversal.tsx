import { useCallback } from 'react';
import type { Node, Edge, Connection } from 'reactflow';

// traverse through node graph once the output node is connected -- this check is in node-graph.tsx
// traverse backwards then flip the list at the end (DFS)
export const useNodeTraversal = () => {
  const getNodeGraph = useCallback((nodeId: string, nodes: Node[], edges: Edge[]): Node[] => {
    const visited = new Set<string>();
    const result: Node[] = [];

    const traverse = (currentNodeId: string) => {
      if (visited.has(currentNodeId)) {
        return;
      }

      visited.add(currentNodeId);

      const currentNode = nodes.find((n) => n.id === currentNodeId);
      if (!currentNode) {
        return;
      }

      if (currentNodeId !== nodeId) {
        result.push(currentNode);
      }

      // Get all the input edges for current node
      const incomingEdges = edges.filter((edge) => edge.target === currentNodeId);

      incomingEdges.forEach((edge) => {
        traverse(edge.source);
      });
    };

    traverse(nodeId);
    return result.reverse();
  }, []);

  // only allow connections between nodes if types match
  const isValidConnection = useCallback((connection: Connection, nodes: Node[]) => {
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);

    if (!sourceNode || !targetNode || !connection.sourceHandle || !connection.targetHandle) {
      return false;
    }

    // we check based on prefix of handle id
    const getHandlePrefix = (handleId: string): string => {
      const hyphenIndex = handleId.indexOf('-');
      if (hyphenIndex !== -1) {
        return handleId.substring(0, hyphenIndex);
      }
      return handleId;
    };

    const sourcePrefix = getHandlePrefix(connection.sourceHandle);
    const targetPrefix = getHandlePrefix(connection.targetHandle);

    return sourcePrefix === targetPrefix;
  }, []);

  return {
    getNodeGraph,
    isValidConnection,
  };
};
