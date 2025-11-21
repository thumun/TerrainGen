/**
 * @todo is this being used somewhere?
 */
export type NodeData = {
  isOutput?: boolean;
  operationVal?: string;
  outputType?: string;
};

type Node<
  TType extends string,
  TData extends { [key: string]: unknown } = { [key: string]: never },
> = {
  type: TType;
  data: TData;
};

export type Vector = Node<'vector'>;
export type Transform = Node<'transform'>;
export type Noise = Node<'noise', { mode: 'FBM' }>;
export type MathFloat = Node<'mathFloat', { operationVal: 'Add' | 'Sub' | 'Mult' | 'Div' }>;
export type MathVec3 = Node<'mathVec3', { operationVal: 'Add' | 'Sub' | 'Mult' | 'Div' }>;
export type MixFloat = Node<'mixFloat'>;
export type MixVec3 = Node<'mixVec3'>;
export type Terrain = Node<'terrain'>;

export type All =
  | Vector
  | Transform
  | Noise
  | MathFloat
  | MathVec3
  | MixFloat
  | MixVec3
  | Terrain;

/**
 * Handle IDs for each node type
 */
export const HANDLES = {
  vector: {
    in: {},
    out: { result: 'vec3-out' },
  },
  transform: {
    in: {
      geo: 'geo-in',
      translate: 'vec3-trans-in',
      rotate: 'vec3-rotate-in',
      scale: 'vec3-scale-in',
      uniformScale: 'float-scale-in',
    },
    out: { result: 'geo-out' },
  },
  noise: {
    in: { scale: 'float-scale', density: 'float-density' },
    out: { result: 'float-out' },
  },
  mathFloat: {
    in: { a: 'float-val1-in', b: 'float-val2-in' },
    out: { result: 'float-out' },
  },
  mathVec3: {
    in: { a: 'vec3-val1-in', b: 'vec3-val2-in' },
    out: { result: 'vec3-out' },
  },
  mixFloat: {
    in: { a: 'float-val1-in', b: 'float-val2-in', mix: 'float-val3-in' },
    out: { result: 'float-out' },
  },
  mixVec3: {
    in: { a: 'vec3-val1-in', b: 'vec3-val2-in', mix: 'float-val3-in' },
    out: { result: 'vec3-out' },
  },
  terrain: {
    in: { height: 'float-trans-in' },
    out: {},
  },
} as const satisfies {
  [nodeType in All['type']]: { in: Record<string, string>; out: Record<string, string> };
};
export type Handles = typeof HANDLES;

export const BASE_NODES: All[] = [
  {
    type: 'transform', // 0
    data: {},
  },
  {
    type: 'noise', // 1
    data: { mode: 'FBM' },
  },
  {
    type: 'mathVec3', // 2
    data: {
      operationVal: 'Add',
    },
  },
  {
    type: 'mixVec3', // 3
    data: {},
  },
  {
    type: 'terrain', // 4
    data: {},
  },
  {
    type: 'vector', // 5
    data: {},
  },
  {
    type: 'mathFloat', // 6
    data: {
      operationVal: 'Add',
    },
  },
  {
    type: 'mixFloat', // 7
    data: {},
  },
];
