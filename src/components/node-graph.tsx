/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  type Connection,
  type FitViewOptions,
  addEdge,
  type Edge,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ContextMenu from './editor/context-menu';
import { useNodeMapping } from './editor/map-instructions';
import { useNodeTraversal } from './editor/node-graph-traversal';
import { useNodeGraph } from './editor/node-pane-menu';
import { nodeTypes } from './editor/type';
import { usePipeline } from './editor/use-pipeline';

import type * as shaders from '@/lib/shaders/jit/types/shaders';

export const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

type NodeGraphProps = {
  onDisplacePipelineUpdate?: (newPipeline: shaders.DisplaceShaderConfig) => void;
};

export default function NodeGraph({ onDisplacePipelineUpdate }: NodeGraphProps) {
  const {
    nodes,
    edges,
    menu,
    onNodesChange,
    onEdgesChange,
    setEdges,
    reactFlowWrapper,
    onPaneContextMenu,
    onPaneClick,
  } = useNodeGraph();

  const { getNodeGraph, isValidConnection } = useNodeTraversal();
  const { mapNodeToInstruction, getFinalOutputKey, mapNodesToKeys, mapNodeToUniform } =
    useNodeMapping();
  const { executePipeline } = usePipeline({
    mapNodeToInstruction,
    getFinalOutputKey,
    mapNodesToKeys,
    mapNodeToUniform,
  });

  const onOutputNodeConnected = useCallback(
    (outputNode: Node, connectedNodes: Node[], edges: Edge[]) => {
      const pipeline = [...connectedNodes, outputNode];
      executePipeline(pipeline, edges);
      if (onDisplacePipelineUpdate) {
        // TODO: we should return something from `executePipeline` and call the below method
        //       with the result
        onDisplacePipelineUpdate({
          uniforms: [],
          instructionSet: [],
          outputs: { height: 'foo' },
        });
      }
    },
    [executePipeline, onDisplacePipelineUpdate],
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      // setEdges((eds) => addEdge(params, eds));

      // Create the updated edges first
      const updatedEdges = addEdge(params, edges);

      // Then set the state
      setEdges(updatedEdges);

      if (params.target) {
        const targetNode = nodes.find((node) => node.id === params.target);

        if (targetNode?.data?.isOutput === true) {
          console.log('Connected to output node:', targetNode);
          const connectedNodes = getNodeGraph(targetNode.id, nodes, updatedEdges);
          onOutputNodeConnected(targetNode, connectedNodes, updatedEdges);
        }
      }
    },
    [setEdges, nodes, edges, getNodeGraph, onOutputNodeConnected],
  );

  return (
    <div
      ref={reactFlowWrapper}
      style={{ width: '100%', height: '100vh', position: 'relative' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={fitViewOptions}
        isValidConnection={(connection) => isValidConnection(connection, nodes)}
      >
        <Background />
        <Controls />
        {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
      </ReactFlow>
    </div>
  );
}
