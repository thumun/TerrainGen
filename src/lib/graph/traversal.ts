import type * as types from './types';

/**
 * Runs DFS through node graph. Spits out an array of nodes, ordered such that all dependent
 * nodes occur after their dependencies.
 */
export function getOrderedNodes<TNode extends types.Node>(
  nodeId: string,
  nodes: TNode[],
  edges: types.Edge[],
): TNode[] {
  const visited = new Set<string>();
  const result: TNode[] = [];

  const traverse = (currentNodeId: string) => {
    if (visited.has(currentNodeId)) {
      return;
    }

    visited.add(currentNodeId);

    const currentNode = nodes.find((n) => n.id === currentNodeId);
    if (!currentNode) {
      return;
    }

    // Get all the input edges for current node
    const incomingEdges = edges.filter((edge) => edge.target === currentNodeId);

    incomingEdges.forEach((edge) => {
      traverse(edge.source);
    });

    result.push(currentNode);
  };

  traverse(nodeId);
  return result;
}

// only allow connections between nodes if types match
export function isValidConnection(connection: types.Connection, nodes: types.Node[]) {
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
}
