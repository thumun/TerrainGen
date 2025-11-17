/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useCallback } from 'react';
import type { Edge, Node } from 'reactflow';

import type * as instructions from '@/lib/shaders/jit/types/instructions';
import type * as util from '@/lib/shaders/jit/types/util';

export const useNodeMapping = () => {
  const generateReferenceKey = useCallback(
    (nodeId: string, suffix: string): util.ReferenceKey => {
      console.log(`Generating reference key for node ${nodeId} with suffix: ${suffix}`);
      return `${nodeId}_${suffix}`;
    },
    [],
  );

  const mapNodeToUniform = useCallback(
    (node: Node, edges: Edge[]): util.UniformConfig | null => {
      console.log(`Mapping node to uniform: ${node.id} (type: ${node.type})`);
      const { type, data } = node;

      switch (type) {
        case 'vector': {
          const returnedEdges = edges.filter((edge) => edge.targetHandle === 'vec3-out');
          console.log(`returned edges count: ${returnedEdges.length}`);
          const uniformKey = 0;
          //const uniformKey = generateReferenceKey(node.id, returnedEdges[0].id || '');

          console.log(`Creating vector uniform with key: ${uniformKey}`, data.vecInfo);
          return {
            key: uniformKey,
            type: 'vec3f',
            value: data.vecInfo,
          } as unknown as util.UniformConfig;
        }
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
  };

  // based on the node type, we create the instruction
  // hard-code-y for now..
  const mapNodeToInstruction = useCallback(
    (
      node: Node,
      edges: Edge[],
      nodeKeyMap: Map<string, Map<string, string>>,
    ): instructions.All | null => {
      console.log(`Mapping node to instruction: ${node.id} (type: ${node.type})`);
      const { type, data } = node;

      switch (type) {
        case 'math': {
          const mathInstruction = {
            type: 'math',
            operation: data.operationVal,
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
    },
    [],
  );

  const mapNodesToKeys = useCallback(
    (nodes: Node[], edges: Edge[]): Map<string, Map<string, string>> => {
      console.log('Starting mapNodesToKeys');
      const nodeKeyMap = new Map<string, Map<string, string>>();
      const outgoingEdges: Edge[] = [];

      // get each outgoing edge, generate ket based on node id & src handle (edge id name)
      // store each outgoing edge in dict with key in node id info
      nodes.forEach((node, index) => {
        console.log(
          `\nProcessing node ${index + 1}/${nodes.length}: ${node.id} (${node.type})`,
        );

        const temp = edges.filter((edge: { source: string }) => edge.source === node.id);
        console.log(`Found ${temp.length} outgoing edges for node ${node.id}`);

        temp.forEach((element) => {
          outgoingEdges.push(element);
        });

        temp.forEach((edge) => {
          console.log(
            `Processing outgoing edge: ${edge.id} from ${edge.source} to ${edge.target}`,
          );
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
    mapNodesToKeys,
    mapNodeToUniform,
  };
};
