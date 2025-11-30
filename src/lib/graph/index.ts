import * as nodeMapping from './node-mapping';
import * as nodeTypes from './node-types';
import * as traversal from './traversal';
import type * as types from './types';

import type * as scene from '@/lib/scene';
import type * as instructions from '@/lib/shaders/jit/types/instructions';
import type * as util from '@/lib/shaders/jit/types/util';

export type OutputNodeUpdates = {
  displacePipeline?: scene.DisplacePipeline;
  instancingPipeline?: scene.InstancingPipeline;
};

export type PipelineNode = types.Node & nodeTypes.All;

/**
 * Main entrypoint for regenerating pipelines.
 *
 * @param nodeId  The ID of the node at which changes have been made (i.e. a connection is made)
 * @returns       An object containing any updated pipelines downstream from the provided node
 */
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
    const uniforms = orderedDependencyNodes.flatMap(getUniforms);

    // generate instruction set
    const instructionSet = orderedDependencyNodes
      .map((node) => getInstruction(node, orderedDependencyNodes, edges))
      .filter((instruction) => instruction !== null);

    // Get height key from the incoming edge of the terrain node
    const heightEdge = edges.find((edge) => edge.target === terrainNode.id);
    const heightEdgeSourceNode = orderedDependencyNodes.find(
      (node) => node.id === heightEdge?.source,
    );
    const outputs: scene.DisplacePipeline['outputs'] = {
      height: nodeMapping.getHandleKey({
        // TODO: wow these type assertions are awesome (evil as fuck)
        sourceNode: heightEdgeSourceNode!,
        outgoingHandleId: heightEdge!.sourceHandle!,
      }),
    };

    displacePipeline = { instructionSet, uniforms, outputs };
  }

  const instancingNode = downstreamNodes.find((node) => node.type === 'instancing');
  let instancingPipeline: scene.InstancingPipeline | undefined = undefined;

  if (instancingNode) {
    const orderedDependencyNodes = traversal.getOrderedNodes(instancingNode.id, nodes, edges);

    // generate uniforms
    const uniforms = orderedDependencyNodes.flatMap(getUniforms);

    // generate instruction set
    const instructionSet = orderedDependencyNodes
      .map((node) => getInstruction(node, orderedDependencyNodes, edges))
      .filter((instruction) => instruction !== null);

    // Get inputs from the incoming edges of the instancing node
    const positionEdge = edges.find(
      (edge) =>
        edge.target === instancingNode.id &&
        edge.targetHandle === nodeTypes.HANDLES.instancing.in.position,
    );

    const positionNode = orderedDependencyNodes.find(
      (node) => node.id === positionEdge?.source,
    );

    const geometryEdge = edges.find(
      (edge) =>
        edge.target === instancingNode.id &&
        edge.targetHandle === nodeTypes.HANDLES.instancing.in.geometry,
    );
    const geometryNode = orderedDependencyNodes.find(
      (node) => node.id === geometryEdge?.source,
    ) as
      | (nodeTypes.PrimitiveGeometry & { id: string })
      | (nodeTypes.BuiltinGeometry & { id: string })
      | (nodeTypes.LoadGeometry & { id: string })
      | undefined;

    const instCountEdge = edges.find(
      (edge) =>
        edge.target === instancingNode.id &&
        edge.targetHandle === nodeTypes.HANDLES.instancing.in.instCount,
    );
    const instCountNode = orderedDependencyNodes.find(
      (node) => node.id === instCountEdge?.source,
    ) as (nodeTypes.UnsignedInt & { id: string }) | undefined;

    if (!geometryNode) {
      console.error('Instancing node requires a geometry input');
      return { displacePipeline };
    } else if (!positionNode || !positionEdge) {
      console.error('Instancing node requires a position input');
      return { displacePipeline };
    }

    const outputs: scene.InstancingPipeline['outputs'] = {
      instanceCount: !instCountNode ? 30 : instCountNode.data.value,
      instancePositions: nodeMapping.getHandleKey({
        sourceNode: positionNode,
        outgoingHandleId: positionEdge.sourceHandle!,
      }),
      meshPath: geometryNode.data.meshPath,
      fileContent: geometryNode.type === 'loadGeo' ? geometryNode.data.fileContent : undefined,
    };

    instancingPipeline = {
      instructionSet,
      uniforms,
      outputs,
    };
  }

  return { displacePipeline, instancingPipeline };
}

function getInstruction(
  node: nodeTypes.All & { id: string },
  nodes: (nodeTypes.All & { id: string })[],
  edges: types.Edge[],
): instructions.All | null {
  /** A mapping from incoming handles on our node to the incoming edge */
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

      const incomingNode = nodes.find((node) => node.id === incomingEdge.source);
      if (incomingNode === undefined) {
        console.error(
          'incoming node with id',
          incomingEdge.source,
          'connecting via handle ID',
          handle,
          'to node',
          node.id,
          'was not found in nodes list!',
        );
        return 'error_dummy_key';
      }

      return nodeMapping.getHandleKey({
        sourceNode: incomingNode,
        outgoingHandleId: incomingEdge.sourceHandle as string,
      });
    },
  );
}

function getUniforms(node: nodeTypes.All & { id: string }): util.UniformConfig[] {
  const uniformMapping = nodeMapping.UNIFORM_MAPPING[node.type] as nodeMapping.UniformGenerator<
    nodeTypes.All,
    typeof node.type,
    util.UniformConfig
  >;

  return uniformMapping(node);
}
