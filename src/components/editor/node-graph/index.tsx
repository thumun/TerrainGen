import { useCallback, useRef } from 'react';
import ReactFlow, { Background, Controls, addEdge } from 'reactflow';
import type { Connection, FitViewOptions, Edge, Node } from 'reactflow';

import ContextMenu from './context-menu';
import KeyboardShortcuts from './keyboard-shortcuts';

import * as nodeComponents from '@/components/nodes';
import { useContextMenu } from '@/hooks/use-context-menu';
import {
  GraphGlobalsProvider,
  type GraphGlobalsProviderProps,
} from '@/hooks/use-graph-globals';
import { type UseNodeGraphResult } from '@/hooks/use-node-graph';
import type { UsePipelinesResult } from '@/hooks/use-pipelines';
import type { PipelineNode } from '@/lib/graph';
import * as traversal from '@/lib/graph/traversal';

import 'reactflow/dist/style.css';

export const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

type NodeGraphProps = {
  nodeGraph: UseNodeGraphResult;
  rebuildPipelinesFromNode: UsePipelinesResult['rebuildPipelinesFromNode'];
  onUniformUpdate?: (key: string, value: number | [number, number, number]) => void;
};

export default function NodeGraph({
  nodeGraph,
  onUniformUpdate,
  rebuildPipelinesFromNode,
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

      // Update pipelines if we need to
      if (!params.target) return;
      rebuildPipelinesFromNode(params.target, {
        nodes: nodes as PipelineNode[],
        edges: updatedEdges,
      });
    },
    [edges, nodes, setEdges, rebuildPipelinesFromNode],
  );

  const addNode = useCallback(
    (node: Node) => {
      nodeGraph.setNodes((nodes) => [...nodes, node]);
    },
    [nodeGraph],
  );

  const onNodePipelineUpdate = useCallback<GraphGlobalsProviderProps['onNodePipelineUpdate']>(
    (nodeId) => {
      rebuildPipelinesFromNode(nodeId, {
        nodes: nodes as PipelineNode[],
        edges: edges,
      });
    },
    [edges, nodes, rebuildPipelinesFromNode],
  );

  return (
    <div ref={reactFlowWrapper} className="relative h-screen w-full">
      <GraphGlobalsProvider
        onAddNode={addNode}
        onUniformUpdate={onUniformUpdate ?? (() => {})}
        onNodePipelineUpdate={onNodePipelineUpdate}
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
          <KeyboardShortcuts
            reactFlowWrapperRef={reactFlowWrapper}
            onOpenContextMenu={onPaneContextMenu}
          />
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
