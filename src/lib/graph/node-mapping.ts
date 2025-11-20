/**
 * This file implements methods to convert node graph nodes into the types accepted by `@/lib/shaders/jit`.
 */

import type * as nodeTypes from './node-types';
import type * as types from './types';

import type * as instructions from '@/lib/shaders/jit/types/instructions';
import type * as util from '@/lib/shaders/jit/types/util';

/**
 * Generates a reference key for a given node.
 *
 * @todo Notably, variables can't begin with numbers in WGSL. This should add a prefix or
 *       somehow otherwise ensure that the var name doesn't start with a number.
 */
const generateReferenceKey = (nodeId: string, suffix: string): util.ReferenceKey => {
  console.log(`Generating reference key for node ${nodeId} with suffix: ${suffix}`);
  return `${nodeId}_${suffix}`;
};

/**
 * Determines if a node is an "output" node (such as "terrain") and should thus trigger some
 * pipeline reconstruction
 */
export function isOutputNode(node: types.Node) {
  return (node.data as { isOutput?: boolean }).isOutput;
}

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

/**
 * For a given node type, generate an instruction.
 *
 * @param node                  The given node
 * @param getIncomingHandleKey  Callback to get the outgoing handle key from an upstream node,
 *                              given an incoming handle ID for this current node
 */
type InstructionGenerator<
  TNode extends { type: string },
  TNodeType extends TNode['type'],
  TInstruction,
> = (
  node: nodeTypes.All & { id: string; type: TNodeType },
  getIncomingHandleKey: (handle: string) => string,
) => TInstruction;

/**
 * A collection of methods per known node type (i.e. 'mathVec3') which generate an instruction
 * based on a given node's content.
 */
type InstructionMapping<TNode extends { type: string }, TInstruction> = {
  [nodeType in TNode['type']]: InstructionGenerator<TNode, nodeType, TInstruction>;
};

/**
 * Implementation of `InstructionMapping` for our node types and instructions
 */
const INSTRUCTION_MAPPING: InstructionMapping<nodeTypes.All, instructions.All> = {
  mathVec3: (node, getIncomingHandleKey): instructions.Math => ({
    type: 'math',
    operation: mathOperationMapping[node.data.operationVal],
    references: {
      readA: getIncomingHandleKey('vec3-val1-in'),
      readB: getIncomingHandleKey('vec3-val2-in'),
      write: getHandleKey({ sourceNodeId: node.id, outgoingHandleId: 'vec3-out' }),
    },
  }),
};

export function getInstruction(
  node: nodeTypes.All & { id: string },
  edges: types.Edge[],
): instructions.All {
  const incomingHandlesToEdges = Object.fromEntries(
    edges
      .filter((edge) => edge.target === node.id)
      .map((edge) => [edge.targetHandle as string, edge]),
  );

  return INSTRUCTION_MAPPING[node.type](
    node,

    // callback to get output handle key on another node for a given input handle on this node
    (handle) => {
      const incomingEdge = incomingHandlesToEdges[handle];
      return getHandleKey({
        sourceNodeId: incomingEdge.source,
        outgoingHandleId: incomingEdge.sourceHandle as string,
      });
    },
  );
}

export function mapNodeToUniform(
  node: types.Node,
  edges: types.Edge[],
): util.UniformConfig | null {
  console.log(`Mapping node to uniform: ${node.id} (type: ${node.type})`);
  const { type, data } = node;

  /* eslint-disable @typescript-eslint/switch-exhaustiveness-check */
  switch (type) {
    case 'vector': {
      const returnedEdges = edges.filter((edge) => edge.targetHandle === 'vec3-out');
      console.log(`returned edges count: ${returnedEdges.length}`);
      const uniformKey = 0;
      //const uniformKey = generateReferenceKey(node.id, returnedEdges[0].id || '');

      console.log(
        `Creating vector uniform with key: ${uniformKey}`,
        (data as { vecInfo: string }).vecInfo,
      );
      return {
        key: uniformKey,
        type: 'vec3f',
        value: (data as { vecInfo: string }).vecInfo,
      } as unknown as util.UniformConfig;
    }
    default:
      return null;
  }
  /* eslint-enable @typescript-eslint/switch-exhaustiveness-check */
}

export function getNodeFieldData(
  handleName: string,
  isInput: boolean,
  node: types.Node,
  edges: types.Edge[],
  nodeKeyMap: Map<string, Map<string, string>>,
): string | undefined {
  console.log(
    `Getting field data for node ${node.id}, handle: ${handleName}, isInput: ${isInput}`,
  );
  // input means that on left side of the node
  // which means that it's the target for an edge
  if (isInput) {
    const returnedEdges = edges.filter((edge) => edge.targetHandle === handleName);

    console.log(`Found ${returnedEdges.length} edges with sourceHandle ${handleName}`);

    // need to get edge that matches with node id
    returnedEdges.forEach((edge) => {
      if (edge.target === node.id) {
        const edgeIdAndKey = nodeKeyMap.get(node.id);
        console.log(`Retrieved key for edge ${edge.id}: ${edgeIdAndKey?.get(edge.id)}`);
        return edgeIdAndKey?.get(edge.id);
      }
    });
  } else {
    const returnedEdges = edges.filter((edge) => edge.sourceHandle === handleName);

    console.log(`Found ${returnedEdges.length} edges with sourceHandle ${handleName}`);

    // need to get edge that matches with node id
    returnedEdges.forEach((edge) => {
      if (edge.source === node.id) {
        const edgeIdAndKey = nodeKeyMap.get(node.id);
        edgeIdAndKey?.get(edge.id);
        console.log(`Retrieved key for edge ${edge.id}: ${edgeIdAndKey?.get(edge.id)}`);
        return edgeIdAndKey?.get(edge.id);
      }
    });
  }

  return undefined;
}

