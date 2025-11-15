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
import MathNodeFloat from '@/nodes/math-node-float';
import MathNodeVec3 from '@/nodes/math-node-vec3';
import MixNodeFloat from '@/nodes/mix-node-float';
import MixNodeVec3 from '@/nodes/mix-node-vec3';
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
  uniforms: util.Uniform[];
  shaderConfig: shaders.VertexShaderConfig;
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
  mathVec3: MathNodeVec3,
  mathFloat: MathNodeFloat,
  mixVec3: MixNodeVec3,
  mixFloat: MixNodeFloat,
  terrain: TerrainNode,
  vector: VectorNode,
};

// Re-export ReactFlow types for convenience
export type { Node, Edge, Connection, NodeTypes, FitViewOptions };
