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
  waterPipeline?: scene.WaterPipeline;
};

export type PipelineNode = types.Node & nodeTypes.All;

/**
 * Main entrypoint for regenerating pipelines.
 *
 * @param nodeId  The ID of the node at which changes have been made (i.e. a connection is made)
 * @returns       An object containing any updated pipelines downstream from the provided node
 */
export function generatePipelinesFromNode(
  nodeId: string,
  nodes: PipelineNode[],
  edges: types.Edge[],
) {
  const downstreamNodeIds = new Set(traversal.getDownstreamNodeIds(nodeId, nodes, edges));

  return generatePipelines([...downstreamNodeIds], nodes, edges);
}

/**
 * Alternate entrypoint for pipeline generation, regenerating all existing pipelines
 *
 * @returns  An object containing all (existing) generated pipelines
 */
export function generateAllPipelines(nodes: PipelineNode[], edges: types.Edge[]) {
  return generatePipelines(
    nodes.map((node) => node.id),
    nodes,
    edges,
  );
}

/**
 * Internal entrypoint for pipeline generation, using a set of updated nodes.
 *
 * @param updatedNodeIds  All node IDs which have been affected by some change
 * @returns               An object containing any updated pipelines downstream from the provided node
 */
function generatePipelines(
  updatedNodeIds: string[],
  nodes: PipelineNode[],
  edges: types.Edge[],
): OutputNodeUpdates {
  const activeNodes = nodes.filter((node) => updatedNodeIds.includes(node.id));

  // find displace pipeline
  const terrainNode = activeNodes.find((node) => node.type === 'terrain');
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

  // find water pipeline
  const waterNode = activeNodes.find((node) => node.type === 'water');
  let waterPipeline: scene.WaterPipeline | undefined = undefined;
  if (waterNode) {
    const orderedDependencyNodes = traversal.getOrderedNodes(waterNode.id, nodes, edges);

    // generate uniforms
    const uniforms = orderedDependencyNodes.flatMap(getUniforms);

    // generate instruction set
    const instructionSet = orderedDependencyNodes
      .map((node) => getInstruction(node, orderedDependencyNodes, edges))
      .filter((instruction) => instruction !== null);

    // Get height key from the incoming edge of the water node
    const heightEdge = edges.find((edge) => edge.target === waterNode.id);
    const heightEdgeSourceNode = orderedDependencyNodes.find(
      (node) => node.id === heightEdge?.source,
    );
    const outputs: scene.WaterPipeline['outputs'] = {
      height: nodeMapping.getHandleKey({
        sourceNode: heightEdgeSourceNode!,
        outgoingHandleId: heightEdge!.sourceHandle!,
      }),
    };

    waterPipeline = { instructionSet, uniforms, outputs };
  }

  const instancingNode = activeNodes.find((node) => node.type === 'instancing');
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
    const scatterEdge = edges.find(
      (edge) =>
        edge.target === instancingNode.id &&
        edge.targetHandle === nodeTypes.HANDLES.instancing.in.position,
    );

    const scatterNode = orderedDependencyNodes.find(
      (node) => node.id === scatterEdge?.source && node.type === 'scatter',
    ) as (nodeTypes.Scatter & { id: string }) | undefined;

    const geometryEdge = edges.find(
      (edge) =>
        edge.target === instancingNode.id &&
        edge.targetHandle === nodeTypes.HANDLES.instancing.in.geometry,
    );

    let geometryNode:
      | (nodeTypes.PrimitiveGeometry & { id: string })
      | (nodeTypes.BuiltinGeometry & { id: string })
      | (nodeTypes.LoadGeometry & { id: string })
      | undefined;

    let transformNode: (nodeTypes.Transform & { id: string }) | undefined;

    let currentNodeId = geometryEdge?.source;
    while (currentNodeId) {
      const node = orderedDependencyNodes.find((n) => n.id === currentNodeId);

      if (!node) break;

      if (node.type === 'primGeo' || node.type === 'builtinGeo' || node.type === 'loadGeo') {
        geometryNode = node as typeof geometryNode;
        break;
      } else if (node.type === 'transform') {
        transformNode = node as nodeTypes.Transform & { id: string };

        // Find the geometry input of the transform node
        const transformGeoEdge = edges.find(
          (edge) =>
            edge.target === node.id && edge.targetHandle === nodeTypes.HANDLES.transform.in.geo,
        );
        currentNodeId = transformGeoEdge?.source;
      } else {
        break;
      }
    }

    if (!geometryNode) {
      console.error('Instancing node requires a geometry input');
      return { displacePipeline };
    } else if (!scatterNode || !scatterEdge) {
      console.error('Instancing node requires a scatter input');
      return { displacePipeline };
    }

    let transformConfig: { translate: string; rotate: string; scale: string } | undefined;
    if (transformNode) {
      const translateEdge = edges.find(
        (edge) =>
          edge.target === transformNode.id &&
          edge.targetHandle === nodeTypes.HANDLES.transform.in.translate,
      );
      const rotateEdge = edges.find(
        (edge) =>
          edge.target === transformNode.id &&
          edge.targetHandle === nodeTypes.HANDLES.transform.in.rotate,
      );
      const scaleEdge = edges.find(
        (edge) =>
          edge.target === transformNode.id &&
          edge.targetHandle === nodeTypes.HANDLES.transform.in.scale,
      );

      if (translateEdge && rotateEdge && scaleEdge) {
        const translateNode = orderedDependencyNodes.find((n) => n.id === translateEdge.source);
        const rotateNode = orderedDependencyNodes.find((n) => n.id === rotateEdge.source);
        const scaleNode = orderedDependencyNodes.find((n) => n.id === scaleEdge.source);

        transformConfig = {
          translate: nodeMapping.getHandleKey({
            sourceNode: translateNode!,
            outgoingHandleId: translateEdge.sourceHandle!,
          }),
          rotate: nodeMapping.getHandleKey({
            sourceNode: rotateNode!,
            outgoingHandleId: rotateEdge.sourceHandle!,
          }),
          scale: nodeMapping.getHandleKey({
            sourceNode: scaleNode!,
            outgoingHandleId: scaleEdge.sourceHandle!,
          }),
        };
      }
    }

    const outputs: scene.InstancingPipeline['outputs'] = {
      instanceCount: !scatterNode ? 1 : Math.max(scatterNode.data.instances, 1),
      instancePositions: nodeMapping.getHandleKey({
        sourceNode: scatterNode,
        outgoingHandleId: scatterEdge.sourceHandle!,
      }),
      meshPath: geometryNode.data.meshPath,
      transform: transformConfig,
      fileContent:
        geometryNode.type === 'loadGeo' ? (geometryNode.data.fileContent as string) : undefined,
      fileType: geometryNode.type === 'loadGeo' ? geometryNode.data.fileType : undefined,
    };

    instancingPipeline = {
      instructionSet,
      uniforms,
      outputs,
    };
  }

  return { displacePipeline, waterPipeline, instancingPipeline };
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
