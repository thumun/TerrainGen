/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useCallback } from 'react';
import type { Edge, Node } from 'reactflow';

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
    (node: Node): util.UniformConfig | null => {
      const { type, data } = node;
      const uniformKey = generateReferenceKey(node.id, 'value');

      switch (type) {
        case 'vector':
          return {
            key: uniformKey,
            type: 'vec3f',
            value: data.vecInfo,
          } as unknown as util.UniformConfig;
        default:
          return null;
      }
    },
    [generateReferenceKey],
  );

  const getNodeFieldData = (
    handleName: string,
    isInput: boolean,
    node: Node,
    edges: Edge[],
    nodeKeyMap: Map<string, Map<string, string>>,
  ): string | undefined => {
    // input means that on left side of the node
    // which means that it's the target for an edge
    if (isInput) {
      const returnedEdges = edges.filter((edge) => edge.targetHandle === handleName);

      // need to get edge that matches with node id
      returnedEdges.forEach((edge) => {
        if (edge.target === node.id) {
          const edgeIdAndKey = nodeKeyMap.get(node.id);
          edgeIdAndKey?.get(edge.id);
          return edgeIdAndKey?.get(edge.id);
        }
      });
    } else {
      const returnedEdges = edges.filter((edge) => edge.sourceHandle === handleName);

      // need to get edge that matches with node id
      returnedEdges.forEach((edge) => {
        if (edge.source === node.id) {
          const edgeIdAndKey = nodeKeyMap.get(node.id);
          edgeIdAndKey?.get(edge.id);
          return edgeIdAndKey?.get(edge.id);
        }
      });
    }

    return undefined;
  };

  // based on the node type, we create the instruction
  // hard-code-y for now..
  const mapNodeToInstruction = useCallback(
    (
      node: Node,
      edges: Edge[],
      nodeKeyMap: Map<string, Map<string, string>>,
    ): instructions.All | null => {
      const { type, data } = node;

      switch (type) {
        case 'math':
          return {
            type: 'math',
            operation: data.operationVal,
            references: {
              readA: getNodeFieldData('vec3-val1-in', true, node, edges, nodeKeyMap),
              readB: getNodeFieldData('vec3-val2-in', true, node, edges, nodeKeyMap),
              write: getNodeFieldData('vec3-out', false, node, edges, nodeKeyMap),
            },
          } as instructions.All;

        case 'vector': {
          return {
            type: 'vector',
            references: {
              write: getNodeFieldData('vec3-out', false, node, edges, nodeKeyMap),
            },
          } as instructions.All;
        }

        case 'noise': {
          return {
            type: 'noise',
            references: {
              pos: getNodeFieldData('vec3-pos-in', true, node, edges, nodeKeyMap),
              scale: getNodeFieldData('vec3-scale-in', true, node, edges, nodeKeyMap),
              numOctaves: getNodeFieldData('vec3-numOctaves-in', true, node, edges, nodeKeyMap),
              write: getNodeFieldData('float-out', false, node, edges, nodeKeyMap),
            },
          } as instructions.All;
        }

        default:
          return null;
      }
    },
    [generateReferenceKey],
  );

  const mapNodesToKeys = useCallback(
    (nodes: Node[], edges: Edge[]): Map<string, Map<string, string>> => {
      const nodeKeyMap = new Map<string, Map<string, string>>();
      const incomingEdges: Edge[] = [];

      // get each incoming edge, generate ket based on node id & src handle (edge id name)
      // store each incoming edge in dict with key in node id info
      nodes.forEach((node) => {
        const temp = edges.filter((edge: { target: string }) => edge.target === node.id);

        temp.forEach((element) => {
          incomingEdges.push(element);
        });

        incomingEdges.forEach((edge) => {
          const generatedKey = generateReferenceKey(node.id, edge.id || '');
          const edgeAndKey = new Map<string, string>();
          edgeAndKey.set(edge.id, generatedKey);
          nodeKeyMap.set(node.id, edgeAndKey);
        });
      });

      // cycle through edges, get each target node & target handle
      // get key w/ edge id && add to dict
      if (incomingEdges.length > 0) {
        incomingEdges.forEach((edge) => {
          const currNodeId = edge.source;
          const edgeIds = nodeKeyMap.get(currNodeId);
          const key = edgeIds?.get(edge.id);

          if (key != null) {
            const edgeAndKey = new Map<string, string>();
            edgeAndKey.set(edge.target, key);
            nodeKeyMap.set(edge.target, edgeAndKey);
          }
        });
      }

      return nodeKeyMap;
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
    mapNodeToUniform,
    mapNodesToKeys,
  };
};
