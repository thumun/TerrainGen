export interface Node {
  id: string;
}

export interface Edge {
  source: string;
  target: string;
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
