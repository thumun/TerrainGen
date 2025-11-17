import type { RefObject } from 'react';
import type {
  Node,
  Edge,
  Connection,
  NodeTypes,
  FitViewOptions,
  OnNodesChange,
  OnEdgesChange,
} from 'reactflow';

import type * as instructions from '@/lib/shaders/jit/types/instructions';
import type * as shaders from '@/lib/shaders/jit/types/shaders';
import type * as util from '@/lib/shaders/jit/types/util';
import MathNode from '@/nodes/math-node';
import MixNode from '@/nodes/mix-node';
import NoiseNode from '@/nodes/noise-node';
import TerrainNode from '@/nodes/terrain-node';
import TransformNode from '@/nodes/transform-node';
import VectorNode from '@/nodes/vector-node';

export interface MenuPosition {
  id: string | null;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export interface PipelineResult {
  instructionSet: instructions.All[];
  uniforms: util.UniformConfig[];
  shaderConfig: shaders.DisplaceShaderConfig;
}

export interface NodeGraphHook {
  nodes: Node[];
  edges: Edge[];
  menu: MenuPosition | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setMenu: (menu: MenuPosition | null) => void;
  reactFlowWrapper: RefObject<HTMLDivElement | null>;
  onPaneContextMenu: (event: React.MouseEvent) => void;
  onPaneClick: () => void;
}

export const nodeTypes: NodeTypes = {
  transform: TransformNode,
  noise: NoiseNode,
  math: MathNode,
  mix: MixNode,
  terrain: TerrainNode,
  vector: VectorNode,
};

// Re-export ReactFlow types for convenience
export type { Node, Edge, Connection, NodeTypes, FitViewOptions };
