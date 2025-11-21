import * as nodeMapping from './node-mapping';
import type * as nodeTypes from './node-types';
import * as traversal from './traversal';
import type * as types from './types';

import type * as scene from '@/lib/scene';
import type * as instructions from '@/lib/shaders/jit/types/instructions';
import type * as util from '@/lib/shaders/jit/types/util';

export type OutputNodeUpdates = { displacePipeline?: scene.DisplacePipeline };

export type PipelineNode = types.Node & nodeTypes.All;

export function generateUpdatedPipelines(
  nodeId: string,
  nodes: PipelineNode[],
  edges: types.Edge[],
): OutputNodeUpdates {
  const downstreamNodeIds = new Set(traversal.getDownstreamNodeIds(nodeId, nodes, edges));
  const downstreamNodes = nodes.filter((node) => downstreamNodeIds.has(node.id));

  // find displace pipeline
  const terrainNode = downstreamNodes.find((node) => node.type === 'terrain');
  let displacePipeline: scene.DisplacePipeline | undefined = undefined;
  if (terrainNode) {
    const orderedDependencyNodes = traversal.getOrderedNodes(terrainNode.id, nodes, edges);

    // generate uniforms
    const uniforms = orderedDependencyNodes.flatMap((node) => getUniforms(node, edges));

    // generate instruction set
    const instructionSet = orderedDependencyNodes
      .map((node) => getInstruction(node, edges))
      .filter((instruction) => instruction !== null);

    // TODO: get height key
    const outputs: scene.DisplacePipeline['outputs'] = { height: 'TODO' };

    displacePipeline = { instructionSet, uniforms, outputs };
  }

  return { displacePipeline };
}

function getInstruction(
  node: nodeTypes.All & { id: string },
  edges: types.Edge[],
): instructions.All | null {
  const incomingHandlesToEdges = Object.fromEntries(
    edges
      .filter((edge) => edge.target === node.id)
      .map((edge) => [edge.targetHandle as string, edge]),
  );

  const instructionMapping = nodeMapping.INSTRUCTION_MAPPING[
    node.type
  ] as nodeMapping.InstructionGenerator<nodeTypes.All, typeof node.type, instructions.All>;

  return instructionMapping(
    node,
    // callback to get output handle key on another node for a given input handle on this node
    (handle) => {
      const incomingEdge = incomingHandlesToEdges[handle];
      if (incomingEdge === undefined) {
        console.error(
          'incoming edge on',
          node.type,
          'node',
          node.id,
          'with handle ID',
          handle,
          'was not connected!',
        );
        return 'error_dummy_key';
      }
      return nodeMapping.getHandleKey({
        sourceNodeId: incomingEdge.source,
        outgoingHandleId: incomingEdge.sourceHandle as string,
      });
    },
  );
}

// TODO TODO TODO
function getUniforms(
  // @ts-expect-error TODO use this
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node: nodeTypes.All & { id: string },
  // @ts-expect-error TODO use this
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  edges: types.Edge[],
): util.UniformConfig[] {
  return [];
}
