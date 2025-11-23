/**
 * This file implements methods to convert node graph nodes into the types accepted by `@/lib/shaders/jit`.
 */

import * as nodeTypes from './node-types';

import type * as instructions from '@/lib/shaders/jit/types/instructions';
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
export function getHandleKey(opts: { sourceNodeId: string; outgoingHandleId: string }) {
  return formatKey(`hdlkey_${opts.sourceNodeId}_${opts.outgoingHandleId}`);
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
  // TODO: this is not a real instruction yet
  float: dummyHandler,
  vector: () => null,

  // TODO: this transform functionality is not real until we have geometry
  transform: dummyHandler,

  noise: (node, getIncomingHandleKey): instructions.Noise => ({
    type: 'noise',
    method: ({ FBM: 'fbm' } as const)[node.data.mode],
    references: {
      pos: getIncomingHandleKey(nodeTypes.HANDLES.noise.in.position),
      numOctaves: getIncomingHandleKey(nodeTypes.HANDLES.noise.in.numOctaves),
      scale: getIncomingHandleKey(nodeTypes.HANDLES.noise.in.scale),
      write: getHandleKey({
        sourceNodeId: node.id,
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
        sourceNodeId: node.id,
        outgoingHandleId: nodeTypes.HANDLES.mathVec3.out.result,
      }),
    },
  }),
  trigMathFloat: (node, getIncomingHandleKey): instructions.TrigMath => ({
    type: 'trig-math',
    operation: trigOperationMapping[node.data.operationVal],
    references: {
      read: getIncomingHandleKey(nodeTypes.HANDLES.trigMathFloat.in.input),
      write: getHandleKey({
        sourceNodeId: node.id,
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
        sourceNodeId: node.id,
        outgoingHandleId: nodeTypes.HANDLES.mathVec3.out.result,
      }),
    },
  }),

  // TODO: these guys need nodes!
  mixFloat: dummyHandler,
  mixVec3: dummyHandler,

  separate: (node, getIncomingHandleKey): instructions.SeparateXYZ => ({
    type: 'separate-xyz',
    references: {
      read: getIncomingHandleKey(nodeTypes.HANDLES.separate.in.xyz),
      writeX: getHandleKey({
        sourceNodeId: node.id,
        outgoingHandleId: nodeTypes.HANDLES.separate.out.x,
      }),
      writeY: getHandleKey({
        sourceNodeId: node.id,
        outgoingHandleId: nodeTypes.HANDLES.separate.out.y,
      }),
      writeZ: getHandleKey({
        sourceNodeId: node.id,
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
        sourceNodeId: node.id,
        outgoingHandleId: nodeTypes.HANDLES.combine.out.xyz,
      }),
    },
  }),

  terrain: () => null,
};

const dummyUniformHandler = () => {
  console.error('Not implemented!');
  return [];
};
export const UNIFORM_MAPPING: UniformMapping<nodeTypes.All, util.UniformConfig> = {
  mathVec3: (node) => {
    // TODO: logical uniform creation based on node data. these should match uniforms used in
    //       references by INSTRUCTION_MAPPING. In fact, this logic could even be combined into
    //       those methods.

    console.log('Not implemented!');
    return [];

    return [{ key: formatKey(`unif_${node.id}`), type: 'vec3f', initialValue: [0, 0, 0] }];
  },
  // TODO: all of the below, or move the logic up into the "instruction mapping"
  mathFloat: dummyUniformHandler,
  trigMathFloat: dummyUniformHandler,
  mixFloat: dummyUniformHandler,
  mixVec3: dummyUniformHandler,
  noise: dummyUniformHandler,
  terrain: dummyUniformHandler,
  transform: dummyUniformHandler,
  combine: dummyUniformHandler,
  vector: (node) => [
    {
      type: 'vec3f',
      key: getHandleKey({
        sourceNodeId: node.id,
        outgoingHandleId: nodeTypes.HANDLES.vector.out.result,
      }),
      initialValue: [node.data.x, node.data.y, node.data.z],
    },
  ],
  float: (node) => [
    {
      type: 'f32',
      key: getHandleKey({
        sourceNodeId: node.id,
        outgoingHandleId: nodeTypes.HANDLES.float.out.result,
      }),
      initialValue: node.data.value,
    },
  ],
  separate: dummyUniformHandler,
};
