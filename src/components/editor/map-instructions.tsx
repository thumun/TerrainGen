/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useCallback } from 'react';
import type { Node } from 'reactflow';

import type * as instructions from '@/lib/shaders/jit/types/instructions';
import type * as util from '@/lib/shaders/jit/types/util';

export const useNodeMapping = () => {
  const generateReferenceKey = useCallback(
    (nodeId: string, suffix: string): util.ReferenceKey => {
      return `${nodeId}_${suffix}`;
    },
    [],
  );

  const mapNodeToUniform = useCallback(
    (node: Node, bindingNum: number, groupNum: number): util.Uniform | null => {
      const { type, data } = node;

      switch (type) {
        case 'vector':
          return {
            type: 'vec3f',
            key: generateReferenceKey(node.id, 'test'),
            group: groupNum,
            binding: bindingNum,
            value: data.vecInfo,
          } as util.Uniform;
        default:
          return null;
      }
    },
    [generateReferenceKey],
  );

  // based on the node type, we create the instruction
  // hard-code-y for now..
  const mapNodeToInstruction = useCallback(
    (node: Node): instructions.All | null => {
      const { type, data } = node;

      switch (type) {
        case 'math':
          return {
            type: 'math',
            operation: data.operationVal,
            references: {
              readA: generateReferenceKey(node.id, 'a'),
              readB: generateReferenceKey(node.id, 'b'),
              write: generateReferenceKey(node.id, 'result'),
            },
          } as instructions.All;

        case 'vector':
          return {
            type: 'separate-xyz',
            references: {
              read: generateReferenceKey(node.id, 'input'),
              writeX: data.outputX ? generateReferenceKey(node.id, 'vec3-out') : undefined,
              writeY: data.outputY ? generateReferenceKey(node.id, 'vec3-out') : undefined,
              writeZ: data.outputZ ? generateReferenceKey(node.id, 'vec3-out') : undefined,
            },
          } as instructions.All;

        // Add cases for other node types
        default:
          return null;
      }
    },
    [generateReferenceKey],
  );

  const getFinalOutputKey = useCallback(
    (pipeline: Node[]): util.ReferenceKey => {
      const lastNode = pipeline[pipeline.length - 1];

      // Determine output key based on last node type
      switch (lastNode.type) {
        case 'terrain':
          return generateReferenceKey(lastNode.id, 'height');
        default:
          return generateReferenceKey(lastNode.id, 'output');
      }
    },
    [generateReferenceKey],
  );

  return {
    mapNodeToInstruction,
    getFinalOutputKey,
    generateReferenceKey,
    mapNodeToUniform,
  };
};
