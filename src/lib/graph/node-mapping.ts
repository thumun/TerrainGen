/**
 * This file implements methods to convert node graph nodes into the types accepted by `@/lib/shaders/jit`.
 */

import * as nodeTypes from './node-types';

import type * as instructions from '@/lib/shaders/jit/types/instructions';
import * as shaders from '@/lib/shaders/jit/types/shaders';
import type * as util from '@/lib/shaders/jit/types/util';

// --------------------------------------------------------------------------------------------
// ------ TYPE DEFINITIONS FOR NODE MAPPING
// --------------------------------------------------------------------------------------------

/**
 * For a given node type, generate an instruction.
 *
 * @param node                  The given node
 * @param getIncomingHandleKey  Callback to get the outgoing handle key from an upstream node,
 *                              given an incoming handle ID for this current node
 */
export type InstructionGenerator<
  TNode extends { type: string },
  TNodeType extends TNode['type'],
  TInstruction,
> = (
  node: nodeTypes.All & { id: string; type: TNodeType },
  getIncomingHandleKey: (handle: string) => string,
) => TInstruction | null;

/**
 * A collection of methods per known node type (i.e. 'mathVec3') which generate an instruction
 * based on a given node's content.
 */
export type InstructionMapping<TNode extends { type: string }, TInstruction> = {
  [nodeType in TNode['type']]: InstructionGenerator<TNode, nodeType, TInstruction>;
};

export type UniformGenerator<
  TNode extends { type: string },
  TNodeType extends TNode['type'],
  TUniform,
> = (node: nodeTypes.All & { id: string; type: TNodeType }) => TUniform[];

export type UniformMapping<TNode extends { type: string }, TUniform> = {
  [nodeType in TNode['type']]: UniformGenerator<TNode, nodeType, TUniform>;
};

// --------------------------------------------------------------------------------------------
// ------ NODE MAPPING IMPLEMENTATIONS
// --------------------------------------------------------------------------------------------

function formatKey(key: string) {
  return key.replaceAll('-', '_').replaceAll(' ', '');
}

/** Generates a consistent handle key for a specific node's outgoing handle. */
export function getHandleKey({
  sourceNode,
  outgoingHandleId,
}: {
  sourceNode: nodeTypes.All & { id: string };
  outgoingHandleId: string;
}) {
  // if coming from an input node, read directly from global input key
  // there's probably some cleaner way of doing this without importing consts like this
  if (sourceNode.type === 'vertexData') {
    return shaders.DISPLACE_SHADER_INPUT_KEYS.terrainPos;
  } else if (sourceNode.type === 'float' || sourceNode.type === 'vector') {
    return 'nodeGraphUniforms.' + formatKey(`hdlkey_${sourceNode.id}_${outgoingHandleId}`);
  }

  return formatKey(`hdlkey_${sourceNode.id}_${outgoingHandleId}`);
}

const mathOperationMapping: {
  [key in nodeTypes.MathVec3['data']['operationVal']]: instructions.Math['operation'];
} = {
  Add: 'add',
  Sub: 'sub',
  Mult: 'mult',
  Div: 'div',
};
const trigOperationMapping: {
  [key in nodeTypes.TrigMathFloat['data']['operationVal']]: instructions.TrigMath['operation'];
} = {
  Sin: 'sin',
  Cos: 'cos',
  Tan: 'tan',
};

const noiseTypeMapping: {
  [key in nodeTypes.Noise['data']['mode']]: instructions.Noise['method'];
} = {
  FBM: 'fbm',
  Worley: 'worley',
};

const dummyHandler = () => {
  console.error('Not implemented!');
  return null;
};
/**
 * Implementation of `InstructionMapping` for our node types and instructions
 *
 * @todo  for slots which either take a uniform or an input key, this will probably need some
 *        modification to accommodate
 */