// based on the node type, we create the instruction
// hard-code-y for now..
export function mapNodeToInstruction(
  node: types.Node,
  edges: types.Edge[],
  nodeKeyMap: Map<string, Map<string, string>>,
): instructions.All | null {
  console.log(`Mapping node to instruction: ${node.id} (type: ${node.type})`);
  const { type, data } = node;

  /* eslint-disable @typescript-eslint/switch-exhaustiveness-check */
  switch (type) {
    case 'math': {
      const mathInstruction = {
        type: 'math',
        operation: (data as { operationVal: instructions.Math['operation'] }).operationVal,
        references: {
          readA: getNodeFieldData('vec3-val1-in', true, node, edges, nodeKeyMap),
          readB: getNodeFieldData('vec3-val2-in', true, node, edges, nodeKeyMap),
          write: getNodeFieldData('vec3-out', false, node, edges, nodeKeyMap),
        },
      } as instructions.All;
      console.log(`Created math instruction:`, mathInstruction);
      return mathInstruction;
    }

    case 'vector': {
      const vecInstruction = {
        type: 'vector',
        references: {
          write: getNodeFieldData('vec3-out', false, node, edges, nodeKeyMap),
        },
      } as instructions.All;
      console.log(`Created vector instruction:`, vecInstruction);
      return vecInstruction;
    }

    case 'noise': {
      const noiseInstruction = {
        type: 'noise',
        references: {
          pos: getNodeFieldData('vec3-pos-in', true, node, edges, nodeKeyMap),
          scale: getNodeFieldData('vec3-scale-in', true, node, edges, nodeKeyMap),
          numOctaves: getNodeFieldData('vec3-numOctaves-in', true, node, edges, nodeKeyMap),
          write: getNodeFieldData('float-out', false, node, edges, nodeKeyMap),
        },
      } as instructions.All;
      console.log(`Created noise instruction:`, noiseInstruction);
      return noiseInstruction;
    }

    default:
      return null;
  }
  /* eslint-enable @typescript-eslint/switch-exhaustiveness-check */
}

export function mapNodesToKeys(
  nodes: types.Node[],
  edges: types.Edge[],
): Map<string, Map<string, string>> {
  console.log('Starting mapNodesToKeys');
  const nodeKeyMap = new Map<string, Map<string, string>>();
  const outgoingEdges: types.Edge[] = [];

  // get each outgoing edge, generate ket based on node id & src handle (edge id name)
  // store each outgoing edge in dict with key in node id info
  nodes.forEach((node, index) => {
    console.log(`\nProcessing node ${index + 1}/${nodes.length}: ${node.id} (${node.type})`);

    const temp = edges.filter((edge: { source: string }) => edge.source === node.id);
    console.log(`Found ${temp.length} outgoing edges for node ${node.id}`);

    temp.forEach((element) => {
      outgoingEdges.push(element);
    });

    temp.forEach((edge) => {
      console.log(`Processing outgoing edge: ${edge.id} from ${edge.source} to ${edge.target}`);
      const generatedKey = generateReferenceKey(node.id, edge.id || '');
      const edgeAndKey = new Map<string, string>();
      edgeAndKey.set(edge.id, generatedKey);
      nodeKeyMap.set(node.id, edgeAndKey);
      console.log(`Set key mapping for node ${node.id}: ${edge.id} -> ${generatedKey}`);
    });

    // clearing array
    temp.length = 0;
  });

  // cycle through edges, get each target node & target handle
  // get key w/ edge id && add to dict
  if (outgoingEdges.length > 0) {
    outgoingEdges.forEach((edge, index) => {
      console.log(`\nProcessing edge ${index + 1}/${outgoingEdges.length}: ${edge.id}`);
      const currNodeId = edge.source;
      const edgeIds = nodeKeyMap.get(currNodeId);
      const key = edgeIds?.get(edge.id);

      if (key != null) {
        const edgeAndKey = new Map<string, string>();
        edgeAndKey.set(edge.target, key);
        nodeKeyMap.set(edge.target, edgeAndKey);
        console.log(`Propagated key to target node ${edge.target}: ${key}`);
      }
    });
  }

  return nodeKeyMap;
}

export function getFinalOutputKey(pipeline: types.Node[]): util.ReferenceKey {
  const lastNode = pipeline[pipeline.length - 1];

  // Determine output key based on last node type
  /* eslint-disable @typescript-eslint/switch-exhaustiveness-check */
  switch (lastNode.type) {
    case 'terrain':
      return generateReferenceKey(lastNode.id, 'height');
    default:
      return generateReferenceKey(lastNode.id, 'output');
  }
  /* eslint-enable @typescript-eslint/switch-exhaustiveness-check */
}
