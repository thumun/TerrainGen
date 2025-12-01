/** Parameterized node type with custom data object! */
type Node<
  TType extends string,
  TData extends { [key: string]: unknown } = { [key: string]: never },
> = {
  type: TType;
  data: TData;
};

export type Vector = Node<'vector', { x: number; y: number; z: number }>;
export type Transform = Node<'transform'>;
export type Noise = Node<'noise', { mode: 'FBM' | 'Worley' }>;
export type MathFloat = Node<'mathFloat', { operationVal: 'Add' | 'Sub' | 'Mult' | 'Div' }>;
export type TrigMathFloat = Node<'trigMathFloat', { operationVal: 'Sin' | 'Cos' | 'Tan' }>;
export type MathVec3 = Node<'mathVec3', { operationVal: 'Add' | 'Sub' | 'Mult' | 'Div' }>;
export type MixFloat = Node<'mixFloat'>;
export type MixVec3 = Node<'mixVec3'>;
export type VertexData = Node<'vertexData'>;
export type Terrain = Node<'terrain'>;
export type Separate = Node<'separate'>;
export type Combine = Node<'combine'>;
export type Float = Node<'float', { value: number }>;
export type PrimitiveGeometry = Node<'primGeo', { meshPath: string }>;
export type LoadGeometry = Node<'loadGeo', { meshPath: string; fileContent: string }>;
export type BuiltinGeometry = Node<'builtinGeo', { meshPath: string }>;
export type Scatter = Node<'scatter', { instances: number; threshold: number }>;
export type Instancing = Node<'instancing'>;
export type UnsignedInt = Node<'unsignedInt', { value: number }>;

export type All =
  | Vector
  | Transform
  | Noise
  | MathFloat
  | TrigMathFloat
  | MathVec3
  | MixFloat
  | MixVec3
  | VertexData
  | Terrain
  | Separate
  | Combine
  | Float
  | PrimitiveGeometry
  | LoadGeometry
  | BuiltinGeometry
  | Scatter
  | Instancing
  | UnsignedInt;

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
    in: { position: 'vec3-position', numOctaves: 'uint-numOctaves', scale: 'float-scale' },
    out: { result: 'float-out' },
  },
  mathFloat: {
    in: { a: 'float-val1-in', b: 'float-val2-in' },
    out: { result: 'float-out' },
  },
  trigMathFloat: {
    in: { input: 'float-in' },
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
  vertexData: {
    in: {},
    out: { position: 'vec3-pos-out' },
  },
  terrain: {
    in: { height: 'float-trans-in' },
    out: {},
  },
  separate: {
    in: { xyz: 'vec3-val1-in' },
    out: { x: 'float-x-out', y: 'float-y-out', z: 'float-z-out' },
  },
  combine: {
    in: { x: 'float-x-in', y: 'float-y-in', z: 'float-z-in' },
    out: { xyz: 'vec3-out' },
  },
  float: {
    in: {},
    out: { result: 'float-out' },
  },
  scatter: {
    in: { a: 'float-val1-in' },
    out: { result: 'float-out' },
  },
  instancing: {
    in: { position: 'vec3-pos-array-in', geometry: 'geo-inst-in', instCount: 'uint-count-in' },
    out: {},
  },
  primGeo: {
    in: {},
    out: { result: 'geo-out' },
  },
  loadGeo: {
    in: {},
    out: { result: 'geo-out' },
  },
  builtinGeo: {
    in: {},
    out: { result: 'geo-out' },
  },
  unsignedInt: {
    in: {},
    out: { result: 'uint-out' },
  },
} as const satisfies {
  [nodeType in All['type']]: { in: Record<string, string>; out: Record<string, string> };
};
export type Handles = typeof HANDLES;

/**
 * Node prefabs for when a user wants to add a new node
 */
export const NODE_PREFABS: { [nodeType in All['type']]: All & { type: nodeType } } = {
  transform: { type: 'transform', data: {} },
  noise: { type: 'noise', data: { mode: 'FBM' } },
  mathVec3: {
    type: 'mathVec3',
    data: { operationVal: 'Add' },
  },
  mixVec3: { type: 'mixVec3', data: {} },
  vertexData: { type: 'vertexData', data: {} },
  terrain: { type: 'terrain', data: {} },
  vector: { type: 'vector', data: { x: 0, y: 0, z: 0 } },
  mathFloat: {
    type: 'mathFloat',
    data: { operationVal: 'Add' },
  },
  trigMathFloat: {
    type: 'trigMathFloat',
    data: { operationVal: 'Sin' },
  },
  mixFloat: { type: 'mixFloat', data: {} },
  separate: { type: 'separate', data: {} },
  combine: { type: 'combine', data: {} },
  float: { type: 'float', data: { value: 0 } },
  scatter: { type: 'scatter', data: { instances: 0, threshold: 0 } },
  instancing: { type: 'instancing', data: {} },
  primGeo: { type: 'primGeo', data: { meshPath: '/models/cube.obj' } },
  loadGeo: { type: 'loadGeo', data: { meshPath: '', fileContent: '' } },
  builtinGeo: { type: 'builtinGeo', data: { meshPath: '/models/tree.obj' } },
  unsignedInt: { type: 'unsignedInt', data: { value: 0 } },
};
