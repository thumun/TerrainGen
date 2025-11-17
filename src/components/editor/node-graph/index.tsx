/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useCallback, useRef } from 'react';
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

import ContextMenu from './context-menu';

import { useContextMenu } from '@/hooks/use-context-menu';
import { useNodeGraph } from '@/hooks/use-node-graph';
import * as graph from '@/lib/graph';
import * as traversal from '@/lib/graph/traversal';
import { nodeTypes } from '@/nodes/node-types';

export const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

export default function NodeGraph() {
  /** Ref pointing to div wrapping ReactFlow element. */
  const reactFlowWrapper = useRef<HTMLDivElement>(null!);

  // hook owning node + edge state, and react flow
  const { nodes, edges, onNodesChange, onEdgesChange, setEdges } = useNodeGraph();

  // hook to manage context menu state + position
  const { menu, onPaneClick, onPaneContextMenu } = useContextMenu({ reactFlowWrapper });

  // TODO: this should be expanded to trigger whenever ANY node connection is updated
  //   that is upstream to an output node.
  //
  /** Callback triggered upon the connection of an edge to an "output" node. */
  const onOutputNodeConnected = useCallback(
    (outputNode: Node, connectedNodes: Node[], edges: Edge[]) => {
      const pipeline = [...connectedNodes, outputNode];
      graph.executePipeline(pipeline, edges);
    },
    [],
  );

  /** Callback triggered upon the connection of ANY edge to ANY node. */
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      // Create the updated edges first
      const updatedEdges = addEdge(params, edges);

      // Then set the state
      setEdges(updatedEdges);

      if (params.target) {
        const targetNode = nodes.find((node) => node.id === params.target);

        if (targetNode?.data?.isOutput === true) {
          console.log('Connected to output node:', targetNode);
          const connectedNodes = traversal.getNodeGraph(targetNode.id, nodes, updatedEdges);
          onOutputNodeConnected(targetNode, connectedNodes, updatedEdges);
        }
      }
    },
    [setEdges, nodes, edges, onOutputNodeConnected],
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
