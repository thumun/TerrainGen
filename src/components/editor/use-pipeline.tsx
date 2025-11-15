import { useCallback } from 'react';
import type { Node } from 'reactflow';

import type { PipelineResult } from './type';

import type * as instructions from '@/lib/shaders/jit/types/instructions';
import type * as shaders from '@/lib/shaders/jit/types/shaders';
import type * as util from '@/lib/shaders/jit/types/util';

interface UsePipelineProps {
  mapNodeToInstruction: (node: Node) => instructions.All | null;
  getFinalOutputKey: (pipeline: Node[]) => util.ReferenceKey;
  generateReferenceKey: (nodeId: string, suffix: string) => util.ReferenceKey;
  mapNodeToUniform: (node: Node) => util.UniformConfig | null;
}

export const usePipeline = ({
  mapNodeToInstruction,
  getFinalOutputKey,
  mapNodeToUniform,
}: UsePipelineProps) => {
  const executePipeline = useCallback(
    (pipeline: Node[]): PipelineResult => {
      console.log('Executing pipeline with steps:');

      // Collect all instructions and uniforms
      const instructionSet: instructions.All[] = [];
      const uniforms: util.UniformConfig[] = [];

      // First pass: identify all input nodes that need uniforms
      pipeline.forEach((node) => {
        const uniformInfo = mapNodeToUniform(node);
        if (uniformInfo != null) {
          uniforms.push(uniformInfo);
        }
      });

      // Second pass: traverse and set up uniform input/output

      // Third pass: create instructions
      pipeline.forEach((node, index) => {
        console.log(`Step ${index + 1}: ${node.type} (${node.id})`);

        const instruction = mapNodeToInstruction(node);
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
          height: getFinalOutputKey(pipeline),
        },
      };

      console.log('Generated shader config:', shaderConfig);

      return {
        instructionSet,
        uniforms,
        shaderConfig,
      };
    },
    [mapNodeToInstruction, getFinalOutputKey, mapNodeToUniform],
  );

  return {
    executePipeline,
  };
};
