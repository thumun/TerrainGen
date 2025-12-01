import { useCallback, useRef } from 'react';
import ReactFlow, { Background, Controls, addEdge } from 'reactflow';
import type { Connection, FitViewOptions, Edge } from 'reactflow';

import ContextMenu from './context-menu';

import * as nodeComponents from '@/components/nodes';
import { useContextMenu } from '@/hooks/use-context-menu';
import { GraphGlobalsProvider } from '@/hooks/use-graph-globals';
import { type UseNodeGraphResult } from '@/hooks/use-node-graph';
import * as graph from '@/lib/graph';
import * as traversal from '@/lib/graph/traversal';
import type * as scene from '@/lib/scene';

import 'reactflow/dist/style.css';

export const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

type NodeGraphProps = {
  nodeGraph: UseNodeGraphResult;
  onDisplacePipelineUpdate?: (newPipeline: scene.DisplacePipeline) => void;
  onInstancingPipelineUpdate?: (newPipeline: scene.InstancingPipeline) => void;
  onDisplaceUniformUpdate?: (key: string, value: number | [number, number, number]) => void;
};

export default function NodeGraph({
  nodeGraph,
  onDisplacePipelineUpdate,
  onInstancingPipelineUpdate,
  onDisplaceUniformUpdate,
}: NodeGraphProps) {
  /** Ref pointing to div wrapping ReactFlow element. */
  const reactFlowWrapper = useRef<HTMLDivElement>(null!);

  // state and callbacks for node + edge state, and react flow
  const { nodes, edges, onNodesChange, onEdgesChange, setEdges } = nodeGraph;

  // hook to manage context menu state + position
  const { menuState, onPaneContextMenu, closeMenu } = useContextMenu({ reactFlowWrapper });

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
        updatedEdges,
      );

      if (pipelines.displacePipeline && onDisplacePipelineUpdate) {
        onDisplacePipelineUpdate(pipelines.displacePipeline);
      }
      if (pipelines.instancingPipeline && onInstancingPipelineUpdate) {
        onInstancingPipelineUpdate(pipelines.instancingPipeline);
      }
    },
    [edges, setEdges, nodes, onDisplacePipelineUpdate, onInstancingPipelineUpdate],
  );

  return (
    <div ref={reactFlowWrapper} className="relative h-screen w-full">
      <GraphGlobalsProvider
        value={{ setDisplacePipelineUniform: onDisplaceUniformUpdate ?? (() => {}) }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeComponents.nodeTypes}
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
          onConnect={onConnect}
          onPaneContextMenu={onPaneContextMenu}
          fitView
          fitViewOptions={fitViewOptions}
          isValidConnection={(connection) => traversal.isValidConnection(connection, nodes)}
        >
          <Background />
          <Controls />
          <ContextMenu
            state={menuState}
            closeMenu={closeMenu}
            reactFlowWrapper={reactFlowWrapper}
          />
        </ReactFlow>
      </GraphGlobalsProvider>
    </div>
  );
}
