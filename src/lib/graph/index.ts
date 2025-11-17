import * as nodeMapping from './node-mapping';
import type * as graph from './types';

import type * as instructions from '@/lib/shaders/jit/types/instructions';
import type * as shaders from '@/lib/shaders/jit/types/shaders';
import type * as util from '@/lib/shaders/jit/types/util';

export type PipelineResult = {
  instructionSet: instructions.All[];
  uniforms: util.UniformConfig[];
  shaderConfig: shaders.VertexShaderConfig;
};

export function executePipeline(pipeline: graph.Node[], edges: graph.Edge[]): PipelineResult {
  console.log('Executing pipeline with steps:');

  // Collect all instructions and uniforms
  const instructionSet: instructions.All[] = [];
  const uniforms: util.UniformConfig[] = [];

  // First pass: identify all input nodes that need uniforms
  pipeline.forEach((node: graph.Node) => {
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
  const shaderConfig: shaders.VertexShaderConfig = {
    type: 'vertex',
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
