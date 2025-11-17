import type * as types from './types';

/**
 * Runs DFS through node graph. Spits out an array of nodes in reverse order.
 *
 * @todo Should this be BFS instead? that way each layer is fully "exhausted" before moving
 *       on to the next... we should prob chat about how this works and go through a whiteboard
 *       example to make sure we all agree on it
 * */
export function getNodeGraph<TNode extends types.Node>(
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
