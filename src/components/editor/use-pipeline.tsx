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
  mapNodeToUniform: (
    node: Node,
    bindingNum: number,
    groupNum: number,
  ) => util.UniformConfig | null;
}

export const usePipeline = ({
  mapNodeToInstruction,
  getFinalOutputKey,
  generateReferenceKey,
}: UsePipelineProps) => {
  const executePipeline = useCallback(
    (pipeline: Node[]): PipelineResult => {
      console.log('Executing pipeline with steps:');

      // Collect all instructions and uniforms
      const instructionSet: instructions.All[] = [];
      const uniforms: util.UniformConfig[] = [];
      const uniformBindings = new Map<string, { group: number; binding: number }>();

      const currentGroup = 1;
      let currentBinding = 0;

      // First pass: identify all input nodes that need uniforms
      pipeline.forEach((node) => {
        if (node.type === 'vector' || node.type === 'noise') {
          const uniformKey = generateReferenceKey(node.id, 'value');

          if (!uniformBindings.has(uniformKey)) {
            uniforms.push({
              key: uniformKey,
              type: 'vec3f',
              group: currentGroup,
              binding: currentBinding,
              value: 0,
            });
            uniformBindings.set(uniformKey, { group: currentGroup, binding: currentBinding });
            currentBinding++;
          }
        }
      });

      // Second pass: create instructions
      pipeline.forEach((node, index) => {
        console.log(`Step ${index + 1}: ${node.type} (${node.id})`);

        const instruction = mapNodeToInstruction(node);
        if (instruction) {
          instructionSet.push(instruction);
        }
      });

      // Create the final shader config
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
    [mapNodeToInstruction, getFinalOutputKey, generateReferenceKey],
  );

  return {
    executePipeline,
  };
};
