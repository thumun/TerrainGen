/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  type Connection,
  type FitViewOptions,
  addEdge,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ContextMenu from './context-menu';

import { nodeTypes } from '@/components/nodes';
import { useContextMenu } from '@/hooks/use-context-menu';
import { useNodeGraph } from '@/hooks/use-node-graph';
import * as graph from '@/lib/graph';
import * as traversal from '@/lib/graph/traversal';
import type * as scene from '@/lib/scene';

export const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

type NodeGraphProps = {
  onDisplacePipelineUpdate?: (newPipeline: scene.DisplacePipeline) => void;
};

export default function NodeGraph({ onDisplacePipelineUpdate }: NodeGraphProps) {
  /** Ref pointing to div wrapping ReactFlow element. */
  const reactFlowWrapper = useRef<HTMLDivElement>(null!);

  // hook owning node + edge state, and react flow
  const { nodes, edges, onNodesChange, onEdgesChange, setEdges } = useNodeGraph();

  // hook to manage context menu state + position
  const { menu, onPaneClick, onPaneContextMenu } = useContextMenu({ reactFlowWrapper });

  /** Callback triggered upon the connection of ANY edge to ANY node. */
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      // Create the updated edges first
      const updatedEdges = addEdge(params, edges);

      // Then set the state
      setEdges(updatedEdges);

      if (!params.target) return;

      // Run our big pipeline generator!
      const pipelines = graph.generateUpdatedPipelines(
        params.target,
        nodes as graph.PipelineNode[], // this assertion had better hold true! smile
        edges,
      );

      if (pipelines.displacePipeline && onDisplacePipelineUpdate) {
        onDisplacePipelineUpdate(pipelines.displacePipeline);
      }
    },
    [edges, setEdges, nodes, onDisplacePipelineUpdate],
  );

  return (
    <div ref={reactFlowWrapper} className="relative h-screen w-full">
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
        isValidConnection={(connection) => traversal.isValidConnection(connection, nodes)}
      >
        <Background />
        <Controls />
        {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
      </ReactFlow>
    </div>
  );
}
