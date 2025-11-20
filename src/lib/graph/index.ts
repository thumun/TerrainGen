import * as nodeMapping from './node-mapping';
import type * as nodeTypes from './node-types';
import * as traversal from './traversal';
import type * as types from './types';

import type * as scene from '@/lib/scene';
import type * as instructions from '@/lib/shaders/jit/types/instructions';
import type * as util from '@/lib/shaders/jit/types/util';

export type OutputNodeUpdates = { displacePipeline?: scene.DisplacePipeline };

export function generateUpdatedPipelines(
  nodeId: string,
  nodes: (types.Node & nodeTypes.All)[],
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
    const uniforms = orderedDependencyNodes
      .map((node) => {
        return nodeMapping.mapNodeToUniform(node, edges);
      })
      .filter((uniform) => uniform !== null);

    // generate instruction set
    const instructionSet = orderedDependencyNodes.map((node) => {
      return nodeMapping.getInstruction(node, edges);
    });

    // TODO: get height key
    const outputs: scene.DisplacePipeline['outputs'] = { height: 'TODO' };

    displacePipeline = { instructionSet, uniforms, outputs };
  }

  return { displacePipeline };
}

export type PipelineResult = {
  // TODO: these two below are unnecessary I think
  instructionSet: instructions.All[];
  uniforms: util.UniformConfig[];
  shaderConfig: scene.DisplacePipeline;
};

export function executePipeline(pipeline: types.Node[], edges: types.Edge[]): PipelineResult {
  console.log('Executing pipeline with steps:');

  // Collect all instructions and uniforms
  const instructionSet: instructions.All[] = [];
  const uniforms: util.UniformConfig[] = [];

  // First pass: identify all input nodes that need uniforms
  pipeline.forEach((node: types.Node) => {
    const uniformInfo = nodeMapping.mapNodeToUniform(node, edges);
    if (uniformInfo != null) {
      uniforms.push(uniformInfo);
    }
  });

  // Second pass: traverse and set up uniform input/output
  const nodeKeyMap = nodeMapping.mapNodesToKeys(pipeline, edges);

  // Third pass: create instructions
  pipeline.forEach((node, index) => {
    console.log(`Step ${index + 1}: ${node.type} (${node.id})`);

    const instruction = nodeMapping.mapNodeToInstruction(node, edges, nodeKeyMap);
    if (instruction) {
      instructionSet.push(instruction);
    }
  });

  // Fourth pass: Create the final shader config
  const shaderConfig: scene.DisplacePipeline = {
    uniforms,
    instructionSet,
    outputs: {
      height: nodeMapping.getFinalOutputKey(pipeline),
    },
  };

  console.log('Generated shader config:', shaderConfig);

  return {
    instructionSet,
    uniforms,
    shaderConfig,
  };
}
