export type NodeData = {
  isOutput?: boolean;
  operationVal?: string;
  outputType?: string;
};

type Node<TType extends string, TData extends { isOutput: boolean; [key: string]: unknown }> = {
  type: TType;
  data: TData;
};

// type TransformNode = Node<'transform', { isOutput: false }>;
// type NoiseNode = Node<'noise', { isOutput: false }>;
export type MathVec3 = Node<
  'mathVec3',
  {
    isOutput: false;
    operationVal: 'Add' | 'Sub' | 'Mult' | 'Div';
  }
>;
// type MixVec3Node = Node<'mixVec3', { isOutput: false }>;
// type TerrainNode = Node<'terrain', { isOutput: true }>;

export type All = MathVec3;

export const HANDLES = {
  mathVec3: {
    in: { a: 'vec3-val1-in', b: 'vec3-val2-in' },
    out: { result: 'vec3-out' },
  },
} as const satisfies {
  [nodeType in All['type']]: { in: Record<string, string>; out: Record<string, string> };
};
export type Handles = typeof HANDLES;

export const BASE_NODES: All[] = [
  // {
  //   type: 'transform', // 0
  //   data: { isOutput: false },
  // },
  // {
  //   type: 'noise', // 1
  //   data: { isOutput: false },
  // },
  {
    type: 'mathVec3', // 2
    data: {
      isOutput: false,
      operationVal: 'Add',
    },
  },
  // {
  //   type: 'mixVec3', // 3
  //   data: { isOutput: false },
  // },
  // {
  //   type: 'terrain', // 4
  //   data: { isOutput: true },
  // },
  // {
  //   type: 'vector', // 5
  //   data: { isOutput: false },
  // },
  // {
  //   type: 'mathFloat', // 6
  //   data: {
  //     isOutput: false,
  //     operationVal: 'add',
  //   },
  // },
  // {
  //   type: 'mixFloat', // 7
  //   data: { isOutput: false },
  // },
];
