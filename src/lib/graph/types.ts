export interface Node {
  id: string;
  type?: string;
  data: unknown;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

/**
 * Connection event from `source node` -> `edge` -> `target node`
 *
 * note: for `sourceTarget` and `targetHandle`, using prefix `type-handleName` allows type enforcement
 */
export interface Connection {
  source: string | null;
  target: string | null;
  sourceHandle: string | null;
  targetHandle: string | null;
}