export const INSTRUCTION_MAPPING: InstructionMapping<nodeTypes.All, instructions.All> = {
  float: () => null,
  vector: () => null,
  unsignedInt: () => null,

  // only input/output nodes don't get any instructions!
  vertexData: () => null,
  terrain: () => null,

  // TODO: this transform functionality is not real until we have geometry
  transform: dummyHandler,

  noise: (node, getIncomingHandleKey): instructions.Noise => ({
    type: 'noise',
    method: noiseTypeMapping[node.data.mode],
    references: {
      pos: getIncomingHandleKey(nodeTypes.HANDLES.noise.in.position),
      numOctaves: getIncomingHandleKey(nodeTypes.HANDLES.noise.in.numOctaves),
      scale: getIncomingHandleKey(nodeTypes.HANDLES.noise.in.scale),
      write: getHandleKey({
        sourceNode: node,
        outgoingHandleId: nodeTypes.HANDLES.noise.out.result,
      }),
    },
  }),

  mathFloat: (node, getIncomingHandleKey): instructions.Math => ({
    type: 'math',
    operation: mathOperationMapping[node.data.operationVal],
    references: {
      readA: getIncomingHandleKey(nodeTypes.HANDLES.mathFloat.in.a),
      readB: getIncomingHandleKey(nodeTypes.HANDLES.mathFloat.in.b),
      write: getHandleKey({
        sourceNode: node,
        outgoingHandleId: nodeTypes.HANDLES.mathFloat.out.result,
      }),
    },
  }),
  trigMathFloat: (node, getIncomingHandleKey): instructions.TrigMath => ({
    type: 'trig-math',
    operation: trigOperationMapping[node.data.operationVal],
    references: {
      read: getIncomingHandleKey(nodeTypes.HANDLES.trigMathFloat.in.input),
      write: getHandleKey({
        sourceNode: node,
        outgoingHandleId: nodeTypes.HANDLES.trigMathFloat.out.result,
      }),
    },
  }),
  mathVec3: (node, getIncomingHandleKey): instructions.Math => ({
    type: 'math',
    operation: mathOperationMapping[node.data.operationVal],
    references: {
      readA: getIncomingHandleKey(nodeTypes.HANDLES.mathVec3.in.a),
      readB: getIncomingHandleKey(nodeTypes.HANDLES.mathVec3.in.b),
      write: getHandleKey({
        sourceNode: node,
        outgoingHandleId: nodeTypes.HANDLES.mathVec3.out.result,
      }),
    },
  }),

  mixFloat: (node, getIncomingHandleKey): instructions.Mix => ({
    type: 'mix',
    references: {
      readA: getIncomingHandleKey(nodeTypes.HANDLES.mixFloat.in.a),
      readB: getIncomingHandleKey(nodeTypes.HANDLES.mixFloat.in.b),
      readMix: getIncomingHandleKey(nodeTypes.HANDLES.mixFloat.in.mix),
      write: getHandleKey({
        sourceNode: node,
        outgoingHandleId: nodeTypes.HANDLES.mixFloat.out.result,
      }),
    },
  }),
  mixVec3: (node, getIncomingHandleKey): instructions.Mix => ({
    type: 'mix',
    references: {
      readA: getIncomingHandleKey(nodeTypes.HANDLES.mixVec3.in.a),
      readB: getIncomingHandleKey(nodeTypes.HANDLES.mixVec3.in.b),
      readMix: getIncomingHandleKey(nodeTypes.HANDLES.mixVec3.in.mix),
      write: getHandleKey({
        sourceNode: node,
        outgoingHandleId: nodeTypes.HANDLES.mixVec3.out.result,
      }),
    },
  }),

  smoothstepFloat: (node, getIncomingHandleKey): instructions.Smoothstep => ({
    type: 'smoothstep',
    references: {
      readLow: getIncomingHandleKey(nodeTypes.HANDLES.smoothstepFloat.in.low),
      readHigh: getIncomingHandleKey(nodeTypes.HANDLES.smoothstepFloat.in.high),
      readValue: getIncomingHandleKey(nodeTypes.HANDLES.smoothstepFloat.in.value),
      write: getHandleKey({
        sourceNode: node,
        outgoingHandleId: nodeTypes.HANDLES.smoothstepFloat.out.result,
      }),
    },
  }),
  smoothstepVec3: (node, getIncomingHandleKey): instructions.Smoothstep => ({
    type: 'smoothstep',
    references: {
      readLow: getIncomingHandleKey(nodeTypes.HANDLES.smoothstepVec3.in.low),
      readHigh: getIncomingHandleKey(nodeTypes.HANDLES.smoothstepVec3.in.high),
      readValue: getIncomingHandleKey(nodeTypes.HANDLES.smoothstepVec3.in.value),
      write: getHandleKey({
        sourceNode: node,
        outgoingHandleId: nodeTypes.HANDLES.smoothstepVec3.out.result,
      }),
    },
  }),

  separate: (node, getIncomingHandleKey): instructions.SeparateXYZ => ({
    type: 'separate-xyz',
    references: {
      read: getIncomingHandleKey(nodeTypes.HANDLES.separate.in.xyz),
      writeX: getHandleKey({
        sourceNode: node,
        outgoingHandleId: nodeTypes.HANDLES.separate.out.x,
      }),
      writeY: getHandleKey({
        sourceNode: node,
        outgoingHandleId: nodeTypes.HANDLES.separate.out.y,
      }),
      writeZ: getHandleKey({
        sourceNode: node,
        outgoingHandleId: nodeTypes.HANDLES.separate.out.z,
      }),
    },
  }),
  combine: (node, getIncomingHandleKey): instructions.CombineXYZ => ({
    type: 'combine-xyz',
    references: {
      readX: getIncomingHandleKey(nodeTypes.HANDLES.combine.in.x),
      readY: getIncomingHandleKey(nodeTypes.HANDLES.combine.in.y),
      readZ: getIncomingHandleKey(nodeTypes.HANDLES.combine.in.z),
      write: getHandleKey({
        sourceNode: node,
        outgoingHandleId: nodeTypes.HANDLES.combine.out.xyz,
      }),
    },
  }),

  scatter: () => null, // dummy for now, make this later...
  instancing: dummyHandler,
  primGeo: dummyHandler,
  loadGeo: dummyHandler,
  builtinGeo: dummyHandler,
};

export const UNIFORM_MAPPING: UniformMapping<nodeTypes.All, util.UniformConfig> = {
  mathVec3: () => [],
  mathFloat: () => [],
  trigMathFloat: () => [],
  mixFloat: () => [],
  mixVec3: () => [],
  smoothstepFloat: () => [],
  smoothstepVec3: () => [],
  noise: () => [],
  vertexData: () => [],
  terrain: () => [],
  transform: () => [],
  combine: () => [],
  vector: (node) => [
    {
      type: 'vec3f',
      key: formatKey(`hdlkey_${node.id}_${nodeTypes.HANDLES.vector.out.result}`),
      initialValue: [node.data.x, node.data.y, node.data.z],
    },
  ],
  float: (node) => [
    {
      type: 'f32',
      key: formatKey(`hdlkey_${node.id}_${nodeTypes.HANDLES.float.out.result}`),
      initialValue: node.data.value,
    },
  ],
  unsignedInt: (node) => [
    {
      type: 'u32',
      key: getHandleKey({
        sourceNode: node,
        outgoingHandleId: nodeTypes.HANDLES.unsignedInt.out.result,
      }),
      initialValue: node.data.value,
    },
  ],
  separate: () => [],
  primGeo: () => [],
  loadGeo: () => [],
  builtinGeo: () => [],
  scatter: () => [],
  instancing: () => [],
};
