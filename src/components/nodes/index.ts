import type { NodeTypes } from 'reactflow';

import MathNode from './math-node';
import MixNode from './mix-node';
import NoiseNode from './noise-node';
import TerrainNode from './terrain-node';
import TransformNode from './transform-node';
import VectorNode from './vector-node';

export const nodeTypes: NodeTypes = {
  transform: TransformNode,
  noise: NoiseNode,
  math: MathNode,
  mix: MixNode,
  terrain: TerrainNode,
  vector: VectorNode,
};
