import type { Node, Edge, XYPosition } from 'reactflow';

type SerializedNodeData = {
  id: string;
  data: unknown;
  type: string;
  position: XYPosition;
};

type SerializedEdgeData = {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
};

type SerializedGraphData = { nodes: SerializedNodeData[]; edges: SerializedEdgeData[] };

/**
 * Converts a ReactFlow graph into only required serialized data. Can be used to export a node
 * graph as a text file for sharing.
 */
export function serializeReactFlowNodeGraph({
  nodes,
  edges,
}: {
  nodes: Node[];
  edges: Edge[];
}): string {
  return JSON.stringify({
    nodes: nodes.map(({ id, data, position, type }) => ({
      id,
      data: data as unknown,
      position,
      type: type as string,
    })),
    edges: edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({
      id,
      source,
      target,
      sourceHandle: sourceHandle as string,
      targetHandle: targetHandle as string,
    })),
  } satisfies SerializedGraphData);
}

type DeserializeReactFlowNodeGraphResult =
  | { success: true; graph: { nodes: Node[]; edges: Edge[] } }
  | { success: false; message: string };

/**
 * Parses a serialized node graph into usable node/edge data for a ReactFlow node graph.
 */
export function deserializeReactFlowNodeGraph(
  serializedGraph: string,
): DeserializeReactFlowNodeGraphResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serializedGraph);
  } catch {
    return { success: false, message: 'JSON parse failed' };
  }

  if (typeof parsed !== 'object' || !parsed) {
    return { success: false, message: 'Invalid filetype' };
  }

  return { success: true, graph: parsed as { nodes: Node[]; edges: Edge[] } };
}
